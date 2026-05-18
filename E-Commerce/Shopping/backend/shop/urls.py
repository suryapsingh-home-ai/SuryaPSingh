from django.urls import path

from . import views

urlpatterns = [
    path("health/", views.health, name="health"),
    path("products/", views.product_list, name="product-list"),
    path("products/<slug:slug>/", views.product_detail, name="product-detail"),
    path("checkout/", views.checkout, name="checkout"),
    path("orders/status/", views.order_status, name="order-status"),
]
