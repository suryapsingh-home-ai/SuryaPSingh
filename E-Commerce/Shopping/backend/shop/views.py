from decimal import Decimal

import stripe
from django.conf import settings
from django.db import transaction
from django.db.models import F
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Order, OrderItem, Product
from .serializers import (
    CheckoutSerializer,
    OrderLookupSerializer,
    OrderSerializer,
    ProductSerializer,
)
from .stripe_service import build_line_items, create_checkout_session


@api_view(["GET"])
def health(request):
    return Response({"status": "ok"})


@api_view(["GET"])
def product_list(request):
    qs = Product.objects.filter(is_active=True, stock__gt=0).select_related("category")
    return Response(ProductSerializer(qs, many=True).data)


@api_view(["GET"])
def product_detail(request, slug):
    try:
        obj = Product.objects.select_related("category").get(slug=slug, is_active=True)
    except Product.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
    return Response(ProductSerializer(obj).data)


@api_view(["POST"])
def checkout(request):
    if not settings.STRIPE_SECRET_KEY:
        return Response(
            {"detail": "Stripe is not configured (missing STRIPE_SECRET_KEY)."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    ser = CheckoutSerializer(data=request.data)
    ser.is_valid(raise_exception=True)
    data = ser.validated_data

    product_map = {}
    for item in data["items"]:
        pid = str(item["product_id"])
        product_map[pid] = product_map.get(pid, 0) + item["quantity"]

    products = list(
        Product.objects.filter(
            id__in=product_map.keys(),
            is_active=True,
        )
    )
    if len(products) != len(product_map):
        return Response(
            {"detail": "One or more products are invalid or inactive."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    rows = []
    total = Decimal("0")
    for p in products:
        qty = product_map[str(p.id)]
        if qty > p.stock:
            return Response(
                {"detail": f"Insufficient stock for {p.name}."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        line = Decimal(p.price) * qty
        total += line
        rows.append({"product": p, "quantity": qty})

    line_items = build_line_items(rows)
    success_url = data["success_url"]
    if "{CHECKOUT_SESSION_ID}" not in success_url:
        sep = "&" if "?" in success_url else "?"
        success_url = f"{success_url}{sep}session_id={{CHECKOUT_SESSION_ID}}"

    with transaction.atomic():
        order = Order.objects.create(
            customer_email=data["customer_email"],
            total=total,
        )
        for row in rows:
            OrderItem.objects.create(
                order=order,
                product=row["product"],
                quantity=row["quantity"],
                unit_price=row["product"].price,
            )

    session = create_checkout_session(
        order_id=order.id,
        customer_email=data["customer_email"],
        line_items=line_items,
        success_url=success_url,
        cancel_url=data["cancel_url"],
    )

    order.stripe_checkout_session_id = session.id
    order.save(update_fields=["stripe_checkout_session_id"])

    return Response(
        {
            "checkout_url": session.url,
            "order_id": str(order.id),
            "session_id": session.id,
        }
    )


@api_view(["GET"])
def order_status(request):
    ser = OrderLookupSerializer(data=request.query_params)
    ser.is_valid(raise_exception=True)
    session_id = (ser.validated_data.get("session_id") or "").strip()
    order_id = ser.validated_data.get("order_id")

    order = None
    if order_id:
        order = Order.objects.filter(id=order_id).first()
    elif session_id:
        order = Order.objects.filter(stripe_checkout_session_id=session_id).first()

    if not order:
        return Response({"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND)
    return Response(OrderSerializer(order).data)


@csrf_exempt
@require_POST
def stripe_webhook(request):
    if not settings.STRIPE_WEBHOOK_SECRET:
        return HttpResponse("Webhook not configured", status=500)

    payload = request.body
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")

    try:
        event = stripe.Webhook.construct_event(
            payload,
            sig_header,
            settings.STRIPE_WEBHOOK_SECRET,
        )
    except ValueError:
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError:
        return HttpResponse(status=400)

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        if session.get("payment_status") != "paid":
            return HttpResponse(status=200)
        order_id = (session.get("metadata") or {}).get("order_id")
        stripe_session_id = session.get("id")
        if order_id:
            updated = Order.objects.filter(id=order_id, status=Order.Status.PENDING).update(
                status=Order.Status.PAID,
                stripe_checkout_session_id=stripe_session_id or "",
            )
            if updated:
                order = Order.objects.filter(id=order_id).first()
                if order:
                    for item in order.items.select_related("product"):
                        Product.objects.filter(id=item.product_id).update(
                            stock=F("stock") - item.quantity
                        )

    return HttpResponse(status=200)
