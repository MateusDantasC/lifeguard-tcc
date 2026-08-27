$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$credentialsFile = Join-Path $projectRoot "credentials.json"
$outputDirectory = Join-Path $projectRoot "dist"
$outputApk = Join-Path $outputDirectory "lifeguard.apk"
$androidStudioJdk = "C:\Program Files\Android\Android Studio\jbr"
$defaultAndroidSdk = Join-Path $env:LOCALAPPDATA "Android\Sdk"

if (-not (Test-Path $credentialsFile)) {
    throw "credentials.json nao encontrado. Baixe a chave existente com: npx eas-cli credentials -p android"
}

$credentials = Get-Content $credentialsFile -Raw | ConvertFrom-Json
$keystore = $credentials.android.keystore
$keystorePath = Join-Path $projectRoot $keystore.keystorePath

if (-not (Test-Path $keystorePath)) {
    throw "Chave Android nao encontrada em $keystorePath"
}

if (Test-Path $androidStudioJdk) {
    $env:JAVA_HOME = $androidStudioJdk
}

if (-not $env:JAVA_HOME -or -not (Test-Path (Join-Path $env:JAVA_HOME "bin\java.exe"))) {
    throw "JDK 17 ou superior nao encontrado. Conclua a instalacao do Android Studio."
}

if (-not $env:ANDROID_HOME) {
    $env:ANDROID_HOME = $defaultAndroidSdk
}
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME

if (-not (Test-Path $env:ANDROID_HOME)) {
    throw "Android SDK nao encontrado. Abra o Android Studio uma vez e conclua o Setup Wizard."
}

$env:Path = "$(Join-Path $env:JAVA_HOME 'bin');$(Join-Path $env:ANDROID_HOME 'platform-tools');$env:Path"

Push-Location $projectRoot
try {
    & npx.cmd expo prebuild --platform android --clean --no-install
    if ($LASTEXITCODE -ne 0) { throw "Falha ao gerar o projeto Android." }

    $sdkPath = $env:ANDROID_HOME.Replace("\", "/")
    Set-Content -Path "android/local.properties" -Value "sdk.dir=$sdkPath" -Encoding utf8

    $gradleProperties = "android/gradle.properties"
    Add-Content -Path $gradleProperties -Encoding utf8 -Value @"

LIFEGUARD_UPLOAD_STORE_FILE=$($keystorePath.Replace('\', '/'))
LIFEGUARD_UPLOAD_STORE_PASSWORD=$($keystore.keystorePassword)
LIFEGUARD_UPLOAD_KEY_ALIAS=$($keystore.keyAlias)
LIFEGUARD_UPLOAD_KEY_PASSWORD=$($keystore.keyPassword)
"@

    $buildGradlePath = "android/app/build.gradle"
    $buildGradle = Get-Content $buildGradlePath -Raw
    $debugSigningBlock = @"
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
"@
    $releaseSigningBlock = @"
$debugSigningBlock
        release {
            storeFile file(LIFEGUARD_UPLOAD_STORE_FILE)
            storePassword LIFEGUARD_UPLOAD_STORE_PASSWORD
            keyAlias LIFEGUARD_UPLOAD_KEY_ALIAS
            keyPassword LIFEGUARD_UPLOAD_KEY_PASSWORD
        }
"@

    if (-not $buildGradle.Contains($debugSigningBlock)) {
        throw "Estrutura de assinatura do Gradle mudou; build interrompida para proteger a chave."
    }

    $buildGradle = $buildGradle.Replace($debugSigningBlock, $releaseSigningBlock)
    $buildGradle = $buildGradle.Replace("signingConfig signingConfigs.debug`r`n            def enableShrinkResources", "signingConfig signingConfigs.release`r`n            def enableShrinkResources")
    $buildGradle = $buildGradle.Replace("signingConfig signingConfigs.debug`n            def enableShrinkResources", "signingConfig signingConfigs.release`n            def enableShrinkResources")
    Set-Content -Path $buildGradlePath -Value $buildGradle -Encoding utf8

    Push-Location "android"
    try {
        & .\gradlew.bat app:assembleRelease
        if ($LASTEXITCODE -ne 0) { throw "Falha ao compilar o APK." }
    }
    finally {
        Pop-Location
    }

    New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null
    Copy-Item "android/app/build/outputs/apk/release/app-release.apk" $outputApk -Force
    $hash = (Get-FileHash $outputApk -Algorithm SHA256).Hash.ToLowerInvariant()
    Set-Content -Path "$outputApk.sha256" -Value "$hash  lifeguard.apk" -Encoding ascii

    Write-Host ""
    Write-Host "APK pronto: $outputApk" -ForegroundColor Green
    Write-Host "SHA-256: $hash"
}
finally {
    Pop-Location
}
