from django.contrib import admin
from django.utils.html import format_html
from .models import ReferralCode, Referral, ReferralCredit


@admin.register(ReferralCode)
class ReferralCodeAdmin(admin.ModelAdmin):
    list_display = ['code', 'user_email', 'clicks', 'signups', 'paid_referrals', 'conversion_rate', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['code', 'user__email', 'user__first_name', 'user__last_name']
    readonly_fields = ['id', 'code', 'created_at', 'clicks', 'signups', 'paid_referrals', 'referral_url_display', 'stats_display']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'user', 'code', 'created_at', 'is_active')
        }),
        ('Statistics', {
            'fields': ('clicks', 'signups', 'paid_referrals', 'stats_display')
        }),
        ('Referral URL', {
            'fields': ('referral_url_display',)
        }),
    )
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'User'
    user_email.admin_order_field = 'user__email'
    
    def referral_url_display(self, obj):
        return format_html('<a href="{}" target="_blank">{}</a>', obj.referral_url, obj.referral_url)
    referral_url_display.short_description = 'Referral URL'
    
    def stats_display(self, obj):
        return format_html(
            '<strong>Conversion Rate:</strong> {}%<br>'
            '<strong>Payment Rate:</strong> {}%<br>'
            '<strong>Credits Earned:</strong> {}',
            obj.conversion_rate,
            obj.payment_rate,
            obj.paid_referrals // 2
        )
    stats_display.short_description = 'Statistics'


@admin.register(Referral)
class ReferralAdmin(admin.ModelAdmin):
    list_display = ['referral_code', 'referred_user_email', 'status', 'clicked_at', 'signed_up_at', 'first_payment_at', 'first_payment_amount']
    list_filter = ['status', 'clicked_at', 'signed_up_at', 'first_payment_at']
    search_fields = ['referral_code__code', 'referred_user__email', 'ip_address']
    readonly_fields = ['id', 'clicked_at', 'signed_up_at', 'first_payment_at', 'credit_awarded_at', 'tracking_cookie']
    
    fieldsets = (
        ('Referral Information', {
            'fields': ('id', 'referral_code', 'referred_user', 'status')
        }),
        ('Tracking Data', {
            'fields': ('ip_address', 'user_agent', 'tracking_cookie')
        }),
        ('Timeline', {
            'fields': ('clicked_at', 'signed_up_at', 'first_payment_at', 'credit_awarded_at')
        }),
        ('Payment Details', {
            'fields': ('first_payment_amount',)
        }),
    )
    
    def referred_user_email(self, obj):
        return obj.referred_user.email if obj.referred_user else 'Anonymous'
    referred_user_email.short_description = 'Referred User'
    referred_user_email.admin_order_field = 'referred_user__email'


@admin.register(ReferralCredit)
class ReferralCreditAdmin(admin.ModelAdmin):
    list_display = ['user_email', 'amount', 'status', 'earned_at', 'used_at', 'referral_count']
    list_filter = ['status', 'earned_at', 'used_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name']
    readonly_fields = ['id', 'earned_at', 'used_at', 'used_for_song']
    
    fieldsets = (
        ('Credit Information', {
            'fields': ('id', 'user', 'amount', 'status')
        }),
        ('Timeline', {
            'fields': ('earned_at', 'used_at', 'expires_at')
        }),
        ('Usage', {
            'fields': ('used_for_song', 'earned_from_referrals')
        }),
    )
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'User'
    user_email.admin_order_field = 'user__email'
    
    def referral_count(self, obj):
        return obj.earned_from_referrals.count()
    referral_count.short_description = 'Referrals'
