from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Ticket, TicketResponse, TicketAttachment

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'avatar']
    
    def get_avatar(self, obj):
        if obj.profile_image:
            return obj.profile_image.url
        return None


class TicketAttachmentSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)
    
    class Meta:
        model = TicketAttachment
        fields = ['id', 'file', 'filename', 'file_size', 'uploaded_by', 'uploaded_at']
        read_only_fields = ['id', 'filename', 'file_size', 'uploaded_by', 'uploaded_at']


class TicketResponseSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    is_from_staff = serializers.BooleanField(read_only=True)
    files = TicketAttachmentSerializer(many=True, read_only=True)
    
    class Meta:
        model = TicketResponse
        fields = [
            'id', 'message', 'author', 'created_at', 
            'is_internal', 'is_from_staff', 'attachment', 'files'
        ]
        read_only_fields = ['id', 'author', 'created_at', 'is_from_staff']
    
    def create(self, validated_data):
        # Set the author to the current user
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


class TicketListSerializer(serializers.ModelSerializer):
    """Serializer for ticket lists (without responses)"""
    author = UserSerializer(read_only=True)
    assignee = UserSerializer(read_only=True)
    response_count = serializers.IntegerField(read_only=True)
    latest_response = serializers.SerializerMethodField()
    is_active = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Ticket
        fields = [
            'id', 'ticket_id', 'title', 'status', 'priority', 'category',
            'author', 'assignee', 'created_at', 'updated_at', 'resolved_at',
            'response_count', 'latest_response', 'is_active', 'tags'
        ]
    
    def get_latest_response(self, obj):
        latest = obj.latest_response
        if latest:
            return {
                'author': latest.author.get_full_name() or latest.author.username,
                'message': latest.message[:100] + '...' if len(latest.message) > 100 else latest.message,
                'created_at': latest.created_at,
                'is_from_staff': latest.is_from_staff
            }
        return None


class TicketDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer with responses"""
    author = UserSerializer(read_only=True)
    assignee = UserSerializer(read_only=True)
    responses = TicketResponseSerializer(many=True, read_only=True)
    attachments = TicketAttachmentSerializer(many=True, read_only=True)
    response_count = serializers.IntegerField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Ticket
        fields = [
            'id', 'ticket_id', 'title', 'description', 'status', 'priority', 
            'category', 'author', 'assignee', 'created_at', 'updated_at', 
            'resolved_at', 'tags', 'responses', 'attachments', 'response_count', 'is_active'
        ]
        read_only_fields = ['id', 'ticket_id', 'author', 'created_at']
    
    def update(self, instance, validated_data):
        # Only allow certain users to update certain fields
        user = self.context['request'].user
        
        # Only staff can assign tickets
        if not user.is_staff:
            validated_data.pop('assignee', None)
            
            # Users can only mark their own tickets as resolved (not reopen them)
            # Staff can change any status
            if validated_data.get('status'):
                new_status = validated_data.get('status')
                # Non-staff users can only:
                # 1. Mark their own tickets as resolved (when satisfied)
                # 2. Cannot reopen tickets once resolved/closed
                if instance.author != user:
                    # Not the ticket author - remove status change
                    validated_data.pop('status', None)
                elif new_status == 'resolved' and instance.status in ['open', 'in_progress', 'pending']:
                    # Allow users to mark their tickets as resolved
                    pass
                else:
                    # Users cannot reopen resolved/closed tickets or set other statuses
                    validated_data.pop('status', None)
        
        return super().update(instance, validated_data)


class TicketCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new tickets"""
    
    class Meta:
        model = Ticket
        fields = ['title', 'description', 'priority', 'category', 'tags']
    
    def create(self, validated_data):
        # Set the author to the current user
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


class TicketStatusUpdateSerializer(serializers.ModelSerializer):
    """Serializer for quick status updates"""
    
    class Meta:
        model = Ticket
        fields = ['status', 'assignee']
    
    def validate(self, data):
        user = self.context['request'].user
        
        # Only staff can change status to resolved/closed or assign tickets
        if not user.is_staff:
            if data.get('status') in ['resolved', 'closed']:
                raise serializers.ValidationError("Only staff can resolve or close tickets.")
            if 'assignee' in data:
                raise serializers.ValidationError("Only staff can assign tickets.")
        
        return data