# Regenere puis repasse les .docx dans Word pour garantir l'ouverture.
$ErrorActionPreference = "Stop"
$scriptDir = $PSScriptRoot
$packDir = Join-Path (Split-Path -Parent $scriptDir) "PokeStore-Livraison-Client"

Get-Process WINWORD -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

& (Join-Path $scriptDir "generate-client-docs.ps1")

$docs = @(
    "01-Cahier-des-charges.docx"
    "02-Guide-utilisateur.docx"
    "03-Documentation-technique.docx"
)

$word = New-Object -ComObject Word.Application
$word.Visible = $true
$word.DisplayAlerts = 0

foreach ($name in $docs) {
    $path = (Resolve-Path (Join-Path $packDir $name)).Path
    Write-Host "Reparation Word: $name"
    $doc = $word.Documents.Open($path, $false, $false, $false)
    $doc.Save()
    $doc.Close($false)
}

$word.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null

Write-Host "Documents repares dans: $packDir" -ForegroundColor Green
