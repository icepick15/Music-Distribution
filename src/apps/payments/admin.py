from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils import timezone
from .models import PaymentMethod, Subscription, Transaction


@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    """Enhanced Payment method administration"""
    
    list_display = [
        'user', 'payment_type', 'get_payment_info', 'is_default', 
        'is_active', 'created_at'
    ]
    list_filter = ['payment_type', 'is_default', 'is_active', 'card_brand']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'bank_name']
    ordering = ['-created_at']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('User & Type', {
            'fields': ('user', 'payment_type', 'is_default', 'is_active')
        }),
        ('Card Details', {
            'fields': ('card_last_four', 'card_brand', 'card_exp_month', 'card_exp_year'),
            'classes': ('collapse',)
        }),
        ('Bank Details', {
            'fields': ('bank_name', 'account_number'),
            'classes': ('collapse',)
        }),
        ('External Integration', {
            'fields': ('paystack_auth_code', 'paystack_customer_code'),
            'classes': ('collapse',)
        }),
    )
    
    def get_payment_info(self, obj):
        if obj.payment_type == 'card' and obj.card_last_four:
            return f"{obj.card_brand} ****{obj.card_last_four}"
        elif obj.payment_type == 'bank_transfer' and obj.bank_name:
            return f"{obj.bank_name}"
        return obj.get_payment_type_display()
    get_payment_info.short_description = 'Payment Info'
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('user', 'payment_type', 'is_default', 'is_active')
        }),
        ('Card Details', {
            'fields': ('card_last_four', 'card_brand', 'card_exp_month', 'card_exp_year'),
            'classes': ('collapse',)
        }),
        ('Bank Details', {
            'fields': ('bank_name', 'account_number'),
            'classes': ('collapse',)
        }),
        ('Paystack Data', {
            'fields': ('paystack_auth_code', 'paystack_customer_code'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ['user', 'subscription_type', 'status', 'amount', 'start_date', 'end_date', 'is_active']
    list_filter = ['subscription_type', 'status', 'auto_renew', 'created_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name']
    readonly_fields = ['id', 'is_active', 'remaining_credits', 'created_at', 'updated_at']
    date_hierarchy = 'start_date'
    
    fieldsets = (
        ('Subscription Info', {
            'fields': ('user', 'subscription_type', 'status', 'amount', 'currency')
        }),
        ('Credits', {
            'fields': ('song_credits', 'credits_used', 'remaining_credits')
        }),
        ('Dates', {
            'fields': ('start_date', 'end_date', 'auto_renew', 'is_active')
        }),
        ('Payment', {
            'fields': ('payment_method',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'payment_method')


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['user', 'transaction_type', 'status', 'amount', 'paystack_reference', 'initiated_at', 'completed_at']
    list_filter = ['transaction_type', 'status', 'currency', 'initiated_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'paystack_reference', 'description']
    readonly_fields = ['id', 'initiated_at', 'completed_at']
    date_hierarchy = 'initiated_at'
    
    fieldsets = (
        ('Transaction Info', {
            'fields': ('user', 'transaction_type', 'status', 'description')
        }),
        ('Financial Details', {
            'fields': ('amount', 'currency', 'fees')
        }),
        ('Related Objects', {
            'fields': ('subscription', 'payment_method')
        }),
        ('Paystack Data', {
            'fields': ('paystack_reference', 'paystack_access_code', 'gateway_response'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('metadata',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('initiated_at', 'completed_at'),
            'classes': ('collapse',)
        })
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'subscription', 'payment_method')
    
    actions = ['mark_as_completed', 'mark_as_failed']
    
    def mark_as_completed(self, request, queryset):
        updated = queryset.filter(status='pending').update(status='success')
        self.message_user(request, f'{updated} transactions marked as completed.')
    mark_as_completed.short_description = "Mark selected transactions as completed"
    
    def mark_as_failed(self, request, queryset):
        updated = queryset.filter(status='pending').update(status='failed')
        self.message_user(request, f'{updated} transactions marked as failed.')
    mark_as_failed.short_description = "Mark selected transactions as failed"
