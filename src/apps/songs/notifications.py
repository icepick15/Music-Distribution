from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.utils.html import strip_tags
import logging

logger = logging.getLogger(__name__)

class MusicNotifications:
    
    @staticmethod
    def send_upload_notification_to_admin(song):
        """Send email to admin when new song is uploaded"""
        try:
            subject = f'🎵 New Song Upload: "{song.title}" by {song.artist.get_full_name()}'
            
            # Simple text message for now
            message = f"""
New song uploaded and needs review!

Song: {song.title}
Artist: {song.artist.get_full_name()} ({song.artist.email})
Genre: {song.genre.name if song.genre else 'Not specified'}
Uploaded: {song.created_at.strftime('%B %d, %Y at %I:%M %p')}

Review this song in your admin dashboard:
{settings.FRONTEND_URL}/admin/review/{song.id}

Or go to the main admin dashboard:
{settings.FRONTEND_URL}/admin/review
            """
            
            # Send to all admin emails
            admin_emails = getattr(settings, 'NOTIFICATION_EMAILS', [settings.ADMIN_EMAIL])
            
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=admin_emails,
                fail_silently=False
            )
            
            logger.info(f"Admin notification sent for song: {song.id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send admin notification: {e}")
            return False
    
    @staticmethod
    def send_approval_notification(song):
        """Send email to artist when song is approved"""
        try:
            subject = f'🎉 Your song "{song.title}" has been approved!'
            
            message = f"""
Congratulations! Your song has been approved and is now live!

Song: {song.title}
Status: Approved & Distributed
Approved: {song.approved_at.strftime('%B %d, %Y at %I:%M %p') if song.approved_at else 'Just now'}

Your song is now being distributed to all major streaming platforms including:
- Spotify
- Apple Music  
- YouTube Music
- Amazon Music
- And many more!

Track your song's performance in your dashboard:
{settings.FRONTEND_URL}/dashboard

Thank you for using our music distribution platform!
            """
            
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[song.artist.email],
                fail_silently=False
            )
            
            logger.info(f"Approval notification sent to: {song.artist.email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send approval notification: {e}")
            return False
    
    @staticmethod
    def send_rejection_notification(song, reason=""):
        """Send email to artist when song is rejected"""
        try:
            subject = f'📝 Update needed for "{song.title}"'
            
            message = f"""
Your song submission needs some updates before it can be approved.

Song: {song.title}
Status: Requires Updates

{f'Review Notes: {reason}' if reason else 'Please check your song and resubmit.'}

Don't worry! This is common and part of our quality process. Please review the feedback and make the necessary updates to your song.

Once you've made the changes, you can re-submit your song for review.

View your dashboard: {settings.FRONTEND_URL}/dashboard
Upload new version: {settings.FRONTEND_URL}/upload

Need help? Contact our support team!
            """
            
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[song.artist.email],
                fail_silently=False
            )
            
            logger.info(f"Rejection notification sent to: {song.artist.email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send rejection notification: {e}")
            return False

    @staticmethod
    def send_submission_confirmation(song):
        """Send confirmation email to artist when song is submitted"""
        try:
            subject = f'📤 "{song.title}" submitted for review'
            
            message = f"""
Thanks for your submission! We've received your song for review.

Song: {song.title}
Status: Under Review
Submitted: {song.created_at.strftime('%B %d, %Y at %I:%M %p')}

What happens next?
- Review Process: 24-48 hours
- Quality Check: Audio, metadata, and content review
- Distribution: If approved, goes live on all platforms
- Notification: You'll get an email with our decision

Track your submission progress:
{settings.FRONTEND_URL}/dashboard

We'll review your song and get back to you soon!
            """
            
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[song.artist.email],
                fail_silently=False
            )
            
            logger.info(f"Submission confirmation sent to: {song.artist.email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send submission confirmation: {e}")
            return False
