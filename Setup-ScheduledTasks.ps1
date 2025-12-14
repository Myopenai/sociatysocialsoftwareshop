# ScheduledTasks.ps1
# Script to set up scheduled tasks for Fabrikage system maintenance

# Import required modules
Import-Module ScheduledTasks -ErrorAction Stop
$ErrorActionPreference = "Stop"

# Define script paths
$scriptPath = "D:\busineshuboffline CHATGTP\Master\Routines\System-Maintenance.ps1"
$backupScriptPath = "D:\busineshuboffline CHATGTP\Master\Routines\Database-Backup.ps1"
$reportScriptPath = "D:\busineshuboffline CHATGTP\Master\Routines\Generate-Reports.ps1"
$healthScriptPath = "D:\busineshuboffline CHATGTP\Master\System-HealthCheck.ps1"
$logPath = "D:\busineshuboffline CHATGTP\Master\Logs\ScheduledTasks.log"

# Ensure the logs directory exists
$logDir = Split-Path -Parent $logPath
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

# Function to create a scheduled task
function New-ScheduledTaskItem {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory=$true)]
        [string]$Name,
        
        [Parameter(Mandatory=$true)]
        [string]$ScriptPath,
        
        [Parameter(Mandatory=$true)]
        [string]$Description,
        
        [Parameter(Mandatory=$true)]
        [ValidateSet('Daily', 'Hourly', 'Weekly', 'Monthly', 'AtStartup')]
        [string]$TriggerType,
        
        [string]$Argument = "",
        [int]$StartHour = 2,
        [int]$StartMinute = 0,
        [string]$DaysOfWeek = 'Sunday',
        [int]$DaysInterval = 1,
        [int]$RepetitionIntervalHours = 1,
        [int]$RepetitionIntervalMinutes = 0
    )

    # Create the action
    $actionParams = @{
        Execute  = 'PowerShell.exe'
        Argument = "-NoProfile -ExecutionPolicy Bypass -File `"$ScriptPath`" $Argument"
    }
    $action = New-ScheduledTaskAction @actionParams

    # Create the trigger based on type
    $trigger = switch ($TriggerType) {
        'Daily' {
            $startTime = (Get-Date -Hour $StartHour -Minute $StartMinute -Second 0).AddDays(1)
            New-ScheduledTaskTrigger -Daily -At $startTime -DaysInterval $DaysInterval
        }
        'Hourly' {
            $startTime = Get-Date
            $repInterval = New-TimeSpan -Hours $RepetitionIntervalHours -Minutes $RepetitionIntervalMinutes
            New-ScheduledTaskTrigger -Once -At $startTime -RepetitionInterval $repInterval
        }
        'Weekly' {
            $startTime = (Get-Date -Hour $StartHour -Minute $StartMinute -Second 0).AddDays(1)
            $days = [System.DayOfWeek]::$DaysOfWeek
            New-ScheduledTaskTrigger -Weekly -DaysOfWeek $days -At $startTime -WeeksInterval 1
        }
        'Monthly' {
            $startTime = (Get-Date -Day 1 -Hour $StartHour -Minute $StartMinute -Second 0).AddMonths(1)
            New-ScheduledTaskTrigger -Monthly -DaysOfMonth 1 -At $startTime
        }
        'AtStartup' {
            New-ScheduledTaskTrigger -AtStartup
        }
    }

    # Set task settings
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
        -StartWhenAvailable -RunOnlyIfNetworkAvailable -DontStopOnIdleEnd
    
    # Set task principal
    $principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

    # Register the task
    $params = @{
        TaskName    = $Name
        Action      = $action
        Trigger     = $trigger
        Description = $Description
        Settings    = $settings
        Principal   = $principal
        Force       = $true
    }

    try {
        $task = Register-ScheduledTask @params
        Write-Host "Successfully created task: $Name" -ForegroundColor Green
        return $task
    }
    catch {
        Write-Host "Error creating task $Name : $_" -ForegroundColor Red
        throw $_
    }
}

# 1. Daily Maintenance Task (runs at 2:00 AM)
try {
    New-ScheduledTaskItem -Name "Fabrikage-DailyMaintenance" `
                         -ScriptPath $scriptPath `
                         -Description "Runs daily maintenance tasks for Fabrikage" `
                         -TriggerType Daily `
                         -Argument "-Cleanup -Backup" `
                         -StartHour 2 `
                         -StartMinute 0
    Write-Host "Created daily maintenance task" -ForegroundColor Green
}
catch {
    Write-Host "Error creating daily maintenance task: $_" -ForegroundColor Red
}

# 2. Hourly Log Rotation (runs every hour)
try {
    New-ScheduledTaskItem -Name "Fabrikage-LogRotation" `
                         -ScriptPath $scriptPath `
                         -Description "Rotates and cleans up log files" `
                         -TriggerType Hourly `
                         -Argument "-RotateLogs" `
                         -RepetitionIntervalHours 1
    Write-Host "Created log rotation task" -ForegroundColor Green
}
catch {
    Write-Host "Error creating log rotation task: $_" -ForegroundColor Red
}

# 3. Weekly Database Backup (runs every Sunday at 3:00 AM)
try {
    if (Test-Path $backupScriptPath) {
        New-ScheduledTaskItem -Name "Fabrikage-WeeklyBackup" `
                             -ScriptPath $backupScriptPath `
                             -Description "Creates a weekly backup of the Fabrikage database" `
                             -TriggerType Weekly `
                             -Argument "-FullBackup" `
                             -StartHour 3 `
                             -StartMinute 0 `
                             -DaysOfWeek Sunday
        Write-Host "Created weekly backup task" -ForegroundColor Green
    } else {
        Write-Host "Backup script not found at $backupScriptPath" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "Error creating weekly backup task: $_" -ForegroundColor Red
}

# 4. Monthly Report Generation (runs on the 1st of each month at 4:00 AM)
try {
    if (Test-Path $reportScriptPath) {
        New-ScheduledTaskItem -Name "Fabrikage-MonthlyReport" `
                             -ScriptPath $reportScriptPath `
                             -Description "Generates monthly system reports" `
                             -TriggerType Monthly `
                             -Argument "-MonthlyReport" `
                             -StartHour 4 `
                             -StartMinute 0
        Write-Host "Created monthly report task" -ForegroundColor Green
    } else {
        Write-Host "Report generation script not found at $reportScriptPath" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "Error creating monthly report task: $_" -ForegroundColor Red
}

# 5. Service Health Check (runs every 15 minutes)
try {
    if (Test-Path $healthScriptPath) {
        New-ScheduledTaskItem -Name "Fabrikage-HealthCheck" `
                             -ScriptPath $healthScriptPath `
                             -Description "Checks the health of Fabrikage services every 15 minutes" `
                             -TriggerType Hourly `
                             -Argument "-CheckAll" `
                             -RepetitionIntervalHours 0 `
                             -RepetitionIntervalMinutes 15
        Write-Host "Created health check task" -ForegroundColor Green
    } else {
        Write-Host "Health check script not found at $healthScriptPath" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "Error creating health check task: $_" -ForegroundColor Red
}

Write-Host "`nScheduled tasks setup completed. Review the following tasks in Task Scheduler:" -ForegroundColor Cyan
Write-Host "- Fabrikage-DailyMaintenance" -ForegroundColor Cyan
Write-Host "- Fabrikage-LogRotation" -ForegroundColor Cyan
Write-Host "- Fabrikage-WeeklyBackup" -ForegroundColor Cyan
Write-Host "- Fabrikage-MonthlyReport" -ForegroundColor Cyan
Write-Host "- Fabrikage-HealthCheck" -ForegroundColor Cyan

Write-Host "`nTo view or modify these tasks, open Task Scheduler and look under Task Scheduler Library." -ForegroundColor Yellow
