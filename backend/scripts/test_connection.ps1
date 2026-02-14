# Script pour tester la connexion à Cloud SQL

Write-Host "🔍 Test de connexion à Cloud SQL..." -ForegroundColor Cyan
Write-Host ""

# Charger les variables depuis .env
$envContent = Get-Content "d:\medscan\backend\.env" | Where-Object { $_ -match "^DB_" }
$dbHost = ($envContent | Where-Object { $_ -match "^DB_HOST=" }) -replace "DB_HOST=", ""
$dbPort = ($envContent | Where-Object { $_ -match "^DB_PORT=" }) -replace "DB_PORT=", ""
$dbName = ($envContent | Where-Object { $_ -match "^DB_NAME=" }) -replace "DB_NAME=", ""
$dbUser = ($envContent | Where-Object { $_ -match "^DB_USER=" }) -replace "DB_USER=", ""
$dbPassword = ($envContent | Where-Object { $_ -match "^DB_PASSWORD=" }) -replace "DB_PASSWORD=", ""

Write-Host "📋 Configuration:" -ForegroundColor Yellow
Write-Host "  Host: $dbHost"
Write-Host "  Port: $dbPort"
Write-Host "  Database: $dbName"
Write-Host "  User: $dbUser"
Write-Host ""

# Vérifier si psql est installé
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlPath) {
    Write-Host "❌ psql n'est pas installé" -ForegroundColor Red
    Write-Host "📥 Téléchargez PostgreSQL depuis: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Ou testez avec Python:" -ForegroundColor Yellow
    Write-Host "python -c \"import psycopg2; conn = psycopg2.connect(host='$dbHost', port=$dbPort, database='$dbName', user='$dbUser', password='$dbPassword'); print('Connexion reussie!'); conn.close()\""
    exit 1
}

Write-Host "🧪 Test de connexion avec psql..." -ForegroundColor Cyan
Write-Host ""

# Tester la connexion
$env:PGPASSWORD = $dbPassword
$result = psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -c "\conninfo" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Connexion réussie!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Vérification des tables..." -ForegroundColor Cyan
    psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -c "\dt" 2>&1
    Write-Host ""
    Write-Host "✅ Tout est prêt pour appliquer les migrations!" -ForegroundColor Green
} else {
    Write-Host "❌ Échec de la connexion" -ForegroundColor Red
    Write-Host $result
    Write-Host ""
    Write-Host "🔍 Vérifications:" -ForegroundColor Yellow
    Write-Host "  1. Votre IP est-elle autorisée et ENREGISTRÉE?"
    Write-Host "  2. Le mot de passe est-il correct?"
    Write-Host "  3. La base de donnees existe-t-elle?"
}
