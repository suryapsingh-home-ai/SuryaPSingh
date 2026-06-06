"""
Auth API — admin login and lister register/login/logout/me endpoints.
======================================================================
SHELL: do not edit when cloning. Token-based auth shared by Angular admin and
seller modules. Mounted at /api/auth/* in config/urls.py.

Roles:
  - Admin: Django User with is_staff=True (createsuperuser)
  - Lister: User + ListingProfile (agent or owner)
"""

from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.serializers import AuthTokenSerializer
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from features.listing.permissions import IsListerUser
from features.listing.profile_models import ListingProfile


# POST /api/auth/admin-login/ — returns DRF token for Django staff users only.
class AdminLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = AuthTokenSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        if not user.is_staff:
            return Response({"detail": "Admin privileges required."}, status=403)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key, "username": user.username, "role": "admin"})


# POST /api/auth/admin-logout/ — invalidates the caller's API token.
class AdminLogoutView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response({"detail": "Logged out."})


# GET /api/auth/admin-me/ — confirms the token belongs to a staff user.
class AdminMeView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        return Response({"username": request.user.username, "role": "admin", "is_staff": True})


# Validates registration payload and creates User + ListingProfile in one step.
class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=ListingProfile.Role.choices)
    display_name = serializers.CharField(max_length=120, required=False, allow_blank=True)
    phone = serializers.CharField(max_length=32, required=False, allow_blank=True)

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("Username is already taken.")
        return value

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
        )
        ListingProfile.objects.create(
            user=user,
            role=validated_data["role"],
            display_name=validated_data.get("display_name", ""),
            phone=validated_data.get("phone", ""),
        )
        return user


# POST /api/auth/register/ — agent/owner signup; returns token for immediate login.
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        profile = user.listing_profile
        return Response(
            {
                "token": token.key,
                "username": user.username,
                "role": profile.role,
            },
            status=201,
        )


# POST /api/auth/login/ — lister login; rejects users without ListingProfile.
class ListerLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = AuthTokenSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        profile = getattr(user, "listing_profile", None)
        if not profile:
            return Response({"detail": "Agent or property owner account required."}, status=403)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key, "username": user.username, "role": profile.role})


# POST /api/auth/logout/ — lister token revocation.
class ListerLogoutView(APIView):
    permission_classes = [IsListerUser]

    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response({"detail": "Logged out."})


# GET /api/auth/me/ — lister profile for account UI header.
class ListerMeView(APIView):
    permission_classes = [IsListerUser]

    def get(self, request):
        profile = request.user.listing_profile
        return Response(
            {
                "username": request.user.username,
                "role": profile.role,
                "display_name": profile.display_name,
                "email": request.user.email,
                "phone": profile.phone,
            }
        )
