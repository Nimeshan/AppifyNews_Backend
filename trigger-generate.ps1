# Trigger article generation on Railway
$backendUrl = "https://appifyglobalbackend-production.up.railway.app"
$apiKey = $env:API_KEY

if (-not $apiKey) {
    Write-Host "Error: API_KEY environment variable not set"
    Write-Host "Please set it with: `$env:API_KEY = 'your-api-key'"
    exit 1
}

Write-Host "Triggering article generation..."
$response = Invoke-RestMethod -Uri "$backendUrl/api/admin/generate" `
    -Method POST `
    -Headers @{
        "x-api-key" = $apiKey
        "Content-Type" = "application/json"
    }

Write-Host "Response:"
$response | ConvertTo-Json
