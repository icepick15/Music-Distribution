# Complete Vite Restart Script
# Fixes module caching issues

Write-Host "🔄 Complete Vite Reset" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Kill any running node/vite processes
Write-Host "1️⃣  Stopping all Node processes..." -ForegroundColor Yellow
try {
    Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "   ✅ Node processes stopped" -ForegroundColor Green
} catch {
    Write-Host "   ℹ️  No Node processes running" -ForegroundColor Cyan
}

Start-Sleep -Seconds 1

# Step 2: Clear Vite cache
Write-Host ""
Write-Host "2️⃣  Clearing Vite cache..." -ForegroundColor Yellow
$vitePath = "node_modules\.vite"
if (Test-Path $vitePath) {
    Remove-Item -Path $vitePath -Recurse -Force
    Write-Host "   ✅ Vite cache cleared!" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  No Vite cache found" -ForegroundColor Cyan
}

# Step 3: Clear dist folder
Write-Host ""
Write-Host "3️⃣  Clearing dist folder..." -ForegroundColor Yellow
$distPath = "dist"
if (Test-Path $distPath) {
    Remove-Item -Path $distPath -Recurse -Force
    Write-Host "   ✅ Dist folder cleared!" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  No dist folder found" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "✅ Complete! Now restart:" -ForegroundColor Green
Write-Host ""
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "💡 Also do a hard refresh in browser:" -ForegroundColor Cyan
Write-Host "   Ctrl+Shift+R (Windows/Linux)" -ForegroundColor White
Write-Host "   Cmd+Shift+R (Mac)" -ForegroundColor White
Write-Host ""
