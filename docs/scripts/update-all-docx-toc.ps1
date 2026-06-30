# Calcule la table des matieres + numeros de page (Word doit etre FERME).
$ErrorActionPreference = "Stop"
$docsDir = Split-Path -Parent $PSScriptRoot
$packDir = Join-Path $docsDir "PokeStore-Livraison-Client"
$tocVbs = Join-Path $PSScriptRoot "update-docx-toc.vbs"

if (Get-Process WINWORD -ErrorAction SilentlyContinue) {
    Write-Host "FERMEZ Microsoft Word puis relancez ce script." -ForegroundColor Red
    exit 1
}

$docs = @(
    "01-Cahier-des-charges.docx"
    "02-Guide-utilisateur.docx"
    "03-Documentation-technique.docx"
)

foreach ($name in $docs) {
    $path = Join-Path $packDir $name
    if (-not (Test-Path $path)) {
        Write-Warning "Introuvable: $path"
        continue
    }
    $full = (Resolve-Path -LiteralPath $path).Path
    Write-Host "TOC: $name"
    $p = Start-Process -FilePath "cscript.exe" -ArgumentList @("//Nologo", $tocVbs, $full) -PassThru -Wait -WindowStyle Hidden
    if ($p.ExitCode -ne 0) {
        Write-Warning "Echec pour $name"
    }
}

Write-Host "Termine."
