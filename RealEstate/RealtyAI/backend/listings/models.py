from django.db import models


class Listing(models.Model):
    PROPERTY_STATUS_CHOICES = [
        ("sale", "For Sale"),
        ("rent", "For Rent"),
        ("sold", "Sold"),
    ]

    PROPERTY_TYPE_CHOICES = [
        ("apartment", "Apartment"),
        ("house", "House"),
        ("condo", "Condo"),
        ("land", "Land"),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    bedrooms = models.PositiveSmallIntegerField(default=0)
    bathrooms = models.PositiveSmallIntegerField(default=0)
    area_sqft = models.PositiveIntegerField(null=True, blank=True)
    property_type = models.CharField(max_length=50, choices=PROPERTY_TYPE_CHOICES)
    status = models.CharField(max_length=50, choices=PROPERTY_STATUS_CHOICES, default="sale")
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=128)
    state = models.CharField(max_length=128)
    zipcode = models.CharField(max_length=20)
    image_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} - {self.city}, {self.state}"
