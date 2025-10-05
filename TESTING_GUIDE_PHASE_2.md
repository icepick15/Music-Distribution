# 🧪 PHASE 2 TESTING GUIDE

**Date:** October 4, 2025  
**Purpose:** Comprehensive testing of admin dashboard role-based access controls

---

## 📋 PRE-TESTING SETUP

### Step 1: Create Test Accounts

Run the account creation script:

```powershell
cd "c:\Users\ajibade.akinola\Documents\Music Distribution\Music-Distribution"
.\backend_env\Scripts\Activate.ps1
python create_test_accounts.py
```

**What this does:**
- Creates an admin account with your email (+admin suffix)
- Creates a staff account with your email (+staff suffix)
- Sets up proper roles and permissions
- Displays credentials for both accounts

### Step 2: Start Backend Server

```powershell
# Terminal 1 - Django Backend
cd "c:\Users\ajibade.akinola\Documents\Music Distribution\Music-Distribution"
.\backend_env\Scripts\Activate.ps1
python manage.py runserver
```

**Expected output:**
```
Starting development server at http://127.0.0.1:8000/
```

### Step 3: Start Frontend Server

```powershell
# Terminal 2 - React Frontend
cd "c:\Users\ajibade.akinola\Documents\Music Distribution\Music-Distribution\frontend"
npm run dev
```

**Expected output:**
```
Local: http://localhost:5173/
```

### Step 4: Verify Backend Settings

Check email configuration is set up:
```python
# In Django settings, verify:
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
# OR for testing without real emails:
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
```

---

## 🧪 TESTING SCENARIOS

### SCENARIO 1: Admin Account Testing (Full Access)

#### 1.1 Login as Admin
1. Open browser: http://localhost:5173/
2. Click "Login"
3. Enter admin credentials:
   - Username: `[your_email_prefix]_admin`
   - Password: `admin123`
4. ✅ **Expected:** Successful login, redirected to dashboard

#### 1.2 Navigation Testing
1. Check sidebar navigation
2. ✅ **Expected:** All items visible:
   - Dashboard
   - User Management
   - Content Management
   - Financial Management
   - Support & Tickets
   - Notifications
   - Analytics
   - System Settings
   - Audit Logs

3. ✅ **Expected:** User badge shows "Administrator" (red badge)
4. ✅ **Expected:** User email displayed at top

#### 1.3 Dashboard Testing
1. Navigate to Dashboard
2. ✅ **Expected:** See ALL metrics including:
   - Total Revenue (admin-only)
   - Total Users
   - Total Songs
   - Live Songs
   - Verified Artists
   - Pending Approvals

#### 1.4 User Management Testing
1. Navigate to User Management
2. ✅ **Expected:** Full edit controls visible
3. Click on any user row
4. ✅ **Expected:** See action buttons:
   - View (eye icon)
   - Edit
   - Verify Artist
   - Suspend
5. ✅ **Expected:** Export button visible at top
6. Try to verify an artist
7. ✅ **Expected:** Action succeeds
8. ✅ **Expected:** No "View Only" badges

#### 1.5 Song Approval Testing
1. Navigate to Content Management
2. ✅ **Expected:** No staff notice banner
3. ✅ **Expected:** Export button visible
4. Try to approve a song
5. ✅ **Expected:** Approve action works
6. Try to reject a song
7. ✅ **Expected:** Reject action works
8. Try to delete a song (if delete button exists)
9. ✅ **Expected:** Delete action works

#### 1.6 System Settings Testing
1. Navigate to System Settings
2. ✅ **Expected:** No "Admin Only" banner
3. ✅ **Expected:** All form inputs are enabled
4. ✅ **Expected:** Save button is enabled
5. Try to change a setting
6. ✅ **Expected:** Input fields accept changes
7. Click Save
8. ✅ **Expected:** Settings save successfully

#### 1.7 Support & Communications Testing
1. Navigate to Support & Tickets
2. ✅ **Expected:** No staff restriction banner
3. ✅ **Expected:** "Send Notification" button visible at top
4. Click on a ticket
5. ✅ **Expected:** Status dropdown is enabled
6. Try to change ticket status
7. ✅ **Expected:** Status changes successfully
8. Click "Send Notification"
9. ✅ **Expected:** Modal opens for bulk notifications

#### 1.8 Audit Logs Testing
1. Navigate to Audit Logs
2. ✅ **Expected:** No staff restriction notice
3. ✅ **Expected:** Export button visible
4. ✅ **Expected:** See logs from all users (not just your own)
5. Check log entries
6. ✅ **Expected:** Logs show various users' actions

#### 1.9 Email Notification Testing
1. Perform an action that triggers email (e.g., verify artist)
2. Check your email inbox (admin email address)
3. ✅ **Expected:** Email notification received
4. ✅ **Expected:** Email has correct formatting

---

### SCENARIO 2: Staff Account Testing (Restricted Access)

#### 2.1 Logout and Login as Staff
1. Logout from admin account
2. Click "Login"
3. Enter staff credentials:
   - Username: `[your_email_prefix]_staff`
   - Password: `staff123`
4. ✅ **Expected:** Successful login, redirected to dashboard

#### 2.2 Navigation Testing
1. Check sidebar navigation
2. ❌ **Expected:** Some items HIDDEN:
   - Financial Management (should NOT appear)
   - Notifications (should NOT appear)
   - System Settings (should NOT appear)

3. ✅ **Expected:** These items VISIBLE:
   - Dashboard
   - User Management (with "View Only" badge)
   - Content Management
   - Support & Tickets
   - Analytics (with "View Only" badge)
   - Audit Logs (with restriction note)

4. ✅ **Expected:** User badge shows "Staff Member" (blue badge)
5. ✅ **Expected:** Help text: "Contact admin for full access"

#### 2.3 Dashboard Testing
1. Navigate to Dashboard
2. ❌ **Expected:** Revenue card NOT visible
3. ✅ **Expected:** Other metrics visible:
   - Total Users
   - Total Songs
   - Live Songs
   - Verified Artists
   - Pending Approvals

#### 2.4 User Management Testing
1. Navigate to User Management
2. ✅ **Expected:** Blue banner: "Staff Access Mode - View-only access"
3. ❌ **Expected:** Export button NOT visible
4. Click on any user row
5. ✅ **Expected:** Only View button (eye icon) visible
6. ❌ **Expected:** Edit/Delete buttons NOT visible
7. ✅ **Expected:** "View Only" badge with Lock icon
8. Try to verify artist
9. ❌ **Expected:** Button not present (can't perform action)

#### 2.5 Song Approval Testing
1. Navigate to Content Management
2. ✅ **Expected:** Green banner: "Staff can approve or reject songs"
3. ❌ **Expected:** Export button NOT visible
4. Try to approve a song
5. ✅ **Expected:** Approve action WORKS (staff can approve)
6. Try to reject a song
7. ✅ **Expected:** Reject action WORKS (staff can reject)
8. Look for delete button
9. ❌ **Expected:** Delete button NOT visible (admin-only)

#### 2.6 System Settings Testing
1. Try to navigate to System Settings from URL
2. Option A: Route is protected (shouldn't appear in nav)
3. Option B: If somehow accessed:
   - ✅ **Expected:** Red banner: "Administrator Access Required"
   - ✅ **Expected:** All form inputs are disabled (gray background)
   - ✅ **Expected:** Save button is disabled
   - ❌ **Expected:** Cannot change any settings

#### 2.7 Support & Communications Testing
1. Navigate to Support & Tickets
2. ✅ **Expected:** Blue banner: "Staff can view and respond"
3. ❌ **Expected:** "Send Notification" button NOT visible
4. Click on a ticket
5. ✅ **Expected:** Can view ticket details
6. Try to change ticket status
7. ❌ **Expected:** Status dropdown replaced with Lock icon + status text
8. ✅ **Expected:** Can respond to ticket (if respond feature exists)

#### 2.8 Audit Logs Testing
1. Navigate to Audit Logs
2. ✅ **Expected:** Blue banner: "You can view your own audit trail"
3. ❌ **Expected:** Export button NOT visible
4. Check log entries
5. ✅ **Expected:** Only see YOUR OWN actions (staff user's logs)
6. ❌ **Expected:** Cannot see other users' logs

#### 2.9 Email Notification Testing
1. Perform an action that triggers email (e.g., approve song)
2. Check your email inbox (staff email address)
3. ✅ **Expected:** Email notification received
4. ✅ **Expected:** Email has correct formatting

---

## 🐛 TESTING CHECKLIST

### Visual Elements:
- [ ] Admin badge is red
- [ ] Staff badge is blue
- [ ] Lock icons appear for staff restrictions
- [ ] Access notice banners display correctly
- [ ] No broken UI elements
- [ ] Responsive design works (resize browser)

### Functional Elements:
- [ ] Navigation filters correctly by role
- [ ] Admin sees all features
- [ ] Staff sees limited features
- [ ] Export buttons hidden from staff
- [ ] Form inputs disabled for staff (settings)
- [ ] Status dropdowns replaced with Lock icon
- [ ] Audit logs filtered by user_id for staff

### API Testing:
- [ ] Admin API calls return full data
- [ ] Staff API calls filtered correctly
- [ ] Unauthorized actions return 403 error
- [ ] JWT tokens work correctly
- [ ] No CORS errors

### Browser Console:
- [ ] No JavaScript errors (admin account)
- [ ] No JavaScript errors (staff account)
- [ ] No 404 errors for missing files
- [ ] No permission errors in console

### Email Notifications:
- [ ] Admin email received (+admin address)
- [ ] Staff email received (+staff address)
- [ ] Both emails formatted correctly
- [ ] Email content is accurate

---

## 🔍 DEBUGGING GUIDE

### Issue: Can't login with test accounts
**Check:**
```powershell
python manage.py shell
>>> from django.contrib.auth import get_user_model
>>> User = get_user_model()
>>> User.objects.filter(role='admin').values('username', 'email', 'role', 'is_staff')
>>> User.objects.filter(role='staff').values('username', 'email', 'role', 'is_staff')
```

### Issue: Staff sees admin features
**Check:**
1. Open browser DevTools (F12)
2. Console tab
3. Type: `localStorage.getItem('access_token')`
4. Decode JWT token at jwt.io
5. Verify role in token payload

### Issue: API returns 403 Forbidden
**Check backend logs:**
```powershell
# Check Django server terminal for errors
# Look for permission denied messages
```

### Issue: Navigation doesn't filter
**Check:**
1. Browser DevTools → Console
2. Look for AuthContext errors
3. Type: `document.querySelector('[data-user-role]')` (if implemented)
4. Verify user role is set correctly

### Issue: No email notifications
**Check Django settings:**
```python
# Check if using console backend:
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
# Emails will appear in Django terminal instead of inbox

# Or check SMTP settings if using real email
```

---

## 📊 TEST RESULTS TEMPLATE

Copy this template to record your test results:

```
# PHASE 2 TEST RESULTS
Date: October 4, 2025
Tester: [Your Name]

## Admin Account Tests
- [ ] Login successful
- [ ] All navigation items visible
- [ ] Dashboard shows revenue
- [ ] User management full access
- [ ] Song approval/delete works
- [ ] Settings editable
- [ ] Support status changeable
- [ ] Audit logs show all users
- [ ] Email notifications received

## Staff Account Tests
- [ ] Login successful
- [ ] Navigation filtered (3 items hidden)
- [ ] Dashboard hides revenue
- [ ] User management view-only
- [ ] Song approve works, delete hidden
- [ ] Settings disabled/hidden
- [ ] Support status locked
- [ ] Audit logs show own only
- [ ] Email notifications received

## UI/UX Tests
- [ ] Role badges display correctly
- [ ] Access notices show properly
- [ ] Lock icons appear
- [ ] No visual glitches
- [ ] Responsive design works

## Browser Console
- [ ] No errors (admin)
- [ ] No errors (staff)
- [ ] No 404s
- [ ] No permission errors

## API Tests
- [ ] Admin gets full data
- [ ] Staff gets filtered data
- [ ] 403 for unauthorized
- [ ] Tokens work

## Issues Found
1. 
2. 
3. 

## Overall Status
- [ ] PASS - Ready for production
- [ ] PARTIAL PASS - Minor fixes needed
- [ ] FAIL - Major issues found

## Notes
[Add any additional observations]
```

---

## 🚀 QUICK TEST COMMANDS

### Reset Test Accounts:
```powershell
python create_test_accounts.py
```

### Check User Roles:
```powershell
python manage.py shell
>>> from django.contrib.auth import get_user_model
>>> User = get_user_model()
>>> for u in User.objects.filter(role__in=['admin', 'staff']):
...     print(f"{u.username}: {u.role} (admin={u.is_admin_user}, staff={u.is_staff_user})")
```

### View Email in Console:
```python
# In settings.py, temporarily use:
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
# Emails will print in Django terminal
```

### Clear Browser Cache:
1. F12 → Application → Storage → Clear site data
2. Or use Incognito/Private window

### Check API Endpoints:
```powershell
# Test admin endpoint
curl http://localhost:8000/api/cp/dashboard/ -H "Authorization: Bearer YOUR_TOKEN"

# Test permission check
curl http://localhost:8000/api/cp/settings/ -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📧 EMAIL TESTING NOTES

### Gmail + Addressing:
If using Gmail, both emails will arrive in your inbox:
- Admin: `youremail+admin@gmail.com`
- Staff: `youremail+staff@gmail.com`

You can filter by recipient to separate them.

### Console Backend (No Real Emails):
```python
# settings.py
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
```
Emails appear in Django terminal output.

### SMTP Testing:
```python
# settings.py
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@gmail.com'
EMAIL_HOST_PASSWORD = 'your-app-password'  # Use App Password, not regular password
```

---

## ✅ SUCCESS CRITERIA

Phase 2 testing is successful when:

1. **Admin Account:**
   - ✅ Full access to all features
   - ✅ No restrictions visible
   - ✅ All actions work correctly
   - ✅ Emails received

2. **Staff Account:**
   - ✅ Limited navigation (3 items hidden)
   - ✅ View-only mode works
   - ✅ Can approve songs
   - ✅ Cannot access settings
   - ✅ Audit logs filtered
   - ✅ Emails received

3. **Security:**
   - ✅ Backend rejects unauthorized actions
   - ✅ UI prevents unauthorized access
   - ✅ No permission bypass possible

4. **User Experience:**
   - ✅ Clear communication of access levels
   - ✅ Professional appearance
   - ✅ No confusing UI elements
   - ✅ Consistent behavior

---

**Good luck with testing! 🚀**

Report any issues found and we'll fix them immediately.
