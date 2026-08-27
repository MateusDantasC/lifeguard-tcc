$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$appConfig = Get-Content (Join-Path $projectRoot "app.json") -Raw | ConvertFrom-Json
$version = $appConfig.expo.version
$tag = "v$version"
$apkPath = Join-Path $projectRoot "dist\lifeguard.apk"
$repository = "MateusDantasC/lifeguard-tcc"
$portableGh = Join-Path $projectRoot ".tools\bin\gh.exe"

if (-not (Test-Path $apkPath)) {
    throw "APK nao encontrado. Execute npm run apk:local primeiro."
}

$ghCommand = Get-Command gh -ErrorAction SilentlyContinue
if ($ghCommand) {
    $gh = $ghCommand.Source
}
elseif (Test-Path $portableGh) {
    $gh = $portableGh
}
else {
    throw "GitHub CLI nao encontrado. Instale-o em https://cli.github.com/"
}

& $gh auth status | Out-Null
if ($LASTEXITCODE -ne 0) {
    throw "GitHub nao autenticado. Execute: gh auth login"
}

& $gh release view $tag --repo $repository | Out-Null
if ($LASTEXITCODE -eq 0) {
    & $gh release upload $tag $apkPath --repo $repository --clobber
}
else {
    & $gh release create $tag $apkPath --repo $repository --title "LifeGuard $version" --generate-notes --latest
}

if ($LASTEXITCODE -ne 0) {
    throw "Falha ao publicar o APK no GitHub Releases."
}

Write-Host "APK publicado:" -ForegroundColor Green
Write-Host "https://github.com/$repository/releases/latest/download/lifeguard.apk"
