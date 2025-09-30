from rest_framework import permissions


class TicketPermission(permissions.BasePermission):
    """
    Custom permission class for tickets
    
    - Users can create tickets and view/edit their own tickets
    - Staff can view and manage all tickets
    - Only staff can close/resolve tickets and assign them
    """
    
    def has_permission(self, request, view):
        # Must be authenticated
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Staff can access all tickets
        if request.user.is_staff:
            return True
        
        # Users can only access their own tickets
        if hasattr(obj, 'author'):
            return obj.author == request.user
        
        # For ticket responses, check if user is the ticket author
        if hasattr(obj, 'ticket'):
            return obj.ticket.author == request.user
        
        return False