# Module Export Error Fix 🔧

## Error Message
```
Uncaught SyntaxError: The requested module '/src/admin/components/AdminSidebar.jsx?t=1759628143994' 
does not provide an export named 'default' (at AdminDashboard.jsx:4:8)
```

## Root Cause
This is a **Vite Hot Module Replacement (HMR) caching issue**. The file DOES have a default export, but Vite's cache is stale.

## Verified: Export Exists ✅
```javascript
// Line 85 in AdminSidebar.jsx
export default function AdminSidebar() {
  // ... component code
}
```

## Solutions (Try in order)

### Solution 1: Complete Server Restart (RECOMMENDED)

**Step 1: Stop ALL Node processes**
```powershell
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force
```

**Step 2: Clear Vite cache**
```powershell
cd frontend
Remove-Item -Path "node_modules\.vite" -Recurse -Force
```

**Step 3: Clear dist**
```powershell
Remove-Item -Path "dist" -Recurse -Force -ErrorAction SilentlyContinue
```

**Step 4: Start fresh**
```powershell
npm run dev
```

**Step 5: Hard refresh browser**
- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`
- Or: DevTools → Network → Disable cache → Refresh

---

### Solution 2: Use the Script (Easiest)

```powershell
cd frontend
.\restart-vite.ps1
npm run dev
```

Then hard refresh browser (`Ctrl+Shift+R`)

---

### Solution 3: Nuclear Option (If above don't work)

```powershell
# Stop everything
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force

# Clear ALL caches
cd frontend
Remove-Item -Path "node_modules\.vite" -Recurse -Force
Remove-Item -Path "dist" -Recurse -Force
Remove-Item -Path ".vite" -Recurse -Force -ErrorAction SilentlyContinue

# Clear browser data
# Open DevTools (F12) → Application → Clear storage → Clear site data

# Reinstall (if really stuck)
Remove-Item -Path "node_modules" -Recurse -Force
npm install

# Start fresh
npm run dev
```

---

### Solution 4: Check for File Issues

**Verify export exists:**
```powershell
cd frontend
Select-String -Pattern "export default function AdminSidebar" .\src\admin\components\AdminSidebar.jsx
```

**Should see:**
```
AdminSidebar.jsx:85:export default function AdminSidebar() {
```

**If not found**, the file is corrupted. Restore from git:
```bash
git checkout frontend/src/admin/components/AdminSidebar.jsx
```

---

## Why This Happens

### Vite HMR Cache
Vite caches compiled modules in `node_modules/.vite/` for fast reloads. When files are heavily edited (especially during our multi-file changes), the cache can become inconsistent.

### Browser Cache
Modern browsers aggressively cache ES modules. Even with dev server running, old module definitions can persist.

### Node Process
If Node crashes or is forcefully stopped, cached modules in memory aren't cleared.

---

## Prevention

### During Development
1. **After major refactors**, restart Vite:
   ```powershell
   # Stop with Ctrl+C, then:
   npm run dev
   ```

2. **If seeing weird errors**, hard refresh:
   ```
   Ctrl+Shift+R
   ```

3. **Before reporting bugs**, clear cache:
   ```powershell
   Remove-Item node_modules\.vite -Recurse -Force
   npm run dev
   ```

---

## Verification Steps

After clearing cache and restarting:

### 1. Check Dev Server Output
Should see:
```
VITE v4.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### 2. Check Browser Console
Should NOT see:
- ❌ "does not provide an export"
- ❌ "Cannot find module"
- ❌ "Unexpected token"

### 3. Check Network Tab
- Clear (no errors)
- Modules loading with 200 status
- No 404 errors

### 4. Test Navigation
- Login works
- Dashboard loads
- Sidebar visible
- Routes work

---

## Common Mistakes

### ❌ DON'T: Just refresh browser
Won't clear Vite's cache or Node's memory

### ❌ DON'T: Just restart Vite
Won't clear the cache files

### ❌ DON'T: Edit files while server is down
Start server AFTER clearing cache

### ✅ DO: Full process kill + cache clear + restart
Guaranteed fresh start

### ✅ DO: Hard refresh browser after restart
Clears browser's module cache

---

## Current Status

### File Status: ✅ CORRECT
```javascript
// AdminSidebar.jsx - Line 85
export default function AdminSidebar() {
  const { user, signOut } = useContext(AuthContext);
  const navigate = useNavigate();
  // ... rest of component
  return (
    <aside>...</aside>
  );
}
```

### Import Status: ✅ CORRECT
```javascript
// AdminDashboard.jsx - Line 4
import AdminSidebar from "../admin/components/AdminSidebar";
```

### Problem: ⚠️ CACHE
Vite has stale cached version of the module

---

## Quick Fix Command

**Copy-paste this entire block:**

```powershell
# Complete restart sequence
Write-Host "Stopping Node..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force

Write-Host "Clearing cache..." -ForegroundColor Yellow
cd frontend
Remove-Item -Path "node_modules\.vite" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "dist" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Starting Vite..." -ForegroundColor Green
npm run dev
```

Then in browser: **Ctrl+Shift+R**

---

## If Still Not Working

### Check if file is actually corrupted:
```powershell
cd frontend
Get-Content .\src\admin\components\AdminSidebar.jsx | Select-String "export default"
```

### Restore from version control:
```bash
git status  # Check if file is modified
git diff frontend/src/admin/components/AdminSidebar.jsx  # See changes
git checkout frontend/src/admin/components/AdminSidebar.jsx  # Restore
```

### Check terminal for actual errors:
Look for:
- Syntax errors
- Import errors  
- TypeScript errors
- ESLint errors

---

## Success Indicators

### ✅ Server starts without errors
```
VITE v4.x.x  ready in XXX ms
```

### ✅ No console errors
Browser console clean

### ✅ AdminSidebar loads
Sidebar visible on admin pages

### ✅ Navigation works
Can click links and navigate

---

## Summary

**Problem:** Vite HMR cache is stale  
**Solution:** Kill processes + Clear cache + Restart + Hard refresh  
**Command:** Use `restart-vite.ps1` script  
**Result:** Fresh module resolution  

**The file is correct. The cache is wrong. Clear it!** 🎯
