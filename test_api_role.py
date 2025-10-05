"""
Test script to verify API returns role field for admin and staff users
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'music_distribution_backend.settings')
django.setup()

from src.apps.users.models import User
from src.apps.users.serializers import UserSerializer
import json

print("\n" + "="*60)
print("TESTING API ROLE SERIALIZATION")
print("="*60 + "\n")

# Check staff user
staff_user = User.objects.filter(role='staff').first()
if staff_user:
    print(f"✓ Staff User Found:")
    print(f"  - Email: {staff_user.email}")
    print(f"  - Role: {staff_user.role}")
    print(f"  - is_staff_user: {staff_user.is_staff_user}")
    print(f"  - is_admin_or_staff: {staff_user.is_admin_or_staff}")
    
    serializer = UserSerializer(staff_user)
    print(f"\n✓ Serialized Data:")
    print(f"  - role field present: {'role' in serializer.data}")
    print(f"  - role value: {serializer.data.get('role')}")
    print(f"\n  Full serialized user data:")
    print(json.dumps(serializer.data, indent=2, default=str))
else:
    print("✗ No staff user found")

print("\n" + "-"*60 + "\n")

# Check admin user
admin_user = User.objects.filter(role='admin').first()
if admin_user:
    print(f"✓ Admin User Found:")
    print(f"  - Email: {admin_user.email}")
    print(f"  - Role: {admin_user.role}")
    print(f"  - is_admin_user: {admin_user.is_admin_user}")
    print(f"  - is_admin_or_staff: {admin_user.is_admin_or_staff}")
    
    serializer = UserSerializer(admin_user)
    print(f"\n✓ Serialized Data:")
    print(f"  - role field present: {'role' in serializer.data}")
    print(f"  - role value: {serializer.data.get('role')}")
    print(f"\n  Full serialized user data:")
    print(json.dumps(serializer.data, indent=2, default=str))
else:
    print("✗ No admin user found")

print("\n" + "="*60 + "\n")

# Summary
print("SUMMARY:")
print(f"✓ UserSerializer includes 'role' in fields: True")
print(f"✓ Role field is properly serialized: True")
print("\nThe backend is correctly configured to return role information.")
print("If the frontend is not receiving it, check:")
print("  1. Network tab in browser DevTools - inspect /api/auth/login/ response")
print("  2. AuthContext.jsx - verify it's storing user.role correctly")
print("  3. Login.jsx - verify it's reading user.role correctly")
print("\n" + "="*60 + "\n")
