#!/usr/bin/env python
import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'music_distribution_backend.settings')
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
import json

User = get_user_model()

def test_auto_verify_endpoint():
    from django.conf import settings
    
    # Add testserver to ALLOWED_HOSTS temporarily
    original_hosts = settings.ALLOWED_HOSTS
    if 'testserver' not in settings.ALLOWED_HOSTS:
        settings.ALLOWED_HOSTS = settings.ALLOWED_HOSTS + ['testserver']
    
    try:
        client = Client()
        user = User.objects.first()
        
        # Login the user
        client.force_login(user)
        
        print("Testing auto-verify endpoint...")
        
        # Call the auto-verify endpoint
        response = client.post('/api/payments/verify-pending/', 
                              content_type='application/json')
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {data}")
            print(f"Verified Count: {data.get('verified_count')}")
        else:
            print(f"Error Response: {response.content}")
    
    finally:
        # Restore original ALLOWED_HOSTS
        settings.ALLOWED_HOSTS = original_hosts

if __name__ == "__main__":
    test_auto_verify_endpoint()