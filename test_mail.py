import os
import django
from django.core.mail import send_mail
from django.conf import settings

# Set up Django environment - skip database setup for email testing
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'music_distribution_backend.settings')

# For testing outside Docker, we'll skip database configuration
os.environ['DATABASE_URL'] = ''

django.setup()

def test_email():
    # Print current email configuration
    print("Current email settings:")
    print(f"EMAIL_BACKEND: {getattr(settings, 'EMAIL_BACKEND', 'Not set')}")
    print(f"EMAIL_HOST: {getattr(settings, 'EMAIL_HOST', 'Not set')}")
    print(f"EMAIL_PORT: {getattr(settings, 'EMAIL_PORT', 'Not set')}")
    print(f"EMAIL_USE_TLS: {getattr(settings, 'EMAIL_USE_TLS', 'Not set')}")
    print(f"EMAIL_HOST_USER: {getattr(settings, 'EMAIL_HOST_USER', 'Not set')}")
    print(f"EMAIL_HOST_PASSWORD: {'Set' if getattr(settings, 'EMAIL_HOST_PASSWORD', None) else 'Not set'}")
    print(f"DEFAULT_FROM_EMAIL: {getattr(settings, 'DEFAULT_FROM_EMAIL', 'Not set')}")
    print("-" * 50)
    
    # Test with console backend first
    print("Testing with console backend...")
    try:
        # Temporarily switch to console backend
        original_backend = settings.EMAIL_BACKEND
        settings.EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
        
        send_mail(
            'Test Console Email',
            'This is a test email using console backend.',
            settings.DEFAULT_FROM_EMAIL,
            ['iamicepick@yahoo.com'],  
            fail_silently=False,
        )
        print("Console email test successful!")
        
        # Restore original backend
        settings.EMAIL_BACKEND = original_backend
        
    except Exception as e:
        print(f"Console email failed: {e}")
    
    print("-" * 50)
    print("Testing with SMTP backend...")
    
    try:
        send_mail(
            'Test SMTP Email',
            'This is a test email to verify SMTP email configuration.',
            settings.DEFAULT_FROM_EMAIL,
            ['iamicepick@yahoo.com'],  
            fail_silently=False,
        )
        print("SMTP Email sent successfully!")
    except Exception as e:
        print(f"SMTP Email failed: {e}")

if __name__ == "__main__":
    test_email()