from django.utils import timezone
from .models import Notification, NotificationType, UserNotificationPreference
from .tasks import send_notification_email, send_admin_notification_email
import logging
from django.utils import timezone

logger = logging.getLogger(__name__)


class NotificationService:
    """
    Service class for handling notifications
    """
    
    @staticmethod
    def send_user_notification(user, notification_type_name, title, message, 
                             context_data=None, related_song=None, related_user=None,
                             priority='normal', scheduled_for=None):
        """
        Send notification to a specific user
        """
        try:
            # Get notification type
            notification_type = NotificationType.objects.get(
                name=notification_type_name,
                is_active=True
            )
        except NotificationType.DoesNotExist:
            logger.error(f"Notification type '{notification_type_name}' not found")
            return None
        
        # Get user preferences
        try:
            preferences = UserNotificationPreference.objects.get(
                user=user,
                notification_type=notification_type
            )
        except UserNotificationPreference.DoesNotExist:
            # Create default preferences
            preferences = UserNotificationPreference.objects.create(
                user=user,
                notification_type=notification_type,
                email_enabled=notification_type.default_email_enabled,
                push_enabled=notification_type.default_push_enabled,
                in_app_enabled=notification_type.default_in_app_enabled
            )
        
        # Check if notifications are enabled for this user and type
        if preferences.frequency == 'never':
            logger.info(f"Notifications disabled for user {user.email} and type {notification_type_name}")
            return None
        
        # Create notification
        notification = Notification.objects.create(
            notification_type=notification_type,
            recipient=user,
            title=title,
            message=message,
            context_data=context_data or {},
            send_email=preferences.email_enabled,
            send_push=preferences.push_enabled,
            send_in_app=preferences.in_app_enabled,
            priority=priority,
            related_song=related_song,
            related_user=related_user,
            scheduled_for=scheduled_for
        )
        
        # Send immediate notifications or schedule for digest
        if preferences.frequency == 'immediate' or priority in ['high', 'urgent']:
            # Send immediately using our ZeptoMail backend
            if notification.send_email:
                NotificationService._send_notification_email_direct(notification)
        else:
            # Will be sent as digest
            logger.info(f"Notification {notification.id} scheduled for {preferences.frequency} digest")
        
        logger.info(f"Notification created: {title} for {user.email}")
        return notification
    
    @staticmethod
    def send_admin_notification(title, message, context_data=None):
        """
        Send notification to all admin users
        """
        try:
            # Send email to admin immediately
            send_admin_notification_email.delay(title, message, context_data)
            
            # Also create in-app notifications for admin users
            from django.contrib.auth import get_user_model
            from django.db import models
            
            User = get_user_model()
            admin_users = User.objects.filter(
                models.Q(is_staff=True) | models.Q(is_superuser=True) | models.Q(role='admin')
            )
            
            for admin_user in admin_users:
                NotificationService.send_user_notification(
                    user=admin_user,
                    notification_type_name='admin_alert',
                    title=title,
                    message=message,
                    context_data=context_data,
                    priority='high'
                )
            
            logger.info(f"Admin notification sent: {title}")
            
        except Exception as e:
            logger.error(f"Failed to send admin notification: {str(e)}")
    
    @staticmethod
    def mark_notification_as_read(notification_id, user):
        """
        Mark a notification as read by the user
        """
        try:
            notification = Notification.objects.get(
                id=notification_id,
                recipient=user
            )
            notification.mark_as_read()
            return True
        except Notification.DoesNotExist:
            return False
    
    @staticmethod
    def get_user_notifications(user, limit=10, unread_only=False):
        """
        Get notifications for a user
        """
        queryset = Notification.objects.filter(recipient=user)
        
        if unread_only:
            queryset = queryset.filter(status__in=['pending', 'sent'])
        
        return queryset.order_by('-created_at')[:limit]
    
    @staticmethod
    def get_unread_count(user):
        """
        Get count of unread notifications for a user
        """
        return Notification.objects.filter(
            recipient=user,
            status__in=['pending', 'sent']
        ).count()
    
    @staticmethod
    def create_notification_types():
        """
        Create default notification types
        """
        default_types = [
            # User notifications
            {
                'name': 'user_welcome',
                'category': 'system',
                'description': 'Welcome message for new users',
                'email_subject_template': 'Welcome to Music Distribution Platform, {{ user.first_name }}!',
                'email_template_name': 'user_welcome',
            },
            {
                'name': 'user_login',
                'category': 'system',
                'description': 'User login notification',
                'email_subject_template': 'New login to your account',
                'email_template_name': 'user_login',
                'default_email_enabled': False,  # Usually too frequent
            },
            
            # Song notifications
            {
                'name': 'song_uploaded',
                'category': 'music',
                'description': 'Song uploaded to platform',
                'email_subject_template': 'Song "{{ context_data.song_title }}" uploaded successfully',
                'email_template_name': 'song_uploaded',
            },
            {
                'name': 'song_submitted',
                'category': 'music',
                'description': 'Song submitted for review',
                'email_subject_template': 'Song "{{ context_data.song_title }}" submitted for review',
                'email_template_name': 'song_submitted',
            },
            {
                'name': 'song_approved',
                'category': 'music',
                'description': 'Song approved for distribution',
                'email_subject_template': 'Great news! "{{ context_data.song_title }}" has been approved',
                'email_template_name': 'song_approved',
            },
            {
                'name': 'song_rejected',
                'category': 'music',
                'description': 'Song rejected, needs revision',
                'email_subject_template': 'Song "{{ context_data.song_title }}" needs revision',
                'email_template_name': 'song_rejected',
            },
            {
                'name': 'song_distributed',
                'category': 'music',
                'description': 'Song distributed to platforms',
                'email_subject_template': '"{{ context_data.song_title }}" is now live on streaming platforms!',
                'email_template_name': 'song_distributed',
            },
            
            # Payment notifications
            {
                'name': 'payment_received',
                'category': 'payment',
                'description': 'Payment received',
                'email_subject_template': 'Payment received - ₦{{ context_data.amount }}',
                'email_template_name': 'payment_received',
            },
            {
                'name': 'payment_completed',
                'category': 'payment',
                'description': 'Payment completed successfully',
                'email_subject_template': 'Payment confirmed - ₦{{ context_data.amount }}',
                'email_template_name': 'payment_completed',
            },
            {
                'name': 'payment_failed',
                'category': 'payment',
                'description': 'Payment failed',
                'email_subject_template': 'Payment failed - ₦{{ context_data.amount }}',
                'email_template_name': 'payment_failed',
            },
            
            # Admin notifications
            {
                'name': 'admin_alert',
                'category': 'admin',
                'description': 'General admin alerts',
                'email_subject_template': '[ADMIN] {{ title }}',
                'email_template_name': 'admin_alert',
            },
        ]
        
        created_count = 0
        for nt_data in default_types:
            nt, created = NotificationType.objects.get_or_create(
                name=nt_data['name'],
                defaults=nt_data
            )
            if created:
                created_count += 1
        
        logger.info(f"Created {created_count} notification types")
        return created_count

    @staticmethod
    def _send_notification_email_direct(notification):
        """
        Send notification email directly using Django's email backend (ZeptoMail)
        """
        from django.template.loader import render_to_string
        from django.core.mail import EmailMessage
        from django.conf import settings
        
        try:
            # Get the email template name from notification type
            template_name = notification.notification_type.email_template_name
            if not template_name:
                template_name = 'default_email'
            
            # Prepare context for template
            context = {
                'user': notification.recipient,
                'notification': notification,
                'site_name': getattr(settings, 'SITE_NAME', 'Music Distribution Platform'),
                'frontend_url': getattr(settings, 'FRONTEND_URL', 'http://localhost:5173'),
                'support_email': getattr(settings, 'DEFAULT_FROM_EMAIL', 'support@zabug.com'),
                'year': 2025,
            }
            
            # Add context_data from notification
            if notification.context_data:
                context.update(notification.context_data)
            
            # Render HTML email
            html_content = render_to_string(
                f'notifications/{template_name}.html',
                context
            )
            
            # Create email message
            subject = notification.title
            from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'support@zabug.com')
            to_email = [notification.recipient.email]
            
            # Create HTML email
            email = EmailMessage(
                subject=subject,
                body=html_content,
                from_email=from_email,
                to=to_email,
            )
            email.content_subtype = 'html'  # Set content type to HTML
            
            # Send email
            email.send()
            
            # Update notification status
            notification.status = 'sent'
            notification.sent_at = timezone.now()
            notification.save(update_fields=['status', 'sent_at'])
            
            logger.info(f"Email sent successfully for notification {notification.id}")
            
        except Exception as e:
            # Mark as failed
            notification.status = 'failed'
            notification.save(update_fields=['status'])
            logger.error(f"Failed to send email for notification {notification.id}: {str(e)}")
            raise
