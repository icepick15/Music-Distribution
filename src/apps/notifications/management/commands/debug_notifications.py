from django.core.management.base import BaseCommand
from src.apps.notifications.services import NotificationService
from src.apps.notifications.models import NotificationType


class Command(BaseCommand):
    help = 'Debug notification types creation'
    
    def handle(self, *args, **options):
        self.stdout.write("🔍 Debugging Notification Types...")
        
        # Check current types
        current_types = NotificationType.objects.all()
        self.stdout.write(f"📊 Current notification types: {current_types.count()}")
        
        for nt in current_types:
            self.stdout.write(f"  - {nt.name} ({nt.category})")
        
        if current_types.count() == 0:
            self.stdout.write("\\n🔧 Creating notification types...")
            try:
                created = NotificationService.create_notification_types()
                self.stdout.write(f"✅ Created {created} notification types")
                
                # Check again
                new_types = NotificationType.objects.all()
                self.stdout.write(f"📊 Total notification types now: {new_types.count()}")
                
            except Exception as e:
                self.stdout.write(f"❌ Error creating types: {str(e)}")
        else:
            self.stdout.write("✅ Notification types already exist")
        
        # Test user creation
        self.stdout.write("\\n🧪 Testing user creation with welcome email...")
        
        from django.contrib.auth import get_user_model
        import random
        
        User = get_user_model()
        test_num = random.randint(10000, 99999)
        email = f"test{test_num}@example.com"
        
        try:
            user = User.objects.create_user(
                username=f"test{test_num}",
                email=email,
                first_name="Test",
                last_name="User",
                password="testpass123"
            )
            
            self.stdout.write(f"✅ User created: {user.email}")
            
            # Check for notification
            from src.apps.notifications.models import Notification
            notifications = Notification.objects.filter(recipient=user).order_by('-created_at')
            
            if notifications.exists():
                notif = notifications.first()
                self.stdout.write(f"✅ Notification created: {notif.title}")
                self.stdout.write(f"📊 Status: {notif.status}")
            else:
                self.stdout.write("❌ No notification created")
                
        except Exception as e:
            self.stdout.write(f"❌ Error: {str(e)}")