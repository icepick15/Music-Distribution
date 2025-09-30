from rest_framework import serializers
from .models import ContactMessage, Ticket, TicketResponse, TicketAttachment
from django.contrib.auth import get_user_model

User = get_user_model()


class ContactMessageSerializer(serializers.ModelSerializer):
    """Serializer for ContactMessage model"""
    
    # Read-only fields for responses
    id = serializers.UUIDField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    read_at = serializers.DateTimeField(read_only=True)
    responded_at = serializers.DateTimeField(read_only=True)
    status = serializers.CharField(read_only=True)
    priority = serializers.CharField(read_only=True)
    related_ticket_id = serializers.UUIDField(source='related_ticket.id', read_only=True)
    
    # Computed fields
    response_time_hours = serializers.ReadOnlyField()
    is_urgent = serializers.ReadOnlyField()
    
    class Meta:
        model = ContactMessage
        fields = [
            'id', 'name', 'email', 'subject', 'category', 'message',
            'status', 'priority', 'user', 'created_at', 'updated_at',
            'read_at', 'responded_at', 'related_ticket_id',
            'response_time_hours', 'is_urgent'
        ]
        read_only_fields = [
            'id', 'status', 'priority', 'user', 'created_at', 'updated_at',
            'read_at', 'responded_at', 'related_ticket_id'
        ]
    
    def validate_email(self, value):
        """Validate email format"""
        if not value:
            raise serializers.ValidationError("Email is required.")
        return value.lower().strip()
    
    def validate_name(self, value):
        """Validate name field"""
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError("Name must be at least 2 characters long.")
        return value.strip()
    
    def validate_message(self, value):
        """Validate message content"""
        if not value or len(value.strip()) < 10:
            raise serializers.ValidationError("Message must be at least 10 characters long.")
        return value.strip()
    
    def validate_subject(self, value):
        """Validate subject field"""
        if not value or len(value.strip()) < 3:
            raise serializers.ValidationError("Subject must be at least 3 characters long.")
        return value.strip()


class ContactMessageDetailSerializer(ContactMessageSerializer):
    """Detailed serializer for ContactMessage with additional admin fields"""
    
    # Additional admin fields
    ip_address = serializers.IPAddressField(read_only=True)
    user_agent = serializers.CharField(read_only=True)
    referrer = serializers.URLField(read_only=True)
    
    # Related ticket information
    related_ticket = serializers.SerializerMethodField()
    
    class Meta(ContactMessageSerializer.Meta):
        fields = ContactMessageSerializer.Meta.fields + [
            'ip_address', 'user_agent', 'referrer', 'related_ticket'
        ]
    
    def get_related_ticket(self, obj):
        """Get related ticket information"""
        if obj.related_ticket:
            return {
                'id': obj.related_ticket.id,
                'title': obj.related_ticket.title,
                'status': obj.related_ticket.status,
                'created_at': obj.related_ticket.created_at
            }
        return None


class ContactMessageStatusUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating contact message status"""
    
    class Meta:
        model = ContactMessage
        fields = ['status', 'priority']
    
    def validate_status(self, value):
        """Validate status transition"""
        if self.instance:
            current_status = self.instance.status
            # Define valid status transitions
            valid_transitions = {
                'new': ['read', 'in_progress', 'resolved'],
                'read': ['in_progress', 'responded', 'resolved'],
                'in_progress': ['responded', 'resolved'],
                'responded': ['resolved'],
                'resolved': []  # Cannot change from resolved
            }
            
            if value not in valid_transitions.get(current_status, []):
                raise serializers.ValidationError(
                    f"Cannot change status from '{current_status}' to '{value}'"
                )
        
        return value


# Enhanced existing serializers with contact message integration
class TicketSerializer(serializers.ModelSerializer):
    """Enhanced Ticket serializer"""
    
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    # Contact message relation
    contact_message_id = serializers.UUIDField(source='contact_message.id', read_only=True)
    
    class Meta:
        model = Ticket
        fields = [
            'id', 'title', 'description', 'status', 'priority', 'category',
            'user', 'user_name', 'assigned_to', 'assigned_to_name',
            'created_by', 'created_by_name', 'created_at', 'updated_at',
            'resolved_at', 'contact_message_id'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        """Create ticket with current user as creator"""
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class TicketResponseSerializer(serializers.ModelSerializer):
    """Ticket response serializer"""
    
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = TicketResponse
        fields = [
            'id', 'ticket', 'user', 'user_name', 'message', 'is_internal',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        """Create response with current user"""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class TicketAttachmentSerializer(serializers.ModelSerializer):
    """Ticket attachment serializer"""
    
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    file_size = serializers.ReadOnlyField()
    
    class Meta:
        model = TicketAttachment
        fields = [
            'id', 'ticket', 'file', 'file_name', 'file_size', 'description',
            'uploaded_by', 'uploaded_by_name', 'created_at'
        ]
        read_only_fields = ['id', 'uploaded_by', 'created_at', 'file_size']
    
    def create(self, validated_data):
        """Create attachment with current user"""
        validated_data['uploaded_by'] = self.context['request'].user
        return super().create(validated_data)