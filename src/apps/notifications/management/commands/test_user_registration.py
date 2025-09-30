from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
import random
import string

User = get_user_model()


class Command(BaseCommand):
    help = 'Test user registration flow with automatic welcome email'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            required=True,
            help='Email address for the new test user',
        )
        parser.add_argument(
            '--first-name',
            type=str,
            default='Test',
            help='First name for the user (default: Test)',
        )
        parser.add_argument(
            '--last-name',
            type=str,
            default='User',
            help='Last name for the user (default: User)',
        )
    
    def handle(self, *args, **options):
        email = options['email']
        first_name = options['first_name']
        last_name = options['last_name']
        
        self.stdout.write("🧪 Testing User Registration Flow...")
        self.stdout.write(f"📧 Email: {email}")
        self.stdout.write(f"👤 Name: {first_name} {last_name}")
        
        # Check if user already exists
        if User.objects.filter(email=email).exists():
            self.stdout.write(
                self.style.WARNING(f"⚠️ User with email {email} already exists. Skipping deletion to avoid conflicts...")
            )
            self.stdout.write("💡 To test with this email, please:")
            self.stdout.write("1. Use a different email address, or")
            self.stdout.write("2. Delete the user manually from Django admin")
            return
        
        # Generate random username
        username = f"{first_name.lower()}{random.randint(100, 999)}"
        
        self.stdout.write("\\n🚀 Creating new user (this should trigger welcome email)...")
        
        try:
            # Create user - this should trigger the post_save signal
            with transaction.atomic():
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                    password='testpassword123'
                )
            
            self.stdout.write(
                self.style.SUCCESS(
                    f"✅ User created successfully!"
                    f"\\n👤 Username: {user.username}"
                    f"\\n📧 Email: {user.email}"
                    f"\\n🆔 User ID: {user.id}"
                    f"\\n🎯 Full Name: {user.get_full_name()}"
                )
            )
            
            # Check for created notification preferences
            from src.apps.notifications.models import UserNotificationPreference
            prefs = UserNotificationPreference.objects.filter(user=user)
            
            self.stdout.write(f"\\n📋 Created {prefs.count()} notification preferences:")
            for pref in prefs:
                self.stdout.write(f"  - {pref.notification_type.name}: Email={pref.email_enabled}")
            
            # Check for welcome notification
            from src.apps.notifications.models import Notification
            welcome_notifications = Notification.objects.filter(
                recipient=user,
                notification_type__name='user_welcome'
            ).order_by('-created_at')
            
            if welcome_notifications.exists():
                latest_notification = welcome_notifications.first()
                self.stdout.write(
                    self.style.SUCCESS(
                        f"\\n🎉 Welcome notification created!"
                        f"\\n📨 Notification ID: {latest_notification.id}"
                        f"\\n📄 Title: {latest_notification.title}"
                        f"\\n📊 Status: {latest_notification.status}"
                        f"\\n📧 Email sent: {latest_notification.send_email}"
                        f"\\n🕐 Created: {latest_notification.created_at}"
                    )
                )
                
                if latest_notification.status == 'sent':
                    self.stdout.write(
                        self.style.SUCCESS("📬 Welcome email should be in your inbox!")
                    )
                else:
                    self.stdout.write(
                        self.style.WARNING(f"⚠️ Email status: {latest_notification.status}")
                    )
            else:
                self.stdout.write(
                    self.style.ERROR("❌ No welcome notification found! Check signal connection.")
                )
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"❌ Error creating user: {str(e)}")
            )
        
        self.stdout.write("\\n🎯 Next steps:")
        self.stdout.write("1. Check your email for the welcome message")
        self.stdout.write("2. Test login with the new account")
        self.stdout.write("3. Verify notification preferences in admin")
        self.stdout.write(f"4. Login credentials - Email: {email}, Password: testpassword123")