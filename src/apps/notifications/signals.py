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
        
        # Send welcome notification with enhanced context
        try:
            from django.conf import settings
            
            NotificationService.send_user_notification(
                user=instance,
                notification_type_name='user_welcome',
                title=f"🎵 Welcome to Music Distribution Platform, {instance.first_name or instance.username}!",
                message=f"Your account has been created successfully! We're excited to have you join our community of artists and music creators.",
                context_data={
                    'first_name': instance.first_name or instance.username,
                    'last_name': instance.last_name or '',
                    'full_name': instance.get_full_name() or instance.username,
                    'username': instance.username,
                    'email': instance.email,
                    'user_id': instance.id,
                    'site_name': 'Music Distribution Platform',
                    'frontend_url': getattr(settings, 'FRONTEND_URL', 'http://localhost:5173'),
                    'dashboard_url': f"{getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')}/dashboard",
                    'support_email': getattr(settings, 'DEFAULT_FROM_EMAIL', 'support@zabug.com'),
                    'year': 2025,
                    'welcome_message': 'Welcome to our amazing music platform!',
                    'next_steps': [
                        'Complete your profile',
                        'Upload your first track',
                        'Explore distribution options',
                        'Connect with other artists'
                    ]
                }
            )
            logger.info(f"Welcome notification sent successfully to {instance.email}")
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


@receiver(pre_save, sender='payments.Transaction')
def track_payment_status_change(sender, instance, **kwargs):
    """
    Track the old status before saving to detect status changes
    """
    if instance.pk:
        try:
            old_instance = sender.objects.get(pk=instance.pk)
            instance._old_status = old_instance.status
        except sender.DoesNotExist:
            instance._old_status = None
    else:
        instance._old_status = None


@receiver(post_save, sender='payments.Transaction')
def handle_payment_notification(sender, instance, created, **kwargs):
    """
    Handle payment-related notifications
    """
    if created:
        # New payment initiated - DO NOT send success notification yet
        # Just log the payment initiation
        logger.info(f"Payment initiated: {instance.id}, reference: {instance.paystack_reference}")
    
    else:
        # Check if status actually changed
        old_status = getattr(instance, '_old_status', None)
        
        # Only send notification if status changed from non-success to success, or to failed
        if old_status != instance.status:
            if instance.status == 'success' and old_status != 'success':
                # Get subscription details for payment notification
                from django.utils import timezone
                from datetime import timedelta
                from src.apps.payments.models import Subscription
                
                # Get the actual Subscription object, not the user.subscription CharField
                subscription_obj = instance.subscription  # From transaction's ForeignKey
                if not subscription_obj:
                    # Try to get active subscription from user
                    subscription_obj = Subscription.objects.filter(
                        user=instance.user,
                        status='active'
                    ).first()
                
                subscription_type = subscription_obj.subscription_type if subscription_obj else 'free'
                remaining_credits = subscription_obj.remaining_credits if subscription_obj else 0
                end_date = subscription_obj.end_date if subscription_obj else None
                
                # Format subscription details
                if subscription_type == 'yearly':
                    description_text = "Yearly Premium Subscription - Unlimited uploads"
                    credits_info = "Unlimited uploads"
                elif subscription_type == 'pay_per_song':
                    description_text = f"Pay Per Song - {remaining_credits} credit{'s' if remaining_credits != 1 else ''}"
                    credits_info = f"{remaining_credits} upload credit{'s' if remaining_credits != 1 else ''}"
                else:
                    description_text = instance.description or instance.get_transaction_type_display()
                    credits_info = "N/A"
                
                # Wrap email notification in try/except so template errors don't break payment processing
                try:
                    # Wrap data in context_data object to match template expectations
                    payment_context = {
                        'amount': f"{instance.amount:,.2f}",
                        'currency': instance.currency,
                        'description': description_text,
                        'transaction_id': str(instance.id),
                        'reference': instance.paystack_reference,
                        'payment_date': timezone.now().strftime('%B %d, %Y'),
                        'payment_time': timezone.now().strftime('%I:%M %p'),
                        'subscription_type': subscription_type,
                        'credits_remaining': remaining_credits,
                        'credits_info': credits_info,
                        'subscription_end_date': end_date.strftime('%B %d, %Y') if end_date else 'N/A',
                        'subscription_valid_until': end_date.strftime('%B %d, %Y') if end_date else 'No expiry',
                        'payment_method': 'Paystack',
                        'transaction_type': instance.get_transaction_type_display(),
                    }
                    
                    NotificationService.send_user_notification(
                        user=instance.user,
                        notification_type_name='payment_received',
                        title="Payment Successful! 🎉",
                        message=f"Your payment of ₦{instance.amount:,.2f} for {description_text} has been confirmed.",
                        context_data={'context_data': payment_context},  # Wrap in context_data key
                        priority='high'
                    )
                except Exception as e:
                    # Log but don't fail payment processing
                    logger.error(f"Failed to send payment success email: {str(e)}")
                    pass
            elif instance.status == 'failed' and old_status != 'failed':
                # Get payment failure details
                from django.utils import timezone
                from datetime import timedelta
                
                # Calculate retry date (7 days from now)
                retry_date = timezone.now() + timedelta(days=7)
                
                # Get failure reason from payment metadata if available
                failure_reason = "Payment verification failed"
                if hasattr(instance, 'metadata') and instance.metadata:
                    failure_reason = instance.metadata.get('failure_reason', failure_reason)
                
                NotificationService.send_user_notification(
                    user=instance.user,
                    notification_type_name='payment_failed',
                    title="Payment Failed ❌",
                    message=f"Your payment of ₦{instance.amount:,.2f} could not be processed. {failure_reason}. Please try again or contact support.",
                    context_data={
                        'amount': f"{instance.amount:,.2f}",
                        'currency': instance.currency,
                        'transaction_id': str(instance.id),
                        'reference': instance.paystack_reference,
                        'attempt_date': timezone.now().strftime('%B %d, %Y'),
                        'retry_date': retry_date.strftime('%B %d, %Y'),
                        'failure_reason': failure_reason,
                        'payment_method': 'Paystack',
                        'transaction_type': instance.get_transaction_type_display(),
                        'description': instance.description or 'Subscription payment',
                    },
                    priority='urgent'
                )
