from decimal import Decimal

import stripe
from django.conf import settings

stripe.api_key = settings.STRIPE_SECRET_KEY


def build_line_items(product_rows):
    """
    product_rows: list of dicts with keys product (model), quantity (int)
    """
    line_items = []
    for row in product_rows:
        product = row["product"]
        qty = row["quantity"]
        unit_cents = int((Decimal(product.price) * 100).quantize(Decimal("1")))
        product_data = {
            "name": product.name,
            "description": (product.description or "")[:500],
        }
        if product.image_url:
            product_data["images"] = [product.image_url]
        line_items.append(
            {
                "price_data": {
                    "currency": "usd",
                    "product_data": product_data,
                    "unit_amount": unit_cents,
                },
                "quantity": qty,
            }
        )
    return line_items


def create_checkout_session(
    *,
    order_id,
    customer_email,
    line_items,
    success_url,
    cancel_url,
):
    return stripe.checkout.Session.create(
        mode="payment",
        customer_email=customer_email,
        line_items=line_items,
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={"order_id": str(order_id)},
    )
