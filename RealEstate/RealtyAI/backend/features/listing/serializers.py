"""
Listing serializer — extends engine serializer with lister contact fields.
==========================================================================
SHELL: do not edit when cloning. Adds lister_name/email/phone/role on approved,
non-expired listings by reading ListingProfile on created_by.

Architecture: engine.create_serializer_class → ListingSerializerBase → ListingSerializer
"""

from django.utils import timezone
from rest_framework import serializers

from features.listing.engine import create_serializer_class, serializer_field_names
from features.listing.models import Listing
from features.listing.schema import LISTING_SCHEMA

# Auto-generated serializer from schema field list
ListingSerializerBase = create_serializer_class(LISTING_SCHEMA, Listing)

# Extra read-only keys appended for public detail contact block
CONTACT_FIELDS = ("lister_name", "lister_email", "lister_phone", "lister_role")


# Turn stored role code into label shown on detail page (Agent, Property Owner, …).
def _lister_role_label(role: str) -> str:
    labels = {"agent": "Agent", "owner": "Property Owner", "admin": "Admin"}
    return labels.get(role, role)


# Build name/email/phone/role dict from User + ListingProfile; None if unavailable.
def _contact_for_user(user):
    if not user:
        return None
    profile = getattr(user, "listing_profile", None)
    if profile:
        # Prefer display_name, then full name, then username
        name = profile.display_name.strip() or user.get_full_name().strip() or user.username
        return {
            "name": name,
            "email": user.email or "",
            "phone": profile.phone or "",
            "role": _lister_role_label(profile.role),
        }
    if user.is_staff:
        name = user.get_full_name().strip() or user.username
        return {
            "name": name,
            "email": user.email or "",
            "phone": "",
            "role": _lister_role_label("admin"),
        }
    return None


class ListingSerializer(ListingSerializerBase):
    # SerializerMethodFields populated only when listing is approved and live

    lister_name = serializers.SerializerMethodField()
    lister_email = serializers.SerializerMethodField()
    lister_phone = serializers.SerializerMethodField()
    lister_role = serializers.SerializerMethodField()

    class Meta(ListingSerializerBase.Meta):
        fields = serializer_field_names(LISTING_SCHEMA) + list(CONTACT_FIELDS)
        read_only_fields = ListingSerializerBase.Meta.read_only_fields + list(CONTACT_FIELDS)

    # Gate contact info — hidden for pending/rejected; expired hidden from public.
    def _should_show_contact(self, obj) -> bool:
        request = self.context.get("request")
        user = getattr(request, "user", None) if request else None
        now = timezone.now()

        if obj.approval_status != "approved":
            return False
        if obj.expires_at and obj.expires_at < now:
            # Owner and staff may still see contact on their own expired listing
            if user and user.is_authenticated and (user.is_staff or obj.created_by_id == user.id):
                return True
            return False
        return True

    # Return contact dict or None when _should_show_contact is False.
    def _contact(self, obj):
        if not self._should_show_contact(obj):
            return None
        return _contact_for_user(obj.created_by)

    def get_lister_name(self, obj):
        contact = self._contact(obj)
        return contact["name"] if contact else None

    def get_lister_email(self, obj):
        contact = self._contact(obj)
        return contact["email"] if contact else None

    def get_lister_phone(self, obj):
        contact = self._contact(obj)
        return contact["phone"] if contact else None

    def get_lister_role(self, obj):
        contact = self._contact(obj)
        return contact["role"] if contact else None
