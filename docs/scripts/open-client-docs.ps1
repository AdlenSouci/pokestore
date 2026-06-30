# Ouvre les 3 livrables Word (ferme les instances Word bloquees avant).
$ErrorActionPreference = "Stop"
$packDir = Join-Path (Split-Path -Parent $PSScriptRoot) "PokeStore-Livraison-Client"

$docs = @(
    "01-Cahier-des-charges.docx"
    "02-Guide-utilisateur.docx"
    "03-Documentation-technique.docx"
)

$running = Get-Process WINWORD -ErrorAction SilentlyContinue
if ($running) {
    Write-Host "Fermeture de $($running.Count) processus Word bloque(s)..." -ForegroundColor Yellow
    $running | Stop-Process -Force
    Start-Sleep -Seconds 2
}

foreach ($name in $docs) {
    $path = Join-Path $packDir $name
    if (-not (Test-Path $path)) {
        Write-Warning "Introuvable: $path"
        continue
    }
    Write-Host "Ouverture: $name"
    Start-Process -FilePath $path
    Start-Sleep -Milliseconds 800
}

Write-Host "Termine. Dossier: $packDir"
