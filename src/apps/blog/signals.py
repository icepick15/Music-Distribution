from django.db.models.signals import pre_save
from django.dispatch import receiver
from django.utils.text import slugify
from .models import Post, Category, Tag


@receiver(pre_save, sender=Post)
def generate_post_slug(sender, instance, **kwargs):
    """
    Auto-generate slug for post if not provided
    This is handled in the model save() method but kept here as backup
    """
    if not instance.slug and instance.title:
        base_slug = slugify(instance.title)
        slug = base_slug
        counter = 1
        while Post.objects.filter(slug=slug).exclude(pk=instance.pk).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
        instance.slug = slug


@receiver(pre_save, sender=Category)
def generate_category_slug(sender, instance, **kwargs):
    """Auto-generate slug for category"""
    if not instance.slug and instance.name:
        instance.slug = slugify(instance.name)


@receiver(pre_save, sender=Tag)
def generate_tag_slug(sender, instance, **kwargs):
    """Auto-generate slug for tag"""
    if not instance.slug and instance.name:
        instance.slug = slugify(instance.name)
