from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

app_name = 'users'

urlpatterns = [
    # Authentication endpoints
    path('register/', views.UserRegistrationView.as_view(), name='register'),
    path('login/', views.CustomTokenObtainPairView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Profile endpoints
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('profile/details/', views.UserProfileDetailsView.as_view(), name='profile_details'),
    path('profile/update/', views.UserUpdateView.as_view(), name='profile_update'),
    
    # Password management
    path('password/change/', views.PasswordChangeView.as_view(), name='password_change'),
    
    # Account management
    path('account/delete/', views.AccountDeletionView.as_view(), name='account_delete'),
    
    # Dashboard and stats
    path('dashboard/stats/', views.user_dashboard_stats, name='dashboard_stats'),
    
    # Utility endpoints
    path('check-email/', views.check_email_availability, name='check_email'),
    path('check-username/', views.check_username_availability, name='check_username'),
]
