from django.contrib import admin
from .models import Listing

@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = ("title", "city", "state", "price", "bedrooms", "bathrooms", "status")
    search_fields = ("title", "city", "state", "zipcode", "property_type")
    list_filter = ("status", "property_type", "city", "state")
