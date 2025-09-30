from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from src.apps.notifications.models import Notification, NotificationType, UserNotificationPreference
from django.core.mail import send_mail
from django.conf import settings

User = get_user_model()


class Command(BaseCommand):
    help = 'Simple test for notification templates without Celery/Redis'
    
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
    
    def handle(self, *args, **options):
        email = options.get('email')
        notification_type = options.get('type')
        
        if not email:
            email = 'test@example.com'
            self.stdout.write(f"Using default email: {email}")
        
        # Get or create a test user
        try:
            user = User.objects.get(email=email)
            self.stdout.write(f"Using existing user: {user.email}")
        except User.DoesNotExist:
            user = User.objects.create_user(
                email=email,
                username=email.split('@')[0],
                first_name='John',
                last_name='Doe'
            )
            self.stdout.write(f"Created test user: {user.email}")
        
        # Get notification type
        try:
            notification_type_obj = NotificationType.objects.get(
                name=notification_type,
                is_active=True
            )
        except NotificationType.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'Notification type "{notification_type}" not found')
            )
            return
        
        # Create notification directly without Celery
        try:
            notification = Notification.objects.create(
                notification_type=notification_type_obj,
                recipient=user,
                title=f'Test {notification_type} notification',
                message=f'This is a test {notification_type} notification for {user.first_name}',
                context_data={
                    'site_name': 'Music Distribution Platform',
                    'frontend_url': 'http://localhost:5173',
                },
                send_email=True,
                send_push=False,
                send_in_app=True,
                priority='normal'
            )
            
            # Test sending email directly (without Celery)
            try:
                send_mail(
                    subject=f'Test: {notification.title}',
                    message=notification.message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    fail_silently=False,
                )
                
                # Mark as sent
                notification.status = 'sent'
                notification.sent_at = timezone.now()
                notification.save()
                
                self.stdout.write(
                    self.style.SUCCESS(
                        f'✅ Test notification created and email sent!'
                        f'\n📧 Type: {notification_type}'
                        f'\n👤 Recipient: {user.email}'
                        f'\n📨 Notification ID: {notification.id}'
                        f'\n📊 Status: {notification.status}'
                        f'\n📧 Email Sent: ✅'
                        f'\n📱 In-App: {"✅" if notification.send_in_app else "❌"}'
                        f'\n📄 Title: {notification.title}'
                    )
                )
                
            except Exception as email_error:
                self.stdout.write(
                    self.style.WARNING(
                        f'⚠️ Notification created but email failed: {email_error}'
                        f'\n📨 Notification ID: {notification.id}'
                        f'\n📊 Status: {notification.status}'
                    )
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Failed to create notification: {str(e)}')
            )