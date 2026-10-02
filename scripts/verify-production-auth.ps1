$ErrorActionPreference = "Stop"
Write-Host "Production auth smoke checks"
$base = "https://sysstreamer.asia"
$me = Invoke-WebRequest -UseBasicParsing "$base/api/auth/me" -ErrorAction SilentlyContinue
Write-Host "GET /api/auth/me status:" $me.StatusCode
Write-Host "Expected without token: 401/403 (not a logout trigger in client)."
