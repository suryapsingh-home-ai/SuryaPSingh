"""
DRF permission classes for listings and auth endpoints.
======================================================
SHELL: do not edit when cloning.

ListingPermission: public GET; POST/PUT/DELETE require staff or lister (own rows only).
IsStaffUser / IsListerUser: used by auth views and approve/reject actions.
"""

from rest_framework.permissions import SAFE_METHODS, BasePermission


# True when the user has a ListingProfile with role agent or owner.
def _is_lister(user) -> bool:
    profile = getattr(user, "listing_profile", None)
    return bool(profile and profile.role in ("agent", "owner"))


class ListingPermission(BasePermission):
    # Applied to all /api/{id}/ endpoints from engine.create_viewset_class

    # Can this request reach the view at all? (before object lookup)
    def has_permission(self, request, view):
        # Anyone can browse with GET
        if request.method in SAFE_METHODS:
            return True
        if not request.user or not request.user.is_authenticated:
            return False
        # Writes require staff or registered lister
        return request.user.is_staff or _is_lister(request.user)

    # Can this user act on this specific listing row?
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        if request.user.is_staff:
            return True
        # Listers may only edit/delete listings they created
        return obj.created_by_id == request.user.id


class IsStaffUser(BasePermission):
    # Used by approve/reject actions and admin auth views

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)


class IsListerUser(BasePermission):
    # Used by lister logout/me endpoints

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and _is_lister(request.user))
