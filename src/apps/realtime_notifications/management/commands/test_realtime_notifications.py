"""
Test real-time notifications command
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from src.apps.realtime_notifications.services import RealtimeNotificationService, send_admin_alert

User = get_user_model()


class Command(BaseCommand):
    help = 'Test real-time notifications'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--user-email',
            type=str,
            help='Email of user to send test notification to',
        )
        parser.add_argument(
            '--admin-alert',
            action='store_true',
            help='Send test admin alert',
        )
        parser.add_argument(
            '--all-types',
            action='store_true',
            help='Send all notification types for testing',
        )
    
    def handle(self, *args, **options):
        service = RealtimeNotificationService()
        
        if options['admin_alert']:
            self.send_admin_alert()
        
        if options['user_email']:
            user_email = options['user_email']
            try:
                user = User.objects.get(email=user_email)
                if options['all_types']:
                    self.send_all_notification_types(service, user)
                else:
                    self.send_test_notification(service, user)
            except User.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(f'❌ User with email {user_email} not found')
                )
                return
        
        if not any([options['admin_alert'], options['user_email']]):
            self.stdout.write(
                self.style.WARNING('ℹ️  Use --user-email or --admin-alert to send test notifications')
            )
            self.show_usage_examples()
    
    def send_test_notification(self, service, user):
        """Send a simple test notification"""
        notification = service.send_notification_now(
            recipient=user,
            notification_type='welcome_message',
            title='🔔 Test Real-time Notification',
            message=f'Hello {user.first_name or user.email}! This is a test real-time notification via WebSocket.',
            priority='normal',
            action_url='/dashboard',
            action_text='Go to Dashboard'
        )
        
        if notification:
            self.stdout.write(
                self.style.SUCCESS(
                    f'✅ Sent test notification to {user.email} (ID: {notification.id})'
                )
            )
        else:
            self.stdout.write(
                self.style.ERROR(f'❌ Failed to send notification to {user.email}')
            )
    
    def send_all_notification_types(self, service, user):
        """Send all types of notifications for testing"""
        test_notifications = [
            {
                'type': 'contact_received',
                'title': '📩 New Contact Message',
                'message': 'You have a new contact message from John Doe.',
                'priority': 'normal'
            },
            {
                'type': 'contact_replied',
                'title': '✅ Message Reply Sent',
                'message': 'Your contact message has been replied to.',
                'priority': 'normal'
            },
            {
                'type': 'song_uploaded',
                'title': '🎵 Song Upload Success',
                'message': 'Your song "Test Track" has been uploaded successfully.',
                'priority': 'normal'
            },
            {
                'type': 'song_approved',
                'title': '🎉 Song Approved!',
                'message': 'Congratulations! Your song has been approved for distribution.',
                'priority': 'high'
            },
            {
                'type': 'payment_received',
                'title': '💰 Payment Received',
                'message': 'You\'ve received a royalty payment of $125.50.',
                'priority': 'high'
            },
            {
                'type': 'admin_alert',
                'title': '🚨 System Alert',
                'message': 'This is a test admin alert notification.',
                'priority': 'urgent'
            },
        ]
        
        sent_count = 0
        for notif_data in test_notifications:
            notification = service.send_notification_now(
                recipient=user,
                notification_type=notif_data['type'],
                title=notif_data['title'],
                message=notif_data['message'],
                priority=notif_data['priority'],
                action_url='/dashboard',
                action_text='View Details'
            )
            
            if notification:
                sent_count += 1
                self.stdout.write(f"✅ Sent {notif_data['type']} notification")
        
        self.stdout.write(
            self.style.SUCCESS(
                f'🎉 Sent {sent_count}/{len(test_notifications)} test notifications to {user.email}'
            )
        )
    
    def send_admin_alert(self):
        """Send test admin alert"""
        notifications = send_admin_alert(
            title='🔔 Test Admin Alert',
            message='This is a test admin alert sent to all staff members via real-time WebSocket.',
            priority='normal'
        )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'✅ Sent admin alert to {len(notifications)} admin users'
            )
        )
    
    def show_usage_examples(self):
        """Show usage examples"""
        self.stdout.write("\n📖 Usage Examples:")
        self.stdout.write("python manage.py test_realtime_notifications --user-email user@example.com")
        self.stdout.write("python manage.py test_realtime_notifications --user-email user@example.com --all-types")
        self.stdout.write("python manage.py test_realtime_notifications --admin-alert")
        
        # Show available users
        users = User.objects.all()[:5]
        if users:
            self.stdout.write("\n👥 Available users:")
            for user in users:
                self.stdout.write(f"  - {user.email}")
        
        self.stdout.write("\n🔗 WebSocket URL: ws://localhost:8000/ws/realtime-notifications/")