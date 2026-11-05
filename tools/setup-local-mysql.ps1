param([string]$AdminEmail = 'admin@atlas-isle.local')
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$backendRoot = Join-Path $projectRoot 'backend'
$localRoot = Join-Path $env:USERPROFILE 'AppData\Local\AtlasTravelMySQL'
$dataRoot = Join-Path $localRoot 'data'
$logRoot = Join-Path $localRoot 'logs'
$mysqlRoot = 'C:\Program Files\MySQL\MySQL Server 8.4'
$mysqld = Join-Path $mysqlRoot 'bin\mysqld.exe'
$mysql = Join-Path $mysqlRoot 'bin\mysql.exe'
$mysqladmin = Join-Path $mysqlRoot 'bin\mysqladmin.exe'
$configPath = Join-Path $backendRoot 'mysql.local.ini'
$envPath = Join-Path $backendRoot '.env'
if (!(Test-Path $mysqld) -or !(Test-Path $mysql)) { throw 'MySQL Server 8.4 was not found at its expected installation path.' }
New-Item -ItemType Directory -Force $dataRoot,$logRoot | Out-Null
$errorLog = Join-Path $logRoot 'mysql-error.log'
$pidFile = Join-Path $localRoot 'mysql.pid'
$config = @"
[mysqld]
basedir="$($mysqlRoot -replace '\\','/')"
datadir="$($dataRoot -replace '\\','/')"
port=3307
bind-address=127.0.0.1
mysqlx=0
skip-name-resolve=ON
character-set-server=utf8mb4
collation-server=utf8mb4_0900_ai_ci
log-error="$($errorLog -replace '\\','/')"
pid-file="$($pidFile -replace '\\','/')"
"@
[IO.File]::WriteAllText($configPath,$config,[Text.UTF8Encoding]::new($false))
$initialized = (Get-ChildItem -LiteralPath $dataRoot -Force | Measure-Object).Count -gt 0
if (!$initialized) {
    & $mysqld "--defaults-file=$configPath" --initialize 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "MySQL data initialization failed. Review $errorLog" }
}
$alive = $false
$ErrorActionPreference = 'Continue'
try { & $mysqladmin --protocol=TCP --host=127.0.0.1 --port=3307 --connect-timeout=2 ping 2>&1 | Out-Null; $alive = $LASTEXITCODE -eq 0 } catch {}
if (!$alive) {
    $process = Start-Process -FilePath $mysqld -ArgumentList @("--defaults-file=`"$configPath`"") -WindowStyle Hidden -PassThru
    for ($try = 0; $try -lt 45; $try++) {
        Start-Sleep -Seconds 1
        & $mysqladmin --protocol=TCP --host=127.0.0.1 --port=3307 --connect-timeout=2 ping 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) { $alive = $true; break }
        if ($process.HasExited) { break }
    }
}
$ErrorActionPreference = 'Stop'
if (!$alive) { throw "Isolated MySQL did not become ready. Review $errorLog" }
if (!$initialized) {
    $match = Select-String -Path $errorLog -Pattern 'temporary password is generated for root@localhost: (.+)$' | Select-Object -Last 1
    if (!$match) { throw "MySQL initialized but its one-time root password was not found in $errorLog" }
    $temporaryRootPassword = $match.Matches[0].Groups[1].Value.Trim()
    $rootPassword = [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(36))
    $databasePassword = [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(36))
    $adminPassword = [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(36))
    $env:MYSQL_PWD = $temporaryRootPassword
    $sql = "ALTER USER 'root'@'localhost' IDENTIFIED BY '$rootPassword'; CREATE DATABASE atlas_travel CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; CREATE USER 'atlas_app'@'127.0.0.1' IDENTIFIED BY '$databasePassword'; GRANT ALL PRIVILEGES ON atlas_travel.* TO 'atlas_app'@'127.0.0.1';"
    & $mysql --protocol=TCP --host=127.0.0.1 --port=3307 --user=root --connect-expired-password --execute=$sql 2>&1 | Out-Null
    Remove-Item Env:\MYSQL_PWD -ErrorAction SilentlyContinue
    if ($LASTEXITCODE -ne 0) { throw 'Could not create the isolated application database and user.' }
    if (!(Test-Path $envPath)) { Copy-Item (Join-Path $backendRoot '.env.example') $envPath }
    $envText = Get-Content -LiteralPath $envPath -Raw
    $values = [ordered]@{DB_HOST='127.0.0.1';DB_PORT='3307';DB_DATABASE='atlas_travel';DB_USERNAME='atlas_app';DB_PASSWORD=$databasePassword;ADMIN_EMAIL=$AdminEmail;ADMIN_PASSWORD=$adminPassword;APP_URL='http://127.0.0.1:8000';FRONTEND_URL='http://localhost:5173'}
    foreach ($entry in $values.GetEnumerator()) {
        $line = "$($entry.Key)=$($entry.Value)"
        if ($envText -match "(?m)^$($entry.Key)=.*$") { $envText = [regex]::Replace($envText,"(?m)^$($entry.Key)=.*$",[System.Text.RegularExpressions.MatchEvaluator]{param($m) $line}) }
        else { $envText += "`r`n$line" }
    }
    [IO.File]::WriteAllText($envPath,$envText,[Text.UTF8Encoding]::new($false))
    Write-Output 'Created the isolated MySQL database, app user, and one local admin account. Generated credentials are saved in backend/.env.'
} else {
    Write-Output 'The isolated MySQL instance is already initialized and running.'
}
Write-Output 'MySQL listens only on 127.0.0.1:3307; its data directory is in the current Windows user profile.'

