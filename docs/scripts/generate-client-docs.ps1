# Genere les 3 documents client : Markdown -> Word via Pandoc uniquement (pas de Word COM).

$ErrorActionPreference = "Stop"
$e = [char]0x00E9
$em = [char]0x2014
$docsDir = Split-Path -Parent $PSScriptRoot
$ref = Join-Path $docsDir "reference-livrable.docx"
$logoPath = Join-Path $docsDir "cahier-des-charges\images\logo.png"
$assetsSrc = Join-Path (Split-Path -Parent $docsDir) "frontend\src\assets"
$imgDir = Join-Path $docsDir "cahier-des-charges\images"

if (Test-Path "$assetsSrc\logo.png") {
    Copy-Item "$assetsSrc\logo.png" $logoPath -Force
}
$mobileMap = @{
    "capture-mobile-home.jpg"   = "photomobile\Screenshot_20260628_125450_PokStore.jpg"
    "capture-mobile-shop.jpg"   = "photomobile\Screenshot_20260628_125454_PokStore.jpg"
    "capture-mobile-card.jpg"   = "photomobile\Screenshot_20260628_125503_PokStore.jpg"
    "capture-mobile-stripe.jpg" = "photomobile\Screenshot_20260628_125530_Chrome.jpg"
}
foreach ($dst in $mobileMap.Keys) {
    $src = Join-Path $assetsSrc $mobileMap[$dst]
    if (Test-Path $src) {
        Copy-Item $src (Join-Path $imgDir $dst) -Force
    }
}
if (Test-Path "$assetsSrc\gmail.jpg") {
    Copy-Item "$assetsSrc\gmail.jpg" (Join-Path $imgDir "gmail.jpg") -Force
}

if (-not (Test-Path $ref)) {
    pandoc -o $ref --print-default-data-file reference.docx
}

$files = @(
    @{ Md = "cahier-des-charges\CAHIER_DES_CHARGES_POKEMON_APP.md"; Out = "01-Cahier-des-charges.docx"; Title = "Cahier des charges"; Sub = "Pok${e}Store $em Sp${e}cifications des 3 applications" }
    @{ Md = "METHODOLOGIE_UTILISATEUR.md"; Out = "02-Methodologie-utilisateur.docx"; Title = "M${e}thodologie utilisateur"; Sub = "Parcours web, mobile et admin" }
    @{ Md = "DOCUMENTATION_TECHNIQUE.md"; Out = "03-Documentation-technique.docx"; Title = "Documentation technique"; Sub = "Architecture, API, d${e}ploiement" }
)

$packDir = Join-Path $docsDir "PokeStore-Livraison-Client"
$buildDir = Join-Path $packDir "_build"
$mdBuildDir = Join-Path $buildDir "_md"
New-Item -ItemType Directory -Force -Path $buildDir, $mdBuildDir | Out-Null

function Get-CoverPage {
    param([string]$Title, [string]$Subtitle)
    $spacer = @'
```{=openxml}
<w:p><w:pPr><w:spacing w:before="2880"/></w:pPr></w:p>
```
'@
    $line1 = "::: {align=center}"
    $line2 = "![](cahier-des-charges/images/logo.png){width=4.5cm}"
    $line3 = ""
    $line4 = "**$Title**"
    $line5 = ""
    $line6 = "*$Subtitle*"
    $line7 = ""
    $line8 = "*Juin 2026 $em Projet Ynov B3 DEV*"
    $line9 = ":::"
    $line10 = ""
    $line11 = '```{=openxml}'
    $line12 = '<w:p><w:r><w:br w:type="page"/></w:r></w:p>'
    $line13 = '```'
    ($spacer, $line1, $line2, $line3, $line4, $line5, $line6, $line7, $line8, $line9, $line10, $line11, $line12, $line13) -join "`n"
}

function Convert-CenteredImages {
    param([string]$Body)
    $lines = $Body -split "`n"
    $out = New-Object System.Collections.Generic.List[string]
    foreach ($line in $lines) {
        if ($line -match '^\!\[([^\]]*)\]\(([^)]+)\)\s*$') {
            $out.Add("::: {align=center}")
            $out.Add("![$($Matches[1])]($($Matches[2])){width=14cm}")
            $out.Add(":::")
            $out.Add("")
        } else {
            $out.Add($line)
        }
    }
    $out -join "`n"
}

Push-Location $docsDir
try {
    foreach ($f in $files) {
        $mdPath = Join-Path $docsDir $f.Md
        $outPath = Join-Path $buildDir $f.Out
        $combinedMd = Join-Path $mdBuildDir $f.Out.Replace(".docx", ".md")

        if (-not (Test-Path $mdPath)) {
            Write-Warning "Skip: $mdPath introuvable"
            continue
        }

        $body = Get-Content $mdPath -Raw -Encoding UTF8
        $body = Convert-CenteredImages $body
        $cover = Get-CoverPage -Title $f.Title -Subtitle $f.Sub
        $full = $cover + "`n`n" + $body
        [System.IO.File]::WriteAllText($combinedMd, $full, [System.Text.UTF8Encoding]::new($false))

        $resourcePath = switch -Wildcard ($f.Md) {
            "cahier-des-charges*" { "cahier-des-charges;." }
            "DOCUMENTATION_TECHNIQUE.md" { ".;cahier-des-charges;tests;audit-css" }
            default { ".;cahier-des-charges" }
        }

        pandoc $combinedMd `
            -o $outPath `
            --from markdown `
            --toc `
            --toc-depth=2 `
            --reference-doc=$ref `
            --resource-path=$resourcePath

        Write-Host "OK: $($f.Out)"
    }
} finally {
    Pop-Location
}

foreach ($f in $files) {
    $src = Join-Path $buildDir $f.Out
    $dst = Join-Path $packDir $f.Out
    if (Test-Path $src) {
        try {
            Copy-Item $src $dst -Force
        } catch {
            Write-Warning "Fichier ouvert dans Word? Copie manuelle: $($f.Out)"
        }
    }
}

Write-Host ""
Write-Host "Pack: $packDir"
Get-ChildItem $packDir -Filter "*.docx" | Format-Table Name, @{N='Mo';E={[math]::Round($_.Length/1MB,2)}}
