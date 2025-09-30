# Django Shell Test Script for Notifications
# Copy and paste this into Django shell: python manage.py shell

from django.contrib.auth import get_user_model
from src.apps.notifications.services import NotificationService
from src.apps.notifications.models import NotificationType, Notification

User = get_user_model()

# 1. Check if notification types exist
print("=== Available Notification Types ===")
types = NotificationType.objects.all()
for nt in types:
    print(f"- {nt.name} ({nt.category}): {nt.description}")

print(f"\nTotal types: {types.count()}")

# 2. Create or get a test user
test_email = "test@example.com"
user, created = User.objects.get_or_create(
    email=test_email,
    defaults={
        'username': 'testuser',
        'first_name': 'John',
        'last_name': 'Doe'
    }
)
print(f"\n=== Test User ===")
print(f"User: {user.email} ({'created' if created else 'existing'})")

# 3. Send test welcome notification
try:
    notification = NotificationService.send_notification(
        notification_type_name='user_welcome',
        recipient=user,
        context_data={
            'site_name': 'Music Distribution Platform',
            'frontend_url': 'http://localhost:5173'
        }
    )
    print(f"\n=== Notification Sent ===")
    print(f"✅ Success! Notification ID: {notification.id}")
    print(f"📧 Title: {notification.title}")
    print(f"📄 Message: {notification.message}")
    print(f"📊 Status: {notification.status}")
    
except Exception as e:
    print(f"\n❌ Error: {e}")

# 4. Check recent notifications
print(f"\n=== Recent Notifications ===")
recent = Notification.objects.filter(recipient=user).order_by('-created_at')[:5]
for notif in recent:
    print(f"- {notif.title} | {notif.status} | {notif.created_at}")