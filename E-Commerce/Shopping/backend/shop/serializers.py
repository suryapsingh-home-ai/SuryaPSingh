from decimal import Decimal

from rest_framework import serializers

from .models import Category, Order, OrderItem, Product


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("name", "slug")


class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "slug",
            "description",
            "price",
            "image_url",
            "stock",
            "is_active",
            "category",
        )


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = OrderItem
        fields = ("product", "product_name", "quantity", "unit_price")


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = (
            "id",
            "customer_email",
            "status",
            "total",
            "stripe_checkout_session_id",
            "created_at",
            "items",
        )


class CheckoutItemSerializer(serializers.Serializer):
    product_id = serializers.UUIDField()
    quantity = serializers.IntegerField(min_value=1)


class CheckoutSerializer(serializers.Serializer):
    items = CheckoutItemSerializer(many=True)
    customer_email = serializers.EmailField()
    success_url = serializers.URLField()
    cancel_url = serializers.URLField()

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("Cart cannot be empty.")
        return value


class OrderLookupSerializer(serializers.Serializer):
    session_id = serializers.CharField(required=False, allow_blank=True)
    order_id = serializers.UUIDField(required=False)

    def validate(self, attrs):
        sid = (attrs.get("session_id") or "").strip()
        oid = attrs.get("order_id")
        if not sid and not oid:
            raise serializers.ValidationError("Provide session_id or order_id.")
        return attrs
