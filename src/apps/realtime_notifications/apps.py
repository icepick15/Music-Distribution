"""
App configuration for real-time notifications
"""
from django.apps import AppConfig


class RealtimeNotificationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'src.apps.realtime_notifications'
    verbose_name = 'Real-time Notifications'
    
    def ready(self):
        """Import signals when app is ready"""
        import src.apps.realtime_notifications.signals