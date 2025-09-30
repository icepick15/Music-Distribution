import django_filters
from django.db.models import Q
from .models import Ticket


class TicketFilter(django_filters.FilterSet):
    """Filter class for tickets with advanced filtering options"""
    
    status = django_filters.MultipleChoiceFilter(
        choices=Ticket.STATUS_CHOICES,
        field_name='status',
        lookup_expr='in'
    )
    
    priority = django_filters.MultipleChoiceFilter(
        choices=Ticket.PRIORITY_CHOICES,
        field_name='priority',
        lookup_expr='in'
    )
    
    category = django_filters.MultipleChoiceFilter(
        choices=Ticket.CATEGORY_CHOICES,
        field_name='category',
        lookup_expr='in'
    )
    
    created_after = django_filters.DateTimeFilter(
        field_name='created_at',
        lookup_expr='gte'
    )
    
    created_before = django_filters.DateTimeFilter(
        field_name='created_at',
        lookup_expr='lte'
    )
    
    assigned_to = django_filters.ModelChoiceFilter(
        field_name='assignee',
        queryset=None  # Will be set in __init__
    )
    
    unassigned = django_filters.BooleanFilter(
        method='filter_unassigned'
    )
    
    has_responses = django_filters.BooleanFilter(
        method='filter_has_responses'
    )
    
    author_email = django_filters.CharFilter(
        field_name='author__email',
        lookup_expr='icontains'
    )
    
    class Meta:
        model = Ticket
        fields = {
            'ticket_id': ['exact', 'icontains'],
            'title': ['icontains'],
            'description': ['icontains'],
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Set queryset for assigned_to filter to staff users only
        from django.contrib.auth import get_user_model
        User = get_user_model()
        self.filters['assigned_to'].queryset = User.objects.filter(is_staff=True)
    
    def filter_unassigned(self, queryset, name, value):
        """Filter for unassigned tickets"""
        if value:
            return queryset.filter(assignee__isnull=True)
        return queryset.filter(assignee__isnull=False)
    
    def filter_has_responses(self, queryset, name, value):
        """Filter tickets that have responses"""
        if value:
            return queryset.filter(responses__isnull=False).distinct()
        return queryset.filter(responses__isnull=True)