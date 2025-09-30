from celery import shared_task
from django.utils import timezone
from .models import Subscription
import logging

logger = logging.getLogger(__name__)


@shared_task
def expire_subscriptions():
    """Expire subscriptions that are past end_date or have zero credits and revert roles when appropriate."""
    now = timezone.now()

    # Expire yearly subscriptions past their end date
    expired_yearly = Subscription.objects.filter(
        subscription_type='yearly',
        status='active',
        end_date__lt=now
    )
    for sub in expired_yearly:
        try:
            sub.status = 'expired'
            sub.save()

            # If user has no other active subscription, revert role
            has_other = Subscription.objects.filter(user=sub.user, status='active').exclude(id=sub.id).exists()
            if not has_other:
                try:
                    sub.user.role = 'user'
                    sub.user.subscription = 'free'
                    sub.user.subscription_expires_at = None
                    sub.user.save()
                except Exception:
                    logger.exception('Failed to revert user role for expired yearly subscription')
        except Exception:
            logger.exception('Failed to expire yearly subscription %s', sub.id)

    # Note: Pay-per-song subscriptions should NOT be expired when credits reach 0
    # Users should be able to buy more credits for the same subscription
    # Only expire pay-per-song subscriptions if they are manually cancelled
    # This section is commented out to allow credit top-ups
    
    # payper = Subscription.objects.filter(
    #     subscription_type='pay_per_song',
    #     status='active'
    # )
    # for sub in payper:
    #     try:
    #         if sub.remaining_credits <= 0:
    #             # Don't expire - allow users to buy more credits
    #             pass
    #     except Exception:
    #         logger.exception('Failed to check pay_per_song subscription %s', sub.id)

    return {'status': 'completed'}
