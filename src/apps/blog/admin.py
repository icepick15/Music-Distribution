from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Count
from .models import Post, Category, Tag, Comment


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'post_count', 'created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ['created_at']
    
    def post_count(self, obj):
        return obj.posts.count()
    post_count.short_description = 'Posts'
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        queryset = queryset.annotate(
            _post_count=Count('posts', distinct=True)
        )
        return queryset


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'post_count']
    search_fields = ['name']
    prepopulated_fields = {'slug': ('name',)}
    
    def post_count(self, obj):
        return obj.posts.count()
    post_count.short_description = 'Posts'


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'author', 'category', 'status', 'featured',
        'views', 'read_time', 'published_at', 'image_preview'
    ]
    list_filter = ['status', 'featured', 'category', 'created_at', 'published_at']
    search_fields = ['title', 'excerpt', 'content', 'seo_keywords']
    prepopulated_fields = {'slug': ('title',)}
    filter_horizontal = ['tags']
    readonly_fields = ['views', 'read_time', 'created_at', 'updated_at', 'image_preview_large']
    date_hierarchy = 'published_at'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'author', 'status', 'featured')
        }),
        ('Content', {
            'fields': ('excerpt', 'content')
        }),
        ('Categorization', {
            'fields': ('category', 'tags')
        }),
        ('Media', {
            'fields': ('featured_image', 'image_preview_large')
        }),
        ('SEO', {
            'fields': ('seo_title', 'seo_description', 'seo_keywords'),
            'classes': ('collapse',)
        }),
        ('Metrics', {
            'fields': ('views', 'read_time', 'published_at'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def image_preview(self, obj):
        """Small preview in list view"""
        if obj.featured_image:
            return format_html(
                '<img src="{}" width="50" height="50" style="object-fit: cover; border-radius: 4px;" />',
                obj.featured_image.url
            )
        return "No image"
    image_preview.short_description = 'Image'
    
    def image_preview_large(self, obj):
        """Large preview in detail view"""
        if obj.featured_image:
            return format_html(
                '<img src="{}" style="max-width: 400px; max-height: 300px; object-fit: contain;" />',
                obj.featured_image.url
            )
        return "No image uploaded"
    image_preview_large.short_description = 'Image Preview'
    
    def save_model(self, request, obj, form, change):
        """Set author to current user if creating new post"""
        if not change:  # Creating new post
            obj.author = request.user
        super().save_model(request, obj, form, change)
    
    actions = ['make_published', 'make_draft', 'make_featured', 'remove_featured']
    
    def make_published(self, request, queryset):
        updated = queryset.update(status='published')
        self.message_user(request, f'{updated} posts marked as published.')
    make_published.short_description = 'Publish selected posts'
    
    def make_draft(self, request, queryset):
        updated = queryset.update(status='draft')
        self.message_user(request, f'{updated} posts marked as draft.')
    make_draft.short_description = 'Mark as draft'
    
    def make_featured(self, request, queryset):
        updated = queryset.update(featured=True)
        self.message_user(request, f'{updated} posts marked as featured.')
    make_featured.short_description = 'Mark as featured'
    
    def remove_featured(self, request, queryset):
        updated = queryset.update(featured=False)
        self.message_user(request, f'{updated} posts removed from featured.')
    remove_featured.short_description = 'Remove from featured'


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['user', 'post', 'content_preview', 'approved', 'created_at']
    list_filter = ['approved', 'created_at']
    search_fields = ['user__email', 'content', 'post__title']
    readonly_fields = ['user', 'post', 'created_at', 'updated_at']
    actions = ['approve_comments', 'disapprove_comments']
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content'
    
    def approve_comments(self, request, queryset):
        updated = queryset.update(approved=True)
        self.message_user(request, f'{updated} comments approved.')
    approve_comments.short_description = 'Approve selected comments'
    
    def disapprove_comments(self, request, queryset):
        updated = queryset.update(approved=False)
        self.message_user(request, f'{updated} comments disapproved.')
    disapprove_comments.short_description = 'Disapprove selected comments'
