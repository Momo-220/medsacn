# Script pour appliquer les migrations Alembic sur Cloud SQL

Write-Host "🚀 Application des migrations Alembic..." -ForegroundColor Cyan
Write-Host ""

# Charger les variables depuis .env
$envContent = Get-Content "d:\medscan\backend\.env" | Where-Object { $_ -match "^DB_|^ENVIRONMENT=" }
$dbHost = ($envContent | Where-Object { $_ -match "^DB_HOST=" }) -replace "DB_HOST=", ""
$dbPort = ($envContent | Where-Object { $_ -match "^DB_PORT=" }) -replace "DB_PORT=", ""
$dbName = ($envContent | Where-Object { $_ -match "^DB_NAME=" }) -replace "DB_NAME=", ""
$dbUser = ($envContent | Where-Object { $_ -match "^DB_USER=" }) -replace "DB_USER=", ""
$dbPassword = ($envContent | Where-Object { $_ -match "^DB_PASSWORD=" }) -replace "DB_PASSWORD=", ""
$environment = ($envContent | Where-Object { $_ -match "^ENVIRONMENT=" }) -replace "ENVIRONMENT=", ""

# Construire la DATABASE_URL
$databaseUrl = "postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}"

Write-Host "📋 Configuration:" -ForegroundColor Yellow
Write-Host "  Database URL: postgresql://${dbUser}:***@${dbHost}:${dbPort}/${dbName}"
Write-Host ""

# Définir les variables d'environnement
$env:DATABASE_URL = $databaseUrl
$env:ENVIRONMENT = if ($environment) { $environment } else { "production" }

Write-Host "🔄 Application des migrations..." -ForegroundColor Cyan
Write-Host ""

cd d:\medscan\backend
alembic upgrade head

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Migrations appliquées avec succès!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Vérification des tables créées:" -ForegroundColor Cyan
    $env:PGPASSWORD = $dbPassword
    psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -c "\dt" 2>&1
} else {
    Write-Host ""
    Write-Host "❌ Erreur lors de l'application des migrations" -ForegroundColor Red
}
