#!/usr/bin/env python3
"""
Direct API test script to check the admin users endpoint
"""
import requests
import json

def test_admin_users_api():
    url = "http://localhost:8000/api/admin/users/"
    
    try:
        print(f"🔄 Testing API endpoint: {url}")
        response = requests.get(url, timeout=10)
        
        print(f"📡 Response status: {response.status_code}")
        print(f"📡 Response headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success! Got {len(data)} users")
            for i, user in enumerate(data[:3]):  # Show first 3 users
                print(f"  User {i+1}: {user.get('username', 'Unknown')} (ID: {user.get('id', 'Unknown')})")
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"❌ Response text: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection error - Django server might not be running on port 8000")
    except requests.exceptions.Timeout:
        print("❌ Request timeout")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    test_admin_users_api()
