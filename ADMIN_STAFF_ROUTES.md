# 🗺️ ADMIN & STAFF ROUTING GUIDE

**Quick Answer:** Both Admin and Staff use the **SAME route**: `/control-panel/`

---

## 🔐 Route Structure

### Single Route for Both Roles:
```
http://localhost:5173/control-panel/
```

**Why the same route?**
- The UI automatically adapts based on user role
- Navigation filters show/hide items based on permissions
- Admin sees all features
- Staff sees limited features
- Better security (no predictable staff-only route)

---

## 🚪 Login & Access

### Login Page:
```
http://localhost:5173/login
```

**For both Admin and Staff:**
1. Go to: `http://localhost:5173/login`
2. Enter credentials:
   - Admin: `yourname_admin` / `admin123`
   - Staff: `yourname_staff` / `staff123`
3. After login, you'll be redirected automatically

### Alternative Admin Login (if needed):
```
http://localhost:5173/admin-login
```

---

## 🎯 What Happens After Login

### Admin User Flow:
```
1. Login → http://localhost:5173/login
2. Redirect → http://localhost:5173/control-panel/
3. Sees → All 9 navigation items
4. Access → Full control panel with all features
```

### Staff User Flow:
```
1. Login → http://localhost:5173/login
2. Redirect → http://localhost:5173/control-panel/
3. Sees → Only 6 navigation items (3 hidden)
4. Access → Limited control panel with restrictions
```

---

## 📍 Control Panel Sub-Routes

### Admin Can Access All:
```
/control-panel/                      → Dashboard
/control-panel/users                 → User Management
/control-panel/content               → Content Management
/control-panel/songs                 → Songs
/control-panel/financial             → Financial Management (Admin only)
/control-panel/support               → Support & Tickets
/control-panel/notifications         → Notifications (Admin only)
/control-panel/analytics             → Analytics
/control-panel/settings              → System Settings (Admin only)
/control-panel/audit                 → Audit Logs
```

### Staff Can Access:
```
✅ /control-panel/                   → Dashboard (no revenue)
✅ /control-panel/users              → User Management (view-only)
✅ /control-panel/content            → Content Management (can approve)
✅ /control-panel/songs              → Songs (can approve)
✅ /control-panel/support            → Support & Tickets (can respond)
✅ /control-panel/analytics          → Analytics (view-only)
✅ /control-panel/audit              → Audit Logs (own logs only)

❌ /control-panel/financial          → Hidden (not in navigation)
❌ /control-panel/notifications      → Hidden (not in navigation)
❌ /control-panel/settings           → Hidden (not in navigation)
```

---

## 🔒 Route Protection

### Backend Protection:
- Django routes at `/control-panel/` (was `/admin/`)
- API endpoints at `/api/cp/` (was `/api/admin/`)
- Permission classes enforce role restrictions
- 403 Forbidden for unauthorized API calls

### Frontend Protection:
- React routes filter by role
- Navigation hides inaccessible items
- Permission checks on components
- Redirect to login if not authenticated

---

## 🧪 Testing Routes

### Test Admin Access:
```
1. Login as admin
2. Try accessing: http://localhost:5173/control-panel/settings
3. ✅ Expected: Settings page loads with editable form
```

### Test Staff Access:
```
1. Login as staff
2. Try accessing: http://localhost:5173/control-panel/settings
3. ❌ Expected: Either redirected OR see disabled form with red banner
```

### Test Direct URL Access:
```
1. Logout completely
2. Try: http://localhost:5173/control-panel/
3. ✅ Expected: Redirected to login page
```

---

## 📋 URL Testing Checklist

### As Admin:
- [ ] `/control-panel/` loads dashboard
- [ ] `/control-panel/users` shows edit buttons
- [ ] `/control-panel/financial` loads (not hidden)
- [ ] `/control-panel/settings` loads (editable)
- [ ] `/control-panel/notifications` loads (can send)
- [ ] All routes work without restrictions

### As Staff:
- [ ] `/control-panel/` loads dashboard (no revenue)
- [ ] `/control-panel/users` shows view-only mode
- [ ] `/control-panel/financial` → Navigation hidden
- [ ] `/control-panel/settings` → Navigation hidden
- [ ] `/control-panel/notifications` → Navigation hidden
- [ ] `/control-panel/audit` shows only own logs

---

## 🎨 Visual Differences by Role

### Same URL, Different Experience:

**Admin at `/control-panel/`:**
```
┌─────────────────────────────────────┐
│ 🔴 Administrator Badge              │
│                                     │
│ Navigation (9 items):               │
│ ✅ Dashboard                        │
│ ✅ User Management                  │
│ ✅ Content Management               │
│ ✅ Financial Management             │
│ ✅ Support & Tickets                │
│ ✅ Notifications                    │
│ ✅ Analytics                        │
│ ✅ System Settings                  │
│ ✅ Audit Logs                       │
│                                     │
│ Dashboard: Revenue card visible     │
│ User Mgmt: Edit buttons present     │
│ Content: Delete buttons present     │
└─────────────────────────────────────┘
```

**Staff at `/control-panel/`:**
```
┌─────────────────────────────────────┐
│ 🔵 Staff Member Badge               │
│                                     │
│ Navigation (6 items):               │
│ ✅ Dashboard                        │
│ ✅ User Management (view-only)      │
│ ✅ Content Management               │
│ ✅ Support & Tickets                │
│ ✅ Analytics (view-only)            │
│ ✅ Audit Logs (own only)            │
│                                     │
│ Dashboard: Revenue card HIDDEN      │
│ User Mgmt: Lock icons + view-only   │
│ Content: Delete buttons HIDDEN      │
└─────────────────────────────────────┘
```

---

## 🔑 Key Points

### Same Route, Different Permissions:
- ✅ **One route** (`/control-panel/`) for both roles
- ✅ **UI adapts** automatically based on user role
- ✅ **Navigation filters** show/hide items
- ✅ **Backend enforces** permissions via API
- ✅ **No separate staff route** (better security)

### Security Through Obscurity:
- ❌ Old: `/admin/` (predictable, easy to find)
- ✅ New: `/control-panel/` (less obvious)
- ✅ API: `/api/cp/` (obscured admin endpoints)

### Permission Layers:
1. **Frontend:** Hide/disable UI elements
2. **Backend:** Reject unauthorized API calls
3. **Database:** Role-based access control

---

## 🆘 Common Questions

### Q: Can I create a separate staff route like `/staff-panel/`?
**A:** Not recommended. Current design is more secure:
- Single route reduces attack surface
- No predictable staff-only URLs
- UI automatically adapts to role
- Simpler maintenance

### Q: What if staff tries to access admin-only routes directly?
**A:** Multiple protections:
1. Navigation doesn't show the link
2. Component checks permissions (shows disabled state)
3. Backend returns 403 if API called
4. No data returned for unauthorized requests

### Q: How does the system know which role I am?
**A:** 
1. JWT token contains user role
2. AuthContext provides user data
3. Permission utilities check role
4. Components render accordingly

---

## 📝 Summary

### For Testing:

**Admin Account:**
```bash
URL: http://localhost:5173/login
Username: yourname_admin
Password: admin123
After Login: http://localhost:5173/control-panel/
```

**Staff Account:**
```bash
URL: http://localhost:5173/login
Username: yourname_staff
Password: staff123
After Login: http://localhost:5173/control-panel/
```

**Same URL, Different Experience!** 🎭

---

## 🔗 Quick Links for Testing

```
Login:           http://localhost:5173/login
Control Panel:   http://localhost:5173/control-panel/
Dashboard:       http://localhost:5173/control-panel/
Users:           http://localhost:5173/control-panel/users
Content:         http://localhost:5173/control-panel/content
Support:         http://localhost:5173/control-panel/support
Analytics:       http://localhost:5173/control-panel/analytics
Audit:           http://localhost:5173/control-panel/audit

Admin Only:
Financial:       http://localhost:5173/control-panel/financial
Notifications:   http://localhost:5173/control-panel/notifications
Settings:        http://localhost:5173/control-panel/settings
```

---

**Ready to test!** Both admin and staff use `/control-panel/` - the UI will automatically adapt! 🚀
