from django.contrib.auth.models import User

user = User.objects.get(username='admin')
user.set_password('admin@123')
user.save()
print("✓ Admin password set to: admin@123")
