from django.apps import AppConfig


class NotificationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'src.apps.notifications'
    verbose_name = 'Notifications'
    
    def ready(self):
        import src.apps.notifications.signals
