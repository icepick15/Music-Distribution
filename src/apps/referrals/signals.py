from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db.models import Count
from src.apps.payments.models import Transaction
from .models import Referral, ReferralCredit


@receiver(post_save, sender=Transaction)
def handle_payment_for_referral(sender, instance, created, **kwargs):
    """
    When a user makes their first payment, mark their referral as paid
    and award credits to the referrer when they reach 2 paid referrals
    """
    if not created:
        return
    
    # Only process successful payments
    if instance.status != 'completed':
        return
    
    # Check if this user was referred
    try:
        referral = Referral.objects.get(
            referred_user=instance.user,
            status__in=['signed_up', 'pending']
        )
    except Referral.DoesNotExist:
        return
    
    # Mark referral as paid
    referral.mark_paid(instance.amount)
    
    # Check if referrer should get a credit
    referral_code = referral.referral_code
    paid_count = Referral.objects.filter(
        referral_code=referral_code,
        status__in=['paid', 'credit_awarded']
    ).count()
    
    # Award credit for every 2 paid referrals
    if paid_count % 2 == 0:
        # Get the last 2 paid referrals
        last_two_referrals = Referral.objects.filter(
            referral_code=referral_code,
            status='paid'
        ).order_by('-first_payment_at')[:2]
        
        # Create credit
        credit = ReferralCredit.objects.create(
            user=referral_code.user,
            amount=1,
            status='available'
        )
        
        # Link the referrals to this credit
        credit.earned_from_referrals.set(last_two_referrals)
        
        # Mark referrals as credit awarded
        for ref in last_two_referrals:
            ref.status = 'credit_awarded'
            ref.credit_awarded_at = credit.earned_at
            ref.save()
        
        # TODO: Send notification to referrer about new credit
        from src.apps.notifications.services import NotificationService
        try:
            NotificationService.send_user_notification(
                user=referral_code.user,
                notification_type='referral_credit',
                title='🎉 You earned a free upload credit!',
                message=f'You earned 1 free upload credit from your referrals. You now have {ReferralCredit.get_available_credits(referral_code.user)} credits available.',
                priority='normal'
            )
        except Exception as e:
            # Don't fail if notification fails
            print(f"Failed to send referral credit notification: {e}")
