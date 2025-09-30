# 👥 Admin Guide: Accessing Contact Messages

## 🎯 Overview

As an admin, you have multiple ways to access, manage, and respond to contact messages. Here are all the methods available:

## 1. 🖥️ Django Admin Interface (Recommended)

### Access URL:

```
http://localhost:8000/admin/support/contactmessage/
```

### Features:

- **Visual Dashboard** with color-coded status and priority badges
- **Filtering** by status, priority, category, date, user
- **Search** across name, email, subject, message content
- **Bulk Actions**: Mark as read/responded/resolved, convert to tickets
- **Detailed View** with all metadata and timestamps
- **Response Time Tracking** with human-readable format

### Admin Actions Available:

- ✅ Mark as read
- ✅ Mark as responded
- ✅ Mark as resolved
- ✅ Convert to tickets (bulk)

## 2. 🚀 REST API Endpoints

### List All Contact Messages

```bash
GET http://localhost:8000/api/support/contact/
Authorization: Token <your-admin-token>
```

**Response:**

```json
{
  "count": 150,
  "next": "http://localhost:8000/api/support/contact/?page=2",
  "previous": null,
  "results": [
    {
      "id": "7cc89de0-d26b-4c36-a26d-76bf225f8822",
      "name": "John Doe",
      "email": "john@example.com",
      "subject": "Technical Support Request",
      "category": "technical",
      "message": "I'm having trouble uploading...",
      "status": "new",
      "priority": "high",
      "user": null,
      "created_at": "2025-09-30T10:30:00Z",
      "updated_at": "2025-09-30T10:30:00Z",
      "read_at": null,
      "responded_at": null,
      "response_time_hours": null,
      "is_urgent": false
    }
  ]
}
```

### Get Specific Contact Message

```bash
GET http://localhost:8000/api/support/contact/{message_id}/
Authorization: Token <your-admin-token>
```

### Filter Messages

```bash
# By status
GET /api/support/contact/?status=new

# By category
GET /api/support/contact/?category=technical

# By priority
GET /api/support/contact/?priority=high

# By date range
GET /api/support/contact/?created_at__gte=2025-09-01

# Search in content
GET /api/support/contact/?search=upload

# Combine filters
GET /api/support/contact/?status=new&category=technical&priority=high
```

### Get Contact Statistics

```bash
GET http://localhost:8000/api/support/contact/stats/
Authorization: Token <your-admin-token>
```

**Response:**

```json
{
  "total_messages": 150,
  "status_breakdown": {
    "new": 25,
    "read": 30,
    "in_progress": 40,
    "responded": 35,
    "resolved": 20
  },
  "category_breakdown": {
    "technical": 45,
    "billing": 30,
    "distribution": 25,
    "royalties": 15,
    "account": 10,
    "partnership": 8,
    "general": 12,
    "other": 5
  },
  "priority_breakdown": {
    "low": 60,
    "medium": 70,
    "high": 15,
    "urgent": 5
  },
  "recent_activity": {
    "last_7_days": 35
  }
}
```

### Get Urgent Messages

```bash
GET http://localhost:8000/api/support/contact/urgent/
Authorization: Token <your-admin-token>
```

## 3. 🔧 Management Actions

### Mark as Read

```bash
POST http://localhost:8000/api/support/contact/{message_id}/mark_as_read/
Authorization: Token <your-admin-token>
```

### Mark as Responded

```bash
POST http://localhost:8000/api/support/contact/{message_id}/mark_as_responded/
Authorization: Token <your-admin-token>
```

### Update Status

```bash
PATCH http://localhost:8000/api/support/contact/{message_id}/update_status/
Authorization: Token <your-admin-token>
Content-Type: application/json

{
  "status": "in_progress"
}
```

### Convert to Ticket

```bash
POST http://localhost:8000/api/support/contact/{message_id}/convert_to_ticket/
Authorization: Token <your-admin-token>
Content-Type: application/json

{
  "assigned_to": 1  // Optional: assign to specific admin user
}
```

## 4. 🐍 Python/Django Shell Access

```python
# Start Django shell
python manage.py shell

# Import the model
from src.apps.support.models import ContactMessage

# Get all new messages
new_messages = ContactMessage.objects.filter(status='new')

# Get urgent messages
urgent_messages = ContactMessage.objects.filter(
    priority__in=['high', 'urgent'],
    status__in=['new', 'read']
)

# Get messages by category
technical_messages = ContactMessage.objects.filter(category='technical')

# Get recent messages (last 24 hours)
from django.utils import timezone
from datetime import timedelta

recent = ContactMessage.objects.filter(
    created_at__gte=timezone.now() - timedelta(hours=24)
)

# Mark message as read
message = ContactMessage.objects.get(id='your-message-id')
message.mark_as_read()

# Convert to ticket
ticket = message.convert_to_ticket()
```

## 5. 📊 Quick Reference Commands

### Using cURL (Command Line)

```bash
# Get admin token first (if using token auth)
curl -X POST http://localhost:8000/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "yourpassword"}'

# List all messages
curl -H "Authorization: Token YOUR_TOKEN" \
  http://localhost:8000/api/support/contact/

# Get new messages only
curl -H "Authorization: Token YOUR_TOKEN" \
  "http://localhost:8000/api/support/contact/?status=new"

# Get statistics
curl -H "Authorization: Token YOUR_TOKEN" \
  http://localhost:8000/api/support/contact/stats/
```

## 6. 🎛️ Admin Dashboard Features

When you access the Django Admin interface, you'll see:

### List View Features:

- **Name & Email** - Contact person details
- **Subject** - Message subject line
- **Status Badge** - Color-coded status (New=Red, Read=Blue, etc.)
- **Priority Badge** - Color-coded priority (Urgent=Red, High=Orange, etc.)
- **Category** - Support category
- **Created Date** - When message was submitted
- **Response Time** - How long to respond (if applicable)

### Filter Sidebar:

- Status (New, Read, In Progress, Responded, Resolved)
- Priority (Low, Medium, High, Urgent)
- Category (Technical, Billing, Distribution, etc.)
- Created Date (Today, Past 7 days, This month, etc.)
- User (Registered users who submitted messages)

### Search Box:

Search across:

- Contact name
- Email address
- Subject line
- Message content
- User username/email

## 7. 🔐 Authentication Requirements

To access contact messages as admin, you need:

1. **Django Admin Access**: User with `is_staff=True`
2. **API Access**: Valid authentication token
3. **Permissions**: The ContactMessageViewSet checks for `IsAdminUser` permission

### Create Admin User:

```bash
python manage.py createsuperuser
```

### Get API Token (if using token auth):

```python
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token

User = get_user_model()
admin_user = User.objects.get(username='admin')
token, created = Token.objects.get_or_create(user=admin_user)
print(f"Admin Token: {token.key}")
```

## 📱 Pro Tips

1. **Use Django Admin for daily management** - It's the most user-friendly
2. **Use API for integrations** - Perfect for custom dashboards or mobile apps
3. **Filter by status='new'** - See what needs immediate attention
4. **Check urgent endpoint** - `/api/support/contact/urgent/` for high-priority items
5. **Use bulk actions** - Select multiple messages and perform batch operations
6. **Convert to tickets** - For complex issues that need ongoing support

Your contact system is now fully accessible through multiple interfaces! 🚀
