# Clear Vite Cache and Restart

Write-Host "🧹 Clearing Vite cache..." -ForegroundColor Yellow

# Check if .vite folder exists
$vitePath = "node_modules\.vite"
if (Test-Path $vitePath) {
    Remove-Item -Path $vitePath -Recurse -Force
    Write-Host "✅ Vite cache cleared!" -ForegroundColor Green
} else {
    Write-Host "ℹ️  No Vite cache found (already clean)" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "📦 Now restart your dev server:" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Or force clear on restart:" -ForegroundColor Cyan
Write-Host "   npm run dev -- --force" -ForegroundColor White
