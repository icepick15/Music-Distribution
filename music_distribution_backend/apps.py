from django.apps import AppConfig

class MusicDistributionConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'music_distribution_backend'
    verbose_name = 'Music Distribution Backend'
    
    def ready(self):
        """
        Configure admin site when the app is ready
        """
        from django.contrib import admin
        admin.site.site_header = "🎵 Music Distribution Admin"
        admin.site.site_title = "Music Distribution Admin"
        admin.site.index_title = "Welcome to Music Distribution Administration"