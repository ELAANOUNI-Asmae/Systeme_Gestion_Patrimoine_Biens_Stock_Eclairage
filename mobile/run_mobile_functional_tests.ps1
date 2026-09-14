param([string]$Device = "emulator-5554")
$ErrorActionPreference = "Stop"
$Mobile = Split-Path -Parent $MyInvocation.MyCommand.Path
$EnvFile = Join-Path $Mobile "integration_test\test_env.json"
if (-not (Test-Path $EnvFile)) { throw "Missing $EnvFile" }
$config = Get-Content $EnvFile -Raw | ConvertFrom-Json
$api = [string]$config.API_BASE_URL
$email = [string]$config.TEST_ADMIN_EMAIL
$password = [string]$config.TEST_ADMIN_PASSWORD
if ([string]::IsNullOrWhiteSpace($api)) { throw "API_BASE_URL is empty" }
if ([string]::IsNullOrWhiteSpace($email) -or $email -like "REMPLACER_*") { throw "TEST_ADMIN_EMAIL is not configured" }
if ([string]::IsNullOrWhiteSpace($password) -or $password -like "REMPLACER_*") { throw "TEST_ADMIN_PASSWORD is not configured" }
Write-Host "== SGPBSE Mobile Functional Tests ==" -ForegroundColor Cyan
Write-Host "Device: $Device"
Write-Host "API: $api"
Write-Host "Email: $email"
Write-Host "Password: [hidden]"
Push-Location $Mobile
try {
  $argsList = @(
    "test",
    "integration_test\sgpbse_mobile_functional_test.dart",
    "-d", $Device,
    "--dart-define=API_BASE_URL=$api",
    "--dart-define=TEST_ADMIN_EMAIL=$email",
    "--dart-define=TEST_ADMIN_PASSWORD=$password"
  )
  & flutter @argsList
  $code = $LASTEXITCODE
} finally { Pop-Location }
exit $code
