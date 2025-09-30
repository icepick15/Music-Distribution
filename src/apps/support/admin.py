from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import Ticket, TicketResponse, TicketAttachment


class TicketResponseInline(admin.TabularInline):
    model = TicketResponse
    extra = 1
    fields = ['author', 'message', 'is_internal', 'created_at']
    readonly_fields = ['created_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('author')


class TicketAttachmentInline(admin.TabularInline):
    model = TicketAttachment
    extra = 0
    fields = ['file', 'filename', 'file_size', 'uploaded_by', 'uploaded_at']
    readonly_fields = ['filename', 'file_size', 'uploaded_by', 'uploaded_at']


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = [
        'ticket_id', 'title', 'status_badge', 'priority_badge', 'category',
        'author', 'assignee', 'response_count', 'created_at'
    ]
    list_filter = [
        'status', 'priority', 'category', 'created_at', 'assignee', 'author'
    ]
    search_fields = [
        'ticket_id', 'title', 'description', 'author__username', 
        'author__email', 'author__first_name', 'author__last_name'
    ]
    readonly_fields = ['ticket_id', 'created_at', 'updated_at', 'resolved_at', 'response_count']
    
    fieldsets = (
        ('Ticket Information', {
            'fields': ('ticket_id', 'title', 'description', 'status', 'priority', 'category', 'tags')
        }),
        ('Assignment', {
            'fields': ('author', 'assignee')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'resolved_at'),
            'classes': ('collapse',)
        }),
        ('Statistics', {
            'fields': ('response_count',),
            'classes': ('collapse',)
        })
    )
    
    inlines = [TicketResponseInline, TicketAttachmentInline]
    
    def status_badge(self, obj):
        colors = {
            'open': 'red',
            'in_progress': 'orange',
            'pending': 'yellow',
            'resolved': 'green',
            'closed': 'gray'
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px; font-size: 11px;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'
    
    def priority_badge(self, obj):
        colors = {
            'low': 'green',
            'medium': 'orange',
            'high': 'red',
            'urgent': 'darkred'
        }
        color = colors.get(obj.priority, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px; font-size: 11px;">{}</span>',
            color,
            obj.get_priority_display()
        )
    priority_badge.short_description = 'Priority'
    
    def response_count(self, obj):
        count = obj.responses.count()
        if count > 0:
            url = reverse('admin:support_ticketresponse_changelist')
            return format_html('<a href="{}?ticket__id={}">{} responses</a>', url, obj.id, count)
        return '0 responses'
    response_count.short_description = 'Responses'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('author', 'assignee').prefetch_related('responses')
    
    actions = ['assign_to_me', 'mark_in_progress', 'mark_resolved', 'mark_closed']
    
    def assign_to_me(self, request, queryset):
        updated = queryset.update(assignee=request.user)
        self.message_user(request, f'{updated} tickets assigned to you.')
    assign_to_me.short_description = 'Assign selected tickets to me'
    
    def mark_in_progress(self, request, queryset):
        updated = queryset.update(status='in_progress')
        self.message_user(request, f'{updated} tickets marked as in progress.')
    mark_in_progress.short_description = 'Mark as In Progress'
    
    def mark_resolved(self, request, queryset):
        updated = queryset.update(status='resolved')
        self.message_user(request, f'{updated} tickets marked as resolved.')
    mark_resolved.short_description = 'Mark as Resolved'
    
    def mark_closed(self, request, queryset):
        updated = queryset.update(status='closed')
        self.message_user(request, f'{updated} tickets marked as closed.')
    mark_closed.short_description = 'Mark as Closed'


@admin.register(TicketResponse)
class TicketResponseAdmin(admin.ModelAdmin):
    list_display = ['ticket_link', 'author', 'message_preview', 'is_internal', 'created_at']
    list_filter = ['created_at', 'is_internal', 'author']
    search_fields = ['ticket__ticket_id', 'ticket__title', 'message', 'author__username']
    readonly_fields = ['created_at']
    
    def ticket_link(self, obj):
        url = reverse('admin:support_ticket_change', args=[obj.ticket.id])
        return format_html('<a href="{}">{}</a>', url, obj.ticket.ticket_id)
    ticket_link.short_description = 'Ticket'
    
    def message_preview(self, obj):
        return obj.message[:100] + '...' if len(obj.message) > 100 else obj.message
    message_preview.short_description = 'Message'


@admin.register(TicketAttachment)
class TicketAttachmentAdmin(admin.ModelAdmin):
    list_display = ['filename', 'ticket_link', 'file_size_display', 'uploaded_by', 'uploaded_at']
    list_filter = ['uploaded_at', 'uploaded_by']
    search_fields = ['filename', 'ticket__ticket_id', 'uploaded_by__username']
    readonly_fields = ['filename', 'file_size', 'uploaded_by', 'uploaded_at']
    
    def ticket_link(self, obj):
        url = reverse('admin:support_ticket_change', args=[obj.ticket.id])
        return format_html('<a href="{}">{}</a>', url, obj.ticket.ticket_id)
    ticket_link.short_description = 'Ticket'
    
    def file_size_display(self, obj):
        """Display file size in human readable format"""
        size = obj.file_size
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} TB"
    file_size_display.short_description = 'File Size'