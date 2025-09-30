#!/usr/bin/env python
import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'music_distribution_backend.settings')
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

def test_api_response():
    # Get the user
    user = User.objects.first()
    print(f"Testing API for user: {user.username}")
    
    # Create API client and authenticate
    client = APIClient()
    refresh = RefreshToken.for_user(user)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    
    # Call the subscription API
    response = client.get('/api/subscriptions/current/')
    
    print(f"=== API RESPONSE ===")
    print(f"Status Code: {response.status_code}")
    print(f"Response Data: {response.json()}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"\n=== PARSED FIELDS ===")
        print(f"Song Credits: {data.get('song_credits')}")
        print(f"Credits Used: {data.get('credits_used')}")
        print(f"Remaining Credits: {data.get('remaining_credits')}")
        print(f"Subscription Type: {data.get('subscription_type')}")
        print(f"Status: {data.get('status')}")

if __name__ == "__main__":
    test_api_response()