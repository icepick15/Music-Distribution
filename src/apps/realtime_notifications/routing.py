"""
WebSocket URL routing for real-time notifications
"""
from django.urls import re_path
from . import consumers

realtime_websocket_urlpatterns = [
    re_path(r'ws/realtime-notifications/$', consumers.RealtimeNotificationConsumer.as_asgi()),
    re_path(r'ws/system-announcements/$', consumers.SystemAnnouncementConsumer.as_asgi()),
]