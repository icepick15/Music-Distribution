#!/usr/bin/env python
import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'music_distribution_backend.settings')
django.setup()

from src.apps.users.models import User
from src.apps.payments.models import Subscription

def check_subscription_data():
    user = User.objects.first()
    print(f"=== DATABASE STATE ===")
    print(f"User: {user.username}")
    print(f"User subscription field: {user.subscription}")
    print(f"Type: {type(user.subscription)}")
    
    subscription = Subscription.objects.filter(user=user).first()
    print(f"Subscription object: {subscription}")
    
    if subscription:
        print(f"Song Credits: {subscription.song_credits}")
        print(f"Credits Used: {subscription.credits_used}")
        print(f"Remaining Credits: {subscription.remaining_credits}")
        print(f"Subscription Type: {subscription.subscription_type}")
        print(f"Status: {subscription.status}")
    else:
        print("No Subscription object found!")

if __name__ == "__main__":
    check_subscription_data()