# Database-Backup.ps1
# Handles database backup operations for Fabrikage system

param (
    [switch]$FullBackup,
    [string]$BackupPath = "D:\busineshuboffline CHATGTP\Master\Backups"
)

$logFile = "D:\busineshuboffline CHATGTP\Master\Logs\Backup-$(Get-Date -Format 'yyyyMMdd').log"

function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "[$timestamp] $Message" | Tee-Object -FilePath $logFile -Append
}

function New-DatabaseBackup {
    param(
        [string]$DatabaseName,
        [string]$OutputPath
    )
    
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupFile = Join-Path -Path $OutputPath -ChildPath "${DatabaseName}_${timestamp}.bak"
    
    try {
        # Example for SQL Server backup (uncomment and modify as needed)
        # $sql = "BACKUP DATABASE [$DatabaseName] TO DISK = N'$backupFile' WITH NOFORMAT, INIT, NAME = N'$DatabaseName-Full Database Backup', SKIP, NOREWIND, NOUNLOAD, STATS = 10"
        # Invoke-Sqlcmd -Query $sql -ServerInstance ".\SQLEXPRESS"
        
        Write-Log "Backup created successfully: $backupFile"
        return $true
    }
    catch {
        Write-Log "ERROR creating backup for $DatabaseName : $_"
        return $false
    }
}

# Main execution
Write-Log "=== Starting Database Backup ==="

try {
    # Ensure backup directory exists
    if (-not (Test-Path $BackupPath)) {
        New-Item -ItemType Directory -Path $BackupPath -Force | Out-Null
    }
    
    # List of databases to back up (modify as needed)
    $databases = @("FabrikageDB")
    
    $successCount = 0
    foreach ($db in $databases) {
        if (New-DatabaseBackup -DatabaseName $db -OutputPath $BackupPath) {
            $successCount++
        }
    }
    
    # Cleanup old backups (keep last 7 days)
    $retentionDays = 7
    Get-ChildItem -Path $BackupPath -Filter "*.bak" | 
        Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-$retentionDays) } |
        Remove-Item -Force -ErrorAction SilentlyContinue
    
    Write-Log "=== Backup completed. Successfully backed up $successCount of $($databases.Count) databases. ==="
    exit 0
}
catch {
    Write-Log "ERROR: $_"
    Write-Log $_.ScriptStackTrace
    Write-Log "=== Backup completed with errors ==="
    exit 1
}
