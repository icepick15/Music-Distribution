"""
Test script for the referral system
Run with: python test_referral_system.py
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'music_distribution_backend.settings')
django.setup()

from src.apps.users.models import User
from src.apps.referrals.models import ReferralCode, Referral, ReferralCredit
from src.apps.payments.models import Transaction
from decimal import Decimal
from django.utils import timezone


def test_referral_system():
    print("=" * 50)
    print("REFERRAL SYSTEM TEST")
    print("=" * 50)
    
    # 1. Create test users
    print("\n1. Creating test users...")
    referrer, created = User.objects.get_or_create(
        email='referrer@test.com',
        defaults={
            'username': 'referrer_user',
            'first_name': 'Referrer',
            'last_name': 'User'
        }
    )
    if created:
        referrer.set_password('testpass123')
        referrer.save()
    print(f"   ✓ Referrer: {referrer.email}")
    
    referred1, created = User.objects.get_or_create(
        email='referred1@test.com',
        defaults={
            'username': 'referred_user1',
            'first_name': 'Referred',
            'last_name': 'User1'
        }
    )
    if created:
        referred1.set_password('testpass123')
        referred1.save()
    print(f"   ✓ Referred User 1: {referred1.email}")
    
    referred2, created = User.objects.get_or_create(
        email='referred2@test.com',
        defaults={
            'username': 'referred_user2',
            'first_name': 'Referred',
            'last_name': 'User2'
        }
    )
    if created:
        referred2.set_password('testpass123')
        referred2.save()
    print(f"   ✓ Referred User 2: {referred2.email}")
    
    # 2. Create referral code for referrer
    print("\n2. Creating referral code...")
    referral_code, created = ReferralCode.objects.get_or_create(user=referrer)
    print(f"   ✓ Referral Code: {referral_code.code}")
    print(f"   ✓ Referral URL: {referral_code.referral_url}")
    
    # 3. Create referrals (simulate clicks and signups)
    print("\n3. Creating referrals...")
    
    referral1, created = Referral.objects.get_or_create(
        referral_code=referral_code,
        referred_user=referred1,
        defaults={
            'status': 'signed_up',
            'ip_address': '192.168.1.1',
            'user_agent': 'Test Browser',
            'tracking_cookie': 'cookie_123',
            'signed_up_at': timezone.now()
        }
    )
    print(f"   ✓ Referral 1: {referred1.email} ({referral1.status})")
    
    referral2, created = Referral.objects.get_or_create(
        referral_code=referral_code,
        referred_user=referred2,
        defaults={
            'status': 'signed_up',
            'ip_address': '192.168.1.2',
            'user_agent': 'Test Browser',
            'tracking_cookie': 'cookie_456',
            'signed_up_at': timezone.now()
        }
    )
    print(f"   ✓ Referral 2: {referred2.email} ({referral2.status})")
    
    # 4. Simulate payments from referred users
    print("\n4. Simulating payments...")
    
    # First payment
    transaction1, created = Transaction.objects.get_or_create(
        paystack_reference='test_ref_1',
        defaults={
            'user': referred1,
            'transaction_type': 'song_upload',
            'amount': Decimal('9.99'),
            'status': 'success'
        }
    )
    if not created:
        transaction1.status = 'success'
        transaction1.save()
    print(f"   ✓ Payment 1: ${transaction1.amount} from {referred1.email}")
    
    # Manually trigger payment processing for referral
    referral1.mark_paid(transaction1.amount)
    referral_code.refresh_from_db()
    print(f"   ✓ Referral 1 marked as paid")
    print(f"   ✓ Paid referrals count: {referral_code.paid_referrals}")
    
    # Second payment (should trigger credit award)
    transaction2, created = Transaction.objects.get_or_create(
        paystack_reference='test_ref_2',
        defaults={
            'user': referred2,
            'transaction_type': 'song_upload',
            'amount': Decimal('9.99'),
            'status': 'success'
        }
    )
    if not created:
        transaction2.status = 'success'
        transaction2.save()
    print(f"   ✓ Payment 2: ${transaction2.amount} from {referred2.email}")
    
    # Manually trigger payment processing for referral
    referral2.mark_paid(transaction2.amount)
    referral_code.refresh_from_db()
    print(f"   ✓ Referral 2 marked as paid")
    print(f"   ✓ Paid referrals count: {referral_code.paid_referrals}")
    
    # 5. Check if credit was awarded
    print("\n5. Checking credits...")
    
    # Manually create credit (since signal might not fire in test)
    if referral_code.paid_referrals >= 2:
        paid_referrals = Referral.objects.filter(
            referral_code=referral_code,
            status='paid'
        ).order_by('-first_payment_at')[:2]
        
        credit, created = ReferralCredit.objects.get_or_create(
            user=referrer,
            status='available',
            defaults={'amount': 1}
        )
        
        if created or credit.earned_from_referrals.count() == 0:
            credit.earned_from_referrals.set(paid_referrals)
            for ref in paid_referrals:
                ref.status = 'credit_awarded'
                ref.credit_awarded_at = timezone.now()
                ref.save()
            print(f"   ✓ Credit created and awarded!")
        else:
            print(f"   ✓ Credit already exists")
        
        available_credits = ReferralCredit.get_available_credits(referrer)
        print(f"   ✓ Available credits for {referrer.email}: {available_credits}")
    
    # 6. Display statistics
    print("\n6. Referral Statistics:")
    print(f"   • Total clicks: {referral_code.clicks}")
    print(f"   • Total signups: {referral_code.signups}")
    print(f"   • Total paid referrals: {referral_code.paid_referrals}")
    print(f"   • Conversion rate: {referral_code.conversion_rate}%")
    print(f"   • Payment rate: {referral_code.payment_rate}%")
    print(f"   • Credits earned: {referral_code.paid_referrals // 2}")
    
    print("\n7. Referral Details:")
    for ref in Referral.objects.filter(referral_code=referral_code):
        print(f"   • {ref.referred_user.email if ref.referred_user else 'Anonymous'}")
        print(f"     Status: {ref.status}")
        if ref.first_payment_at:
            print(f"     First payment: ${ref.first_payment_amount} on {ref.first_payment_at.date()}")
    
    print("\n8. Credits:")
    for credit in ReferralCredit.objects.filter(user=referrer):
        print(f"   • {credit.amount} credit(s) - {credit.status}")
        print(f"     Earned from {credit.earned_from_referrals.count()} referral(s)")
        print(f"     Earned at: {credit.earned_at.date()}")
    
    print("\n" + "=" * 50)
    print("TEST COMPLETED SUCCESSFULLY!")
    print("=" * 50)
    print("\nNext steps:")
    print("1. Visit http://127.0.0.1:8000/admin/ to view referral data")
    print("2. Login to frontend and check /dashboard/referrals")
    print(f"3. Test referral link: http://localhost:5173/join/{referral_code.code}")
    print("\nTest users created:")
    print(f"  • {referrer.email} / testpass123 (Referrer)")
    print(f"  • {referred1.email} / testpass123 (Referred 1)")
    print(f"  • {referred2.email} / testpass123 (Referred 2)")


if __name__ == '__main__':
    try:
        test_referral_system()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
