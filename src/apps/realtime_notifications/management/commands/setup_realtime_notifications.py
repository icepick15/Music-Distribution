"""
Setup real-time notification templates and initial data
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from src.apps.realtime_notifications.models import NotificationTemplate, UserNotificationSettings

User = get_user_model()


class Command(BaseCommand):
    help = 'Setup real-time notification templates and initial data'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            help='Reset existing templates and create new ones',
        )
        parser.add_argument(
            '--create-user-settings',
            action='store_true',
            help='Create notification settings for existing users',
        )
    
    def handle(self, *args, **options):
        if options['reset']:
            self.stdout.write("Resetting notification templates...")
            NotificationTemplate.objects.all().delete()
        
        self.create_templates()
        
        if options['create_user_settings']:
            self.create_user_settings()
        
        self.stdout.write(
            self.style.SUCCESS('✅ Real-time notification setup completed!')
        )
    
    def create_templates(self):
        """Create default notification templates"""
        templates = [
            {
                'name': 'contact_received_template',
                'notification_type': 'contact_received',
                'title_template': '📩 New Contact Message from {{ contact.name }}',
                'message_template': 'You received a new {{ contact.category }} message: "{{ contact.subject }}"',
                'action_url_template': '/admin/support/contactmessage/{{ contact.id }}/change/',
                'action_text': 'View Message',
                'priority': 'normal',
                'expires_in_minutes': 2880,  # 48 hours
            },
            {
                'name': 'contact_replied_template',
                'notification_type': 'contact_replied',
                'title_template': '✅ Your message has been replied to',
                'message_template': 'Hi {{ user.first_name }}, we\'ve replied to your message "{{ contact.subject }}". Check your email for our response.',
                'action_url_template': '/contact-history',
                'action_text': 'View History',
                'priority': 'normal',
                'expires_in_minutes': 10080,  # 7 days
            },
            {
                'name': 'song_uploaded_template',
                'notification_type': 'song_uploaded',
                'title_template': '🎵 Song uploaded successfully',
                'message_template': 'Your song "{{ song.title }}" has been uploaded and is now under review.',
                'action_url_template': '/dashboard/songs/{{ song.id }}',
                'action_text': 'View Song',
                'priority': 'normal',
                'expires_in_minutes': 1440,  # 24 hours
            },
            {
                'name': 'song_approved_template',
                'notification_type': 'song_approved',
                'title_template': '🎉 Song approved for distribution!',
                'message_template': 'Congratulations! Your song "{{ song.title }}" has been approved and will be distributed to platforms.',
                'action_url_template': '/dashboard/songs/{{ song.id }}',
                'action_text': 'View Details',
                'priority': 'high',
                'expires_in_minutes': 10080,  # 7 days
            },
            {
                'name': 'song_rejected_template',
                'notification_type': 'song_rejected',
                'title_template': '❌ Song requires attention',
                'message_template': 'Your song "{{ song.title }}" needs some changes before approval. Reason: {{ reason }}',
                'action_url_template': '/dashboard/songs/{{ song.id }}',
                'action_text': 'Fix Issues',
                'priority': 'high',
                'expires_in_minutes': 10080,  # 7 days
            },
            {
                'name': 'payment_received_template',
                'notification_type': 'payment_received',
                'title_template': '💰 Payment received: ${{ amount }}',
                'message_template': 'You\'ve received a royalty payment of ${{ amount }} for {{ period }}.',
                'action_url_template': '/dashboard/payments/{{ payment_id }}',
                'action_text': 'View Payment',
                'priority': 'high',
                'expires_in_minutes': 43200,  # 30 days
            },
            {
                'name': 'user_registered_template',
                'notification_type': 'user_registered',
                'title_template': '🎉 New user registered',
                'message_template': 'User {{ user.email }} ({{ user.get_full_name }}) has registered on the platform.',
                'action_url_template': '/admin/users/user/{{ user.id }}/change/',
                'action_text': 'View Profile',
                'priority': 'normal',
                'expires_in_minutes': 1440,  # 24 hours
            },
            {
                'name': 'admin_alert_template',
                'notification_type': 'admin_alert',
                'title_template': '🚨 Admin Alert: {{ alert_title }}',
                'message_template': '{{ alert_message }}',
                'action_url_template': '{{ action_url }}',
                'action_text': '{{ action_text }}',
                'priority': 'urgent',
                'expires_in_minutes': 720,  # 12 hours
            },
            {
                'name': 'system_maintenance_template',
                'notification_type': 'system_maintenance',
                'title_template': '🔧 Scheduled Maintenance',
                'message_template': 'System maintenance is scheduled for {{ maintenance_time }}. Expected duration: {{ duration }}.',
                'action_url_template': '/system-status',
                'action_text': 'View Status',
                'priority': 'normal',
                'expires_in_minutes': 4320,  # 3 days
            },
            {
                'name': 'welcome_message_template',
                'notification_type': 'welcome_message',
                'title_template': '🎵 Welcome to Music Distribution Platform!',
                'message_template': 'Hi {{ user.first_name }}! Welcome to our platform. Start by uploading your first song.',
                'action_url_template': '/dashboard/upload',
                'action_text': 'Upload Song',
                'priority': 'normal',
                'expires_in_minutes': 10080,  # 7 days
            },
        ]
        
        created_count = 0
        updated_count = 0
        
        for template_data in templates:
            template, created = NotificationTemplate.objects.get_or_create(
                name=template_data['name'],
                defaults=template_data
            )
            
            if created:
                created_count += 1
                self.stdout.write(f"✅ Created template: {template.name}")
            else:
                # Update existing template
                for key, value in template_data.items():
                    if key != 'name':
                        setattr(template, key, value)
                template.save()
                updated_count += 1
                self.stdout.write(f"🔄 Updated template: {template.name}")
        
        self.stdout.write(
            self.style.SUCCESS(
                f"📧 Templates: {created_count} created, {updated_count} updated"
            )
        )
    
    def create_user_settings(self):
        """Create notification settings for existing users without settings"""
        users_without_settings = User.objects.filter(
            realtime_notification_settings__isnull=True
        )
        
        created_count = 0
        for user in users_without_settings:
            UserNotificationSettings.objects.create(
                user=user,
                enable_websocket=True,
                enable_browser_push=False,
                contact_notifications=True,
                song_notifications=True,
                payment_notifications=True,
                admin_notifications=user.is_staff,
                system_notifications=True,
            )
            created_count += 1
        
        self.stdout.write(
            self.style.SUCCESS(
                f"👥 Created notification settings for {created_count} users"
            )
        )