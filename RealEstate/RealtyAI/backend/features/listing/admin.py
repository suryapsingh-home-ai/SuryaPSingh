"""
Django admin registration — schema-driven list columns and filters.
=================================================================
SHELL: optional ops UI; Angular admin module is the primary staff interface.
"""

from django.contrib import admin

from features.listing.engine import admin_list_display, admin_list_filter, admin_search_fields
from features.listing.models import Listing
from features.listing.profile_models import ListingProfile
from features.listing.schema import LISTING_SCHEMA


@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    """Browse/edit listings in Django admin with columns from schema flags."""

    list_display = (*admin_list_display(LISTING_SCHEMA), "approval_status", "expires_at", "created_by")
    list_filter = (*admin_list_filter(LISTING_SCHEMA), "approval_status")
    search_fields = admin_search_fields(LISTING_SCHEMA)


@admin.register(ListingProfile)
class ListingProfileAdmin(admin.ModelAdmin):
    """Manage agent/owner accounts."""

    list_display = ("user", "role", "display_name", "phone", "created_at")
    list_filter = ("role",)
