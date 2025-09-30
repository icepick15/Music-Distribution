from django.core.management.base import BaseCommand
import requests


class Command(BaseCommand):
    help = 'Test ZeptoMail API directly'
    
    def handle(self, *args, **options):
        self.stdout.write("🧪 Testing ZeptoMail API directly...")
        
        url = "https://api.zeptomail.com/v1.1/email"
        
        payload = {
            "from": {"address": "support@zabug.com"},
            "to": [{"email_address": {"address": "iamicepick@yahoo.com", "name": "Test User"}}],
            "subject": "Test Email from Music Distribution Platform",
            "htmlbody": "<div><b>🎵 Test email from your music platform!</b><br/>This confirms ZeptoMail API is working.</div>"
        }
        
        headers = {
            'accept': "application/json",
            'content-type': "application/json",
            'authorization': "Zoho-enczapikey wSsVR613/0amWvt0yTL4c+46yFpTAQygER90iwOi6H/1H6iW8MdpxEGfBQSmHKMZFmdpFWRD9r8ry0wF1zZa2dkry1EECSiF9mqRe1U4J3x17qnvhDzKXGtalBCLKowPxw1un2JhEMEm+g==",
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            
            self.stdout.write(f"📊 Status Code: {response.status_code}")
            self.stdout.write(f"📝 Response: {response.text}")
            
            if response.status_code == 200:
                self.stdout.write(
                    self.style.SUCCESS("✅ ZeptoMail API test successful! Check your email.")
                )
            else:
                self.stdout.write(
                    self.style.ERROR(f"❌ ZeptoMail API failed: {response.status_code}")
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"❌ Error testing ZeptoMail API: {str(e)}")
            )