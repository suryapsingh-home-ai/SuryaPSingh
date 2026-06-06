"""
Schema engine — builds Django model, serializer, and viewset from LISTING_SCHEMA.
================================================================================
SHELL: do not edit when cloning for jobs/cars. Reads schema.py at import time.

Architecture role:
  schema.py  →  engine.py  →  models.py / serializers.py / views.py / admin.py

Comment standard: purpose is explained on the line(s) immediately BEFORE each
function or meaningful variable declaration so the code reads top-to-bottom.
"""

from django.contrib.auth.models import User
from django.db import models
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, serializers, viewsets
from rest_framework.authentication import TokenAuthentication
from rest_framework.pagination import PageNumberPagination

from features.listing.permissions import ListingPermission


# Map one entry from schema["fields"] to a Django model Field instance.
def _django_field(field_spec: dict) -> models.Field:
    # Schema type — string | text | money | integer | choice | url
    field_type = field_spec["type"]
    # When True, field cannot be blank on required string types
    required = field_spec.get("required", False)

    if field_type == "string":
        # Max length defaults to 255 unless schema overrides it
        kwargs = {"max_length": field_spec.get("max_length", 255)}
        if required:
            return models.CharField(**kwargs)
        return models.CharField(**kwargs, blank=True, default="")
    if field_type == "text":
        return models.TextField(blank=True, default="")
    if field_type == "money":
        return models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    if field_type == "integer":
        return models.PositiveIntegerField(default=0, null=True, blank=True)
    if field_type == "choice":
        # choices is a list of (stored_value, display_label) tuples
        choices = field_spec["choices"]
        default = field_spec.get("default", choices[0][0])
        return models.CharField(max_length=64, choices=choices, default=default)
    if field_type == "url":
        return models.URLField(blank=True, default="")
    raise ValueError(f"Unsupported field type: {field_type}")


# Build the Listing Django model class at import time from schema field definitions.
def create_listing_model(schema: dict) -> type:
    # Used by __str__ to pick a human-readable title field
    field_names = [f["name"] for f in schema["fields"]]

    # Admin and shell output — prefer "title - city, state" when those attrs exist
    def __str__(self) -> str:
        title = getattr(self, "title", None) or getattr(self, field_names[0], None)
        city = getattr(self, "city", None)
        state = getattr(self, "state", None)
        if city and state:
            return f"{title} - {city}, {state}"
        return str(title)

    # Base model attributes before product-specific columns are added
    attrs = {
        "__module__": "features.listing.models",
        "__str__": __str__,
        "Meta": type(
            "Meta",
            (),
            {"ordering": ["-created_at"]},
        ),
        "created_at": models.DateTimeField(auto_now_add=True),
        "updated_at": models.DateTimeField(auto_now=True),
    }

    # Add one Django column per schema field (title, price, city, …)
    for field_spec in schema["fields"]:
        attrs[field_spec["name"]] = _django_field(field_spec)

    # --- System fields (same for every product type: properties, jobs, cars) ---

    # Who submitted this listing (admin or lister User)
    attrs["created_by"] = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="listings",
    )
    # Workflow state — public API only shows approved + non-expired
    attrs["approval_status"] = models.CharField(
        max_length=16,
        choices=[
            ("pending", "Pending"),
            ("approved", "Approved"),
            ("rejected", "Rejected"),
        ],
        default="pending",
    )
    # Set when admin approves; public browse hides rows past this datetime
    attrs["expires_at"] = models.DateTimeField(null=True, blank=True)
    # Filled when admin rejects; shown to lister in account UI
    attrs["rejection_reason"] = models.TextField(blank=True, default="")

    # Dynamically create class named "Listing" inheriting from models.Model
    return type("Listing", (models.Model,), attrs)


# List every JSON key the base listing API serializer should expose.
def serializer_field_names(schema: dict) -> list[str]:
    return [
        "id",
        *[f["name"] for f in schema["fields"]],
        "approval_status",
        "expires_at",
        "rejection_reason",
        "created_by_username",
        "created_at",
        "updated_at",
    ]


# Build a DRF ModelSerializer class wired to the dynamic Listing model.
def create_serializer_class(schema: dict, listing_model: type) -> type:
    # All product + system fields included in API responses
    field_names = serializer_field_names(schema)

    class ListingSerializer(serializers.ModelSerializer):
        # Read-only username of created_by for admin table display
        created_by_username = serializers.CharField(source="created_by.username", read_only=True)

        class Meta:
            model = listing_model
            fields = field_names
            read_only_fields = [
                "id",
                "created_at",
                "updated_at",
                "created_by_username",
                "rejection_reason",
            ]

    ListingSerializer.__name__ = "ListingSerializer"
    return ListingSerializer


# Default pagination for GET /api/{id}/ — matches frontend page_size of 12.
class ListingPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = "page_size"
    max_page_size = 100


# Build a generic ModelViewSet; views.py subclasses it for approval business rules.
def create_viewset_class(schema: dict, listing_model: type, serializer_cls: type) -> type:
    # Fields with search=True become ?search= query targets
    schema_search_fields = [f["name"] for f in schema["fields"] if f.get("search")]
    # Fields with filter=exact|range become django-filter query params
    schema_filterset_fields = {}
    # Fields with sortable=True plus created_at / expires_at
    schema_ordering_fields = ["created_at"]

    for field_spec in schema["fields"]:
        name = field_spec["name"]
        if field_spec.get("filter") == "exact":
            schema_filterset_fields[name] = ["exact"]
        elif field_spec.get("filter") == "range":
            schema_filterset_fields[name] = ["gte", "lte"]
        if field_spec.get("sortable"):
            schema_ordering_fields.append(name)

    # Admin UI can filter listing table by approval_status
    schema_filterset_fields["approval_status"] = ["exact"]
    schema_ordering_fields.append("expires_at")

    class ListingViewSet(viewsets.ModelViewSet):
        queryset = listing_model.objects.all()
        serializer_class = serializer_cls
        pagination_class = ListingPagination
        authentication_classes = [TokenAuthentication]
        permission_classes = [ListingPermission]
        filter_backends = [filters.SearchFilter, DjangoFilterBackend, filters.OrderingFilter]
        search_fields = schema_search_fields
        filterset_fields = schema_filterset_fields
        ordering_fields = schema_ordering_fields
        ordering = ["-created_at"]

    ListingViewSet.__name__ = "ListingViewSet"
    return ListingViewSet


# Django admin list columns — first 6 schema fields marked show_in_list.
def admin_list_display(schema: dict) -> tuple:
    names = [f["name"] for f in schema["fields"] if f.get("show_in_list")][:6]
    return tuple(names) if names else ("id",)


# Django admin right-sidebar filters from schema fields with filter=exact.
def admin_list_filter(schema: dict) -> list[str]:
    return [f["name"] for f in schema["fields"] if f.get("filter") == "exact"]


# Django admin search box targets schema fields with search=True.
def admin_search_fields(schema: dict) -> list[str]:
    return [f["name"] for f in schema["fields"] if f.get("search")]
