from django.core.management.base import BaseCommand
import requests


class Command(BaseCommand):
    help = 'Debug ZeptoMail API authentication and account details'
    
    def handle(self, *args, **options):
        self.stdout.write("🔍 Debugging ZeptoMail API...")
        
        # Test 1: Check API key validity with a simple request
        url = "https://api.zeptomail.com/v1.1/email"
        
        # Test with minimal payload first
        test_payloads = [
            {
                "name": "Minimal Test",
                "payload": {
                    "from": {"address": "support@zabug.com"},
                    "to": [{"email_address": {"address": "test@example.com"}}],
                    "subject": "Test"
                }
            },
            {
                "name": "With Different From Address",
                "payload": {
                    "from": {"address": "noreply@zabug.com"},
                    "to": [{"email_address": {"address": "test@example.com"}}],
                    "subject": "Test"
                }
            }
        ]
        
        headers = {
            'accept': "application/json",
            'content-type': "application/json",
            'authorization': "Zoho-enczapikey wSsVR613/0amWvt0yTL4c+46yFpTAQygER90iwOi6H/1H6iW8MdpxEGfBQSmHKMZFmdpFWRD9r8ry0wF1zZa2dkry1EECSiF9mqRe1U4J3x17qnvhDzKXGtalBCLKowPxw1un2JhEMEm+g==",
        }
        
        for test in test_payloads:
            self.stdout.write(f"\n🧪 Testing: {test['name']}")
            self.stdout.write(f"📤 From: {test['payload']['from']['address']}")
            
            try:
                response = requests.post(url, json=test['payload'], headers=headers, timeout=10)
                
                self.stdout.write(f"📊 Status: {response.status_code}")
                
                if response.status_code == 200:
                    self.stdout.write(self.style.SUCCESS("✅ Success!"))
                    break
                elif response.status_code == 401:
                    error_data = response.json()
                    details = error_data.get('error', {}).get('details', [])
                    if details:
                        detail = details[0]
                        self.stdout.write(f"❌ Error: {detail.get('message')}")
                        self.stdout.write(f"🎯 Target: {detail.get('target_value')}")
                else:
                    self.stdout.write(f"❓ Status {response.status_code}: {response.text}")
                    
            except Exception as e:
                self.stdout.write(f"💥 Exception: {str(e)}")
        
        # Test 2: Try alternative API endpoint
        self.stdout.write("\n🔄 Testing alternative endpoint...")
        alt_url = "https://api.zeptomail.in/v1.1/email"
        
        try:
            response = requests.post(alt_url, json=test_payloads[0]['payload'], headers=headers, timeout=10)
            self.stdout.write(f"📊 Alt endpoint status: {response.status_code}")
            if response.status_code != 401:
                self.stdout.write(f"📝 Alt response: {response.text[:200]}")
        except Exception as e:
            self.stdout.write(f"💥 Alt endpoint error: {str(e)}")
            
        # Recommendations
        self.stdout.write("\n💡 Next steps:")
        self.stdout.write("1. Check your ZeptoMail dashboard for verified sender addresses")
        self.stdout.write("2. Verify the API key is from the correct account")
        self.stdout.write("3. Check if zabug.com domain is verified")
        self.stdout.write("4. Try regenerating the API key")