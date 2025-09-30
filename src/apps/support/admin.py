from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import Ticket, TicketResponse, TicketAttachment, ContactMessage


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


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'email', 'subject', 'status_badge', 'priority_badge', 
        'category_display', 'created_at', 'response_time_display'
    ]
    list_filter = [
        'status', 'priority', 'category', 'created_at', 'user'
    ]
    search_fields = [
        'name', 'email', 'subject', 'message', 'user__username', 'user__email'
    ]
    readonly_fields = [
        'id', 'created_at', 'updated_at', 'read_at', 'responded_at', 
        'response_time_hours', 'ip_address', 'user_agent', 'referrer'
    ]
    
    fieldsets = (
        ('Contact Information', {
            'fields': ('name', 'email', 'user')
        }),
        ('Message Details', {
            'fields': ('subject', 'category', 'message', 'status', 'priority')
        }),
        ('Management', {
            'fields': ('related_ticket',)
        }),
        ('Metadata', {
            'fields': ('ip_address', 'user_agent', 'referrer'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'read_at', 'responded_at', 'response_time_hours'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_as_read', 'mark_as_responded', 'mark_as_resolved', 'convert_to_tickets']
    
    def status_badge(self, obj):
        """Display status with color coding"""
        colors = {
            'new': '#dc2626',      # red
            'read': '#2563eb',     # blue
            'in_progress': '#d97706',  # yellow
            'responded': '#059669',    # green
            'resolved': '#6b7280'      # gray
        }
        color = colors.get(obj.status, '#6b7280')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = 'Status'
    
    def priority_badge(self, obj):
        """Display priority with color coding"""
        colors = {
            'low': '#6b7280',      # gray
            'medium': '#2563eb',   # blue
            'high': '#d97706',     # yellow
            'urgent': '#dc2626'    # red
        }
        color = colors.get(obj.priority, '#6b7280')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, obj.get_priority_display()
        )
    priority_badge.short_description = 'Priority'
    
    def category_display(self, obj):
        """Display category with better formatting"""
        return obj.get_category_display()
    category_display.short_description = 'Category'
    
    def response_time_display(self, obj):
        """Display response time in human readable format"""
        if obj.response_time_hours:
            hours = obj.response_time_hours
            if hours < 1:
                return f"{int(hours * 60)}m"
            elif hours < 24:
                return f"{hours:.1f}h"
            else:
                return f"{hours/24:.1f}d"
        return "No response"
    response_time_display.short_description = 'Response Time'
    
    def mark_as_read(self, request, queryset):
        """Mark selected messages as read"""
        updated = 0
        for message in queryset:
            if message.status == 'new':
                message.mark_as_read()
                updated += 1
        self.message_user(request, f"Marked {updated} messages as read.")
    mark_as_read.short_description = "Mark as read"
    
    def mark_as_responded(self, request, queryset):
        """Mark selected messages as responded"""
        updated = 0
        for message in queryset:
            if message.status in ['new', 'read', 'in_progress']:
                message.mark_as_responded()
                updated += 1
        self.message_user(request, f"Marked {updated} messages as responded.")
    mark_as_responded.short_description = "Mark as responded"
    
    def mark_as_resolved(self, request, queryset):
        """Mark selected messages as resolved"""
        updated = queryset.update(status='resolved')
        self.message_user(request, f"Marked {updated} messages as resolved.")
    mark_as_resolved.short_description = "Mark as resolved"
    
    def convert_to_tickets(self, request, queryset):
        """Convert selected messages to tickets"""
        converted = 0
        for message in queryset:
            if not message.related_ticket:
                try:
                    message.convert_to_ticket()
                    converted += 1
                except Exception as e:
                    self.message_user(request, f"Error converting {message.name}: {str(e)}", level='ERROR')
        self.message_user(request, f"Converted {converted} messages to tickets.")
    convert_to_tickets.short_description = "Convert to tickets"