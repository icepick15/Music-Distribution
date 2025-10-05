# COMPLETE FIX - Run this entire block

Write-Host "`n🔧 COMPLETE VITE RESTART & CACHE CLEAR" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Kill all Node processes
Write-Host "[1/5] Stopping all Node processes..." -ForegroundColor Yellow
try {
    $processes = Get-Process | Where-Object {$_.ProcessName -like "*node*"}
    if ($processes) {
        $processes | Stop-Process -Force
        Write-Host "      ✅ Stopped $($processes.Count) Node process(es)" -ForegroundColor Green
    } else {
        Write-Host "      ℹ️  No Node processes running" -ForegroundColor Cyan
    }
} catch {
    Write-Host "      ⚠️  Could not stop some processes (may need admin)" -ForegroundColor Yellow
}

Start-Sleep -Seconds 2

# Step 2: Clear Vite cache
Write-Host "`n[2/5] Clearing Vite cache..." -ForegroundColor Yellow
if (Test-Path "node_modules\.vite") {
    Remove-Item -Path "node_modules\.vite" -Recurse -Force
    Write-Host "      ✅ Vite cache cleared" -ForegroundColor Green
} else {
    Write-Host "      ℹ️  No Vite cache found" -ForegroundColor Cyan
}

# Step 3: Clear dist folder
Write-Host "`n[3/5] Clearing dist folder..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Path "dist" -Recurse -Force
    Write-Host "      ✅ Dist folder cleared" -ForegroundColor Green
} else {
    Write-Host "      ℹ️  No dist folder found" -ForegroundColor Cyan
}

# Step 4: Verify AdminSidebar export
Write-Host "`n[4/5] Verifying AdminSidebar export..." -ForegroundColor Yellow
$exportLine = Select-String -Pattern "export default function AdminSidebar" -Path "src\admin\components\AdminSidebar.jsx"
if ($exportLine) {
    Write-Host "      ✅ Export found at line $($exportLine.LineNumber)" -ForegroundColor Green
} else {
    Write-Host "      ❌ WARNING: Export not found! File may be corrupted" -ForegroundColor Red
}

# Step 5: Instructions
Write-Host "`n[5/5] Next steps:" -ForegroundColor Yellow
Write-Host "      1. Run: npm run dev" -ForegroundColor White
Write-Host "      2. Wait for server to start" -ForegroundColor White
Write-Host "      3. In browser: Ctrl+Shift+R (hard refresh)" -ForegroundColor White

Write-Host "`n✅ CACHE CLEARED! Ready to restart.`n" -ForegroundColor Green
Write-Host "Run now: " -NoNewline -ForegroundColor Cyan
Write-Host "npm run dev" -ForegroundColor White
Write-Host ""
