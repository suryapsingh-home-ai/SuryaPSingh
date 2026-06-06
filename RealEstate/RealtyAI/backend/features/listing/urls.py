"""
Listing feature URL routing — registers /api/{schema.id}/ REST routes.
====================================================================
SHELL: path segment comes from schema.py id (e.g. properties → /api/properties/).
Included by config/urls.py under /api/.
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from features.listing.schema import LISTING_SCHEMA
from features.listing.views import ListingViewSet

router = DefaultRouter()
router.register(LISTING_SCHEMA["id"], ListingViewSet, basename="listing")

urlpatterns = [
    path("", include(router.urls)),
]
