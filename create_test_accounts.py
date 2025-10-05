"""
Create Admin and Staff Test Accounts
Run this script to create test accounts for Phase 2 testing
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'music_distribution_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()

def create_test_accounts():
    """Create admin and staff test accounts"""
    
    print("\n" + "="*60)
    print("🎯 CREATING TEST ACCOUNTS FOR PHASE 2 TESTING")
    print("="*60 + "\n")
    
    # Get custom email from user
    print("Enter your custom email for testing:")
    custom_email = input("Email: ").strip()
    
    if not custom_email or '@' not in custom_email:
        print("❌ Invalid email address!")
        return
    
    # Extract username base from email
    email_base = custom_email.split('@')[0]
    
    with transaction.atomic():
        # Create Admin Account
        admin_username = f"{email_base}_admin"
        admin_email = custom_email.replace('@', '+admin@')
        
        if User.objects.filter(username=admin_username).exists():
            print(f"⚠️  Admin account already exists: {admin_username}")
            admin_user = User.objects.get(username=admin_username)
            # Update email
            admin_user.email = admin_email
            admin_user.save()
            print(f"✅ Updated admin email to: {admin_email}")
        else:
            admin_user = User.objects.create_user(
                username=admin_username,
                email=admin_email,
                password='admin123',  # Change this after testing
                first_name='Admin',
                last_name='User',
                is_staff=True,
                is_superuser=False,
                role='admin'
            )
            print(f"✅ Created admin account: {admin_username}")
        
        # Create Staff Account
        staff_username = f"{email_base}_staff"
        staff_email = custom_email.replace('@', '+staff@')
        
        if User.objects.filter(username=staff_username).exists():
            print(f"⚠️  Staff account already exists: {staff_username}")
            staff_user = User.objects.get(username=staff_username)
            # Update email and role
            staff_user.email = staff_email
            staff_user.role = 'staff'
            staff_user.is_staff = True
            staff_user.is_superuser = False
            staff_user.save()
            print(f"✅ Updated staff email to: {staff_email}")
        else:
            staff_user = User.objects.create_user(
                username=staff_username,
                email=staff_email,
                password='staff123',  # Change this after testing
                first_name='Staff',
                last_name='Member',
                is_staff=True,
                is_superuser=False,
                role='staff'
            )
            print(f"✅ Created staff account: {staff_username}")
        
        print("\n" + "="*60)
        print("🎉 TEST ACCOUNTS CREATED SUCCESSFULLY!")
        print("="*60)
        
        print("\n📋 ADMIN ACCOUNT:")
        print(f"   Username: {admin_username}")
        print(f"   Email: {admin_email}")
        print(f"   Password: admin123")
        print(f"   Role: {admin_user.role}")
        print(f"   Is Admin: {admin_user.is_admin_user}")
        print(f"   Is Staff: {admin_user.is_staff}")
        print(f"   Is Superuser: {admin_user.is_superuser}")
        
        print("\n📋 STAFF ACCOUNT:")
        print(f"   Username: {staff_username}")
        print(f"   Email: {staff_email}")
        print(f"   Password: staff123")
        print(f"   Role: {staff_user.role}")
        print(f"   Is Admin: {staff_user.is_admin_user}")
        print(f"   Is Staff: {staff_user.is_staff}")
        print(f"   Is Superuser: {staff_user.is_superuser}")
        
        print("\n" + "="*60)
        print("📧 EMAIL NOTIFICATION TESTING:")
        print("="*60)
        print(f"Both accounts use variants of: {custom_email}")
        print(f"Admin emails go to: {admin_email}")
        print(f"Staff emails go to: {staff_email}")
        print("\nIf your email provider supports + addressing (Gmail does),")
        print("both will arrive in your inbox with different addresses.")
        
        print("\n" + "="*60)
        print("🚀 NEXT STEPS:")
        print("="*60)
        print("1. Start the Django backend server")
        print("2. Start the React frontend server")
        print("3. Login with admin account to test full access")
        print("4. Login with staff account to test restrictions")
        print("5. Check email notifications for both accounts")
        
        print("\n" + "="*60)
        print("⚠️  SECURITY NOTE:")
        print("="*60)
        print("These are TEST accounts with simple passwords.")
        print("Change passwords after testing or delete these accounts.")
        print("="*60 + "\n")

if __name__ == '__main__':
    try:
        create_test_accounts()
    except Exception as e:
        print(f"\n❌ Error creating accounts: {str(e)}")
        import traceback
        traceback.print_exc()
