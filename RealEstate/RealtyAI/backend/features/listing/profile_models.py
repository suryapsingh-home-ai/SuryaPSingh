"""
Lister profile — extends Django User with role and contact info for listings.
==============================================================================
SHELL: do not edit when cloning. One-to-one with User; shown on detail page
via serializers.py when listing is approved and live.

Roles: agent | owner (labels are product-specific in serializer, generic here).
"""

from django.contrib.auth.models import User
from django.db import models


class ListingProfile(models.Model):
    """Agent or property owner account linked to Django auth User."""

    class Role(models.TextChoices):
        AGENT = "agent", "Agent"
        OWNER = "owner", "Property Owner"

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="listing_profile")
    role = models.CharField(max_length=16, choices=Role.choices)
    display_name = models.CharField(max_length=120, blank=True, default="")
    phone = models.CharField(max_length=32, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.user.username} ({self.get_role_display()})"
