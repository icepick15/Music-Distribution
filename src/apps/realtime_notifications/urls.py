"""
URL configuration for real-time notifications
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .demo_views import notifications_demo
from .simple_demo import simple_demo

app_name = 'realtime_notifications'

router = DefaultRouter()
router.register(r'notifications', views.RealtimeNotificationViewSet, basename='notifications')
router.register(r'templates', views.NotificationTemplateViewSet, basename='templates')
router.register(r'settings', views.UserNotificationSettingsViewSet, basename='settings')
router.register(r'admin', views.AdminNotificationViewSet, basename='admin')

urlpatterns = [
    path('api/realtime/', include(router.urls)),
    path('demo/realtime-notifications/', notifications_demo, name='notifications_demo'),
    path('test/', simple_demo, name='simple_test'),
]