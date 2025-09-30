from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
from .models import Ticket, TicketResponse

User = get_user_model()


@receiver(post_save, sender=Ticket)
def ticket_created_notification(sender, instance, created, **kwargs):
    """Send notification when a new ticket is created"""
    if created:
        # Notify staff about new ticket
        staff_users = User.objects.filter(is_staff=True, email__isnull=False).exclude(email='')
        
        subject = f'New Support Ticket: {instance.ticket_id}'
        message = f"""
A new support ticket has been created:

Ticket ID: {instance.ticket_id}
Title: {instance.title}
Priority: {instance.get_priority_display()}
Category: {instance.get_category_display()}
Author: {instance.author.get_full_name() or instance.author.username}
Email: {instance.author.email}

Description:
{instance.description}

You can manage this ticket in the admin panel.
        """
        
        # Send email to all staff members
        for staff_user in staff_users:
            try:
                send_mail(
                    subject=subject,
                    message=message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[staff_user.email],
                    fail_silently=True,
                )
            except Exception:
                pass  # Fail silently to not break the ticket creation


@receiver(post_save, sender=TicketResponse)
def ticket_response_notification(sender, instance, created, **kwargs):
    """Send notification when a response is added to a ticket"""
    if created:
        ticket = instance.ticket
        
        if instance.is_from_staff:
            # Staff responded - notify the ticket author
            if ticket.author.email:
                subject = f'Response to your ticket {ticket.ticket_id}'
                message = f"""
Hello {ticket.author.get_full_name() or ticket.author.username},

You have received a response to your support ticket:

Ticket ID: {ticket.ticket_id}
Title: {ticket.title}

Response from {instance.author.get_full_name() or instance.author.username}:
{instance.message}

You can view and respond to this ticket by logging into your account.
                """
                
                try:
                    send_mail(
                        subject=subject,
                        message=message,
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[ticket.author.email],
                        fail_silently=True,
                    )
                except Exception:
                    pass
        else:
            # Customer responded - notify assigned staff or all staff
            recipients = []
            
            if ticket.assignee and ticket.assignee.email:
                recipients.append(ticket.assignee.email)
            else:
                # No assignee, notify all staff
                staff_emails = User.objects.filter(
                    is_staff=True, 
                    email__isnull=False
                ).exclude(email='').values_list('email', flat=True)
                recipients.extend(staff_emails)
            
            if recipients:
                subject = f'Customer response on ticket {ticket.ticket_id}'
                message = f"""
Customer {instance.author.get_full_name() or instance.author.username} has responded to ticket {ticket.ticket_id}:

Title: {ticket.title}
Priority: {ticket.get_priority_display()}
Status: {ticket.get_status_display()}

Response:
{instance.message}

You can manage this ticket in the admin panel.
                """
                
                for email in recipients:
                    try:
                        send_mail(
                            subject=subject,
                            message=message,
                            from_email=settings.DEFAULT_FROM_EMAIL,
                            recipient_list=[email],
                            fail_silently=True,
                        )
                    except Exception:
                        pass


@receiver(pre_save, sender=Ticket)
def ticket_status_change_notification(sender, instance, **kwargs):
    """Send notification when ticket status changes"""
    if instance.pk:  # Only for existing tickets
        try:
            old_ticket = Ticket.objects.get(pk=instance.pk)
            if old_ticket.status != instance.status:
                # Status changed, notify the author
                if instance.author.email:
                    subject = f'Ticket {instance.ticket_id} status updated'
                    message = f"""
Hello {instance.author.get_full_name() or instance.author.username},

Your support ticket status has been updated:

Ticket ID: {instance.ticket_id}
Title: {instance.title}
Old Status: {old_ticket.get_status_display()}
New Status: {instance.get_status_display()}

You can view this ticket by logging into your account.
                    """
                    
                    try:
                        send_mail(
                            subject=subject,
                            message=message,
                            from_email=settings.DEFAULT_FROM_EMAIL,
                            recipient_list=[instance.author.email],
                            fail_silently=True,
                        )
                    except Exception:
                        pass
        except Ticket.DoesNotExist:
            pass