"""
Test script to create sample blog content
Run with: python test_blog_system.py
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'music_distribution_backend.settings')
django.setup()

from src.apps.blog.models import Category, Tag, Post
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

def create_sample_blog_content():
    """Create sample categories, tags, and blog posts"""
    
    print("🎬 Creating sample blog content...")
    
    # Get admin user (or create one)
    try:
        admin = User.objects.filter(is_staff=True).first()
        if not admin:
            print("❌ No admin user found. Please create one first:")
            print("   python manage.py createsuperuser")
            return
    except Exception as e:
        print(f"❌ Error finding admin user: {e}")
        return
    
    # Create Categories
    print("\n📁 Creating categories...")
    categories_data = [
        {
            'name': 'Music Distribution',
            'description': 'Learn how to distribute your music to all major platforms',
            'icon': 'MusicalNoteIcon'
        },
        {
            'name': 'Industry Insights',
            'description': 'Stay updated with the latest music industry trends',
            'icon': 'ChartBarIcon'
        },
        {
            'name': 'Tips & Tricks',
            'description': 'Practical advice for independent artists',
            'icon': 'LightBulbIcon'
        },
        {
            'name': 'Success Stories',
            'description': 'Inspiring stories from artists who made it',
            'icon': 'TrophyIcon'
        },
    ]
    
    categories = {}
    for cat_data in categories_data:
        category, created = Category.objects.get_or_create(
            name=cat_data['name'],
            defaults={
                'description': cat_data['description'],
                'icon': cat_data['icon']
            }
        )
        categories[cat_data['name']] = category
        print(f"   {'✅ Created' if created else '✓ Exists'}: {category.name}")
    
    # Create Tags
    print("\n🏷️  Creating tags...")
    tags_data = [
        'Distribution', 'Spotify', 'Apple Music', 'Tutorial', 'Beginners',
        'Marketing', 'Promotion', 'Royalties', 'Streaming', 'Tips'
    ]
    
    tags = {}
    for tag_name in tags_data:
        tag, created = Tag.objects.get_or_create(name=tag_name)
        tags[tag_name] = tag
        print(f"   {'✅ Created' if created else '✓ Exists'}: {tag.name}")
    
    # Create Blog Posts
    print("\n📝 Creating blog posts...")
    posts_data = [
        {
            'title': 'How to Distribute Your Music to Spotify in 2025',
            'category': 'Music Distribution',
            'tags': ['Distribution', 'Spotify', 'Tutorial', 'Beginners'],
            'excerpt': 'A complete step-by-step guide on getting your music on Spotify and reaching millions of listeners worldwide.',
            'content': '''
                <h2>Getting Started with Spotify Distribution</h2>
                <p>Distributing your music to Spotify has never been easier. With our platform, you can reach millions of listeners worldwide in just a few clicks.</p>
                
                <h3>Step 1: Prepare Your Music</h3>
                <p>Ensure your tracks are professionally mixed and mastered. Spotify recommends:</p>
                <ul>
                    <li>Audio format: WAV or FLAC</li>
                    <li>Sample rate: 44.1 kHz</li>
                    <li>Bit depth: 16-bit or higher</li>
                </ul>
                
                <h3>Step 2: Upload Your Tracks</h3>
                <p>Log into your account and navigate to the upload section. Fill in all metadata including:</p>
                <ul>
                    <li>Song title and artist name</li>
                    <li>Album artwork (3000x3000px minimum)</li>
                    <li>Release date</li>
                    <li>Genre and mood tags</li>
                </ul>
                
                <h3>Step 3: Submit for Distribution</h3>
                <p>Once you've uploaded everything, submit your release. We'll handle the rest!</p>
                
                <p><strong>Pro Tip:</strong> Submit your music at least 2 weeks before your desired release date to allow time for processing and playlist consideration.</p>
            ''',
            'featured': True,
            'status': 'published'
        },
        {
            'title': 'Understanding Music Streaming Royalties',
            'category': 'Industry Insights',
            'tags': ['Royalties', 'Streaming', 'Spotify', 'Apple Music'],
            'excerpt': 'Learn how streaming royalties work and how much you can earn from platforms like Spotify, Apple Music, and more.',
            'content': '''
                <h2>How Streaming Royalties Work</h2>
                <p>Understanding how you get paid from streaming services is crucial for any independent artist.</p>
                
                <h3>What Are Streaming Royalties?</h3>
                <p>Streaming royalties are payments made to rights holders (that's you!) when your music is played on streaming platforms.</p>
                
                <h3>Average Payout Per Stream</h3>
                <ul>
                    <li><strong>Spotify:</strong> $0.003 - $0.005 per stream</li>
                    <li><strong>Apple Music:</strong> $0.007 - $0.010 per stream</li>
                    <li><strong>YouTube Music:</strong> $0.002 - $0.004 per stream</li>
                    <li><strong>Tidal:</strong> $0.012 - $0.015 per stream</li>
                </ul>
                
                <h3>Factors That Affect Your Earnings</h3>
                <p>Several factors influence how much you earn:</p>
                <ul>
                    <li>Listener's country and subscription type</li>
                    <li>Platform's revenue share model</li>
                    <li>Total streams on the platform that month</li>
                </ul>
                
                <p><strong>Bottom Line:</strong> Focus on getting more streams and building your fanbase. The money will follow!</p>
            ''',
            'featured': True,
            'status': 'published'
        },
        {
            'title': '5 Common Mistakes New Artists Make',
            'category': 'Tips & Tricks',
            'tags': ['Tips', 'Beginners', 'Marketing'],
            'excerpt': 'Avoid these common pitfalls and set yourself up for success in the music industry.',
            'content': '''
                <h2>Learn From Others' Mistakes</h2>
                <p>Here are the top 5 mistakes we see new artists make—and how to avoid them.</p>
                
                <h3>1. Rushing the Release</h3>
                <p>Many artists upload their music the same day they want it live. Always plan ahead:</p>
                <ul>
                    <li>Submit 2-4 weeks in advance</li>
                    <li>Build anticipation with pre-saves</li>
                    <li>Give yourself time for marketing</li>
                </ul>
                
                <h3>2. Poor Metadata</h3>
                <p>Incomplete or incorrect metadata can hurt your discoverability:</p>
                <ul>
                    <li>Use proper spelling and formatting</li>
                    <li>Include all contributors</li>
                    <li>Add accurate genre tags</li>
                </ul>
                
                <h3>3. Ignoring Album Artwork Quality</h3>
                <p>Your artwork is the first thing listeners see. Make it count:</p>
                <ul>
                    <li>Use high resolution (3000x3000px minimum)</li>
                    <li>Avoid text-heavy designs</li>
                    <li>Make it visually striking</li>
                </ul>
                
                <h3>4. No Marketing Plan</h3>
                <p>Distribution is just the start. You need to promote your music:</p>
                <ul>
                    <li>Build your social media presence</li>
                    <li>Engage with your fans</li>
                    <li>Submit to playlists</li>
                    <li>Collaborate with other artists</li>
                </ul>
                
                <h3>5. Giving Up Too Soon</h3>
                <p>Success in music takes time. Stay consistent and keep creating!</p>
            ''',
            'featured': False,
            'status': 'published'
        },
    ]
    
    created_posts = []
    for post_data in posts_data:
        post, created = Post.objects.get_or_create(
            title=post_data['title'],
            defaults={
                'author': admin,
                'category': categories[post_data['category']],
                'excerpt': post_data['excerpt'],
                'content': post_data['content'],
                'status': post_data['status'],
                'featured': post_data['featured'],
                'published_at': timezone.now() if post_data['status'] == 'published' else None
            }
        )
        
        if created:
            # Add tags
            for tag_name in post_data['tags']:
                post.tags.add(tags[tag_name])
            created_posts.append(post)
            print(f"   ✅ Created: {post.title}")
        else:
            print(f"   ✓ Exists: {post.title}")
    
    # Summary
    print("\n" + "="*60)
    print("✅ Sample blog content created successfully!")
    print("="*60)
    print(f"\n📊 Summary:")
    print(f"   Categories: {Category.objects.count()}")
    print(f"   Tags: {Tag.objects.count()}")
    print(f"   Posts: {Post.objects.count()}")
    print(f"   Published Posts: {Post.objects.filter(status='published').count()}")
    print(f"   Featured Posts: {Post.objects.filter(featured=True).count()}")
    
    print(f"\n🌐 Access your blog:")
    print(f"   Frontend: http://localhost:5173/blog")
    print(f"   Admin: http://localhost:8000/admin/blog/")
    print(f"   API: http://localhost:8000/api/blog/posts/")
    
    print("\n💡 Next Steps:")
    print("   1. Visit the admin to customize posts")
    print("   2. Add featured images to posts")
    print("   3. Create more content")
    print("   4. Share on social media!")
    
    return created_posts


if __name__ == '__main__':
    try:
        create_sample_blog_content()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
