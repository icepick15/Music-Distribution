from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'codes', views.ReferralCodeViewSet, basename='referral-code')
router.register(r'credits', views.ReferralCreditViewSet, basename='referral-credit')

urlpatterns = [
    path('', include(router.urls)),
    path('track/', views.track_referral_click, name='track-referral'),
    path('validate/<str:code>/', views.validate_referral_code, name='validate-referral'),
    path('link/', views.link_referral_to_user, name='link-referral'),
]
