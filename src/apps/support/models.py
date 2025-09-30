from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
import uuid

User = get_user_model()


class ContactMessage(models.Model):
    """Model for contact form submissions"""
    
    CATEGORY_CHOICES = [
        ('technical', 'Technical Support'),
        ('billing', 'Billing & Payments'),
        ('distribution', 'Music Distribution'),
        ('royalties', 'Royalties & Analytics'),
        ('account', 'Account Issues'),
        ('partnership', 'Partnership Inquiry'),
        ('general', 'General Inquiry'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('new', 'New'),
        ('read', 'Read'),
        ('in_progress', 'In Progress'),
        ('responded', 'Responded'),
        ('resolved', 'Resolved'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Contact Information
    name = models.CharField(max_length=255, help_text="Contact's full name")
    email = models.EmailField(help_text="Contact's email address")
    
    # Message Details
    subject = models.CharField(max_length=255, help_text="Message subject")
    category = models.CharField(
        max_length=20, 
        choices=CATEGORY_CHOICES, 
        default='general',
        help_text="Message category"
    )
    message = models.TextField(help_text="The contact message")
    
    # System Fields
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='new',
        help_text="Current status of the message"
    )
    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_CHOICES,
        default='medium',
        help_text="Message priority level"
    )
    
    # User Association (optional - for logged-in users)
    user = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='contact_messages',
        help_text="Associated user account (if logged in)"
    )
    
    # Tracking Fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    read_at = models.DateTimeField(null=True, blank=True, help_text="When message was first read")
    responded_at = models.DateTimeField(null=True, blank=True, help_text="When response was sent")
    
    # Additional Metadata
    ip_address = models.GenericIPAddressField(null=True, blank=True, help_text="Sender's IP address")
    user_agent = models.TextField(null=True, blank=True, help_text="Sender's browser information")
    referrer = models.URLField(null=True, blank=True, help_text="Page that referred to contact form")
    
    # Auto-generated ticket (if converted to support ticket)
    related_ticket = models.ForeignKey(
        'Ticket',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='contact_message',
        help_text="Related support ticket (if created)"
    )
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Contact Message"
        verbose_name_plural = "Contact Messages"
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['category', 'priority']),
            models.Index(fields=['email']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.subject} ({self.category})"
    
    def mark_as_read(self):
        """Mark message as read"""
        if self.status == 'new':
            self.status = 'read'
            self.read_at = timezone.now()
            self.save()
    
    def mark_as_responded(self):
        """Mark message as responded"""
        self.status = 'responded'
        self.responded_at = timezone.now()
        self.save()
    
    def convert_to_ticket(self, assigned_to=None):
        """Convert contact message to support ticket"""
        if not self.related_ticket:
            # Check if user exists - tickets require a user account
            if not self.user:
                # For anonymous users, we can't create tickets directly
                # because the author field is required
                raise ValueError(
                    f"Cannot convert anonymous contact message to ticket. "
                    f"Contact: {self.name} ({self.email}). "
                    f"Admin must create a user account first or handle as contact message only."
                )
            
            # Map contact category to ticket category
            category_mapping = {
                'technical': 'technical',
                'billing': 'billing',
                'distribution': 'distribution',
                'royalties': 'general',  # Map to general since royalties isn't in ticket choices
                'account': 'account',
                'partnership': 'general',  # Map to general
                'general': 'general',
                'other': 'general'
            }
            
            ticket_category = category_mapping.get(self.category, 'general')
            
            # Create ticket with correct field names
            ticket = Ticket.objects.create(
                title=self.subject,
                description=f"Contact form submission from {self.name} ({self.email})\n\n{self.message}",
                status='open',
                priority=self.priority,
                category=ticket_category,
                author=self.user,  # Required field - user must exist
                assignee=assigned_to  # Use 'assignee' not 'assigned_to'
            )
            
            self.related_ticket = ticket
            self.status = 'in_progress'
            self.save()
            return ticket
        return self.related_ticket
    
    @property
    def is_urgent(self):
        """Check if message is urgent"""
        return self.priority in ['high', 'urgent']
    
    @property
    def response_time_hours(self):
        """Calculate response time in hours"""
        if self.responded_at:
            delta = self.responded_at - self.created_at
            return round(delta.total_seconds() / 3600, 2)
        return None


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