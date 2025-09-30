from django.core.management.base import BaseCommand
from src.apps.notifications.services import NotificationService
from src.apps.notifications.models import EmailTemplate, NotificationType


class Command(BaseCommand):
    help = 'Setup notification system with default types and templates'
    
    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Setting up notification system...'))
        
        # Create notification types first
        created_types = self.create_notification_types()
        self.stdout.write(
            self.style.SUCCESS(f'Created {created_types} notification types')
        )
        
        # Create email templates
        created_templates = self.create_email_templates()
        self.stdout.write(
            self.style.SUCCESS(f'Created {created_templates} email templates')
        )
        
        self.stdout.write(
            self.style.SUCCESS('Notification system setup complete!')
        )
    
    def create_notification_types(self):
        """Create all notification types manually to ensure they exist"""
        default_types = [
            # User notifications
            {
                'name': 'user_welcome',
                'category': 'system',
                'description': 'Welcome message for new users',
                'email_subject_template': 'Welcome to Music Distribution Platform, {{ user.first_name }}!',
                'email_template_name': 'user_welcome',
                'is_active': True,
                'default_email_enabled': True,
            },
            {
                'name': 'user_login',
                'category': 'system',
                'description': 'User login notification',
                'email_subject_template': 'New login to your account',
                'email_template_name': 'user_login',
                'is_active': True,
                'default_email_enabled': False,  # Usually too frequent
            },
            
            # Song notifications
            {
                'name': 'song_uploaded',
                'category': 'music',
                'description': 'Song uploaded to platform',
                'email_subject_template': 'Song "{{ context_data.song_title }}" uploaded successfully',
                'email_template_name': 'song_uploaded',
                'is_active': True,
                'default_email_enabled': True,
            },
            {
                'name': 'song_submitted',
                'category': 'music',
                'description': 'Song submitted for review',
                'email_subject_template': 'Song "{{ context_data.song_title }}" submitted for review',
                'email_template_name': 'song_submitted',
                'is_active': True,
                'default_email_enabled': True,
            },
            {
                'name': 'song_approved',
                'category': 'music',
                'description': 'Song approved for distribution',
                'email_subject_template': 'Great news! "{{ context_data.song_title }}" has been approved',
                'email_template_name': 'song_approved',
                'is_active': True,
                'default_email_enabled': True,
            },
            {
                'name': 'song_rejected',
                'category': 'music',
                'description': 'Song rejected, needs revision',
                'email_subject_template': 'Song "{{ context_data.song_title }}" needs revision',
                'email_template_name': 'song_rejected',
                'is_active': True,
                'default_email_enabled': True,
            },
            {
                'name': 'song_distributed',
                'category': 'music',
                'description': 'Song distributed to platforms',
                'email_subject_template': '"{{ context_data.song_title }}" is now live on streaming platforms!',
                'email_template_name': 'song_distributed',
                'is_active': True,
                'default_email_enabled': True,
            },
            
            # Payment notifications
            {
                'name': 'payment_received',
                'category': 'payment',
                'description': 'Payment received',
                'email_subject_template': 'Payment received - ${{ context_data.amount }}',
                'email_template_name': 'payment_received',
                'is_active': True,
                'default_email_enabled': True,
            },
            {
                'name': 'payment_completed',
                'category': 'payment',
                'description': 'Payment completed successfully',
                'email_subject_template': 'Payment confirmed - ${{ context_data.amount }}',
                'email_template_name': 'payment_completed',
                'is_active': True,
                'default_email_enabled': True,
            },
            {
                'name': 'payment_failed',
                'category': 'payment',
                'description': 'Payment failed',
                'email_subject_template': 'Payment failed - ${{ context_data.amount }}',
                'email_template_name': 'payment_failed',
                'is_active': True,
                'default_email_enabled': True,
            },
            
            # Admin notifications - Create both admin_alert and admin_notification for compatibility
            {
                'name': 'admin_alert',
                'category': 'admin',
                'description': 'General admin alerts',
                'email_subject_template': '[ADMIN] {{ title }}',
                'email_template_name': 'admin_notification',
                'is_active': True,
                'default_email_enabled': True,
            },
            {
                'name': 'admin_notification',
                'category': 'admin',
                'description': 'Admin notification alerts',
                'email_subject_template': '[ADMIN] {{ title }}',
                'email_template_name': 'admin_notification',
                'is_active': True,
                'default_email_enabled': True,
            },
        ]
        
        created_count = 0
        for nt_data in default_types:
            nt, created = NotificationType.objects.get_or_create(
                name=nt_data['name'],
                defaults=nt_data
            )
            if created:
                created_count += 1
                self.stdout.write(f"  ✅ Created notification type: {nt_data['name']}")
            else:
                self.stdout.write(f"  ⚡ Notification type exists: {nt_data['name']}")
        
        return created_count
    
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
                'name': 'song_uploaded',
                'template_type': 'transactional',
                'subject_template': 'Song "{{ context_data.song_title }}" uploaded successfully',
                'html_template': '{% load static %}{% include "notifications/song_uploaded.html" %}',
                'is_default': True,
            },
            {
                'name': 'song_submitted',
                'template_type': 'transactional',
                'subject_template': 'Song "{{ context_data.song_title }}" submitted for review',
                'html_template': '{% load static %}{% include "notifications/song_submitted.html" %}',
                'is_default': True,
            },
            {
                'name': 'song_rejected',
                'template_type': 'transactional',
                'subject_template': 'Song "{{ context_data.song_title }}" needs revision',
                'html_template': '{% load static %}{% include "notifications/song_rejected.html" %}',
                'is_default': True,
            },
            {
                'name': 'song_distributed',
                'template_type': 'transactional',
                'subject_template': '"{{ context_data.song_title }}" is now live!',
                'html_template': '{% load static %}{% include "notifications/song_distributed.html" %}',
                'is_default': True,
            },
            {
                'name': 'user_login',
                'template_type': 'transactional',
                'subject_template': 'New login to your account',
                'html_template': '{% load static %}{% include "notifications/user_login.html" %}',
                'is_default': True,
            },
            {
                'name': 'payment_received',
                'template_type': 'transactional',
                'subject_template': 'Payment received - ${{ context_data.amount }}',
                'html_template': '{% load static %}{% include "notifications/payment_received.html" %}',
                'is_default': True,
            },
            {
                'name': 'payment_completed',
                'template_type': 'transactional',
                'subject_template': 'Payment confirmed - ${{ context_data.amount }}',
                'html_template': '{% load static %}{% include "notifications/payment_completed.html" %}',
                'is_default': True,
            },
            {
                'name': 'payment_failed',
                'template_type': 'transactional',
                'subject_template': 'Payment failed - ${{ context_data.amount }}',
                'html_template': '{% load static %}{% include "notifications/payment_failed.html" %}',
                'is_default': True,
            },
            {
                'name': 'admin_notification',
                'template_type': 'system',
                'subject_template': '[ADMIN] {{ title }}',
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
                self.stdout.write(f"  ✅ Created email template: {template_data['name']}")
            else:
                self.stdout.write(f"  ⚡ Email template exists: {template_data['name']}")

        return created_count
