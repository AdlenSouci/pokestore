# Genere les 3 documents client : page de garde -> table des matieres -> contenu.

$ErrorActionPreference = "Stop"
$e = [char]0x00E9
$em = [char]0x2014
$docsDir = Split-Path -Parent $PSScriptRoot
$scriptDir = $PSScriptRoot
$luaFilter = Join-Path $scriptDir "docx-livrable.lua"
$tocVbs = Join-Path $scriptDir "update-docx-toc.vbs"
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

if (-not (Test-Path $ref)) {
    pandoc -o $ref --print-default-data-file reference.docx
}

$files = @(
    @{
        Md = "cahier-des-charges\CAHIER_DES_CHARGES_POKEMON_APP.md"
        Out = "01-Cahier-des-charges-CORRECTION.docx"
        Title = "Cahier des charges"
        Sub = "Pok${e}Store $em Besoin, p${e}rim${e}tre et fonctionnalit${e}s"
        Desc = "Version corrig${e}e $em Juin 2026"
    }
    @{
        Md = "METHODOLOGIE_UTILISATEUR.md"
        Out = "02-Guide-utilisateur-CORRECTION.docx"
        Title = "Guide utilisateur"
        Sub = "Mode d'emploi site web, application Android et admin"
        Desc = "Version corrig${e}e $em Juin 2026"
    }
    @{
        Md = "DOCUMENTATION_TECHNIQUE.md"
        Out = "03-Documentation-technique-CORRECTION.docx"
        Title = "Documentation technique"
        Sub = "Architecture, API, d${e}ploiement et tests"
        Desc = "Version corrig${e}e $em Juin 2026"
    }
)

$packDir = Join-Path $docsDir "PokeStore-Livraison-Client"
$buildDir = Join-Path $packDir "_build"
$mdBuildDir = Join-Path $buildDir "_md"
New-Item -ItemType Directory -Force -Path $buildDir, $mdBuildDir | Out-Null

function Get-CoverBlock {
    param([string]$Title, [string]$Subtitle, [string]$Desc)
    @"
::: {align=center}

![](cahier-des-charges/images/logo.png){width=3.2cm}

&nbsp;

**$Title**

*$Subtitle*

*Juin 2026 $em Projet Ynov B3 DEV*

&nbsp;

*$Desc*

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

function Strip-LeadingPreamble {
    param([string]$Body)
    $lines = $Body -split "`r?`n"
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match '^#\s+\S') {
            if ($i -eq 0) { return $Body }
            return ($lines[$i..($lines.Count - 1)] -join "`n")
        }
    }
    return $Body
}

function Get-ImageWidthCm {
    param([string]$Path)
    $p = $Path.ToLower()
    if ($p -match 'mobile|gmail|stripe') { return '3.2cm' }
    if ($p -match 'pagespeed|lighthouse|swagger|e2e-06') { return '7cm' }
    if ($p -match 'schema-architecture|schema-admin|schema-parcours|schema-paiement') { return '14cm' }
    if ($p -match 'electron|home-hero|shop|auth|jest|e2e-') { return '5.5cm' }
    return '5.5cm'
}

function Convert-CenteredImages {
    param([string]$Body)
    $lines = $Body -split "`n"
    $out = New-Object System.Collections.Generic.List[string]
    foreach ($line in $lines) {
        if ($line -match '^\!\[([^\]]*)\]\(([^)]+)\)(\{width=[^}]+\})?\s*$') {
            $alt = $Matches[1]
            $src = $Matches[2]
            $width = Get-ImageWidthCm $src
            $out.Add("")
            $out.Add("::: {align=center}")
            $out.Add("![$alt]($src){width=$width}")
            $out.Add(":::")
            $out.Add("")
        } else {
            $out.Add($line)
        }
    }
    $out -join "`n"
}

function Set-DocxUpdateFieldsOnOpen {
    param([string]$DocxPath)

    Add-Type -AssemblyName System.IO.Compression
    Add-Type -AssemblyName System.IO.Compression.FileSystem

    $tempDir = Join-Path $env:TEMP ("docx-patch-" + [guid]::NewGuid().ToString())
    $extractDir = Join-Path $tempDir "extract"
    New-Item -ItemType Directory -Path $extractDir -Force | Out-Null

    [System.IO.Compression.ZipFile]::ExtractToDirectory($DocxPath, $extractDir)

    $settingsPath = Join-Path $extractDir "word\settings.xml"
    $w = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"

    if (-not (Test-Path $settingsPath)) {
        @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:settings xmlns:w="$w"><w:updateFields w:val="true"/></w:settings>
"@ | Set-Content -Path $settingsPath -Encoding UTF8
    } else {
        [xml]$xml = Get-Content $settingsPath -Encoding UTF8
        $nsMgr = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
        $nsMgr.AddNamespace("w", $w)
        $node = $xml.SelectSingleNode("//w:updateFields", $nsMgr)
        if ($null -eq $node) {
            $el = $xml.CreateElement("w", "updateFields", $w)
            $el.SetAttribute("val", $w, "true") | Out-Null
            $xml.DocumentElement.PrependChild($el) | Out-Null
        } else {
            $node.SetAttribute("val", $w, "true") | Out-Null
        }
        $xml.Save($settingsPath)
    }

    $outTemp = Join-Path $tempDir "patched.docx"
    if (Test-Path $outTemp) { Remove-Item $outTemp -Force }
    [System.IO.Compression.ZipFile]::CreateFromDirectory($extractDir, $outTemp)
    Copy-Item $outTemp $DocxPath -Force
    Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue
}

function Update-DocxTocViaWord {
    param([string]$DocxPath)

    if (-not (Test-Path $tocVbs)) {
        Write-Warning "Script VBS TOC introuvable"
        return
    }

    if (Get-Process WINWORD -ErrorAction SilentlyContinue) {
        Write-Warning "Word est ouvert : fermez Word puis relancez le script pour calculer la table des matieres."
        return
    }

    $fullPath = (Resolve-Path -LiteralPath $DocxPath).Path
    $proc = Start-Process -FilePath "cscript.exe" `
        -ArgumentList @("//Nologo", $tocVbs, $fullPath) `
        -PassThru -Wait -WindowStyle Hidden

    if ($proc.ExitCode -ne 0) {
        Write-Warning "Echec mise a jour TOC Word pour $(Split-Path $DocxPath -Leaf)"
    } else {
        Write-Host "  TOC + numeros de page calcules"
    }
}

function Prepare-FullDocument {
    param([string]$Raw, [string]$Title, [string]$Subtitle, [string]$Desc)
    $body = Strip-YamlFrontMatter $Raw
    $body = Strip-LeadingPreamble $body
    $body = Convert-CenteredImages $body
    (Get-CoverBlock -Title $Title -Subtitle $Subtitle -Desc $Desc) + $body
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
        $full = Prepare-FullDocument -Raw $raw -Title $f.Title -Subtitle $f.Sub -Desc $f.Desc

        [System.IO.File]::WriteAllText($fullMd, $full, [System.Text.UTF8Encoding]::new($false))

        $resourcePath = switch -Wildcard ($f.Md) {
            "cahier-des-charges*" { "cahier-des-charges;.;schemas" }
            "DOCUMENTATION_TECHNIQUE.md" { ".;cahier-des-charges;tests;schemas;audit-css" }
            default { ".;cahier-des-charges;schemas" }
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
            Write-Warning "Fichier ouvert dans Word? Fermez Word puis relancez: $($f.Out)"
        }
    }
}

Write-Host ""
Write-Host "Mise a jour de la table des matieres (calcul reel via Word)..."
foreach ($f in $files) {
    $dst = Join-Path $packDir $f.Out
    if (Test-Path $dst) {
        Update-DocxTocViaWord -DocxPath $dst
    }
}

Write-Host ""
Write-Host "Pack: $packDir"
Get-ChildItem $packDir -Filter "*.docx" | Format-Table Name, @{N='Mo';E={[math]::Round($_.Length/1MB,2)}}
