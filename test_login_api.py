"""
Quick diagnostic script to test login API and verify role is returned
Run this while your Django server is running (python manage.py runserver)
"""
import requests
import json

API_BASE_URL = 'http://127.0.0.1:8000/api'

print("\n" + "="*70)
print("LOGIN API TEST - VERIFYING ROLE IN RESPONSE")
print("="*70 + "\n")

# Test credentials
test_accounts = [
    {
        'email': 'iconxx101+staff@yahoo.com',
        'password': 'staff123',
        'expected_role': 'staff'
    },
    {
        'email': 'iconxx101+admin@yahoo.com',
        'password': 'admin123',
        'expected_role': 'admin'
    }
]

for account in test_accounts:
    print(f"\n{'─'*70}")
    print(f"Testing {account['expected_role'].upper()} Account")
    print(f"{'─'*70}\n")
    
    try:
        # Make login request
        response = requests.post(
            f"{API_BASE_URL}/auth/login/",
            json={
                'email': account['email'],
                'password': account['password']
            },
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"📡 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            # Check structure
            print(f"\n✓ Login Successful!")
            print(f"\n📦 Response Structure:")
            print(f"  - Has 'user' key: {'user' in data}")
            print(f"  - Has 'access' token: {'access' in data}")
            print(f"  - Has 'refresh' token: {'refresh' in data}")
            
            if 'user' in data:
                user = data['user']
                print(f"\n👤 User Object:")
                print(f"  - ID: {user.get('id')}")
                print(f"  - Email: {user.get('email')}")
                print(f"  - Username: {user.get('username')}")
                print(f"  - Full Name: {user.get('full_name')}")
                print(f"  - Role: {user.get('role')} {'✓' if user.get('role') == account['expected_role'] else '✗ MISMATCH!'}")
                
                # Check if role is present
                if 'role' in user:
                    print(f"\n✅ SUCCESS: Role field is present in user object")
                    print(f"   Role value: '{user['role']}'")
                    print(f"   Expected: '{account['expected_role']}'")
                    print(f"   Match: {'YES ✓' if user['role'] == account['expected_role'] else 'NO ✗'}")
                else:
                    print(f"\n❌ ERROR: Role field is MISSING from user object")
                    print(f"   This should not happen - backend is configured correctly")
                    print(f"   Check Django settings and middleware")
            
            # Show full response for debugging
            print(f"\n📄 Full User Object:")
            print(json.dumps(user, indent=2))
            
        else:
            print(f"\n❌ Login Failed")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print(f"\n❌ ERROR: Could not connect to API")
        print(f"   Make sure Django server is running:")
        print(f"   python manage.py runserver")
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")

print(f"\n{'═'*70}")
print(f"TEST COMPLETE")
print(f"{'═'*70}\n")

print("SUMMARY:")
print("--------")
print("If you see '✅ SUCCESS' above, the API is working correctly.")
print("The frontend should receive the user object with role field.")
print("\nTo debug frontend issues:")
print("1. Open browser DevTools (F12)")
print("2. Go to Network tab")
print("3. Login with test account")
print("4. Find /api/auth/login/ request")
print("5. Check Response tab - verify role is present")
print("6. Check Console tab - look for errors")
print("\nIf role is missing in browser but present here,")
print("check AuthContext.jsx line 157-161 for issues.")
print()
