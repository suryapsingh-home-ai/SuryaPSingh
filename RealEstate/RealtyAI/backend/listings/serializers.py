from rest_framework import serializers
from .models import Listing


class ListingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Listing
        fields = [
            "id",
            "title",
            "description",
            "price",
            "bedrooms",
            "bathrooms",
            "area_sqft",
            "property_type",
            "status",
            "address",
            "city",
            "state",
            "zipcode",
            "image_url",
            "created_at",
            "updated_at",
        ]
