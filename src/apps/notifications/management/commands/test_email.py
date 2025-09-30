from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.conf import settings


class Command(BaseCommand):
    help = 'Test basic email sending without notifications'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--to',
            type=str,
            required=True,
            help='Email address to send test email to',
        )
    
    def handle(self, *args, **options):
        to_email = options['to']
        
        self.stdout.write("📧 Testing basic email sending...")
        self.stdout.write(f"📤 From: {settings.EMAIL_HOST_USER}")
        self.stdout.write(f"📥 To: {to_email}")
        self.stdout.write(f"🏠 SMTP Host: {settings.EMAIL_HOST}:{settings.EMAIL_PORT}")
        
        try:
            send_mail(
                subject='Test Email from Music Distribution Platform',
                message='This is a test email to verify SMTP configuration.',
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[to_email],
                fail_silently=False,
            )
            
            self.stdout.write(
                self.style.SUCCESS('✅ Email sent successfully!')
            )
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Email failed: {str(e)}')
            )
            
            # Provide troubleshooting tips
            self.stdout.write(
                self.style.WARNING(
                    '\n🔧 Troubleshooting tips:\n'
                    '1. Make sure 2-factor authentication is enabled on Gmail\n'
                    '2. Generate a new App Password in Google Account settings\n'
                    '3. Check if your network allows SMTP connections\n'
                    '4. Try using 465 port with SSL instead of 587 with TLS'
                )
            )