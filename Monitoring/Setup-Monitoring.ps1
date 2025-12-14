# Setup-Monitoring.ps1
# Script to manage the Fabrikage monitoring system

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('start', 'stop', 'status', 'install', 'uninstall')]
    [string]$Action,
    
    [string]$Environment = "development"
)

# Import required modules
$ErrorActionPreference = "Stop"
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootPath = Split-Path -Parent $scriptPath
$logFile = "$rootPath\Logs\monitoring-$(Get-Date -Format 'yyyyMMdd').log"

# Ensure logs directory exists
$logDir = "$rootPath\Logs"
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

# Logging function
function Write-Log {
    param(
        [string]$Message,
        [ValidateSet('INFO', 'WARNING', 'ERROR')]
        [string]$Level = 'INFO'
    )
    
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $logMessage = "[$timestamp] [$Level] $Message"
    Add-Content -Path $logFile -Value $logMessage
    
    # Also write to console with colors
    $color = switch ($Level) {
        'INFO' { 'White' }
        'WARNING' { 'Yellow' }
        'ERROR' { 'Red' }
        default { 'Gray' }
    }
    
    Write-Host $logMessage -ForegroundColor $color
}

# Service management functions
function Start-MonitoringServices {
    Write-Log "Starting Fabrikage monitoring services..."
    
    try {
        # Start Prometheus
        Start-Process -FilePath "$scriptPath\prometheus.exe" -ArgumentList @(
            "--config.file=\"$scriptPath\prometheus.yml""
            "--storage.tsdb.path=\"$scriptPath\data\prometheus""
            "--web.listen-address=:9090"
        ) -NoNewWindow -PassThru -ErrorAction Stop | Out-Null
        
        # Start Alertmanager
        Start-Process -FilePath "$scriptPath\alertmanager.exe" -ArgumentList @(
            "--config.file=\"$scriptPath\alertmanager.yml""
            "--storage.path=\"$scriptPath\data\alertmanager""
            "--web.listen-address=:9093"
        ) -NoNewWindow -PassThru -ErrorAction Stop | Out-Null
        
        # Start Node Exporter (for system metrics)
        if (Test-Path "$scriptPath\node_exporter.exe") {
            Start-Process -FilePath "$scriptPath\node_exporter.exe" -NoNewWindow -PassThru -ErrorAction Stop | Out-Null
        }
        
        # Start Windows Exporter (for Windows-specific metrics)
        if (Test-Path "$scriptPath\windows_exporter.exe") {
            Start-Process -FilePath "$scriptPath\windows_exporter.exe" -NoNewWindow -PassThru -ErrorAction Stop | Out-Null
        }
        
        Write-Log "Monitoring services started successfully"
        Write-Host "`nAccess monitoring dashboards:" -ForegroundColor Cyan
        Write-Host "- Prometheus: http://localhost:9090" -ForegroundColor Cyan
        Write-Host "- Alertmanager: http://localhost:9093" -ForegroundColor Cyan
        Write-Host "- Grafana: http://localhost:3000 (if installed)" -ForegroundColor Cyan
        
        return $true
    }
    catch {
        Write-Log "Failed to start monitoring services: $_" -Level ERROR
        return $false
    }
}

function Stop-MonitoringServices {
    Write-Log "Stopping Fabrikage monitoring services..."
    
    $services = @("prometheus", "alertmanager", "node_exporter", "windows_exporter")
    $stoppedAll = $true
    
    foreach ($service in $services) {
        $process = Get-Process -Name $service -ErrorAction SilentlyContinue
        if ($process) {
            try {
                Stop-Process -Name $service -Force -ErrorAction Stop
                Write-Log "Stopped $service"
            }
            catch {
                Write-Log "Failed to stop $service : $_" -Level WARNING
                $stoppedAll = $false
            }
        }
    }
    
    if ($stoppedAll) {
        Write-Log "All monitoring services stopped successfully"
    }
    
    return $stoppedAll
}

function Get-MonitoringStatus {
    $services = @{
        "prometheus" = @{ Port = 9090; Name = "Prometheus" }
        "alertmanager" = @{ Port = 9093; Name = "Alertmanager" }
        "node_exporter" = @{ Port = 9100; Name = "Node Exporter" }
        "windows_exporter" = @{ Port = 9182; Name = "Windows Exporter" }
    }
    
    Write-Host "`nMonitoring Services Status:" -ForegroundColor Cyan
    Write-Host "-" * 50
    
    $allRunning = $true
    foreach ($service in $services.Keys) {
        $process = Get-Process -Name $service -ErrorAction SilentlyContinue
        $status = if ($process) { "Running (PID: $($process.Id))" } else { "Not Running" }
        $color = if ($process) { "Green" } else { "Red" }
        
        Write-Host "$($services[$service].Name):" -NoNewline
        Write-Host " $status" -ForegroundColor $color
        Write-Host "  Port: $($services[$service].Port)" -ForegroundColor Gray
        
        if (-not $process) {
            $allRunning = $false
        }
    }
    
    if ($allRunning) {
        Write-Host "`nAll monitoring services are running" -ForegroundColor Green
    } else {
        Write-Host "`nSome monitoring services are not running" -ForegroundColor Yellow
    }
    
    return $allRunning
}

function Install-MonitoringServices {
    Write-Log "Installing Fabrikage monitoring services..."
    
    try {
        # Create required directories
        $directories = @(
            "$scriptPath\data\prometheus",
            "$scriptPath\data\alertmanager"
        )
        
        foreach ($dir in $directories) {
            if (-not (Test-Path $dir)) {
                New-Item -ItemType Directory -Path $dir -Force | Out-Null
                Write-Log "Created directory: $dir"
            }
        }
        
        # Download monitoring tools if not already present
        $tools = @{
            "prometheus" = @{
                url = "https://github.com/prometheus/prometheus/releases/download/v2.30.3/prometheus-2.30.3.windows-amd64.zip"
                exe = "prometheus.exe"
                dir = "prometheus-2.30.3.windows-amd64"
            }
            "alertmanager" = @{
                url = "https://github.com/prometheus/alertmanager/releases/download/v0.23.0/alertmanager-0.23.0.windows-amd64.zip"
                exe = "alertmanager.exe"
                dir = "alertmanager-0.23.0.windows-amd64"
            }
            "node_exporter" = @{
                url = "https://github.com/prometheus/node_exporter/releases/download/v1.2.2/node_exporter-1.2.2.windows-amd64.zip"
                exe = "node_exporter.exe"
                dir = "node_exporter-1.2.2.windows-amd64"
            }
            "windows_exporter" = @{
                url = "https://github.com/prometheus-community/windows_exporter/releases/download/v0.18.1/windows_exporter-0.18.1-amd64.exe"
                exe = "windows_exporter.exe"
                dir = "."
            }
        }
        
        $client = New-Object System.Net.WebClient
        
        foreach ($tool in $tools.Keys) {
            $exePath = "$scriptPath\$($tools[$tool].exe)
            
            if (-not (Test-Path $exePath)) {
                Write-Log "Downloading $tool..."
                $zipPath = "$scriptPath\$tool.zip"
                $extractDir = "$scriptPath\$($tools[$tool].dir)
                
                # Download the tool
                $client.DownloadFile($tools[$tool].url, $zipPath)
                
                # Extract if it's a zip file
                if ($tools[$tool].url.EndsWith('.zip')) {
                    Expand-Archive -Path $zipPath -DestinationPath $scriptPath -Force
                    
                    # Move the executable to the script directory
                    $sourceExe = "$extractDir\$($tools[$tool].exe)
                    if (Test-Path $sourceExe) {
                        Move-Item -Path $sourceExe -Destination $scriptPath -Force
                        
                        # Clean up
                        Remove-Item -Path $extractDir -Recurse -Force -ErrorAction SilentlyContinue
                    }
                }
                
                # Clean up the zip file
                Remove-Item -Path $zipPath -Force -ErrorAction SilentlyContinue
                
                Write-Log "Installed $tool"
            } else {
                Write-Log "$tool is already installed"
            }
        }
        
        # Install as Windows services (optional)
        $installAsService = Read-Host "Do you want to install monitoring services as Windows services? (Y/N)"
        if ($installAsService -eq 'Y' -or $installAsService -eq 'y') {
            if (-not (Get-Command nssm -ErrorAction SilentlyContinue)) {
                Write-Log "NSSM (Non-Sucking Service Manager) is required to install services. Please install it first." -Level WARNING
                return $false
            }
            
            # Install Prometheus as a service
            nssm install Fabrikage-Prometheus "$scriptPath\prometheus.exe" "--config.file=\"$scriptPath\prometheus.yml\" --storage.tsdb.path=\"$scriptPath\data\prometheus\""
            nssm set Fabrikage-Prometheus AppDirectory "$scriptPath"
            nssm set Fabrikage-Prometheus Description "Fabrikage Monitoring - Prometheus"
            nssm set Fabrikage-Prometheus Start SERVICE_AUTO_START
            
            # Install Alertmanager as a service
            nssm install Fabrikage-Alertmanager "$scriptPath\alertmanager.exe" "--config.file=\"$scriptPath\alertmanager.yml\" --storage.path=\"$scriptPath\data\alertmanager\""
            nssm set Fabrikage-Alertmanager AppDirectory "$scriptPath"
            nssm set Fabrikage-Alertmanager Description "Fabrikage Monitoring - Alertmanager"
            nssm set Fabrikage-Alertmanager Start SERVICE_AUTO_START
            
            Write-Log "Monitoring services installed as Windows services"
        }
        
        Write-Log "Fabrikage monitoring installation completed successfully" -Level INFO
        return $true
    }
    catch {
        Write-Log "Failed to install monitoring services: $_" -Level ERROR
        return $false
    }
}

function Uninstall-MonitoringServices {
    Write-Log "Uninstalling Fabrikage monitoring services..."
    
    try {
        # Stop services if running
        Stop-MonitoringServices | Out-Null
        
        # Remove Windows services if they exist
        $services = @("Fabrikage-Prometheus", "Fabrikage-Alertmanager")
        
        foreach ($service in $services) {
            if (Get-Service -Name $service -ErrorAction SilentlyContinue) {
                Write-Log "Removing Windows service: $service"
                nssm remove $service confirm
            }
        }
        
        # Optionally remove downloaded files
        $removeFiles = Read-Host "Do you want to remove all monitoring files? This cannot be undone. (Y/N)"
        if ($removeFiles -eq 'Y' -or $removeFiles -eq 'y') {
            $filesToRemove = @(
                "$scriptPath\prometheus.exe",
                "$scriptPath\alertmanager.exe",
                "$scriptPath\node_exporter.exe",
                "$scriptPath\windows_exporter.exe",
                "$scriptPath\data"
            )
            
            foreach ($file in $filesToRemove) {
                if (Test-Path $file) {
                    Remove-Item -Path $file -Recurse -Force -ErrorAction SilentlyContinue
                    Write-Log "Removed: $file"
                }
            }
        }
        
        Write-Log "Fabrikage monitoring uninstallation completed" -Level INFO
        return $true
    }
    catch {
        Write-Log "Failed to uninstall monitoring services: $_" -Level ERROR
        return $false
    }
}

# Main script execution
try {
    # Ensure we're running as administrator for service management
    $isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    
    if (-not $isAdmin -and ($Action -eq 'install' -or $Action -eq 'uninstall')) {
        Write-Host "This action requires administrator privileges. Please run the script as an administrator." -ForegroundColor Red
        exit 1
    }
    
    # Execute the requested action
    switch ($Action.ToLower()) {
        'start' {
            $success = Start-MonitoringServices
            if (-not $success) { exit 1 }
        }
        'stop' {
            $success = Stop-MonitoringServices
            if (-not $success) { exit 1 }
        }
        'status' {
            $success = Get-MonitoringStatus
            if (-not $success) { exit 1 }
        }
        'install' {
            $success = Install-MonitoringServices
            if (-not $success) { exit 1 }
        }
        'uninstall' {
            $success = Uninstall-MonitoringServices
            if (-not $success) { exit 1 }
        }
        default {
            Write-Host "Invalid action: $Action" -ForegroundColor Red
            Write-Host "Valid actions: start, stop, status, install, uninstall"
            exit 1
        }
    }
    
    exit 0
}
catch {
    Write-Log "Error: $_" -Level ERROR
    Write-Log $_.ScriptStackTrace -Level ERROR
    exit 1
}
