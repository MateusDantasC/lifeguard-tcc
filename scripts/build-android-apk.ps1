$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$credentialsFile = Join-Path $projectRoot "credentials.json"
$outputDirectory = Join-Path $projectRoot "dist"
$outputApk = Join-Path $outputDirectory "lifeguard.apk"
$packageJsonPath = Join-Path $projectRoot "package.json"
$androidStudioJdk = "C:\Program Files\Android\Android Studio\jbr"
$projectAndroidSdk = Join-Path $projectRoot ".tools\android-sdk"
$userGradleHome = Join-Path $env:USERPROFILE ".gradle"
$userAndroidHome = Join-Path $env:USERPROFILE ".android"
$defaultAndroidSdk = Join-Path $env:LOCALAPPDATA "Android\Sdk"
$utf8WithoutBom = New-Object System.Text.UTF8Encoding($false)

if (-not (Test-Path $credentialsFile)) {
    throw "credentials.json nao encontrado. Baixe a chave existente com: npx eas-cli credentials -p android"
}

$credentials = Get-Content $credentialsFile -Raw | ConvertFrom-Json
$keystore = $credentials.android.keystore
$keystorePath = Join-Path $projectRoot $keystore.keystorePath

if (-not (Test-Path $keystorePath)) {
    throw "Chave Android nao encontrada em $keystorePath"
}

$jdk17 = Get-ChildItem "C:\Program Files\Microsoft" -Directory -Filter "jdk-17*" -ErrorAction SilentlyContinue |
    Sort-Object Name -Descending |
    Select-Object -First 1

if ($jdk17 -and (Test-Path (Join-Path $jdk17.FullName "bin\java.exe"))) {
    $env:JAVA_HOME = $jdk17.FullName
}
elseif (Test-Path $androidStudioJdk) {
    $env:JAVA_HOME = $androidStudioJdk
}

if (-not $env:JAVA_HOME -or -not (Test-Path (Join-Path $env:JAVA_HOME "bin\java.exe"))) {
    throw "JDK 17 ou superior nao encontrado. Conclua a instalacao do Android Studio."
}

if (Test-Path $projectAndroidSdk) {
    $env:ANDROID_HOME = $projectAndroidSdk
}
elseif (-not $env:ANDROID_HOME) {
    $env:ANDROID_HOME = $defaultAndroidSdk
}
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
$env:GRADLE_USER_HOME = $userGradleHome
$env:ANDROID_USER_HOME = $userAndroidHome
$env:NODE_ENV = "production"

New-Item -ItemType Directory -Force -Path $userGradleHome | Out-Null
New-Item -ItemType Directory -Force -Path $userAndroidHome | Out-Null

if (-not (Test-Path $env:ANDROID_HOME)) {
    throw "Android SDK nao encontrado. Abra o Android Studio uma vez e conclua o Setup Wizard."
}

$env:Path = "$(Join-Path $env:JAVA_HOME 'bin');$(Join-Path $env:ANDROID_HOME 'platform-tools');$env:Path"
$packageJsonBeforePrebuild = Get-Content $packageJsonPath -Raw

Push-Location $projectRoot
try {
    & npx.cmd expo prebuild --platform android --clean --no-install
    if ($LASTEXITCODE -ne 0) { throw "Falha ao gerar o projeto Android." }

    $sdkPath = $env:ANDROID_HOME.Replace("\", "/")
    [System.IO.File]::WriteAllText(
        (Join-Path $projectRoot "android/local.properties"),
        "sdk.dir=$sdkPath`n",
        $utf8WithoutBom
    )

    $gradleProperties = "android/gradle.properties"
    $gradlePropertiesPath = Join-Path $projectRoot $gradleProperties
    $gradlePropertiesContent = Get-Content $gradlePropertiesPath -Raw
    $gradlePropertiesContent = $gradlePropertiesContent.Replace(
        "org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m",
        "org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1024m"
    )
    [System.IO.File]::WriteAllText(
        $gradlePropertiesPath,
        $gradlePropertiesContent,
        $utf8WithoutBom
    )

    [System.IO.File]::AppendAllText($gradlePropertiesPath, @"

LIFEGUARD_UPLOAD_STORE_FILE=$($keystorePath.Replace('\', '/'))
LIFEGUARD_UPLOAD_STORE_PASSWORD=$($keystore.keystorePassword)
LIFEGUARD_UPLOAD_KEY_ALIAS=$($keystore.keyAlias)
LIFEGUARD_UPLOAD_KEY_PASSWORD=$($keystore.keyPassword)
"@
    , $utf8WithoutBom)

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
    [System.IO.File]::WriteAllText(
        (Join-Path $projectRoot $buildGradlePath),
        $buildGradle,
        $utf8WithoutBom
    )

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
    $sha256 = [System.Security.Cryptography.SHA256]::Create()
    $apkStream = [System.IO.File]::OpenRead($outputApk)
    try {
        $hash = ([System.BitConverter]::ToString($sha256.ComputeHash($apkStream))).Replace("-", "").ToLowerInvariant()
    }
    finally {
        $apkStream.Dispose()
        $sha256.Dispose()
    }
    Set-Content -Path "$outputApk.sha256" -Value "$hash  lifeguard.apk" -Encoding ascii

    Write-Host ""
    Write-Host "APK pronto: $outputApk" -ForegroundColor Green
    Write-Host "SHA-256: $hash"
}
finally {
    [System.IO.File]::WriteAllText(
        $packageJsonPath,
        $packageJsonBeforePrebuild,
        $utf8WithoutBom
    )
    Pop-Location
}
