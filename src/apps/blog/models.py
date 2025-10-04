from django.db import models
from django.utils.text import slugify
from django.contrib.auth import get_user_model
from django.utils import timezone
import readtime

User = get_user_model()


class Category(models.Model):
    """Blog post categories"""
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True, help_text="Icon class name (e.g., 'MusicNoteIcon')")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Tag(models.Model):
    """Blog post tags"""
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=50, unique=True, blank=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Post(models.Model):
    """Blog posts"""
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
    ]
    
    # Basic fields
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blog_posts')
    
    # Content
    excerpt = models.TextField(max_length=300, help_text="Short description (max 300 chars)")
    content = models.TextField(help_text="Full article content (supports HTML)")
    
    # Categorization
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='posts')
    tags = models.ManyToManyField(Tag, blank=True, related_name='posts')
    
    # Media
    featured_image = models.ImageField(upload_to='blog/images/', blank=True, null=True)
    
    # Status & Publishing
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')
    featured = models.BooleanField(default=False, help_text="Show on homepage/featured section")
    published_at = models.DateTimeField(null=True, blank=True)
    
    # Metrics
    views = models.IntegerField(default=0)
    read_time = models.IntegerField(default=0, help_text="Estimated reading time in minutes")
    
    # SEO
    seo_title = models.CharField(max_length=70, blank=True, help_text="SEO title (max 70 chars)")
    seo_description = models.TextField(max_length=160, blank=True, help_text="Meta description (max 160 chars)")
    seo_keywords = models.CharField(max_length=200, blank=True, help_text="Comma-separated keywords")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-published_at', '-created_at']
        indexes = [
            models.Index(fields=['-published_at']),
            models.Index(fields=['slug']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        # Auto-generate slug from title
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while Post.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        
        # Set published_at timestamp when status changes to published
        if self.status == 'published' and not self.published_at:
            self.published_at = timezone.now()
        
        # Calculate read time
        if self.content:
            result = readtime.of_text(self.content)
            self.read_time = result.minutes if result.minutes > 0 else 1
        
        # Auto-fill SEO fields if not provided
        if not self.seo_title:
            self.seo_title = self.title[:70]
        if not self.seo_description:
            self.seo_description = self.excerpt[:160]
        
        super().save(*args, **kwargs)
    
    def increment_views(self):
        """Increment view counter"""
        self.views += 1
        self.save(update_fields=['views'])
    
    @property
    def reading_time(self):
        """Return reading time with label"""
        return f"{self.read_time} min read"


class Comment(models.Model):
    """Blog post comments (optional feature)"""
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blog_comments')
    content = models.TextField()
    approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Comment by {self.user.email} on {self.post.title}"
