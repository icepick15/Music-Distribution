#!/usr/bin/env python
import os
import sys
import django
from pathlib import Path

# Add the project directory to Python path
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'music_distribution_backend.settings')

try:
    django.setup()
    print("✅ Django setup successful")
except Exception as e:
    print(f"❌ Django setup failed: {e}")
    sys.exit(1)

# Test .env loading
print("\n🔍 Testing .env file loading...")
from decouple import config

# Test config loading
email_host = config('EMAIL_HOST', default='NOT_FOUND')
admin_email = config('ADMIN_EMAIL', default='NOT_FOUND') 
email_user = config('EMAIL_HOST_USER', default='NOT_FOUND')

print(f"EMAIL_HOST from .env: {email_host}")
print(f"ADMIN_EMAIL from .env: {admin_email}")
print(f"EMAIL_HOST_USER from .env: {email_user}")

# Test Django settings
print("\n🔍 Testing Django settings...")
try:
    from django.conf import settings
    
    print(f"settings.EMAIL_HOST: {getattr(settings, 'EMAIL_HOST', 'NOT_SET')}")
    print(f"settings.EMAIL_HOST_USER: {getattr(settings, 'EMAIL_HOST_USER', 'NOT_SET')}")
    print(f"settings.ADMIN_EMAIL: {getattr(settings, 'ADMIN_EMAIL', 'NOT_SET')}")
    print(f"settings.DEFAULT_FROM_EMAIL: {getattr(settings, 'DEFAULT_FROM_EMAIL', 'NOT_SET')}")
    
except Exception as e:
    print(f"❌ Error accessing Django settings: {e}")
    sys.exit(1)

# Test email sending
print("\n📧 Testing email sending...")
try:
    from django.core.mail import send_mail
    
    send_mail(
        'Test Email - Music Platform Setup Complete',
        'Congratulations! Your email configuration is working correctly. You should now receive notifications when users upload songs.',
        settings.DEFAULT_FROM_EMAIL,
        [settings.ADMIN_EMAIL],
        fail_silently=False,
    )
    
    print("✅ Email sent successfully!")
    print(f"📬 Check your inbox at: {settings.ADMIN_EMAIL}")
    
except Exception as e:
    print(f"❌ Email sending failed: {e}")
    print("\nPossible issues:")
    print("1. Check Gmail app password (16 characters, no spaces)")
    print("2. Ensure 2-Factor Authentication is enabled on Gmail")
    print("3. Verify email address is correct")

print("\n" + "="*50)
print("Email configuration test complete!")
