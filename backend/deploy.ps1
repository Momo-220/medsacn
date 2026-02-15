# Deploy MediScan Backend sur Google Cloud Run
# Pre-requis: gcloud CLI installé et connecté (gcloud auth login)

param(
    [string]$ProjectId = "medscan-projet",
    [string]$Region = "us-central1",
    [switch]$BuildOnly
)

$ErrorActionPreference = "Stop"
$BackendDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "=== MediScan Backend - Deploy Cloud Run ===" -ForegroundColor Cyan
Write-Host "Project: $ProjectId | Region: $Region`n" -ForegroundColor Gray

# 1. Configurer le projet
Write-Host "[1/4] Configuration projet..." -ForegroundColor Yellow
gcloud config set project $ProjectId

# 2. Activer les APIs + config Docker GCR
Write-Host "[2/4] APIs et Docker GCR..." -ForegroundColor Yellow
gcloud services enable run.googleapis.com containerregistry.googleapis.com cloudbuild.googleapis.com sqladmin.googleapis.com --quiet
$prevEA = $ErrorActionPreference; $ErrorActionPreference = "SilentlyContinue"; gcloud auth configure-docker gcr.io --quiet 2>$null; $ErrorActionPreference = $prevEA

# 3. Build de l'image
Write-Host "[3/4] Build Docker..." -ForegroundColor Yellow
Push-Location $BackendDir
docker build -t gcr.io/$ProjectId/mediscan-api:latest .
if ($LASTEXITCODE -ne 0) { Pop-Location; exit 1 }
Pop-Location

if ($BuildOnly) {
    Write-Host "Build OK. Push manuel: docker push gcr.io/$ProjectId/mediscan-api:latest" -ForegroundColor Green
    exit 0
}

# 4. Push et Deploy
Write-Host "[4/4] Push et Deploy Cloud Run..." -ForegroundColor Yellow
docker push gcr.io/$ProjectId/mediscan-api:latest

# Definir les secrets avant de lancer (sinon config via console Cloud Run apres):
# $env:DB_PASSWORD="ton-mdp"; $env:GEMINI_API_KEY="ta-cle"; $env:JWT_SECRET_KEY="cle-forte"; $env:ADMIN_PASSWORD="mdp-dashboard"
if (-not $env:DB_PASSWORD) { Write-Host "ATTENTION: DB_PASSWORD non defini. Le service demarrera mais la DB echouera." -ForegroundColor Red }
if (-not $env:GEMINI_API_KEY) { Write-Host "ATTENTION: GEMINI_API_KEY non defini." -ForegroundColor Red }

# Fichier YAML pour eviter problemes de virgules (CORS_ORIGINS)
$envYaml = @"
ENVIRONMENT: production
DEBUG: "false"
GOOGLE_CLOUD_PROJECT: $ProjectId
GCS_BUCKET_NAME: mediscan-uploads
FIREBASE_PROJECT_ID: medscan-915d3
DB_INSTANCE_CONNECTION_NAME: "medscan-projet:us-central1:medscan"
DB_PORT: "5432"
DB_NAME: mediscan
DB_USER: medscan_user
DB_PASSWORD: $(if ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { "PLACEHOLDER" })
GEMINI_API_KEY: $(if ($env:GEMINI_API_KEY) { $env:GEMINI_API_KEY } else { "PLACEHOLDER" })
GEMINI_MODEL_VISION: gemini-2.5-flash
GEMINI_MODEL_CHAT: gemini-2.5-flash
JWT_SECRET_KEY: $(if ($env:JWT_SECRET_KEY) { $env:JWT_SECRET_KEY } else { "CHANGE-MOI-" + [guid]::NewGuid().ToString("N").Substring(0,24) })
ADMIN_EMAIL: seinimomo1@gmail.com
ADMIN_PASSWORD: $(if ($env:ADMIN_PASSWORD) { $env:ADMIN_PASSWORD } else { "PLACEHOLDER" })
CORS_ORIGINS: "https://mediscan.app,https://www.mediscan.app,https://medscan-eight.vercel.app,http://localhost:3002"
"@
$envFile = Join-Path $env:TEMP "mediscan-env.yaml"
$envYaml | Out-File -FilePath $envFile -Encoding utf8

# Cloud SQL: medscan-projet:us-central1:medscan
# Memory 1Gi pour scan caméra (images + Gemini)
gcloud run deploy mediscan-api `
    --image gcr.io/$ProjectId/mediscan-api:latest `
    --region $Region `
    --platform managed `
    --memory 1Gi `
    --allow-unauthenticated `
    --add-cloudsql-instances "medscan-projet:us-central1:medscan" `
    --env-vars-file $envFile

Remove-Item $envFile -ErrorAction SilentlyContinue

# Si PLACEHOLDER utilise dans la console Cloud Run :
# - GEMINI_API_KEY
# - DB_PASSWORD
# - JWT_SECRET_KEY
# - ADMIN_PASSWORD

Write-Host "`n=== DEPLOI TERMINE ===" -ForegroundColor Green
Write-Host "Configure les secrets dans la console Cloud Run :" -ForegroundColor Yellow
Write-Host "  GEMINI_API_KEY, DB_PASSWORD, JWT_SECRET_KEY, ADMIN_PASSWORD"
Write-Host "`nURL du service : " -NoNewline
gcloud run services describe mediscan-api --region $Region --format="value(status.url)"
