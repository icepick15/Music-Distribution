# 🐛 Email Notification Debugging Guide

**Date:** October 4, 2025  
**Issue:** Email notifications not being sent when approving/distributing songs

---

## 🔍 What I Fixed

### Issue 1: Signal Not Detecting Status Change

**Problem:** The `post_save` signal was trying to get the old status AFTER the save, but the database was already updated.

**Solution:** Added `pre_save` signal to track the old status before saving.

### Issue 2: No Debug Logging

**Problem:** Couldn't see what was happening in the notification flow.

**Solution:** Added comprehensive logging at every step.

---

## 📊 How to Debug

### Step 1: Check Django Logs

When you approve a song in admin, you should see these logs:

```
🔍 PRE_SAVE: Tracked old status for song 'Your Song': pending
🔔 POST_SAVE: Song 'Your Song' - created=False, status=approved
🔍 Status Check: old_status=pending, new_status=approved
✅ Status changed from 'pending' to 'approved' - sending notification
📧 Handling notification: 'Your Song' - pending → approved
📤 Sending 'song_approved' notification to artist@email.com
✅ Notification created successfully: <notification_id>
Email sent successfully for notification <notification_id>
```

### Step 2: If You Don't See These Logs

**Check logs location:**

```bash
# Look in logs/django.log
tail -f logs/django.log
```

**Or check console output** where Django server is running.

---

## 🧪 Testing Steps

### Test 1: Approve Song via Admin

1. **Revert song to pending:**

   ```bash
   python revert_song_status.py
   # Choose option 1 or 2
   ```

2. **Watch Django logs:**

   - Open the terminal where Django is running
   - You should see log messages appear

3. **Approve song in admin:**

   - Go to Django Admin → Songs → Songs
   - Select pending song
   - Action → "✅ Approve selected songs"
   - Click "Go"

4. **Check logs for:**

   - `🔍 PRE_SAVE: Tracked old status`
   - `🔔 POST_SAVE: Song ... status=approved`
   - `✅ Status changed from 'pending' to 'approved'`
   - `📤 Sending 'song_approved' notification`
   - `Email sent successfully`

5. **Check email:**
   - Look in artist's email inbox
   - Check spam folder
   - Check ZeptoMail dashboard for delivery status

### Test 2: Check Notification Database

```bash
python manage.py shell
```

```python
from src.apps.notifications.models import Notification
from src.apps.songs.models import Song

# Get recent notifications
notifications = Notification.objects.all().order_by('-created_at')[:5]
for n in notifications:
    print(f"{n.notification_type.name}: {n.title} - Status: {n.status}")

# Check if notification was created for your song
song = Song.objects.filter(title='Your Song Title').first()
if song:
    notifications = Notification.objects.filter(related_song=song)
    print(f"Found {notifications.count()} notifications for this song")
    for n in notifications:
        print(f"  - {n.notification_type.name}: {n.status} at {n.created_at}")
```

### Test 3: Check User Notification Preferences

```bash
python manage.py shell
```

```python
from src.apps.notifications.models import UserNotificationPreference, NotificationType
from django.contrib.auth import get_user_model

User = get_user_model()
user = User.objects.get(email='artist@email.com')

# Check if song_approved notifications are enabled
try:
    nt = NotificationType.objects.get(name='song_approved')
    pref = UserNotificationPreference.objects.get(user=user, notification_type=nt)
    print(f"Email enabled: {pref.email_enabled}")
    print(f"Frequency: {pref.frequency}")
except Exception as e:
    print(f"Error: {e}")
```

---

## 🚨 Common Issues & Solutions

### Issue: "No old_status found" in logs

**Cause:** The `pre_save` signal isn't tracking the status.

**Solution:**

```bash
# Restart Django server
# The signal should now be active
python manage.py runserver
```

### Issue: "Notification type 'song_approved' not found"

**Cause:** Notification types not created in database.

**Solution:**

```bash
python manage.py shell
```

```python
from src.apps.notifications.services import NotificationService
NotificationService.create_notification_types()
print("Notification types created!")
```

### Issue: "Notifications disabled for user"

**Cause:** User has disabled email notifications.

**Solution:**

```bash
python manage.py shell
```

```python
from src.apps.notifications.models import UserNotificationPreference, NotificationType
from django.contrib.auth import get_user_model

User = get_user_model()
user = User.objects.get(email='artist@email.com')
nt = NotificationType.objects.get(name='song_approved')

# Enable email notifications
pref, created = UserNotificationPreference.objects.get_or_create(
    user=user,
    notification_type=nt,
    defaults={'email_enabled': True, 'frequency': 'immediate'}
)

if not created:
    pref.email_enabled = True
    pref.frequency = 'immediate'
    pref.save()
    print("✅ Email notifications enabled!")
```

### Issue: Email sent but not received

**Possible causes:**

1. **Email in spam folder** - Check spam/junk
2. **ZeptoMail issue** - Check ZeptoMail dashboard
3. **Email address wrong** - Verify user's email
4. **Email service down** - Check settings.py EMAIL\_\* configs

**Check ZeptoMail:**

```bash
# Look for email backend errors in logs
grep -i "zepto" logs/django.log
grep -i "email" logs/django.log
```

---

## 🔧 Manual Email Test

Test the email service directly:

```bash
python manage.py shell
```

```python
from src.apps.notifications.services import NotificationService
from django.contrib.auth import get_user_model
from src.apps.songs.models import Song

User = get_user_model()
user = User.objects.first()  # Get any user
song = Song.objects.first()  # Get any song

# Send test notification
notification = NotificationService.send_user_notification(
    user=user,
    notification_type_name='song_approved',
    title=f"TEST: Song '{song.title}' has been approved",
    message="This is a test notification",
    context_data={'song_title': song.title},
    related_song=song,
    priority='high'
)

if notification:
    print(f"✅ Notification created: {notification.id}")
    print(f"   Status: {notification.status}")
    print(f"   Email enabled: {notification.send_email}")
else:
    print("❌ Notification creation failed")
```

---

## 📝 Quick Reference

### Log Messages Meaning

| Log Message                               | Meaning                                 |
| ----------------------------------------- | --------------------------------------- |
| `🔍 PRE_SAVE: Tracked old status`         | Signal captured old status before save  |
| `🔔 POST_SAVE: Song ... status=approved`  | Save completed, checking for changes    |
| `✅ Status changed from 'X' to 'Y'`       | Status change detected, will send email |
| `📧 Handling notification`                | Creating notification                   |
| `📤 Sending 'song_approved' notification` | Sending to notification service         |
| `✅ Notification created successfully`    | Notification record created             |
| `Email sent successfully`                 | Email sent via ZeptoMail                |
| `⚠️ No old_status found`                  | **ERROR**: Signal not working           |
| `⚠️ Notification creation returned None`  | User disabled notifications             |

### Quick Commands

```bash
# Restart Django server (to load new signal code)
Ctrl+C
python manage.py runserver

# Check logs
tail -f logs/django.log

# Test specific notification
python manage.py shell -c "from src.apps.notifications.services import NotificationService; NotificationService.create_notification_types()"

# Check notification count
python manage.py shell -c "from src.apps.notifications.models import Notification; print(f'Total: {Notification.objects.count()}')"
```

---

## ✅ Success Checklist

After approving a song, you should have:

- [x] Log message: `🔍 PRE_SAVE: Tracked old status`
- [x] Log message: `✅ Status changed from 'pending' to 'approved'`
- [x] Log message: `📤 Sending 'song_approved' notification`
- [x] Log message: `Email sent successfully`
- [x] Notification in database (check via shell)
- [x] Email in artist's inbox (or spam folder)

If ANY of these are missing, use the debugging steps above!

---

## 🆘 Still Not Working?

If you've tried everything and it still doesn't work:

1. **Check Django server is running** with latest code
2. **Restart Django server** (important!)
3. **Check logs/django.log** for any errors
4. **Run manual email test** (see above)
5. **Verify email settings** in settings.py
6. **Check ZeptoMail dashboard** for bounces/failures

**Share these with me:**

- Django server console output
- logs/django.log content
- Result of manual email test
- Output of notification preference check

---

**Last Updated:** October 4, 2025  
**Status:** ✅ Fixed with debug logging
