from celery import shared_task
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.utils import timezone
from .models import Notification, NotificationLog, EmailTemplate
import logging

logger = logging.getLogger(__name__)


@shared_task(bind=True, retry_backoff=True, max_retries=3)
def send_notification_email(self, notification_id):
    """
    Send notification email asynchronously
    """
    try:
        notification = Notification.objects.get(id=notification_id)
        
        if not notification.send_email:
            logger.info(f"Email disabled for notification {notification_id}")
            return
        
        # Get user's email preferences
        user = notification.recipient
        if not user.email or not user.profile.email_notifications:
            logger.info(f"User {user.email} has email notifications disabled")
            return
        
        # Get email template
        template = None
        if notification.notification_type.email_template_name:
            try:
                template = EmailTemplate.objects.get(
                    name=notification.notification_type.email_template_name,
                    is_active=True
                )
            except EmailTemplate.DoesNotExist:
                pass
        
        # Prepare context data
        context = {
            'notification': notification,
            'user': user,
            'recipient_name': user.get_full_name(),
            'title': notification.title,
            'message': notification.message,
            'site_name': 'Music Distribution Platform',
            'frontend_url': settings.FRONTEND_URL if hasattr(settings, 'FRONTEND_URL') else 'http://localhost:5173',
            **notification.context_data
        }
        
        # Render email content
        if template:
            subject = render_to_string_from_template(template.subject_template, context)
            html_content = render_to_string_from_template(template.html_template, context)
            text_content = render_to_string_from_template(template.text_template, context) if template.text_template else None
        else:
            # Fallback to default template
            subject = notification.title
            html_content = render_to_string('notifications/default_email.html', context)
            text_content = notification.message
        
        # Send email
        email = EmailMultiAlternatives(
            subject=subject.strip(),
            body=text_content or notification.message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email],
            reply_to=[settings.DEFAULT_FROM_EMAIL],
        )
        
        if html_content:
            email.attach_alternative(html_content, "text/html")
        
        email.send(fail_silently=False)
        
        # Log successful send
        NotificationLog.objects.create(
            notification=notification,
            channel='email',
            status='sent'
        )
        
        # Update notification status
        notification.mark_as_sent()
        
        logger.info(f"Email sent successfully for notification {notification_id}")
        
    except Notification.DoesNotExist:
        logger.error(f"Notification {notification_id} not found")
    except Exception as exc:
        logger.error(f"Failed to send email for notification {notification_id}: {str(exc)}")
        
        # Log failed send
        try:
            notification = Notification.objects.get(id=notification_id)
            NotificationLog.objects.create(
                notification=notification,
                channel='email',
                status='failed',
                error_message=str(exc)
            )
        except:
            pass
        
        # Retry the task
        raise self.retry(exc=exc, countdown=60)


@shared_task
def send_admin_notification_email(subject, message, context_data=None):
    """
    Send notification email to all admin users
    """
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        # Get all admin emails
        admin_emails = list(settings.NOTIFICATION_EMAILS) if hasattr(settings, 'NOTIFICATION_EMAILS') else []
        
        # Add admin users' emails
        from django.db import models
        admin_users = User.objects.filter(
            models.Q(is_staff=True) | models.Q(is_superuser=True) | models.Q(role='admin')
        ).values_list('email', flat=True)
        admin_emails.extend(admin_users)
        
        # Remove duplicates and empty emails
        admin_emails = list(set(filter(None, admin_emails)))
        
        if not admin_emails:
            logger.warning("No admin emails found for notification")
            return
        
        # Prepare context
        context = {
            'subject': subject,
            'message': message,
            'timestamp': timezone.now(),
            'site_name': 'Music Distribution Platform',
            'frontend_url': settings.FRONTEND_URL if hasattr(settings, 'FRONTEND_URL') else 'http://localhost:5173',
            **(context_data or {})
        }
        
        # Render email content
        html_content = render_to_string('notifications/admin_notification.html', context)
        
        # Send email to all admins
        email = EmailMultiAlternatives(
            subject=f"[ADMIN] {subject}",
            body=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=admin_emails,
            reply_to=[settings.DEFAULT_FROM_EMAIL],
        )
        
        email.attach_alternative(html_content, "text/html")
        email.send(fail_silently=False)
        
        logger.info(f"Admin notification sent to {len(admin_emails)} admins: {subject}")
        
    except Exception as exc:
        logger.error(f"Failed to send admin notification: {str(exc)}")


@shared_task
def send_digest_notifications():
    """
    Send digest notifications (hourly, daily, weekly)
    """
    from django.db import models
    from .models import UserNotificationPreference
    
    # Get users who want digest notifications
    digest_preferences = UserNotificationPreference.objects.filter(
        frequency__in=['hourly', 'daily', 'weekly']
    ).select_related('user', 'notification_type')
    
    # Group by user and frequency
    user_digests = {}
    for pref in digest_preferences:
        user_id = pref.user.id
        frequency = pref.frequency
        
        if user_id not in user_digests:
            user_digests[user_id] = {}
        if frequency not in user_digests[user_id]:
            user_digests[user_id][frequency] = []
        
        user_digests[user_id][frequency].append(pref)
    
    # Send digest emails
    for user_id, frequencies in user_digests.items():
        for frequency, preferences in frequencies.items():
            send_user_digest_email.delay(user_id, frequency, [p.id for p in preferences])


@shared_task
def send_user_digest_email(user_id, frequency, preference_ids):
    """
    Send digest email to a specific user
    """
    try:
        from django.contrib.auth import get_user_model
        from .models import UserNotificationPreference
        User = get_user_model()
        
        user = User.objects.get(id=user_id)
        
        # Get recent notifications for this user and preferences
        from datetime import timedelta
        
        time_ranges = {
            'hourly': timedelta(hours=1),
            'daily': timedelta(days=1),
            'weekly': timedelta(weeks=1),
        }
        
        since = timezone.now() - time_ranges[frequency]
        
        notifications = Notification.objects.filter(
            recipient=user,
            created_at__gte=since,
            notification_type__id__in=[
                pref.notification_type.id 
                for pref in UserNotificationPreference.objects.filter(id__in=preference_ids)
            ]
        ).order_by('-created_at')
        
        if not notifications.exists():
            return
        
        # Prepare context
        context = {
            'user': user,
            'frequency': frequency,
            'notifications': notifications,
            'notification_count': notifications.count(),
            'site_name': 'Music Distribution Platform',
            'frontend_url': settings.FRONTEND_URL if hasattr(settings, 'FRONTEND_URL') else 'http://localhost:5173',
        }
        
        # Render email content
        subject = f"Your {frequency} music platform digest - {notifications.count()} updates"
        html_content = render_to_string('notifications/digest_email.html', context)
        text_content = render_to_string('notifications/digest_email.txt', context)
        
        # Send email
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email],
            reply_to=[settings.DEFAULT_FROM_EMAIL],
        )
        
        email.attach_alternative(html_content, "text/html")
        email.send(fail_silently=False)
        
        logger.info(f"Digest email sent to {user.email} ({frequency})")
        
    except Exception as exc:
        logger.error(f"Failed to send digest email: {str(exc)}")


def render_to_string_from_template(template_string, context):
    """
    Render a template string with context
    """
    from django.template import Context, Template
    template = Template(template_string)
    return template.render(Context(context))
