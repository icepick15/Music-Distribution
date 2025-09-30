"""
Signals for real-time notifications integration
"""
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from django.contrib.auth.signals import user_logged_in

from src.apps.support.models import ContactMessage
from .services import RealtimeNotificationService, send_admin_alert
from .models import UserNotificationSettings

User = get_user_model()


@receiver(post_save, sender=ContactMessage)
def handle_contact_message_notifications(sender, instance, created, **kwargs):
    """
    Send real-time notifications when contact messages are created or updated
    """
    service = RealtimeNotificationService()
    
    if created:
        # Notify admins about new contact message
        admin_users = User.objects.filter(is_staff=True, is_active=True)
        for admin in admin_users:
            service.send_notification_now(
                recipient=admin,
                notification_type='contact_received',
                template_name='contact_received_template',
                context={
                    'contact': {
                        'name': instance.name,
                        'category': instance.get_category_display(),
                        'subject': instance.subject,
                        'id': instance.id
                    }
                },
                sender=None,  # System notification
                metadata={'contact_id': str(instance.id)}
            )
    
    # Check if status changed to 'responded' and notify the user
    if hasattr(instance, '_original_status') and instance._original_status != 'responded' and instance.status == 'responded':
        if instance.user:  # Only notify registered users
            service.send_notification_now(
                recipient=instance.user,
                notification_type='contact_replied',
                template_name='contact_replied_template',
                context={
                    'user': instance.user,
                    'contact': {
                        'subject': instance.subject,
                        'id': instance.id
                    }
                },
                metadata={'contact_id': str(instance.id)}
            )


@receiver(pre_save, sender=ContactMessage)
def store_original_contact_status(sender, instance, **kwargs):
    """Store original status before save to detect changes"""
    if instance.pk:
        try:
            original = ContactMessage.objects.get(pk=instance.pk)
            instance._original_status = original.status
        except ContactMessage.DoesNotExist:
            instance._original_status = None


@receiver(post_save, sender=User)
def handle_user_registration_notifications(sender, instance, created, **kwargs):
    """
    Send notifications when users register
    """
    if created:
        service = RealtimeNotificationService()
        
        # Create notification settings for new user
        UserNotificationSettings.objects.get_or_create(
            user=instance,
            defaults={
                'enable_websocket': True,
                'enable_browser_push': False,
                'contact_notifications': True,
                'song_notifications': True,
                'payment_notifications': True,
                'admin_notifications': instance.is_staff,
                'system_notifications': True,
            }
        )
        
        # Send welcome notification to new user
        service.send_notification_now(
            recipient=instance,
            notification_type='welcome_message',
            template_name='welcome_message_template',
            context={'user': instance},
            priority='normal'
        )
        
        # Notify admins about new user registration
        admin_users = User.objects.filter(is_staff=True, is_active=True).exclude(id=instance.id)
        for admin in admin_users:
            service.send_notification_now(
                recipient=admin,
                notification_type='user_registered',
                template_name='user_registered_template',
                context={
                    'user': {
                        'email': instance.email,
                        'get_full_name': instance.get_full_name(),
                        'id': instance.id
                    }
                },
                metadata={'new_user_id': instance.id}
            )


@receiver(user_logged_in)
def handle_user_login_notifications(sender, request, user, **kwargs):
    """
    Handle real-time notifications on user login
    """
    service = RealtimeNotificationService()
    
    # Send unread count update via WebSocket when user logs in
    # This will be handled by the WebSocket consumer when they connect
    pass


# Example signal for song upload (when you implement songs)
# @receiver(post_save, sender='songs.Song')
# def handle_song_upload_notifications(sender, instance, created, **kwargs):
#     """Send notifications for song uploads"""
#     if created:
#         service = RealtimeNotificationService()
#         
#         # Notify song owner
#         service.send_notification_now(
#             recipient=instance.artist.user,
#             notification_type='song_uploaded',
#             template_name='song_uploaded_template',
#             context={'song': instance}
#         )
#         
#         # Notify admins for review
#         send_admin_alert(
#             title=f'New Song Upload: {instance.title}',
#             message=f'Artist {instance.artist.user.email} uploaded "{instance.title}" for review.',
#             priority='normal',
#             metadata={'song_id': instance.id}
#         )


# Example signal for payment notifications
# @receiver(post_save, sender='payments.Payment')
# def handle_payment_notifications(sender, instance, created, **kwargs):
#     """Send notifications for payments"""
#     if created and instance.status == 'completed':
#         service = RealtimeNotificationService()
#         
#         service.send_notification_now(
#             recipient=instance.user,
#             notification_type='payment_received',
#             template_name='payment_received_template',
#             context={
#                 'amount': instance.amount,
#                 'period': instance.period,
#                 'payment_id': instance.id
#             },
#             priority='high'
#         )