# Génère les 3 documents client en .docx (sans numérotation 1.2.4 automatique).

$ErrorActionPreference = "Stop"
$docsDir = Split-Path -Parent $PSScriptRoot
$ref = Join-Path $docsDir "reference-livrable.docx"

if (-not (Test-Path $ref)) {
    pandoc -o $ref --print-default-data-file reference.docx
}

$files = @(
    @{ Md = "cahier-des-charges\CAHIER_DES_CHARGES_POKEMON_APP.md"; Out = "01-Cahier-des-charges.docx" },
    @{ Md = "METHODOLOGIE_UTILISATEUR.md"; Out = "02-Methodologie-utilisateur.docx" },
    @{ Md = "DOCUMENTATION_TECHNIQUE.md"; Out = "03-Documentation-technique.docx" }
)

$packDir = Join-Path $docsDir "PokeStore-Livraison-Client"
$buildDir = Join-Path $packDir "_build"
New-Item -ItemType Directory -Force -Path $buildDir | Out-Null

Push-Location $docsDir
try {
    foreach ($f in $files) {
        $mdPath = Join-Path $docsDir $f.Md
        $outPath = Join-Path $buildDir $f.Out
        if (-not (Test-Path $mdPath)) {
            Write-Warning "Skip: $mdPath introuvable"
            continue
        }
        $resourcePath = switch -Wildcard ($f.Md) {
            "cahier-des-charges*" { "cahier-des-charges;." }
            "DOCUMENTATION_TECHNIQUE.md" { ".;cahier-des-charges;tests;audit-css" }
            default { ".;cahier-des-charges" }
        }
        pandoc $mdPath `
            -o $outPath `
            --from gfm `
            --toc `
            --toc-depth=2 `
            --reference-doc=$ref `
            --resource-path=$resourcePath
        Write-Host "Pandoc OK: $($f.Out)"
    }
} finally {
    Pop-Location
}

# Mise à jour TOC dans Word
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0

foreach ($f in $files) {
    $outPath = Join-Path $buildDir $f.Out
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

foreach ($f in $files) {
    $src = Join-Path $buildDir $f.Out
    $dst = Join-Path $packDir $f.Out
    if (Test-Path $src) {
        try {
            Copy-Item $src $dst -Force
            Write-Host "Copie OK: $($f.Out)"
        } catch {
            Write-Warning "Copie impossible (fichier ouvert?): $($f.Out) — voir docs/PokeStore-Livraison-Client/_build/"
        }
    }
}

Write-Host ""
Write-Host "Pack client (3 documents): $packDir"
Get-ChildItem $packDir -Filter "*.docx" | Format-Table Name, @{N='Mo';E={[math]::Round($_.Length/1MB,2)}}
