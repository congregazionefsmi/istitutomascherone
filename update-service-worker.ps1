
$ErrorActionPreference = 'Stop'

try {
    # =========================================================
    # 0. PROJECT LOCATION
    # =========================================================

    $basePath = $PSScriptRoot

    if ([string]::IsNullOrWhiteSpace($basePath)) {
        throw "Could not determine the project directory."
    }

    $serviceWorkerPath = Join-Path $basePath "service-worker.js"
    $backupPath = Join-Path $basePath "service-worker.js.bak"

    if (-not (Test-Path -LiteralPath $serviceWorkerPath -PathType Leaf)) {
        throw "service-worker.js not found in: $basePath"
    }

    $content = Get-Content -LiteralPath $serviceWorkerPath -Raw

    # =========================================================
    # 1. INCREMENT CACHE VERSION
    # =========================================================

    $pattern = 'const\s+CACHE_NAME\s*=\s*["'']compendio-v(\d+)\.(\d+)\.(\d+)["'']\s*;'

    $match = [regex]::Match($content, $pattern)

    if (-not $match.Success) {
        throw 'Could not find CACHE_NAME in the expected format: compendio-v9.0.0'
    }

    $major = [int]$match.Groups[1].Value
    $minor = [int]$match.Groups[2].Value
    $patch = [int]$match.Groups[3].Value + 1

    $version = "$major.$minor.$patch"

    $newVersionLine = 'const CACHE_NAME = "compendio-v' + $version + '";'

    $content = [regex]::Replace(
        $content,
        $pattern,
        [System.Text.RegularExpressions.MatchEvaluator]{
            param($m)
            return $newVersionLine
        },
        1
    )

    # =========================================================
    # 2. EXCLUDED DIRECTORIES AND FILES
    # =========================================================

    $excludedFolders = @(
        '.git',
        'node_modules',
        'android',
        'ios',
        '.gradle',
        '.idea',
        '.vscode'
    )

    $excludedFiles = @(
        'service-worker.js',
        'update-service-worker.ps1',
        'update-service-worker.bat'
    )

    $excludedExtensions = @(
        '.bat',
        '.ps1',
        '.bak'
    )

    # =========================================================
    # 3. SCAN PROJECT FILES
    # =========================================================

    Write-Host ''
    Write-Host 'Scanning project files...' -ForegroundColor Cyan

    $files = @(
        Get-ChildItem -LiteralPath $basePath -Recurse -File |
        Where-Object {

            $relative = $_.FullName.Substring($basePath.Length).
                TrimStart([char[]]@('\', '/'))

            $parts = $relative -split '[\\/]'

            $folderExcluded = $false

            foreach ($part in $parts) {
                if ($part -in $excludedFolders) {
                    $folderExcluded = $true
                    break
                }
            }

            $folderExcluded -eq $false -and
            $_.Name -notin $excludedFiles -and
            $_.Extension.ToLowerInvariant() -notin $excludedExtensions

        } |
        ForEach-Object {

            $_.FullName.Substring($basePath.Length).
                TrimStart([char[]]@('\', '/')).Replace('\', '/')

        } |
        Sort-Object -Unique
    )

    if ($files.Count -eq 0) {
        throw 'No project files found.'
    }

    # =========================================================
    # 4. REBUILD APP_FILES
    # =========================================================

    Write-Host "Files discovered: $($files.Count)" -ForegroundColor Cyan

    $entries = ($files | ForEach-Object {
        '    "' + $_ + '"'
    }) -join ",`r`n"

    $array = "const APP_FILES = [`r`n$entries`r`n];"

    $arrayPattern = 'const\s+APP_FILES\s*=\s*\[[\s\S]*?\]\s*;'

    if (-not [regex]::IsMatch($content, $arrayPattern)) {
        throw 'Could not find the APP_FILES array.'
    }

    $content = [regex]::Replace(
        $content,
        $arrayPattern,
        [System.Text.RegularExpressions.MatchEvaluator]{
            param($m)
            return $array
        },
        1
    )

    # =========================================================
    # 5. BACKUP ORIGINAL SERVICE WORKER
    # =========================================================

    Copy-Item `
        -LiteralPath $serviceWorkerPath `
        -Destination $backupPath `
        -Force

    # =========================================================
    # 6. WRITE UPDATED SERVICE WORKER
    # =========================================================

    $tempPath = Join-Path $basePath "service-worker.tmp.js"

    try {

        [System.IO.File]::WriteAllText(
            $tempPath,
            $content,
            [System.Text.UTF8Encoding]::new($false)
        )

        Move-Item `
            -LiteralPath $tempPath `
            -Destination $serviceWorkerPath `
            -Force

    }
    catch {

        if (Test-Path -LiteralPath $tempPath) {
            Remove-Item -LiteralPath $tempPath -Force
        }

        throw
    }

    # =========================================================
    # 7. SUCCESS REPORT
    # =========================================================

    Write-Host ''
    Write-Host '==========================================' -ForegroundColor Green
    Write-Host '  COMPENDIO DI PREGHIERE' -ForegroundColor Green
    Write-Host '  SERVICE WORKER UPDATE SUCCESSFUL' -ForegroundColor Green
    Write-Host '==========================================' -ForegroundColor Green

    Write-Host ''
    Write-Host "Project directory : $basePath"
    Write-Host "New cache version: compendio-v$version"
    Write-Host "Files in APP_FILES: $($files.Count)"
    Write-Host "Backup created   : service-worker.js.bak"

    Write-Host ''
    Write-Host 'Your existing Service Worker logic has been preserved.' -ForegroundColor Green

}
catch {

    Write-Host ''
    Write-Host '==========================================' -ForegroundColor Red
    Write-Host '  SERVICE WORKER UPDATE FAILED' -ForegroundColor Red
    Write-Host '==========================================' -ForegroundColor Red

    Write-Host ''
    Write-Host $_.Exception.Message -ForegroundColor Red

    if ($_.ScriptStackTrace) {
        Write-Host $_.ScriptStackTrace -ForegroundColor Yellow
    }

}

Write-Host ''
Read-Host 'Press ENTER to close'
