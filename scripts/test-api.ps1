# Test the dashboard stats API endpoint
# First, we need to login to get the JWT token

Write-Host "Testing Music Distribution API - Dashboard Stats Endpoint" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Step 1: Login to get JWT token
$loginBody = @{
    email = "test@example.com"
    password = "testpassword123"
} | ConvertTo-Json

$loginHeaders = @{
    "Content-Type" = "application/json"
}

Write-Host "`n1. Logging in to get JWT token..." -ForegroundColor Yellow

try {
    $loginResponse = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/auth/login/" -Method Post -Body $loginBody -Headers $loginHeaders
    $accessToken = $loginResponse.access
    
    Write-Host "✓ Login successful!" -ForegroundColor Green
    Write-Host "User: $($loginResponse.user.first_name) $($loginResponse.user.last_name)" -ForegroundColor Cyan
    Write-Host "Email: $($loginResponse.user.email)" -ForegroundColor Cyan
    Write-Host "Token: $($accessToken.Substring(0, 20))..." -ForegroundColor Gray
    
    # Step 2: Test dashboard stats endpoint
    Write-Host "`n2. Testing dashboard stats endpoint..." -ForegroundColor Yellow
    
    $dashboardHeaders = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $accessToken"
    }
    
    $dashboardResponse = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/songs/stats/" -Method Get -Headers $dashboardHeaders
    
    Write-Host "✓ Dashboard stats retrieved successfully!" -ForegroundColor Green
    Write-Host "`nDashboard Data:" -ForegroundColor Cyan
    $dashboardResponse | ConvertTo-Json -Depth 4 | Write-Host
    
} catch {
    Write-Host "✗ Error occurred:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $errorContent = $reader.ReadToEnd()
        Write-Host "Error details: $errorContent" -ForegroundColor Yellow
    }
}

Write-Host "`n=============================================" -ForegroundColor Green
Write-Host "Test completed!" -ForegroundColor Green
