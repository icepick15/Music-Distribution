from django.urls import path
from . import views, webhooks

app_name = 'payments'

urlpatterns = [
    # Payment Methods
    path('methods/', views.PaymentMethodListCreateView.as_view(), name='payment_methods'),
    path('methods/<uuid:pk>/', views.PaymentMethodDetailView.as_view(), name='payment_method_detail'),
    path('methods/<uuid:payment_method_id>/set-default/', views.set_default_payment_method, name='set_default_payment_method'),
    
    # Subscriptions
    path('subscriptions/', views.SubscriptionListView.as_view(), name='subscriptions'),
    path('subscription/current/', views.CurrentSubscriptionView.as_view(), name='current_subscription'),
    path('subscription/upgrade/', views.SubscriptionUpgradeView.as_view(), name='subscription_upgrade'),
    path('subscription/cancel/', views.cancel_subscription, name='cancel_subscription'),
    path('subscription/consume-credit/', views.ConsumeUploadCreditView.as_view(), name='consume_credit'),
    
    # Transactions
    path('transactions/', views.TransactionListView.as_view(), name='transactions'),
    
    # Payment Processing
    path('initialize/', views.PaymentInitiationView.as_view(), name='payment_initialize'),
    path('verify/', views.PaymentVerificationView.as_view(), name='payment_verify'),
    path('verify-pending/', views.AutoVerifyPendingPaymentsView.as_view(), name='auto_verify_pending'),
    path('callback/', views.PaymentCallbackView.as_view(), name='payment_callback'),
    path('charge/', views.ChargeAuthorizationView.as_view(), name='charge_authorization'),
    
    # Credits
    path('credits/purchase/', views.CreditPurchaseView.as_view(), name='purchase_credits'),
    
    # Utilities
    path('banks/', views.BankListView.as_view(), name='banks'),
    path('pricing/', views.PricingView.as_view(), name='pricing'),
    
    # Webhooks
    path('webhook/', webhooks.paystack_webhook, name='paystack_webhook'),
    # Dev utilities
    path('dev/set-role/', views.dev_set_role, name='dev_set_role'),
    path('dev/test-verify/', views.dev_test_verification, name='dev_test_verification'),
]
