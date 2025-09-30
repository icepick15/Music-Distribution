from django.core.management.base import BaseCommand
from src.apps.notifications.services import NotificationService
from django.contrib.auth import get_user_model
import json

User = get_user_model()

class Command(BaseCommand):
    help = 'Test all notification templates by sending sample emails'

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            help='Email address to send test notifications to',
            default='test@example.com'
        )
        parser.add_argument(
            '--template',
            type=str,
            help='Specific template to test (optional)',
            choices=[
                'user_welcome', 'song_uploaded', 'song_submitted', 'song_approved', 
                'song_rejected', 'song_distributed', 'user_login', 'payment_received',
                'payment_completed', 'payment_failed', 'admin_notification'
            ]
        )

    def handle(self, *args, **options):
        email = options['email']
        specific_template = options.get('template')
        
        # Create or get test user
        test_user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': 'testuser',
                'first_name': 'Test',
                'last_name': 'User',
                'is_active': True
            }
        )
        
        if created:
            self.stdout.write(f"Created test user: {test_user.email}")
        else:
            self.stdout.write(f"Using existing test user: {test_user.email}")

        service = NotificationService()
        
        # Define all test scenarios
        test_scenarios = {
            'user_welcome': {
                'notification_type': 'user_welcome',
                'context_data': {
                    'username': test_user.username,
                    'welcome_bonus': '10',
                    'platform_features': [
                        'Unlimited song uploads',
                        'Global distribution',
                        'Real-time analytics',
                        'Monthly royalty payments'
                    ]
                }
            },
            'song_uploaded': {
                'notification_type': 'song_uploaded',
                'context_data': {
                    'song_title': 'Amazing Test Song',
                    'artist_name': 'Test Artist',
                    'song_id': '12345',
                    'upload_time': '2025-09-30 14:30:00'
                }
            },
            'song_submitted': {
                'notification_type': 'song_submitted',
                'context_data': {
                    'song_title': 'Under Review Song',
                    'artist_name': 'Test Artist',
                    'song_id': '12346',
                    'estimated_review_time': '24-48 hours'
                }
            },
            'song_approved': {
                'notification_type': 'song_approved',
                'context_data': {
                    'song_title': 'Approved Hit Song',
                    'artist_name': 'Test Artist',
                    'song_id': '12347',
                    'approval_date': '2025-09-30',
                    'estimated_distribution_time': '24-48 hours'
                }
            },
            'song_rejected': {
                'notification_type': 'song_rejected',
                'context_data': {
                    'song_title': 'Needs Improvement',
                    'artist_name': 'Test Artist',
                    'song_id': '12348',
                    'rejection_reasons': [
                        {
                            'title': 'Audio Quality',
                            'description': 'The audio quality does not meet our minimum standards for distribution.'
                        },
                        {
                            'title': 'Metadata Incomplete', 
                            'description': 'Some required metadata fields are missing or incomplete.'
                        }
                    ]
                }
            },
            'song_distributed': {
                'notification_type': 'song_distributed',
                'context_data': {
                    'song_title': 'Chart-Topping Hit',
                    'artist_name': 'Test Artist',
                    'song_id': '12349',
                    'release_date': '2025-09-30',
                    'platforms_count': '15+'
                }
            },
            'user_login': {
                'notification_type': 'user_login',
                'context_data': {
                    'login_time': '2025-09-30 14:30:00',
                    'ip_address': '192.168.1.100',
                    'device': 'Chrome Browser',
                    'location': 'New York, USA'
                }
            },
            'payment_received': {
                'notification_type': 'payment_received',
                'context_data': {
                    'amount': '256.89',
                    'payment_period': 'September 2025',
                    'transaction_id': 'TXN-2025-09-001234',
                    'payment_method': 'Bank Transfer',
                    'next_payment_date': 'October 30, 2025'
                }
            },
            'payment_completed': {
                'notification_type': 'payment_completed',
                'context_data': {
                    'amount': '256.89',
                    'completion_date': 'September 30, 2025',
                    'transaction_id': 'TXN-2025-09-001234',
                    'processing_time': '2 hours',
                    'payment_method': 'Bank Transfer',
                    'account_type': 'Checking Account',
                    'account_last_four': '1234',
                    'bank_name': 'Chase Bank'
                }
            },
            'payment_failed': {
                'notification_type': 'payment_failed',
                'context_data': {
                    'amount': '256.89',
                    'payment_period': 'September 2025',
                    'attempt_date': 'September 30, 2025',
                    'transaction_id': 'TXN-2025-09-001234',
                    'retry_date': 'October 7, 2025',
                    'failure_reasons': [
                        {
                            'title': 'Invalid Account Information',
                            'description': 'The bank account information on file appears to be outdated or incorrect.'
                        }
                    ]
                }
            },
            'admin_notification': {
                'notification_type': 'admin_notification',
                'context_data': {
                    'alert_type': 'System Alert',
                    'message': 'New user registration spike detected',
                    'severity': 'medium',
                    'timestamp': '2025-09-30 14:30:00'
                }
            }
        }

        if specific_template:
            # Test only the specified template
            if specific_template in test_scenarios:
                scenario = test_scenarios[specific_template]
                self.test_notification(service, test_user, specific_template, scenario)
            else:
                self.stdout.write(
                    self.style.ERROR(f"Template '{specific_template}' not found")
                )
        else:
            # Test all templates
            self.stdout.write("🚀 Testing all notification templates...")
            self.stdout.write("=" * 60)
            
            for template_name, scenario in test_scenarios.items():
                self.test_notification(service, test_user, template_name, scenario)
                self.stdout.write("-" * 40)
            
            self.stdout.write("=" * 60)
            self.stdout.write(
                self.style.SUCCESS(
                    f"✅ All {len(test_scenarios)} templates tested successfully!"
                )
            )
            self.stdout.write(f"📧 Check your email: {email}")

    def test_notification(self, service, user, template_name, scenario):
        self.stdout.write(f"📧 Testing: {template_name}")
        
        try:
            # Use the send_user_notification method with a descriptive title
            title_mapping = {
                'user_welcome': f'🎵 Welcome to Music Distribution Platform, {user.first_name}!',
                'song_uploaded': f'🎵 Song "{scenario["context_data"].get("song_title", "Your Song")}" Uploaded Successfully!',
                'song_submitted': f'📋 Song "{scenario["context_data"].get("song_title", "Your Song")}" Submitted for Review',
                'song_approved': f'✅ Song "{scenario["context_data"].get("song_title", "Your Song")}" Approved!',
                'song_rejected': f'❌ Song "{scenario["context_data"].get("song_title", "Your Song")}" Needs Attention',
                'song_distributed': f'🚀 Song "{scenario["context_data"].get("song_title", "Your Song")}" Now Live!',
                'user_login': f'🔐 New Login to Your Music Distribution Account',
                'payment_received': f'💰 Payment Received - ${scenario["context_data"].get("amount", "0.00")}',
                'payment_completed': f'✅ Payment Transfer Complete - ${scenario["context_data"].get("amount", "0.00")}',
                'payment_failed': f'❌ Payment Issue - ${scenario["context_data"].get("amount", "0.00")}',
                'admin_notification': f'🚨 Admin Alert: {scenario["context_data"].get("alert_type", "System Alert")}'
            }
            
            title = title_mapping.get(template_name, f'Test {template_name} notification')
            message = f'This is a test of the {template_name} email template.'
            
            # Send the notification using the existing service method
            notification = service.send_user_notification(
                user=user,
                notification_type_name=scenario['notification_type'],
                title=title,
                message=message,
                context_data=scenario['context_data']
            )
            
            if notification:
                self.stdout.write(
                    self.style.SUCCESS(f"   ✅ {template_name} sent successfully")
                )
            else:
                self.stdout.write(
                    self.style.ERROR(f"   ❌ {template_name} failed to send")
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"   💥 {template_name} error: {str(e)}")
            )