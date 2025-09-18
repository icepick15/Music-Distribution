import os
import django
import requests

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'music_distribution_backend.settings')
django.setup()

# Test the API endpoint
try:
    response = requests.get('http://127.0.0.1:8000/api/songs/')
    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    print(f"Response Text: {response.text[:500]}")
except Exception as e:
    print(f"Request failed: {e}")

# Test basic connectivity
try:
    response = requests.get('http://127.0.0.1:8000/')
    print(f"\nRoot URL Status: {response.status_code}")
    print(f"Root URL Text: {response.text[:200]}")
except Exception as e:
    print(f"Root URL failed: {e}")
