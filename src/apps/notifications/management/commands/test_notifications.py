from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from src.apps.notifications.services import NotificationService

User = get_user_model()


class Command(BaseCommand):
    help = 'Test notification templates by sending sample notifications'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            help='Email address to send test notification to',
        )
        parser.add_argument(
            '--type',
            type=str,
            default='user_welcome',
            help='Notification type to test (default: user_welcome)',
        )
        parser.add_argument(
            '--no-email',
            action='store_true',
            help='Create notification without sending email (for testing template rendering)',
        )
    
    def handle(self, *args, **options):
        email = options.get('email')
        notification_type = options.get('type')
        no_email = options.get('no_email')
        
        if not email and not no_email:
            self.stdout.write(
                self.style.ERROR('Please provide an email address with --email or use --no-email for testing')
            )
            return
        
        if no_email:
            email = 'test@example.com'  # Use dummy email for testing
        
        # Get or create a test user
        try:
            user = User.objects.get(email=email)
            self.stdout.write(f"Using existing user: {user.email}")
        except User.DoesNotExist:
            user = User.objects.create_user(
                email=email,
                username=email.split('@')[0],
                first_name='Test',
                last_name='User'
            )
            self.stdout.write(f"Created test user: {user.email}")
        
        # Send test notification
        try:
            notification = NotificationService.send_user_notification(
                user=user,
                notification_type_name=notification_type,
                title=f'Test {notification_type} notification',
                message=f'This is a test {notification_type} notification for {user.first_name}',
                context_data={
                    'site_name': 'Music Distribution Platform',
                    'frontend_url': 'http://localhost:5173',
                }
            )
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'✅ Test notification created successfully!'
                    f'\n📧 Type: {notification_type}'
                    f'\n👤 Recipient: {user.email}'
                    f'\n📨 Notification ID: {notification.id}'
                    f'\n📊 Status: {notification.status}'
                    f'\n📧 Email Enabled: {notification.send_email}'
                    f'\n📱 In-App Enabled: {notification.send_in_app}'
                    f'\n📄 Title: {notification.title}'
                )
            )
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Failed to send notification: {str(e)}')
            )