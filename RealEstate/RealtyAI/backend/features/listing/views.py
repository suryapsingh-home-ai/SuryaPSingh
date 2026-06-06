"""
Listing API viewset — approval workflow, expiry filtering, renew/approve/reject.
================================================================================
SHELL: do not edit when cloning. Extends the generic viewset from engine.py with
business rules: who sees which rows, what happens on create/update, custom actions.

Architecture: urls.py → ListingViewSet → Listing model + ListingSerializer
"""

from datetime import timedelta

from django.db.models import Q
from django.utils import timezone
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from features.listing.engine import create_viewset_class
from features.listing.listing_config import get_default_listing_duration_days
from features.listing.models import Listing
from features.listing.permissions import IsStaffUser
from features.listing.schema import LISTING_SCHEMA
from features.listing.serializers import ListingSerializer

# Generic CRUD viewset from engine — search/filter/ordering already configured
ListingViewSetBase = create_viewset_class(LISTING_SCHEMA, Listing, ListingSerializer)


class ListingViewSet(ListingViewSetBase):
    # REST CRUD plus approve / reject / renew custom actions

    # Return different row sets depending on who is calling the API.
    def get_queryset(self):
        qs = Listing.objects.all()
        user = self.request.user
        now = timezone.now()

        # Seller "my listings" tab: GET /api/properties/?mine=1
        if self.action == "list" and self.request.query_params.get("mine") == "1":
            if user.is_authenticated and hasattr(user, "listing_profile"):
                return qs.filter(created_by=user)
            return qs.none()

        # Staff sees every row including pending and rejected
        if user.is_authenticated and user.is_staff:
            return qs

        # Logged-in lister: public approved rows OR their own rows on list/detail
        if user.is_authenticated and hasattr(user, "listing_profile"):
            public = Q(approval_status="approved", expires_at__gte=now)
            own = Q(created_by=user)
            if self.action in ("list", "retrieve"):
                return qs.filter(public | own)
            return qs.filter(own)

        # Anonymous visitor: only approved and not yet expired
        return qs.filter(approval_status="approved", expires_at__gte=now)

    # Prevent listers from setting approval_status or expires_at in POST/PUT body.
    def get_serializer(self, *args, **kwargs):
        kwargs.setdefault("context", self.get_serializer_context())
        serializer = super().get_serializer(*args, **kwargs)
        user = self.request.user
        if user.is_authenticated and user.is_staff:
            return serializer

        # Handle list serializers (many=True) vs single-object serializers
        fields_target = serializer.child if hasattr(serializer, "child") else serializer
        for field_name in ("approval_status", "expires_at"):
            if field_name in fields_target.fields:
                fields_target.fields[field_name].read_only = True
        return serializer

    # Called on POST — staff listings go live; lister listings wait for approval.
    def perform_create(self, serializer):
        user = self.request.user
        duration_days = get_default_listing_duration_days()

        if user.is_staff:
            serializer.save(
                created_by=user,
                approval_status="approved",
                expires_at=timezone.now() + timedelta(days=duration_days),
            )
            return

        serializer.save(created_by=user, approval_status="pending", expires_at=None)

    # Called on PUT/PATCH — lister editing an approved listing sends it back to pending.
    def perform_update(self, serializer):
        user = self.request.user
        instance = serializer.instance

        if user.is_staff:
            serializer.save()
            return

        if instance.approval_status == "approved":
            serializer.save(approval_status="pending", expires_at=None)
            return

        serializer.save(approval_status="pending", expires_at=None)

    # POST /api/{id}/{pk}/renew/ — lister requests a new approval period after expiry.
    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def renew(self, request, pk=None):
        listing = self.get_object()
        user = request.user

        if not user.is_staff and listing.created_by_id != user.id:
            return Response({"detail": "You can only renew your own listings."}, status=403)

        if listing.approval_status == "pending":
            return Response({"detail": "This listing is already awaiting admin approval."}, status=400)

        listing.approval_status = "pending"
        listing.expires_at = None
        listing.rejection_reason = ""
        listing.save(
            update_fields=["approval_status", "expires_at", "rejection_reason", "updated_at"]
        )
        serializer = ListingSerializer(listing, context={"request": request})
        return Response(serializer.data)

    # POST /api/{id}/{pk}/approve/ — staff only; sets expiry from schema/env days.
    @action(detail=True, methods=["post"], permission_classes=[IsStaffUser])
    def approve(self, request, pk=None):
        listing = self.get_object()
        duration_days = get_default_listing_duration_days()
        listing.approval_status = "approved"
        listing.expires_at = timezone.now() + timedelta(days=duration_days)
        listing.rejection_reason = ""
        listing.save(
            update_fields=["approval_status", "expires_at", "rejection_reason", "updated_at"]
        )
        return Response(ListingSerializer(listing, context={"request": request}).data)

    # POST /api/{id}/{pk}/reject/ — staff only; optional reason in request body.
    @action(detail=True, methods=["post"], permission_classes=[IsStaffUser])
    def reject(self, request, pk=None):
        listing = self.get_object()
        reason = request.data.get("reason", "")
        listing.approval_status = "rejected"
        listing.expires_at = None
        listing.rejection_reason = reason
        listing.save(
            update_fields=["approval_status", "expires_at", "rejection_reason", "updated_at"]
        )
        return Response(ListingSerializer(listing, context={"request": request}).data)
