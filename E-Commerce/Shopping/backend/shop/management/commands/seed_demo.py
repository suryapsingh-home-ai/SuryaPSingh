from decimal import Decimal

from django.core.management.base import BaseCommand

from shop.models import Category, Product


CATEGORIES = [
    {"name": "Electronics", "slug": "electronics"},
    {"name": "Apparel", "slug": "apparel"},
    {"name": "Home & Kitchen", "slug": "home-kitchen"},
]

DEMOS = [
    # Electronics
    {
        "category": "electronics",
        "name": "Wireless Earbuds",
        "slug": "wireless-earbuds",
        "description": "Compact earbuds with charging case and clear sound.",
        "price": Decimal("79.50"),
        "image_url": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800",
        "stock": 40,
    },
    {
        "category": "electronics",
        "name": "USB-C Hub",
        "slug": "usb-c-hub",
        "description": "7-in-1 hub with HDMI, SD, USB-A, and pass-through charging.",
        "price": Decimal("45.00"),
        "image_url": "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=800",
        "stock": 60,
    },
    {
        "category": "electronics",
        "name": "Portable Charger 20K",
        "slug": "portable-charger-20k",
        "description": "High-capacity power bank with USB-C PD fast charging.",
        "price": Decimal("39.99"),
        "image_url": "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800",
        "stock": 55,
    },
    {
        "category": "electronics",
        "name": "Mechanical Keyboard",
        "slug": "mechanical-keyboard",
        "description": "Tactile switches, aluminum frame, and per-key RGB lighting.",
        "price": Decimal("129.00"),
        "image_url": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800",
        "stock": 25,
    },
    # Apparel
    {
        "category": "apparel",
        "name": "Canvas Tote",
        "slug": "canvas-tote",
        "description": "Sturdy everyday tote with reinforced handles.",
        "price": Decimal("24.99"),
        "image_url": "https://images.unsplash.com/photo-1597484662317-9bd7bdda2907?w=800",
        "stock": 50,
    },
    {
        "category": "apparel",
        "name": "Denim Jacket",
        "slug": "denim-jacket",
        "description": "Classic medium wash jacket with chest pockets.",
        "price": Decimal("68.00"),
        "image_url": "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800",
        "stock": 30,
    },
    {
        "category": "apparel",
        "name": "Running Shoes",
        "slug": "running-shoes",
        "description": "Lightweight mesh upper with cushioned sole for daily miles.",
        "price": Decimal("89.95"),
        "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
        "stock": 42,
    },
    {
        "category": "apparel",
        "name": "Cotton Hoodie",
        "slug": "cotton-hoodie",
        "description": "Soft fleece-lined hoodie with kangaroo pocket.",
        "price": Decimal("44.50"),
        "image_url": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800",
        "stock": 70,
    },
    # Home & Kitchen
    {
        "category": "home-kitchen",
        "name": "Stainless Bottle",
        "slug": "stainless-bottle",
        "description": "Insulated 20oz bottle, keeps drinks cold for hours.",
        "price": Decimal("32.00"),
        "image_url": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800",
        "stock": 80,
    },
    {
        "category": "home-kitchen",
        "name": "Ceramic Mug Set",
        "slug": "ceramic-mug-set",
        "description": "Set of four stackable mugs, microwave and dishwasher safe.",
        "price": Decimal("28.00"),
        "image_url": "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800",
        "stock": 45,
    },
    {
        "category": "home-kitchen",
        "name": "Desk Lamp LED",
        "slug": "desk-lamp-led",
        "description": "Adjustable arm, warm-to-cool white, touch dimmer.",
        "price": Decimal("36.75"),
        "image_url": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800",
        "stock": 35,
    },
    {
        "category": "home-kitchen",
        "name": "Throw Pillow",
        "slug": "throw-pillow",
        "description": "18-inch square accent pillow with removable linen cover.",
        "price": Decimal("22.00"),
        "image_url": "https://images.unsplash.com/photo-1584100936595-c9f2fe7ed570?w=800",
        "stock": 90,
    },
]


class Command(BaseCommand):
    help = "Create demo categories and products for local development."

    def handle(self, *args, **options):
        cat_map = {}
        for c in CATEGORIES:
            obj, _ = Category.objects.update_or_create(
                slug=c["slug"],
                defaults={"name": c["name"]},
            )
            cat_map[c["slug"]] = obj
            self.stdout.write(self.style.SUCCESS(f"Category: {obj.name}"))

        for row in DEMOS:
            cat = cat_map.get(row["category"])
            slug = row["slug"]
            defaults = {
                "name": row["name"],
                "description": row["description"],
                "price": row["price"],
                "image_url": row["image_url"],
                "stock": row["stock"],
                "is_active": True,
                "category": cat,
            }
            obj, created = Product.objects.update_or_create(slug=slug, defaults=defaults)
            self.stdout.write(
                self.style.SUCCESS(
                    f"{'Created' if created else 'Updated'}: {obj.name}"
                )
            )
