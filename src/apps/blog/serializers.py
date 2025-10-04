from rest_framework import serializers
from .models import Post, Category, Tag, Comment
from django.contrib.auth import get_user_model

User = get_user_model()


class AuthorSerializer(serializers.ModelSerializer):
    """Serializer for post author"""
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name']


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for blog categories"""
    post_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'icon', 'post_count', 'created_at']
    
    def get_post_count(self, obj):
        return obj.posts.filter(status='published').count()


class TagSerializer(serializers.ModelSerializer):
    """Serializer for blog tags"""
    post_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug', 'post_count']
    
    def get_post_count(self, obj):
        return obj.posts.filter(status='published').count()


class PostListSerializer(serializers.ModelSerializer):
    """Serializer for blog post list view"""
    author = AuthorSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    reading_time = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = [
            'id', 'title', 'slug', 'author', 'excerpt', 'category', 'tags',
            'featured_image', 'status', 'featured', 'published_at', 'views',
            'read_time', 'reading_time', 'created_at', 'updated_at'
        ]
    
    def get_reading_time(self, obj):
        return obj.reading_time


class PostDetailSerializer(serializers.ModelSerializer):
    """Serializer for single blog post detail view"""
    author = AuthorSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    reading_time = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = [
            'id', 'title', 'slug', 'author', 'excerpt', 'content', 'category',
            'tags', 'featured_image', 'status', 'featured', 'published_at',
            'views', 'read_time', 'reading_time', 'seo_title', 'seo_description',
            'seo_keywords', 'comment_count', 'created_at', 'updated_at'
        ]
    
    def get_reading_time(self, obj):
        return obj.reading_time
    
    def get_comment_count(self, obj):
        return obj.comments.filter(approved=True).count()


class CommentSerializer(serializers.ModelSerializer):
    """Serializer for blog comments"""
    user = AuthorSerializer(read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'post', 'user', 'content', 'created_at', 'updated_at']
        read_only_fields = ['user', 'created_at', 'updated_at']


class CommentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating comments"""
    class Meta:
        model = Comment
        fields = ['post', 'content']
