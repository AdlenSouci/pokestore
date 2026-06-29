# Genere les 3 documents client : page de garde -> table des matieres -> contenu -> annexes.

$ErrorActionPreference = "Stop"
$e = [char]0x00E9
$em = [char]0x2014
$docsDir = Split-Path -Parent $PSScriptRoot
$luaFilter = Join-Path $PSScriptRoot "docx-livrable.lua"
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

function Get-CoverBlock {
    param([string]$Title, [string]$Subtitle)
    @"
::: {align=center}

![](cahier-des-charges/images/logo.png){width=5.5cm}

&nbsp;

**$Title**

*$Subtitle*

*Juin 2026 $em Projet Ynov B3 DEV*

:::

\pagebreak

\toc

\pagebreak

"@
}

function Strip-YamlFrontMatter {
    param([string]$Body)
    if ($Body -match '(?s)^---\r?\n.*?\r?\n---\r?\n') {
        return ($Body -replace '(?s)^---\r?\n.*?\r?\n---\r?\n', '').TrimStart()
    }
    $Body
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

function Prepare-FullDocument {
    param([string]$Raw, [string]$Title, [string]$Subtitle)
    $body = Strip-YamlFrontMatter $Raw
    $body = Convert-CenteredImages $body
    (Get-CoverBlock -Title $Title -Subtitle $Subtitle) + $body
}

Push-Location $docsDir
try {
    foreach ($f in $files) {
        $mdPath = Join-Path $docsDir $f.Md
        $outPath = Join-Path $buildDir $f.Out
        $fullMd = Join-Path $mdBuildDir ("full-" + $f.Out.Replace(".docx", ".md"))

        if (-not (Test-Path $mdPath)) {
            Write-Warning "Skip: $mdPath introuvable"
            continue
        }

        $raw = Get-Content $mdPath -Raw -Encoding UTF8
        $full = Prepare-FullDocument -Raw $raw -Title $f.Title -Subtitle $f.Sub

        [System.IO.File]::WriteAllText($fullMd, $full, [System.Text.UTF8Encoding]::new($false))

        $resourcePath = switch -Wildcard ($f.Md) {
            "cahier-des-charges*" { "cahier-des-charges;." }
            "DOCUMENTATION_TECHNIQUE.md" { ".;cahier-des-charges;tests;audit-css" }
            default { ".;cahier-des-charges" }
        }

        pandoc $fullMd `
            -o $outPath `
            --from markdown `
            --lua-filter=$luaFilter `
            -M lang=fr-FR `
            --reference-doc=$ref `
            --resource-path=$resourcePath

        if ($LASTEXITCODE -ne 0) {
            throw "Pandoc a echoue pour $($f.Out)"
        }

        $null = pandoc $outPath -t plain -o "$env:TEMP\docx-check-$($f.Out).txt" 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw "Docx invalide ($($f.Out))"
        }

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
