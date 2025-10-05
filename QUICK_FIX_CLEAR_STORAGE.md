# Quick Fix: Clear Auth Storage & Fresh Login

## Problem
- Routes going to `/control-panel/*` instead of `/staff-portal/*`
- Sidebar showing "logged in as user"
- Sign out button not working
- **Root cause: Stale localStorage data with old user information**

---

## Immediate Solution (Do This Now!)

### Step 1: Clear Storage
**Copy and paste this into your browser console (F12):**

```javascript
localStorage.clear(); sessionStorage.clear(); console.log('✅ Storage cleared!'); location.reload();
```

### Step 2: Login Again
After page reloads:
1. Go to `/login`
2. Login as staff: `iconxx101+staff@yahoo.com` / `staff123`
3. Should redirect to `/staff-portal/`
4. Sidebar should show "Staff" badge

---

## What Was Fixed in Code

### 1. Sign Out Button ✅
Changed from `logout()` to `signOut()`

### 2. Route Detection ✅
Changed from `user?.role` to `user?.publicMetadata?.role`

### 3. Role Display ✅
Now correctly reads role from `publicMetadata`

---

## Test After Clearing Storage

1. **Clear storage** (command above)
2. **Login as staff**
3. **Check these:**
   - [ ] URL is `/staff-portal/` not `/control-panel/`
   - [ ] Badge says "Staff" (blue)
   - [ ] Clicking "Users" goes to `/staff-portal/users`
   - [ ] Sign out button works

---

## If Still Not Working

### Check Console Logs
Look for: `🔍 AdminSidebar Debug:`

**Should see:**
```javascript
{
  userRole: "staff",
  baseRoute: "/staff-portal",
  user: { publicMetadata: { role: "staff" } }
}
```

**If userRole is "user" or undefined:**
- Backend might not be returning correct role
- Check: `localStorage.getItem('authUser')`
- Should have `"role": "staff"` in the JSON

### Force Complete Reset
```javascript
// Nuclear option - clears EVERYTHING
localStorage.clear();
sessionStorage.clear();
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
location.reload();
```

---

## Files Modified
- `AdminSidebar.jsx` - Fixed logout and role detection
- `AuthContext.jsx` - Added logout alias
- `clear-auth-storage.js` - Storage clear script

---

## Summary

**The Problem:** Old cached user data in localStorage with wrong role information.

**The Fix:** 
1. Fixed code to read role correctly
2. Fixed logout function
3. **Clear your browser storage!**

**Run this now:**
```javascript
localStorage.clear(); location.reload();
```

Then login again and it should work! 🎉
