from django.core.management.base import BaseCommand
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = "Set admin password for development"

    def handle(self, *args, **options):
        try:
            user = User.objects.get(username='admin')
            user.set_password('admin@123')
            user.save()
            self.stdout.write(
                self.style.SUCCESS(
                    '✓ Admin password set to: admin@123'
                )
            )
        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR('✗ Admin user not found')
            )
