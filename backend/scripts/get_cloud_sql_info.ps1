# Script PowerShell pour obtenir les infos Cloud SQL

param(
    [Parameter(Mandatory=$true)]
    [string]$InstanceName,
    
    [Parameter(Mandatory=$false)]
    [string]$ProjectId
)

Write-Host "🔍 Récupération des informations Cloud SQL..." -ForegroundColor Cyan
Write-Host ""

# Si ProjectId n'est pas fourni, essayer de le récupérer
if (-not $ProjectId) {
    $ProjectId = gcloud config get-value project 2>$null
    if (-not $ProjectId) {
        Write-Host "❌ Erreur: Project ID non trouvé" -ForegroundColor Red
        Write-Host "Utilisez: .\get_cloud_sql_info.ps1 -InstanceName 'mediscan-db' -ProjectId 'votre-project-id'" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "📋 Project ID: $ProjectId" -ForegroundColor Green
Write-Host "📋 Instance: $InstanceName" -ForegroundColor Green
Write-Host ""

# Obtenir l'IP publique
Write-Host "🌐 Récupération de l'IP publique..." -ForegroundColor Cyan
$ipAddress = gcloud sql instances describe $InstanceName --format="value(ipAddresses[0].ipAddress)" 2>$null
if ($ipAddress) {
    Write-Host "✅ IP Publique: $ipAddress" -ForegroundColor Green
} else {
    Write-Host "❌ Impossible de récupérer l'IP" -ForegroundColor Red
}

Write-Host ""

# Obtenir le Connection Name
Write-Host "🔗 Récupération du Connection Name..." -ForegroundColor Cyan
$connectionName = gcloud sql instances describe $InstanceName --format="value(connectionName)" 2>$null
if ($connectionName) {
    Write-Host "✅ Connection Name: $connectionName" -ForegroundColor Green
} else {
    Write-Host "❌ Impossible de récupérer le Connection Name" -ForegroundColor Red
}

Write-Host ""

# Lister les bases de données
Write-Host "📊 Bases de données existantes:" -ForegroundColor Cyan
gcloud sql databases list --instance=$InstanceName 2>$null

Write-Host ""

# Lister les utilisateurs
Write-Host "👤 Utilisateurs existants:" -ForegroundColor Cyan
gcloud sql users list --instance=$InstanceName 2>$null

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📝 Informations à mettre dans .env:" -ForegroundColor Yellow
Write-Host ""
Write-Host "DB_HOST=$ipAddress"
Write-Host "DB_PORT=5432"
Write-Host "DB_NAME=mediscan"
Write-Host "DB_USER=mediscan_user"
Write-Host "DB_PASSWORD=[VOTRE_MOT_DE_PASSE]"
Write-Host "DB_INSTANCE_CONNECTION_NAME=$connectionName"
Write-Host "ENVIRONMENT=production"
Write-Host ""
