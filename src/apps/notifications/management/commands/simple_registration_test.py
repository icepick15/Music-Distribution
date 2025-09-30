from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
import random

User = get_user_model()


class Command(BaseCommand):
    help = 'Simple user registration test with automatic welcome email'
    
    def handle(self, *args, **options):
        self.stdout.write("🧪 Testing User Registration with Welcome Email...")
        
        # Generate unique email to avoid conflicts
        test_num = random.randint(1000, 9999)
        email = f"testuser{test_num}@example.com"
        username = f"testuser{test_num}"
        
        self.stdout.write(f"📧 Creating user with email: {email}")
        
        try:
            # This should trigger the post_save signal and send welcome email
            user = User.objects.create_user(
                username=username,
                email=email,
                first_name="Test",
                last_name="User",
                password="testpass123"
            )
            
            self.stdout.write(
                self.style.SUCCESS(
                    f"✅ User created successfully!"
                    f"\\n👤 Username: {user.username}"
                    f"\\n📧 Email: {user.email}"
                    f"\\n🆔 User ID: {user.id}"
                )
            )
            
            # Check if welcome notification was created
            from src.apps.notifications.models import Notification
            
            welcome_notifications = Notification.objects.filter(
                recipient=user,
                notification_type__name='user_welcome'
            ).order_by('-created_at')
            
            if welcome_notifications.exists():
                notification = welcome_notifications.first()
                self.stdout.write(
                    self.style.SUCCESS(
                        f"\\n🎉 Welcome notification created!"
                        f"\\n📨 ID: {notification.id}"
                        f"\\n📄 Title: {notification.title}"
                        f"\\n📊 Status: {notification.status}"
                        f"\\n📧 Email enabled: {notification.send_email}"
                        f"\\n🕐 Created: {notification.created_at}"
                    )
                )
                
                if notification.status == 'sent':
                    self.stdout.write(
                        self.style.SUCCESS("📬 Welcome email should have been sent via ZeptoMail!")
                    )
                elif notification.status == 'pending':
                    self.stdout.write(
                        self.style.WARNING("⏳ Email is pending - check ZeptoMail logs")
                    )
                else:
                    self.stdout.write(
                        self.style.WARNING(f"⚠️ Email status: {notification.status}")
                    )
            else:
                self.stdout.write(
                    self.style.ERROR("❌ No welcome notification found!")
                )
                self.stdout.write("🔍 Checking if signal is connected...")
                
            # Also check notification preferences
            from src.apps.notifications.models import UserNotificationPreference
            prefs = UserNotificationPreference.objects.filter(user=user)
            self.stdout.write(f"\\n📋 Notification preferences created: {prefs.count()}")
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"❌ Error: {str(e)}")
            )
        
        self.stdout.write("\\n✨ Registration test complete!")