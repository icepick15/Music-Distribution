from django.apps import AppConfig


class BlogConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'src.apps.blog'
    verbose_name = 'Blog'

    def ready(self):
        import src.apps.blog.signals
