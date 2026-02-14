# Script pour verifier la configuration Firebase

Write-Host "Verification de la configuration Firebase..." -ForegroundColor Cyan
Write-Host ""

$firebaseFile = "d:\medscan\backend\firebase-admin-key.json"
$envFile = "d:\medscan\backend\.env"

# Verifier si le fichier Firebase existe
if (Test-Path $firebaseFile) {
    Write-Host "Fichier Firebase trouve: $firebaseFile" -ForegroundColor Green
    
    # Lire le Project ID depuis le fichier JSON
    try {
        $firebaseJson = Get-Content $firebaseFile | ConvertFrom-Json
        $projectIdFromFile = $firebaseJson.project_id
        Write-Host "   Project ID dans le fichier: $projectIdFromFile" -ForegroundColor Yellow
    } catch {
        Write-Host "   Impossible de lire le Project ID du fichier JSON" -ForegroundColor Yellow
    }
} else {
    Write-Host "Fichier Firebase NON trouve: $firebaseFile" -ForegroundColor Red
    Write-Host ""
    Write-Host "Actions a faire:" -ForegroundColor Yellow
    Write-Host "   1. Telechargez le fichier depuis Firebase Console"
    Write-Host "   2. Placez-le dans: $firebaseFile"
    Write-Host ""
}

# Verifier la configuration dans .env
if (Test-Path $envFile) {
    Write-Host ""
    Write-Host "Configuration dans .env:" -ForegroundColor Cyan
    
    $envContent = Get-Content $envFile
    $firebaseProjectId = ($envContent | Where-Object { $_ -match "^FIREBASE_PROJECT_ID=" }) -replace "FIREBASE_PROJECT_ID=", ""
    $firebaseCredentialsPath = ($envContent | Where-Object { $_ -match "^FIREBASE_CREDENTIALS_PATH=" }) -replace "FIREBASE_CREDENTIALS_PATH=", ""
    
    if ($firebaseProjectId) {
        $color = if ($firebaseProjectId -ne "your-firebase-project") { "Green" } else { "Red" }
        Write-Host "   FIREBASE_PROJECT_ID: $firebaseProjectId" -ForegroundColor $color
        if ($firebaseProjectId -eq "your-firebase-project") {
            Write-Host "   Remplacez 'your-firebase-project' par votre vrai Project ID!" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   FIREBASE_PROJECT_ID non trouve dans .env" -ForegroundColor Red
    }
    
    if ($firebaseCredentialsPath) {
        Write-Host "   FIREBASE_CREDENTIALS_PATH: $firebaseCredentialsPath" -ForegroundColor Green
    } else {
        Write-Host "   FIREBASE_CREDENTIALS_PATH non defini (ajoutez: FIREBASE_CREDENTIALS_PATH=./firebase-admin-key.json)" -ForegroundColor Yellow
    }
    
    # Verifier la correspondance
    if ($projectIdFromFile -and $firebaseProjectId) {
        if ($projectIdFromFile -eq $firebaseProjectId) {
            Write-Host ""
            Write-Host "Les Project ID correspondent!" -ForegroundColor Green
        } else {
            Write-Host ""
            Write-Host "ATTENTION: Les Project ID ne correspondent pas!" -ForegroundColor Red
            Write-Host "   Fichier JSON: $projectIdFromFile"
            Write-Host "   .env: $firebaseProjectId"
        }
    }
} else {
    Write-Host "Fichier .env non trouve" -ForegroundColor Red
}

Write-Host ""
Write-Host "Prochaines etapes:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Telechargez le fichier depuis Firebase Console:"
Write-Host "   https://console.firebase.google.com/"
Write-Host "   -> Parametres du projet -> Comptes de service"
Write-Host "   -> Generer une nouvelle cle privee"
Write-Host ""
Write-Host "2. Placez le fichier dans:"
Write-Host "   $firebaseFile"
Write-Host ""
Write-Host "3. Mettez a jour .env avec votre Project ID"
Write-Host ""
