# 🚀 QUICK START - Phase 2 Testing

**Ready to test in 5 steps!**

---

## Step 1️⃣: Create Test Accounts (2 minutes)

```powershell
cd "c:\Users\ajibade.akinola\Documents\Music Distribution\Music-Distribution"
.\backend_env\Scripts\Activate.ps1
python create_test_accounts.py
```

**What to do:**

- Enter your email when prompted
- Script creates admin + staff accounts
- Note down the usernames displayed

**Example output:**

```
✅ Created admin account: yourname_admin
✅ Created staff account: yourname_staff
Password: admin123 / staff123
```

---

## Step 2️⃣: Verify Setup (30 seconds)

```powershell
python verify_test_setup.py
```

**Expected:**

```
✅ Admin accounts exist
✅ Staff accounts exist
✅ User model properties exist
✅ All checks passed! Ready for testing.
```

---

## Step 3️⃣: Start Backend (Terminal 1)

```powershell
cd "c:\Users\ajibade.akinola\Documents\Music Distribution\Music-Distribution"
.\backend_env\Scripts\Activate.ps1
python manage.py runserver
```

**Expected:**

```
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

✅ **Keep this terminal running!**

---

## Step 4️⃣: Start Frontend (Terminal 2)

```powershell
cd "c:\Users\ajibade.akinola\Documents\Music Distribution\Music-Distribution\frontend"
npm run dev
```

**Expected:**

```
➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

✅ **Keep this terminal running!**

---

## Step 5️⃣: Open Browser & Test

### 5.1 Test Admin Account (5 minutes)

1. **Open:** http://localhost:5173/
2. **Login:**

   - Username: `[your_prefix]_admin`
   - Password: `admin123`

3. **Quick Checks:**
   - [ ] See "Administrator" red badge in sidebar
   - [ ] All 9 navigation items visible
   - [ ] Dashboard shows revenue card
   - [ ] User Management has edit buttons
   - [ ] Song Approval has export button
   - [ ] System Settings is accessible
   - [ ] Audit Logs shows all users

✅ **Pass if:** All items checked above

### 5.2 Test Staff Account (5 minutes)

1. **Logout** from admin
2. **Login:**

   - Username: `[your_prefix]_staff`
   - Password: `staff123`

3. **Quick Checks:**
   - [ ] See "Staff Member" blue badge in sidebar
   - [ ] Only 6 navigation items (Financial/Notifications/Settings hidden)
   - [ ] Dashboard does NOT show revenue card
   - [ ] User Management shows "View Only" with Lock icons
   - [ ] Song Approval shows green banner "Staff can approve"
   - [ ] System Settings NOT in navigation
   - [ ] Audit Logs shows blue banner "View your own"

✅ **Pass if:** All items checked above

---

## 📧 Email Testing (Optional)

### If using console backend:

- Emails appear in Django terminal (Terminal 1)
- Look for email output after actions

### If using SMTP:

- Check your email inbox
- Admin emails: `youremail+admin@...`
- Staff emails: `youremail+staff@...`

---

## ⚡ Common Issues & Quick Fixes

### "Cannot find module"

```powershell
cd frontend
npm install
```

### "Module not found: permissions.js"

```powershell
# Check file exists:
dir frontend\src\utils\permissions.js
```

### "API returns 403"

```powershell
# Check backend is running on port 8000
# Check JWT token is valid (re-login)
```

### "Navigation doesn't filter"

```powershell
# Clear browser cache (F12 → Application → Clear Storage)
# Or use Incognito mode
```

### "User role is wrong"

```powershell
python manage.py shell
>>> from django.contrib.auth import get_user_model
>>> User = get_user_model()
>>> user = User.objects.get(username='yourname_staff')
>>> user.role
'staff'  # Should be 'staff'
>>> user.role = 'staff'  # Fix if wrong
>>> user.save()
```

---

## 🎯 Success Criteria

### ✅ PASS if:

1. Admin sees all features (no restrictions)
2. Staff sees limited features (3 nav items hidden)
3. Revenue card hidden from staff
4. Edit buttons hidden from staff (Lock icons shown)
5. No JavaScript errors in console
6. Both accounts can receive emails

### ❌ FAIL if:

1. Staff sees admin-only features
2. Admin sees restriction notices
3. Navigation doesn't filter
4. Console shows errors
5. API returns 403 for admin actions

---

## 📋 Test Results Quick Form

```
Date: _______________
Tester: _______________

Admin Account:
[ ] Login works
[ ] All nav items visible (9 items)
[ ] Revenue card visible
[ ] Full edit access
[ ] No restrictions

Staff Account:
[ ] Login works
[ ] Limited nav (6 items)
[ ] Revenue card hidden
[ ] View-only mode
[ ] Lock icons show

Console:
[ ] No errors (admin)
[ ] No errors (staff)

Overall: [ ] PASS  [ ] FAIL

Issues found:
1. _______________________
2. _______________________
```

---

## 🎓 Full Testing Guide

For comprehensive testing, see: **TESTING_GUIDE_PHASE_2.md**

Covers:

- Detailed scenario testing
- All component checks
- API testing procedures
- Email verification
- Debugging guide
- Performance checks

---

## 🆘 Need Help?

### Check logs:

- Django: Terminal 1 (backend)
- React: Terminal 2 (frontend)
- Browser: F12 → Console tab

### Quick debug commands:

```powershell
# View test accounts
python manage.py shell
>>> from django.contrib.auth import get_user_model
>>> User = get_user_model()
>>> User.objects.filter(role__in=['admin','staff']).values('username','role','email')

# Reset test accounts
python create_test_accounts.py
```

---

## ⏱️ Total Time Estimate

- **Setup:** 5 minutes
- **Admin Testing:** 5 minutes
- **Staff Testing:** 5 minutes
- **Email Verification:** 2 minutes
- **Total:** ~15-20 minutes for quick test

**Full comprehensive testing:** 45-60 minutes

---

**Ready? Let's test! 🚀**

Start with Step 1 above and work your way down.
