from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class Ticket(models.Model):
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('pending', 'Pending'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    CATEGORY_CHOICES = [
        ('technical', 'Technical Issue'),
        ('billing', 'Billing & Payments'),
        ('account', 'Account Management'),
        ('distribution', 'Music Distribution'),
        ('general', 'General Inquiry'),
        ('bug_report', 'Bug Report'),
        ('feature_request', 'Feature Request'),
    ]
    
    # Ticket identifier
    ticket_id = models.CharField(max_length=20, unique=True, editable=False)
    
    # Basic ticket information
    title = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='general')
    
    # User relationships
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tickets')
    assignee = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='assigned_tickets',
        limit_choices_to={'is_staff': True}
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    tags = models.CharField(max_length=500, blank=True, help_text="Comma-separated tags")
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'priority']),
            models.Index(fields=['author', 'status']),
            models.Index(fields=['assignee', 'status']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.ticket_id}: {self.title}"
    
    def save(self, *args, **kwargs):
        if not self.ticket_id:
            # Generate ticket ID
            last_ticket = Ticket.objects.order_by('-id').first()
            if last_ticket and last_ticket.id:
                next_id = last_ticket.id + 1
            else:
                next_id = 1
            self.ticket_id = f"TKT-{str(next_id).zfill(3)}"
        
        # Set resolved_at when status changes to resolved/closed
        if self.status in ['resolved', 'closed'] and not self.resolved_at:
            self.resolved_at = timezone.now()
        elif self.status not in ['resolved', 'closed'] and self.resolved_at:
            self.resolved_at = None
            
        super().save(*args, **kwargs)
    
    @property
    def is_active(self):
        return self.status in ['open', 'in_progress', 'pending']
    
    @property
    def response_count(self):
        return self.responses.count()
    
    @property
    def latest_response(self):
        return self.responses.order_by('-created_at').first()


class TicketResponse(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='responses')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_internal = models.BooleanField(default=False, help_text="Internal notes not visible to customers")
    
    # File attachments (optional)
    attachment = models.FileField(upload_to='ticket_attachments/', null=True, blank=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Response to {self.ticket.ticket_id} by {self.author.get_full_name() or self.author.username}"
    
    @property
    def is_from_staff(self):
        return self.author.is_staff


class TicketAttachment(models.Model):
    """Separate model for multiple file attachments per ticket"""
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='attachments')
    response = models.ForeignKey(TicketResponse, on_delete=models.CASCADE, related_name='files', null=True, blank=True)
    file = models.FileField(upload_to='ticket_files/')
    filename = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField()
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.filename} - {self.ticket.ticket_id}"