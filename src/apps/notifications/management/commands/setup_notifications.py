from django.core.management.base import BaseCommand
from src.apps.notifications.services import NotificationService
from src.apps.notifications.models import EmailTemplate, NotificationType


class Command(BaseCommand):
    help = 'Setup notification system with default types and templates'
    
    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Setting up notification system...'))
        
        # Create notification types
        created_types = NotificationService.create_notification_types()
        self.stdout.write(
            self.style.SUCCESS(f'Created {created_types} notification types')
        )
        
        # Create email templates
        self.create_email_templates()
        
        self.stdout.write(
            self.style.SUCCESS('Notification system setup complete!')
        )
    
    def create_email_templates(self):
        """Create default email templates"""
        templates = [
            {
                'name': 'user_welcome',
                'template_type': 'transactional',
                'subject_template': 'Welcome to Music Distribution Platform, {{ user.first_name }}!',
                'html_template': '{% load static %}{% include "notifications/user_welcome.html" %}',
                'is_default': True,
            },
            {
                'name': 'song_approved',
                'template_type': 'transactional',
                'subject_template': 'Great news! "{{ context_data.song_title }}" has been approved',
                'html_template': '{% load static %}{% include "notifications/song_approved.html" %}',
                'is_default': True,
            },
            {
                'name': 'admin_alert',
                'template_type': 'system',
                'subject_template': '[ADMIN] {{ subject }}',
                'html_template': '{% load static %}{% include "notifications/admin_notification.html" %}',
                'is_default': True,
            },
        ]
        
        created_count = 0
        for template_data in templates:
            # Get notification type if specified
            notification_type = None
            if template_data.get('notification_type_name'):
                try:
                    notification_type = NotificationType.objects.get(
                        name=template_data['notification_type_name']
                    )
                except NotificationType.DoesNotExist:
                    pass
            
            template, created = EmailTemplate.objects.get_or_create(
                name=template_data['name'],
                defaults={
                    **template_data,
                    'notification_type': notification_type
                }
            )
            if created:
                created_count += 1
        
        self.stdout.write(
            self.style.SUCCESS(f'Created {created_count} email templates')
        )
