from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import TicketViewSet, TicketResponseViewSet, TicketAttachmentViewSet

app_name = 'support'

router = DefaultRouter()
router.register(r'tickets', TicketViewSet, basename='ticket')
router.register(r'responses', TicketResponseViewSet, basename='ticketresponse')
router.register(r'attachments', TicketAttachmentViewSet, basename='ticketattachment')

urlpatterns = [
    path('api/', include(router.urls)),
]