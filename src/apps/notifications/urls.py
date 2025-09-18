from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    NotificationViewSet, NotificationTypeViewSet,
    UserNotificationPreferenceViewSet, EmailTemplateViewSet
)

router = DefaultRouter()
router.register('notifications', NotificationViewSet, basename='notification')
router.register('notification-types', NotificationTypeViewSet)
router.register('preferences', UserNotificationPreferenceViewSet, basename='notification-preference')
router.register('email-templates', EmailTemplateViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
