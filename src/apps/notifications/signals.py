from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import Notification, NotificationType, UserNotificationPreference
from .services import NotificationService
import logging

User = get_user_model()
logger = logging.getLogger(__name__)


@receiver(post_save, sender=User)
def create_user_notification_preferences(sender, instance, created, **kwargs):
    """
    Create default notification preferences for new users
    """
    if created:
        # Get all active notification types
        notification_types = NotificationType.objects.filter(is_active=True)
        
        for nt in notification_types:
            UserNotificationPreference.objects.get_or_create(
                user=instance,
                notification_type=nt,
                defaults={
                    'email_enabled': nt.default_email_enabled,
                    'push_enabled': nt.default_push_enabled,
                    'in_app_enabled': nt.default_in_app_enabled,
                    'frequency': 'immediate',
                }
            )
        
        # Send welcome notification
        try:
            NotificationService.send_user_notification(
                user=instance,
                notification_type_name='user_welcome',
                title=f"Welcome to Music Distribution Platform, {instance.get_full_name()}!",
                message="Your account has been created successfully. Start uploading your music and reach millions of listeners worldwide.",
                context_data={
                    'first_name': instance.first_name,
                    'dashboard_url': '/dashboard',
                }
            )
        except Exception as e:
            logger.error(f"Failed to send welcome notification to {instance.email}: {str(e)}")


@receiver(post_save, sender='songs.Song')
def handle_song_status_change(sender, instance, created, **kwargs):
    """
    Handle song status changes and send appropriate notifications
    """
    if created:
        # New song uploaded (draft created)
        NotificationService.send_user_notification(
            user=instance.artist,
            notification_type_name='song_uploaded',
            title=f"Song '{instance.title}' uploaded successfully",
            message="Your song has been uploaded and saved as a draft. Complete all the details and submit for review.",
            context_data={
                'song_title': instance.title,
                'song_id': str(instance.id),
                'song_url': f'/dashboard/songs/{instance.id}',
            },
            related_song=instance
        )
        
        # Notify admin about new upload
        NotificationService.send_admin_notification(
            title="New Song Uploaded",
            message=f"Artist {instance.artist.get_full_name()} uploaded a new song: {instance.title}",
            context_data={
                'artist_name': instance.artist.get_full_name(),
                'artist_email': instance.artist.email,
                'song_title': instance.title,
                'song_id': str(instance.id),
                'admin_review_url': f'/admin/songs/{instance.id}',
            }
        )
    
    else:
        # Check if status changed
        try:
            old_instance = sender.objects.get(pk=instance.pk)
            if old_instance.status != instance.status:
                handle_song_status_notification(instance, old_instance.status, instance.status)
        except sender.DoesNotExist:
            pass


def handle_song_status_notification(song, old_status, new_status):
    """
    Send notifications based on song status changes
    """
    user = song.artist
    
    status_messages = {
        'pending': {
            'title': f"Song '{song.title}' submitted for review",
            'message': "Your song has been submitted for review. We'll notify you once the review is complete (usually 2-3 business days).",
            'notification_type': 'song_submitted'
        },
        'approved': {
            'title': f"Great news! '{song.title}' has been approved",
            'message': "Your song has been approved and will be distributed to all major streaming platforms within 5-7 days.",
            'notification_type': 'song_approved'
        },
        'rejected': {
            'title': f"Song '{song.title}' needs revision",
            'message': "Your song submission requires some changes before it can be approved. Please check the review comments and resubmit.",
            'notification_type': 'song_rejected'
        },
        'distributed': {
            'title': f"'{song.title}' is now live on streaming platforms!",
            'message': "Congratulations! Your song is now available on Spotify, Apple Music, and other major platforms. Start promoting to reach your audience.",
            'notification_type': 'song_distributed'
        }
    }
    
    if new_status in status_messages:
        msg_data = status_messages[new_status]
        
        # Send user notification
        NotificationService.send_user_notification(
            user=user,
            notification_type_name=msg_data['notification_type'],
            title=msg_data['title'],
            message=msg_data['message'],
            context_data={
                'song_title': song.title,
                'song_id': str(song.id),
                'old_status': old_status,
                'new_status': new_status,
                'song_url': f'/dashboard/songs/{song.id}',
            },
            related_song=song,
            priority='high' if new_status in ['approved', 'distributed'] else 'normal'
        )
        
        # Send admin notification for status changes
        if new_status == 'pending':
            NotificationService.send_admin_notification(
                title="Song Submitted for Review",
                message=f"'{song.title}' by {user.get_full_name()} is ready for review.",
                context_data={
                    'artist_name': user.get_full_name(),
                    'song_title': song.title,
                    'song_id': str(song.id),
                    'admin_review_url': f'/admin/songs/{song.id}',
                }
            )


@receiver(post_save, sender='payments.Transaction')
def handle_payment_notification(sender, instance, created, **kwargs):
    """
    Handle payment-related notifications
    """
    if created:
        # New payment created
        NotificationService.send_user_notification(
            user=instance.user,
            notification_type_name='payment_received',
            title="Payment Received",
            message=f"We've received your payment of ₦{instance.amount} for {instance.description or instance.get_transaction_type_display()}.",
            context_data={
                'amount': str(instance.amount),
                'currency': instance.currency,
                'description': instance.description or instance.get_transaction_type_display(),
                'transaction_id': str(instance.id),
            },
            priority='high'
        )
    
    else:
        # Check if payment status changed
        try:
            old_instance = sender.objects.get(pk=instance.pk)
            if old_instance.status != instance.status:
                handle_payment_status_notification(instance, old_instance.status, instance.status)
        except sender.DoesNotExist:
            pass


def handle_payment_status_notification(transaction, old_status, new_status):
    """
    Send notifications for payment status changes
    """
    if new_status == 'success':
        NotificationService.send_user_notification(
            user=transaction.user,
            notification_type_name='payment_completed',
            title="Payment Confirmed",
            message=f"Your payment of ₦{transaction.amount} has been confirmed. Thank you!",
            context_data={
                'amount': str(transaction.amount),
                'currency': transaction.currency,
                'transaction_id': str(transaction.id),
            },
            priority='high'
        )
    
    elif new_status == 'failed':
        NotificationService.send_user_notification(
            user=transaction.user,
            notification_type_name='payment_failed',
            title="Payment Failed",
            message=f"Your payment of ₦{transaction.amount} could not be processed. Please try again or contact support.",
            context_data={
                'amount': str(transaction.amount),
                'currency': transaction.currency,
                'transaction_id': str(transaction.id),
            },
            priority='urgent'
        )
