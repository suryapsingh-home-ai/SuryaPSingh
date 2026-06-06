"""
Django app config for the listing feature module.
=================================================
Registered via config/features.py → INSTALLED_APPS.
"""

from django.apps import AppConfig


class ListingConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "features.listing"
    label = "listing"
