"""
Custom permission classes for admin dashboard.
Controls access based on user roles (admin, staff, user).
"""

from rest_framework import permissions


class IsAdminOrStaff(permissions.BasePermission):
    """
    Allow access to admin and staff users.
    Used for endpoints that both admins and staff can access.
    """
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        return (
            request.user.role in ['admin', 'staff'] or 
            request.user.is_staff or 
            request.user.is_superuser
        )


class IsAdminOnly(permissions.BasePermission):
    """
    Allow access only to admin users.
    Used for sensitive operations like user management, settings, financial data.
    """
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        return (
            request.user.role == 'admin' or 
            request.user.is_superuser
        )


class IsStaffReadOnly(permissions.BasePermission):
    """
    Staff can only read (GET, HEAD, OPTIONS), admins can do everything.
    Used for endpoints where staff need view access but shouldn't modify data.
    """
    
    def has_permission(self, request, view):
        user = request.user
        
        if not user.is_authenticated:
            return False
        
        # Admins and superusers can do anything
        if user.role == 'admin' or user.is_superuser:
            return True
        
        # Staff can only perform safe methods (GET, HEAD, OPTIONS)
        if user.role == 'staff':
            return request.method in permissions.SAFE_METHODS
        
        return False
    
    def has_object_permission(self, request, view, obj):
        """
        Object-level permission check.
        """
        user = request.user
        
        # Admins can do anything with any object
        if user.role == 'admin' or user.is_superuser:
            return True
        
        # Staff can only read objects
        if user.role == 'staff':
            return request.method in permissions.SAFE_METHODS
        
        return False


class IsSuperuserOnly(permissions.BasePermission):
    """
    Allow access only to superusers.
    Used for dangerous operations like maintenance mode, system-wide settings.
    """
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_superuser
