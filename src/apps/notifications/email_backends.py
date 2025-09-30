import requests
import logging
import json
from django.conf import settings
from django.core.mail.backends.base import BaseEmailBackend
from django.core.mail.message import EmailMessage
from typing import List, Dict, Any

logger = logging.getLogger(__name__)


class ZeptoMailAPIBackend(BaseEmailBackend):
    """
    Custom email backend using ZeptoMail REST API
    """
    
    def __init__(self, fail_silently=False, **kwargs):
        super().__init__(fail_silently=fail_silently, **kwargs)
        self.api_key = getattr(settings, 'ZEPTOMAIL_API_KEY', None)
        self.api_url = getattr(settings, 'ZEPTOMAIL_API_URL', 'https://api.zeptomail.com/v1.1/email')
        self.default_from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@example.com')
        self.default_from_name = getattr(settings, 'DEFAULT_FROM_NAME', 'Music Distribution Platform')
        
        if not self.api_key:
            logger.error("ZEPTOMAIL_API_KEY not configured")
    
    def send_messages(self, email_messages: List[EmailMessage]) -> int:
        """
        Send multiple email messages using ZeptoMail API
        """
        if not self.api_key:
            logger.error("ZeptoMail API key not configured")
            return 0
        
        sent_count = 0
        
        for message in email_messages:
            if self._send_single_message(message):
                sent_count += 1
        
        logger.info(f"ZeptoMail: Sent {sent_count}/{len(email_messages)} emails")
        return sent_count
    
    def _send_single_message(self, message: EmailMessage) -> bool:
        """
        Send a single email message via ZeptoMail API
        """
        try:
            # Prepare headers
            headers = {
                'accept': 'application/json',
                'content-type': 'application/json',
                'authorization': f'Zoho-enczapikey {self.api_key}'
            }
            
            # Prepare email data for ZeptoMail API
            email_data = {
                'from': {
                    'address': message.from_email or self.default_from_email,
                    'name': self.default_from_name
                },
                'to': [
                    {
                        'email_address': {
                            'address': recipient,
                            'name': recipient.split('@')[0]  # Use part before @ as name
                        }
                    } for recipient in message.to
                ],
                'subject': message.subject,
            }
            
            # Add content based on message type
            if hasattr(message, 'content_subtype') and message.content_subtype == 'html':
                email_data['htmlbody'] = message.body
            else:
                email_data['textbody'] = message.body
            
            # Add CC and BCC if present
            if message.cc:
                email_data['cc'] = [
                    {'email_address': {'address': cc, 'name': cc.split('@')[0]}}
                    for cc in message.cc
                ]
            
            if message.bcc:
                email_data['bcc'] = [
                    {'email_address': {'address': bcc, 'name': bcc.split('@')[0]}}
                    for bcc in message.bcc
                ]
            
            # Add attachments if present
            if hasattr(message, 'attachments') and message.attachments:
                email_data['attachments'] = []
                for attachment in message.attachments:
                    # Handle Django email attachments
                    if hasattr(attachment, 'get_filename'):
                        email_data['attachments'].append({
                            'name': attachment.get_filename(),
                            'content': attachment.get_content()
                        })
            
            # Send request to ZeptoMail API
            response = requests.post(
                self.api_url,
                headers=headers,
                json=email_data,
                timeout=30
            )
            
            # ZeptoMail returns 200 or 201 for success
            if response.status_code in [200, 201]:
                response_data = response.json()
                logger.info(f"Email sent successfully via ZeptoMail: {message.subject}")
                logger.debug(f"ZeptoMail response: {response_data}")
                return True
            else:
                error_msg = f"ZeptoMail API error {response.status_code}: {response.text}"
                logger.error(error_msg)
                if not self.fail_silently:
                    raise Exception(error_msg)
                return False
                
        except requests.RequestException as e:
            logger.error(f"Network error sending email via ZeptoMail: {str(e)}")
            if not self.fail_silently:
                raise
            return False
        except Exception as e:
            logger.error(f"Unexpected error sending email via ZeptoMail: {str(e)}")
            if not self.fail_silently:
                raise
            return False


class HybridEmailBackend(BaseEmailBackend):
    """
    Hybrid backend that tries ZeptoMail API first, falls back to SMTP
    """
    
    def __init__(self, fail_silently=False, **kwargs):
        super().__init__(fail_silently=fail_silently, **kwargs)
        self.api_backend = ZeptoMailAPIBackend(fail_silently=True)
        
        # Import SMTP backend for fallback
        from django.core.mail.backends.smtp import EmailBackend as SMTPBackend
        self.smtp_backend = SMTPBackend(fail_silently=fail_silently)
    
    def send_messages(self, email_messages: List[EmailMessage]) -> int:
        """
        Try ZeptoMail API first, fallback to SMTP if needed
        """
        try:
            # Try ZeptoMail API first
            sent_count = self.api_backend.send_messages(email_messages)
            if sent_count == len(email_messages):
                logger.info(f"All {sent_count} emails sent via ZeptoMail API")
                return sent_count
            else:
                logger.warning(f"Only {sent_count}/{len(email_messages)} sent via API, trying SMTP fallback")
                
                # Try to send remaining emails via SMTP
                failed_messages = email_messages[sent_count:]
                smtp_sent = self.smtp_backend.send_messages(failed_messages)
                total_sent = sent_count + smtp_sent
                logger.info(f"Total sent: {total_sent} (API: {sent_count}, SMTP: {smtp_sent})")
                return total_sent
                
        except Exception as e:
            logger.warning(f"ZeptoMail API failed, falling back to SMTP: {str(e)}")
            # Fallback to SMTP for all messages
            try:
                sent_count = self.smtp_backend.send_messages(email_messages)
                logger.info(f"{sent_count} emails sent via SMTP fallback")
                return sent_count
            except Exception as smtp_error:
                logger.error(f"Both API and SMTP failed: {str(smtp_error)}")
                if not self.fail_silently:
                    raise
                return 0


class ConsoleZeptoMailBackend(BaseEmailBackend):
    """
    Console backend that shows what would be sent via ZeptoMail (for testing)
    """
    
    def send_messages(self, email_messages: List[EmailMessage]) -> int:
        """
        Print email messages to console in ZeptoMail API format
        """
        for message in email_messages:
            print("\n" + "="*80)
            print("📧 ZEPTOMAIL API EMAIL (Console Mode)")
            print("="*80)
            print(f"🚀 API Endpoint: https://api.zeptomail.com/v1.1/email")
            print(f"📤 From: {message.from_email}")
            print(f"📥 To: {', '.join(message.to)}")
            if message.cc:
                print(f"📋 CC: {', '.join(message.cc)}")
            if message.bcc:
                print(f"🤫 BCC: {', '.join(message.bcc)}")
            print(f"📄 Subject: {message.subject}")
            print(f"💌 Content Type: {'HTML' if hasattr(message, 'content_subtype') and message.content_subtype == 'html' else 'Text'}")
            print("\n📝 Message Body:")
            print("-" * 40)
            print(message.body)
            print("-" * 40)
            print("✅ Would be sent via ZeptoMail API")
            print("="*80)
        
        return len(email_messages)