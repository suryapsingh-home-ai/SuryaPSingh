"""
Root URL configuration — Django admin, Swagger, auth, and feature APIs.
=======================================================================
SHELL: mounts /api/auth/* and loops FEATURE_API_INCLUDES from features.py.
Listing routes live at /api/{schema.id}/ via features/listing/urls.py.
"""

from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView

from config.features import FEATURE_API_INCLUDES
from features.listing.auth_views import (
    AdminLoginView,
    AdminLogoutView,
    AdminMeView,
    ListerLoginView,
    ListerLogoutView,
    ListerMeView,
    RegisterView,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
    path("api/auth/admin-login/", AdminLoginView.as_view(), name="admin-login"),
    path("api/auth/admin-logout/", AdminLogoutView.as_view(), name="admin-logout"),
    path("api/auth/admin-me/", AdminMeView.as_view(), name="admin-me"),
    path("api/auth/register/", RegisterView.as_view(), name="register"),
    path("api/auth/login/", ListerLoginView.as_view(), name="lister-login"),
    path("api/auth/logout/", ListerLogoutView.as_view(), name="lister-logout"),
    path("api/auth/me/", ListerMeView.as_view(), name="lister-me"),
]

for urlconf in FEATURE_API_INCLUDES:
    urlpatterns.append(path("api/", include(urlconf)))
