# Génère les documents client en .docx (Word) avec table des matières mise à jour.

$ErrorActionPreference = "Stop"
$docsDir = Split-Path -Parent $PSScriptRoot
$ref = Join-Path $docsDir "reference-livrable.docx"

if (-not (Test-Path $ref)) {
    pandoc -o $ref --print-default-data-file reference.docx
}

$files = @(
    @{ Md = "cahier-des-charges\CAHIER_DES_CHARGES_POKEMON_APP.md"; Out = "CAHIER_DES_CHARGES_POKEMON_APP.docx" },
    @{ Md = "DOCUMENTATION_FONCTIONNELLE.md"; Out = "DOCUMENTATION_FONCTIONNELLE.docx" },
    @{ Md = "DOCUMENTATION_TECHNIQUE.md"; Out = "DOCUMENTATION_TECHNIQUE.docx" },
    @{ Md = "GUIDE_UTILISATEUR.md"; Out = "GUIDE_UTILISATEUR.docx" },
    @{ Md = "LIVRAISON_CLIENT.md"; Out = "LIVRAISON_CLIENT.docx" },
    @{ Md = "LIVRABLE_ORAL_FINAL.md"; Out = "LIVRABLE_ORAL_FINAL_v12.docx" }
)

Push-Location $docsDir
try {
    foreach ($f in $files) {
        $mdPath = Join-Path $docsDir $f.Md
        $outPath = Join-Path $docsDir $f.Out
        if (-not (Test-Path $mdPath)) {
            Write-Warning "Skip: $mdPath introuvable"
            continue
        }
        $resourcePath = switch -Wildcard ($f.Md) {
            "cahier-des-charges*" { "cahier-des-charges;." }
            "DOCUMENTATION_TECHNIQUE.md" { ".;cahier-des-charges;tests;audit-css" }
            "LIVRABLE_ORAL_FINAL.md" { ".;cahier-des-charges;tests" }
            default { ".;cahier-des-charges" }
        }
        pandoc $mdPath `
            -o $outPath `
            --from gfm `
            --toc `
            --toc-depth=3 `
            --number-sections `
            --reference-doc=$ref `
            --resource-path=$resourcePath
        Write-Host "Pandoc OK: $($f.Out)"
    }
} finally {
    Pop-Location
}

# Mise à jour TOC dans Word (numéros de page corrects)
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0

foreach ($f in $files) {
    $outPath = Join-Path $docsDir $f.Out
    if (-not (Test-Path $outPath)) { continue }
    $doc = $word.Documents.Open($outPath)
    Start-Sleep -Milliseconds 800
    foreach ($toc in $doc.TablesOfContents) { $toc.Update() }
    $null = $doc.Fields.Update()
    $doc.Repaginate()
    Start-Sleep -Milliseconds 500
    foreach ($toc in $doc.TablesOfContents) { $toc.Update() }
    $doc.Save()
    $doc.Close()
    Write-Host "Word TOC OK: $($f.Out)"
}

$word.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null

Write-Host ""
Write-Host "Documents client dans: $docsDir"

$packDir = Join-Path $docsDir "PokeStore-Livraison-Client"
New-Item -ItemType Directory -Force -Path $packDir | Out-Null
Copy-Item (Join-Path $docsDir "CAHIER_DES_CHARGES_POKEMON_APP.docx") (Join-Path $packDir "01-Cahier-des-charges.docx") -Force
Copy-Item (Join-Path $docsDir "DOCUMENTATION_FONCTIONNELLE.docx") (Join-Path $packDir "02-Documentation-fonctionnelle.docx") -Force
Copy-Item (Join-Path $docsDir "DOCUMENTATION_TECHNIQUE.docx") (Join-Path $packDir "03-Documentation-technique.docx") -Force
Copy-Item (Join-Path $docsDir "GUIDE_UTILISATEUR.docx") (Join-Path $packDir "04-Guide-utilisateur.docx") -Force
Copy-Item (Join-Path $docsDir "LIVRAISON_CLIENT.docx") (Join-Path $packDir "05-Dossier-livraison.docx") -Force
Copy-Item (Join-Path $docsDir "LIVRABLE_ORAL_FINAL_v12.docx") (Join-Path $packDir "06-Synthese-projet-captures.docx") -Force
Write-Host "Pack client: $packDir"
Get-ChildItem $packDir | Format-Table Name, @{N='Mo';E={[math]::Round($_.Length/1MB,2)}}
