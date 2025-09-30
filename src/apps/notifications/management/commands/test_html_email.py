from django.core.management.base import BaseCommand
from django.template.loader import render_to_string
from django.contrib.auth import get_user_model
from django.conf import settings
import requests

User = get_user_model()


class Command(BaseCommand):
    help = 'Test notification templates with actual HTML rendering'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            required=True,
            help='Email address to send test to',
        )
        parser.add_argument(
            '--template',
            type=str,
            default='user_welcome',
            help='Template to test (default: user_welcome)',
        )
    
    def handle(self, *args, **options):
        email = options['email']
        template_name = options['template']
        
        self.stdout.write(f"🎨 Testing HTML template: {template_name}")
        self.stdout.write(f"📧 Sending to: {email}")
        
        # Get or create test user
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            user = User.objects.create_user(
                email=email,
                username=email.split('@')[0],
                first_name='John',
                last_name='Doe'
            )
        
        # Render the HTML template
        try:
            html_content = render_to_string(
                f'notifications/{template_name}.html',
                {
                    'user': user,
                    'site_name': 'Music Distribution Platform',
                    'frontend_url': 'https://musicdist.com',
                    'support_email': 'support@zabug.com',
                    'year': 2025,
                    'context_data': {
                        'welcome_message': 'Welcome to our amazing music platform!',
                        'next_steps': [
                            'Complete your profile',
                            'Upload your first track',
                            'Explore distribution options'
                        ]
                    }
                }
            )
            
            self.stdout.write("✅ Template rendered successfully!")
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"❌ Template rendering failed: {str(e)}")
            )
            return
        
        # Send via ZeptoMail API with actual HTML
        url = "https://api.zeptomail.com/v1.1/email"
        
        payload = {
            "from": {
                "address": "support@zabug.com",
                "name": "Music Distribution Platform"
            },
            "to": [{
                "email_address": {
                    "address": email,
                    "name": f"{user.first_name} {user.last_name}"
                }
            }],
            "subject": f"🎵 Welcome to Music Distribution Platform, {user.first_name}!",
            "htmlbody": html_content,
            "textbody": f"Welcome {user.first_name}! Thanks for joining Music Distribution Platform."
        }
        
        headers = {
            'accept': "application/json",
            'content-type': "application/json",
            'authorization': f"Zoho-enczapikey {settings.ZEPTOMAIL_API_KEY}",
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            
            self.stdout.write(f"📊 Status Code: {response.status_code}")
            
            if response.status_code in [200, 201]:
                response_data = response.json()
                self.stdout.write(
                    self.style.SUCCESS(
                        f"✅ HTML email sent successfully!"
                        f"\\n📧 Template: {template_name}"
                        f"\\n👤 Recipient: {email}"
                        f"\\n🆔 Request ID: {response_data.get('request_id', 'N/A')}"
                        f"\\n💌 Check your email to see the beautiful HTML design!"
                    )
                )
            else:
                error_msg = response.text
                self.stdout.write(
                    self.style.ERROR(f"❌ Email failed: {response.status_code} - {error_msg}")
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"❌ Error sending email: {str(e)}")
            )
        
        # Show HTML preview in terminal (first 500 chars)
        self.stdout.write("\\n🔍 HTML Preview (first 500 characters):")
        self.stdout.write("-" * 60)
        self.stdout.write(html_content[:500] + "..." if len(html_content) > 500 else html_content)
        self.stdout.write("-" * 60)