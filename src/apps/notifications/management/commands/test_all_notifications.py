from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from src.apps.notifications.services import NotificationService
from src.apps.notifications.models import NotificationType

User = get_user_model()


class Command(BaseCommand):
    help = 'Test all notification types at once'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            required=True,
            help='Email address to send test notifications to',
        )
        parser.add_argument(
            '--category',
            type=str,
            help='Test only notifications from specific category (system, music, payment, admin)',
        )
    
    def handle(self, *args, **options):
        email = options['email']
        category_filter = options.get('category')
        
        # Get or create test user
        try:
            user = User.objects.get(email=email)
            self.stdout.write(f"Using existing user: {user.email}")
        except User.DoesNotExist:
            user = User.objects.create_user(
                email=email,
                username=email.split('@')[0],
                first_name='Test',
                last_name='User'
            )
            self.stdout.write(f"Created test user: {user.email}")
        
        # Get notification types
        notification_types = NotificationType.objects.all()
        if category_filter:
            notification_types = notification_types.filter(category=category_filter)
        
        self.stdout.write(f"\n🧪 Testing {notification_types.count()} notification types...")
        
        results = []
        
        for nt in notification_types:
            try:
                notification = NotificationService.send_user_notification(
                    user=user,
                    notification_type_name=nt.name,
                    title=f'Test {nt.name} notification',
                    message=f'This is a test {nt.name} notification for {user.first_name}',
                    context_data={
                        'site_name': 'Music Distribution Platform',
                        'song_title': 'Test Song Title',
                        'amount': '$25.00',
                    }
                )
                
                results.append({
                    'type': nt.name,
                    'category': nt.category,
                    'status': 'SUCCESS',
                    'id': str(notification.id)
                })
                
            except Exception as e:
                results.append({
                    'type': nt.name,
                    'category': nt.category,
                    'status': 'FAILED',
                    'error': str(e)
                })
        
        # Print summary
        self.stdout.write(f"\n📊 TEST RESULTS SUMMARY")
        self.stdout.write("=" * 50)
        
        successful = 0
        failed = 0
        
        for result in results:
            if result['status'] == 'SUCCESS':
                self.stdout.write(
                    self.style.SUCCESS(
                        f"✅ {result['type']} ({result['category']}) - {result['id'][:8]}..."
                    )
                )
                successful += 1
            else:
                self.stdout.write(
                    self.style.ERROR(
                        f"❌ {result['type']} ({result['category']}) - {result['error']}"
                    )
                )
                failed += 1
        
        self.stdout.write(f"\n📈 FINAL SCORE: {successful} successful, {failed} failed")
        
        if failed == 0:
            self.stdout.write(
                self.style.SUCCESS("🎉 ALL NOTIFICATION TYPES WORKING PERFECTLY!")
            )
        else:
            self.stdout.write(
                self.style.WARNING(f"⚠️ {failed} notification types need attention")
            )