# Script pour mettre à jour le mot de passe dans .env

param(
    [Parameter(Mandatory=$true)]
    [string]$Password
)

$envFile = "d:\medscan\backend\.env"

if (Test-Path $envFile) {
    $content = Get-Content $envFile
    $newContent = $content | ForEach-Object {
        if ($_ -match "^DB_PASSWORD=") {
            "DB_PASSWORD=$Password"
        } else {
            $_
        }
    }
    $newContent | Set-Content $envFile
    Write-Host "✅ Mot de passe mis à jour dans .env" -ForegroundColor Green
} else {
    Write-Host "❌ Fichier .env non trouvé" -ForegroundColor Red
}
