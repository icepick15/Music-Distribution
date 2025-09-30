"""
URL configuration for music_distribution_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from . import views


urlpatterns = [
    path('admin/', admin.site.urls),
    
    
    # Health check endpoints
    path('api/health/', views.api_health, name='api_health'),
    path('api/test-cors/', views.api_test_cors, name='api_test_cors'),
    
    # API endpoints
    path('api/auth/', include('src.apps.users.urls')),
    path('api/songs/', include('src.apps.songs.urls')),
    path('api/payments/', include('src.apps.payments.urls')),
    path('api/notifications/', include('src.apps.notifications.urls')),
    path('api/support/', include('src.apps.support.urls')),
    path('', include('src.apps.realtime_notifications.urls')),  # Real-time notifications
    path('', include('src.apps.admin_dashboard.urls')),  # Admin dashboard
    # path('api/artists/', include('src.apps.artists.urls')),
    # path('api/analytics/', include('src.apps.analytics.urls')),
    # path('api/admin/', include('src.apps.admin_panel.urls')),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
