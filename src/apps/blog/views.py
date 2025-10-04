from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Post, Category, Tag, Comment
from .serializers import (
    PostListSerializer, PostDetailSerializer, CategorySerializer,
    TagSerializer, CommentSerializer, CommentCreateSerializer
)


class PostViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for blog posts
    - List all published posts
    - Retrieve single post by slug
    - Filter by category, tags, featured
    - Search by title, excerpt, content
    """
    permission_classes = [AllowAny]
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category__slug', 'tags__slug', 'featured', 'author']
    search_fields = ['title', 'excerpt', 'content', 'seo_keywords']
    ordering_fields = ['published_at', 'views', 'created_at']
    ordering = ['-published_at']
    
    def get_queryset(self):
        """Return only published posts for public, all for admin"""
        queryset = Post.objects.select_related('author', 'category').prefetch_related('tags')
        
        # Only show published posts to non-staff
        if not self.request.user.is_staff:
            queryset = queryset.filter(status='published')
        
        return queryset
    
    def get_serializer_class(self):
        """Use detailed serializer for single post view"""
        if self.action == 'retrieve':
            return PostDetailSerializer
        return PostListSerializer
    
    def retrieve(self, request, *args, **kwargs):
        """Get single post and increment view counter"""
        instance = self.get_object()
        
        # Increment views (only for published posts)
        if instance.status == 'published':
            instance.increment_views()
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured posts"""
        posts = self.get_queryset().filter(featured=True)[:5]
        serializer = self.get_serializer(posts, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent posts (for sidebar)"""
        posts = self.get_queryset()[:5]
        serializer = self.get_serializer(posts, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Get most viewed posts"""
        posts = self.get_queryset().order_by('-views')[:5]
        serializer = self.get_serializer(posts, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def related(self, request, slug=None):
        """Get related posts based on category and tags"""
        post = self.get_object()
        
        # Get posts with same category or tags
        related = Post.objects.filter(
            Q(category=post.category) | Q(tags__in=post.tags.all()),
            status='published'
        ).exclude(id=post.id).distinct()[:4]
        
        serializer = self.get_serializer(related, many=True)
        return Response(serializer.data)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for blog categories"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'


class TagViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for blog tags"""
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'


class CommentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for blog comments
    - List approved comments for a post
    - Create comment (requires authentication)
    """
    serializer_class = CommentSerializer
    permission_classes = [AllowAny]  # List is public, create requires auth
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['post']
    
    def get_queryset(self):
        """Return only approved comments for public"""
        queryset = Comment.objects.select_related('user', 'post')
        
        if not self.request.user.is_staff:
            queryset = queryset.filter(approved=True)
        
        return queryset
    
    def get_serializer_class(self):
        """Use create serializer for POST requests"""
        if self.action == 'create':
            return CommentCreateSerializer
        return CommentSerializer
    
    def get_permissions(self):
        """Require authentication for creating comments"""
        if self.action == 'create':
            return [IsAuthenticated()]
        return [AllowAny()]
    
    def perform_create(self, serializer):
        """Save comment with current user"""
        serializer.save(user=self.request.user)
