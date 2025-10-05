"""
Verify Test Environment Setup
Quick check to ensure everything is ready for Phase 2 testing
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'music_distribution_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.conf import settings

User = get_user_model()

def verify_setup():
    print("\n" + "="*60)
    print("🔍 PHASE 2 TEST ENVIRONMENT VERIFICATION")
    print("="*60 + "\n")
    
    # Check 1: Test accounts exist
    print("📋 Checking Test Accounts...")
    admin_count = User.objects.filter(role='admin').count()
    staff_count = User.objects.filter(role='staff').count()
    
    print(f"   Admin accounts: {admin_count}")
    print(f"   Staff accounts: {staff_count}")
    
    if admin_count == 0:
        print("   ❌ No admin accounts found!")
        print("   → Run: python create_test_accounts.py")
    else:
        print("   ✅ Admin accounts exist")
        
    if staff_count == 0:
        print("   ❌ No staff accounts found!")
        print("   → Run: python create_test_accounts.py")
    else:
        print("   ✅ Staff accounts exist")
    
    # Check 2: User model properties
    print("\n📋 Checking User Model Properties...")
    try:
        test_user = User.objects.first()
        if test_user:
            has_admin_prop = hasattr(test_user, 'is_admin_user')
            has_staff_prop = hasattr(test_user, 'is_staff_user')
            has_admin_or_staff = hasattr(test_user, 'is_admin_or_staff')
            
            if has_admin_prop and has_staff_prop and has_admin_or_staff:
                print("   ✅ User model properties exist")
            else:
                print("   ❌ Missing user model properties")
                print("   → Check src/apps/users/models.py")
        else:
            print("   ⚠️  No users in database")
    except Exception as e:
        print(f"   ❌ Error checking user properties: {str(e)}")
    
    # Check 3: Django admin route
    print("\n📋 Checking Django Admin Route...")
    from django.urls import resolve, reverse
    try:
        # This will fail if route doesn't exist
        admin_path = reverse('admin:index')
        if 'control-panel' in admin_path:
            print(f"   ✅ Admin route obscured: {admin_path}")
        else:
            print(f"   ⚠️  Admin route may not be obscured: {admin_path}")
    except Exception as e:
        print(f"   ❌ Error checking admin route: {str(e)}")
    
    # Check 4: Email backend
    print("\n📋 Checking Email Configuration...")
    email_backend = settings.EMAIL_BACKEND
    print(f"   Email Backend: {email_backend}")
    
    if 'console' in email_backend.lower():
        print("   ℹ️  Using console backend - emails will appear in terminal")
    elif 'smtp' in email_backend.lower():
        print("   ✅ Using SMTP backend - real emails will be sent")
        if hasattr(settings, 'EMAIL_HOST'):
            print(f"   SMTP Host: {settings.EMAIL_HOST}")
    else:
        print("   ⚠️  Unknown email backend")
    
    # Check 5: Permission classes
    print("\n📋 Checking Permission Classes...")
    try:
        from src.apps.admin_dashboard.permissions import (
            IsAdminOrStaff, IsAdminOnly, IsStaffReadOnly, IsSuperuserOnly
        )
        print("   ✅ Permission classes imported successfully")
    except ImportError as e:
        print(f"   ❌ Cannot import permission classes: {str(e)}")
        print("   → Check src/apps/admin_dashboard/permissions.py")
    
    # Check 6: Show test account details
    print("\n" + "="*60)
    print("📋 TEST ACCOUNT DETAILS")
    print("="*60)
    
    print("\n🔴 ADMIN ACCOUNTS:")
    admin_users = User.objects.filter(role='admin')
    if admin_users.exists():
        for user in admin_users:
            print(f"\n   Username: {user.username}")
            print(f"   Email: {user.email}")
            print(f"   Role: {user.role}")
            print(f"   Is Admin: {user.is_admin_user if hasattr(user, 'is_admin_user') else 'N/A'}")
            print(f"   Is Staff: {user.is_staff}")
            print(f"   Is Superuser: {user.is_superuser}")
    else:
        print("   ❌ No admin accounts found")
    
    print("\n🔵 STAFF ACCOUNTS:")
    staff_users = User.objects.filter(role='staff')
    if staff_users.exists():
        for user in staff_users:
            print(f"\n   Username: {user.username}")
            print(f"   Email: {user.email}")
            print(f"   Role: {user.role}")
            print(f"   Is Admin: {user.is_admin_user if hasattr(user, 'is_admin_user') else 'N/A'}")
            print(f"   Is Staff: {user.is_staff}")
            print(f"   Is Superuser: {user.is_superuser}")
    else:
        print("   ❌ No staff accounts found")
    
    # Summary
    print("\n" + "="*60)
    print("📊 VERIFICATION SUMMARY")
    print("="*60)
    
    checks_passed = 0
    total_checks = 6
    
    if admin_count > 0:
        checks_passed += 1
    if staff_count > 0:
        checks_passed += 1
    if test_user and hasattr(test_user, 'is_admin_user'):
        checks_passed += 1
    if 'control-panel' in admin_path:
        checks_passed += 1
    if email_backend:
        checks_passed += 1
    try:
        from src.apps.admin_dashboard.permissions import IsAdminOrStaff
        checks_passed += 1
    except:
        pass
    
    print(f"\n   Checks Passed: {checks_passed}/{total_checks}")
    
    if checks_passed == total_checks:
        print("   ✅ All checks passed! Ready for testing.")
    elif checks_passed >= 4:
        print("   ⚠️  Most checks passed. Review warnings above.")
    else:
        print("   ❌ Several checks failed. Fix issues before testing.")
    
    print("\n" + "="*60)
    print("🚀 NEXT STEPS")
    print("="*60)
    print("\n1. Start Django backend:")
    print("   python manage.py runserver")
    print("\n2. Start React frontend:")
    print("   cd frontend && npm run dev")
    print("\n3. Open browser:")
    print("   http://localhost:5173/")
    print("\n4. Login with test accounts")
    print("\n5. Follow TESTING_GUIDE_PHASE_2.md")
    print("="*60 + "\n")

if __name__ == '__main__':
    try:
        verify_setup()
    except Exception as e:
        print(f"\n❌ Error during verification: {str(e)}")
        import traceback
        traceback.print_exc()
