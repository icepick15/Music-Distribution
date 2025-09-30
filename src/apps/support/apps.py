from django.apps import AppConfig


class SupportConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'src.apps.support'
    verbose_name = 'Support System'
    
    def ready(self):
        import src.apps.support.signals