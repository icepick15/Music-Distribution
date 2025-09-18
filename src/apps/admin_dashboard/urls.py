from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AdminDashboardViewSet, UserManagementViewSet, ContentManagementViewSet,
    SystemSettingsViewSet, AdminActionsViewSet, BulkNotificationViewSet
)

router = DefaultRouter()
router.register(r'dashboard', AdminDashboardViewSet, basename='admin-dashboard')
router.register(r'users', UserManagementViewSet, basename='admin-users')
router.register(r'content', ContentManagementViewSet, basename='admin-content')
router.register(r'settings', SystemSettingsViewSet, basename='admin-settings')
router.register(r'actions', AdminActionsViewSet, basename='admin-actions')
router.register(r'notifications', BulkNotificationViewSet, basename='admin-notifications')

urlpatterns = [
    path('api/admin/', include(router.urls)),
]
