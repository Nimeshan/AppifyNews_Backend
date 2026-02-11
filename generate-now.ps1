# PowerShell script to generate articles on Railway
# Update the API_KEY below to match what you set in Railway

$API_KEY = "appify-secret-2024"  # CHANGE THIS to match Railway
$BASE_URL = "https://appifyglobalbackend-production.up.railway.app"

Write-Host "🚀 Generating articles on Railway..." -ForegroundColor Green
Write-Host ""

# Generate articles
Write-Host "⚙️  Triggering article generation..." -ForegroundColor Yellow
try {
    $generate = Invoke-RestMethod -Uri "$BASE_URL/api/admin/generate" `
        -Method POST `
        -Headers @{"x-api-key"=$API_KEY}
    Write-Host "✅ $($generate.message)" -ForegroundColor Green
    Write-Host ""
    Write-Host "⏳ Waiting 30 seconds for generation to complete..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
} catch {
    Write-Host "❌ Generation failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Publish articles
Write-Host "📝 Publishing articles..." -ForegroundColor Yellow
try {
    $publish = Invoke-RestMethod -Uri "$BASE_URL/api/admin/publish-all" `
        -Method POST `
        -Headers @{"x-api-key"=$API_KEY}
    Write-Host "✅ $($publish.message)" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Publishing failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Check stats
Write-Host "📊 Final stats:" -ForegroundColor Cyan
try {
    $stats = Invoke-RestMethod -Uri "$BASE_URL/api/admin/stats" `
        -Headers @{"x-api-key"=$API_KEY}
    Write-Host "   Total: $($stats.total)" -ForegroundColor White
    Write-Host "   Published: $($stats.published)" -ForegroundColor White
    Write-Host "   Pending: $($stats.pending)" -ForegroundColor White
    Write-Host ""
    Write-Host "✅ Done! Visit your frontend to see articles." -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not fetch stats" -ForegroundColor Yellow
}
