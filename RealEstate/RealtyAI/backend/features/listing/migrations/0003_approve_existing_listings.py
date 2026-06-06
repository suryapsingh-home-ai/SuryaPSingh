from datetime import timedelta

from django.db import migrations
from django.utils import timezone


def approve_existing_listings(apps, schema_editor):
    listing_model = apps.get_model("listing", "Listing")
    expires_at = timezone.now() + timedelta(days=15)
    listing_model.objects.update(
        approval_status="approved",
        expires_at=expires_at,
    )


class Migration(migrations.Migration):

    dependencies = [
        ("listing", "0002_listing_profiles_and_approval"),
    ]

    operations = [
        migrations.RunPython(approve_existing_listings, migrations.RunPython.noop),
    ]
