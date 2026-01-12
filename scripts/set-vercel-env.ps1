# PowerShell script to push .env variables to Vercel
# Usage:
# 1) Install Vercel CLI: npm i -g vercel
# 2) Login: vercel login
# 3) Run this script from repo root: pwsh ./scripts/set-vercel-env.ps1

$envFile = Join-Path (Get-Location) '.env'
if (-not (Test-Path $envFile)) {
    Write-Error ".env file not found at $envFile"
    exit 1
}

# Check for vercel
if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "Vercel CLI not found. Install with: npm i -g vercel" -ForegroundColor Yellow
    exit 1
}

Write-Host "Reading .env and adding variables to Vercel (Production)." -ForegroundColor Cyan
Write-Host "Make sure you're logged in: vercel login" -ForegroundColor Cyan

Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if ([string]::IsNullOrWhiteSpace($line) -or $line.StartsWith('#')) { return }
    if ($line -notmatch '=') { return }
    $pair = $line -split '=',2
    $key = $pair[0].Trim()
    $value = $pair[1]
    if ([string]::IsNullOrWhiteSpace($key)) { return }

    Write-Host "Adding $key to Vercel (Production)..." -NoNewline
    # Add to Production; if the variable exists, this will create a new one (Vercel CLI may prompt)
    & vercel env add $key $value production --yes
    if ($LASTEXITCODE -ne 0) {
        Write-Host " failed" -ForegroundColor Red
        Write-Host "You may need to run the command interactively or add variables from the Vercel dashboard." -ForegroundColor Yellow
    } else {
        Write-Host " done" -ForegroundColor Green
    }
}

Write-Host "Done. Consider also adding same vars to Preview or Development scopes if needed." -ForegroundColor Cyan
