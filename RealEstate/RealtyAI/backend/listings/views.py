from rest_framework import viewsets, filters
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from .models import Listing
from .serializers import ListingSerializer


class ListingPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 100


class ListingViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Listing.objects.all()
    serializer_class = ListingSerializer
    pagination_class = ListingPagination
    filter_backends = [filters.SearchFilter, DjangoFilterBackend, filters.OrderingFilter]
    search_fields = ["title", "description", "city", "state", "zipcode", "property_type"]
    filterset_fields = {
        "city": ["exact"],
        "state": ["exact"],
        "property_type": ["exact"],
        "status": ["exact"],
        "bedrooms": ["gte", "lte"],
        "bathrooms": ["gte", "lte"],
        "price": ["gte", "lte"],
        "area_sqft": ["gte", "lte"],
    }
    ordering_fields = ["price", "created_at", "bedrooms", "bathrooms", "area_sqft"]
    ordering = ["-created_at"]
