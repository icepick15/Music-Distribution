"""
Send notifications and show immediate feedback
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from src.apps.realtime_notifications.models import RealtimeNotification
from src.apps.realtime_notifications.services import RealtimeNotificationService

User = get_user_model()


class Command(BaseCommand):
    help = 'Test notifications and show what happens'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            default='iamicepick@yahoo.com',
            help='Email of user to test notifications',
        )
    
    def handle(self, *args, **options):
        email = options['email']
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'❌ User {email} not found')
            )
            return
        
        # Show before state
        before_count = RealtimeNotification.objects.filter(recipient=user).count()
        self.stdout.write(f"📊 Before: {before_count} notifications")
        
        # Send test notification
        service = RealtimeNotificationService()
        notification = service.send_notification_now(
            recipient=user,
            notification_type='welcome_message',
            title='🧪 Live Test Notification',
            message=f'This is a test notification sent at {self.get_current_time()}',
            priority='normal'
        )
        
        # Show after state
        after_count = RealtimeNotification.objects.filter(recipient=user).count()
        self.stdout.write(f"📊 After: {after_count} notifications")
        
        if notification:
            self.stdout.write(
                self.style.SUCCESS(
                    f'✅ Notification created: {notification.id}'
                )
            )
            self.stdout.write(f"📱 Title: {notification.title}")
            self.stdout.write(f"📝 Message: {notification.message}")
            self.stdout.write(f"🔄 Status: {notification.status}")
            
            # Check if it was delivered via WebSocket
            if notification.status == 'sent':
                self.stdout.write(
                    self.style.SUCCESS(
                        '🚀 Real-time delivery: SUCCESS (WebSocket sent)'
                    )
                )
            else:
                self.stdout.write(
                    self.style.WARNING(
                        f'⚠️  Real-time delivery: PENDING (Status: {notification.status})'
                    )
                )
        else:
            self.stdout.write(
                self.style.ERROR('❌ Failed to create notification')
            )
        
        # Show recent notifications
        self.stdout.write("\n📋 Recent notifications for this user:")
        recent = RealtimeNotification.objects.filter(
            recipient=user
        ).order_by('-created_at')[:3]
        
        for notif in recent:
            time_str = notif.created_at.strftime('%H:%M:%S')
            self.stdout.write(
                f"  • {notif.title} ({notif.status}) - {time_str}"
            )
    
    def get_current_time(self):
        from datetime import datetime
        return datetime.now().strftime('%H:%M:%S')