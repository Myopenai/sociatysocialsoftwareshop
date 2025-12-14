# System-HealthCheck.ps1
# Performs health checks on the Fabrikage system

param (
    [switch]$CheckAll,
    [switch]$CheckServices,
    [switch]$CheckDisks,
    [switch]$CheckMemory,
    [switch]$CheckCPU
)

$logFile = "D:\busineshuboffline CHATGTP\Master\Logs\HealthCheck-$(Get-Date -Format 'yyyyMMdd').log"

function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "[$timestamp] $Message" | Tee-Object -FilePath $logFile -Append
}

function Test-ServiceHealth {
    param(
        [string]$ServiceName,
        [string]$DisplayName
    )
    
    try {
        $service = Get-Service -Name $ServiceName -ErrorAction Stop
        
        if ($service.Status -ne 'Running') {
            Write-Log "WARNING: Service $DisplayName is not running (Status: $($service.Status))"
            return $false
        }
        
        Write-Log "Service $DisplayName is running."
        return $true
    }
    catch {
        Write-Log "ERROR checking service $DisplayName : $_"
        return $false
    }
}

function Test-DiskSpace {
    param(
        [string]$Drive = "C:",
        [int]$WarningThresholdGB = 20,
        [int]$CriticalThresholdGB = 10
    )
    
    try {
        $disk = Get-PSDrive -Name $Drive -PSProvider 'FileSystem' -ErrorAction Stop
        $freeGB = [math]::Round($disk.Free / 1GB, 2)
        $totalGB = [math]::Round($disk.Used / 1GB + $freeGB, 2)
        $usedPercent = [math]::Round(($disk.Used / ($disk.Used + $disk.Free)) * 100, 2)
        
        if ($freeGB -lt $CriticalThresholdGB) {
            Write-Log "CRITICAL: Low disk space on $Drive - ${freeGB}GB free (${usedPercent}% used)"
            return $false
        }
        elseif ($freeGB -lt $WarningThresholdGB) {
            Write-Log "WARNING: Low disk space on $Drive - ${freeGB}GB free (${usedPercent}% used)"
            return $true
        }
        
        Write-Log "Disk space OK on $Drive - ${freeGB}GB free (${usedPercent}% used)"
        return $true
    }
    catch {
        Write-Log "ERROR checking disk space on $Drive : $_"
        return $false
    }
}

function Test-MemoryUsage {
    param(
        [int]$WarningThresholdPercent = 80,
        [int]$CriticalThresholdPercent = 90
    )
    
    try {
        $memory = Get-CimInstance -ClassName Win32_OperatingSystem | Select-Object TotalVisibleMemorySize, FreePhysicalMemory
        $usedMemory = $memory.TotalVisibleMemorySize - $memory.FreePhysicalMemory
        $usedPercent = [math]::Round(($usedMemory / $memory.TotalVisibleMemorySize) * 100, 2)
        $freeGB = [math]::Round($memory.FreePhysicalMemory / 1MB, 2)
        $totalGB = [math]::Round($memory.TotalVisibleMemorySize / 1MB, 2)
        
        if ($usedPercent -gt $CriticalThresholdPercent) {
            Write-Log "CRITICAL: High memory usage - ${usedPercent}% (${freeGB}GB free of ${totalGB}GB)"
            return $false
        }
        elseif ($usedPercent -gt $WarningThresholdPercent) {
            Write-Log "WARNING: High memory usage - ${usedPercent}% (${freeGB}GB free of ${totalGB}GB)"
            return $true
        }
        
        Write-Log "Memory usage OK - ${usedPercent}% (${freeGB}GB free of ${totalGB}GB)"
        return $true
    }
    catch {
        Write-Log "ERROR checking memory usage: $_"
        return $false
    }
}

function Test-CPUUsage {
    param(
        [int]$WarningThresholdPercent = 80,
        [int]$CriticalThresholdPercent = 90,
        [int]$SampleIntervalSeconds = 5,
        [int]$Samples = 3
    )
    
    try {
        $cpuLoads = @()
        
        for ($i = 0; $i -lt $Samples; $i++) {
            $cpu = Get-Counter '\Processor(_Total)\% Processor Time' -ErrorAction Stop
            $load = [math]::Round($cpu.CounterSamples[0].CookedValue, 2)
            $cpuLoads += $load
            
            if ($i -lt $Samples - 1) {
                Start-Sleep -Seconds $SampleIntervalSeconds
            }
        }
        
        $avgLoad = [math]::Round(($cpuLoads | Measure-Object -Average).Average, 2)
        
        if ($avgLoad -gt $CriticalThresholdPercent) {
            Write-Log "CRITICAL: High CPU usage - ${avgLoad}% (average over $Samples samples)"
            return $false
        }
        elseif ($avgLoad -gt $WarningThresholdPercent) {
            Write-Log "WARNING: High CPU usage - ${avgLoad}% (average over $Samples samples)"
            return $true
        }
        
        Write-Log "CPU usage OK - ${avgLoad}% (average over $Samples samples)"
        return $true
    }
    catch {
        Write-Log "ERROR checking CPU usage: $_"
        return $false
    }
}

# Main execution
Write-Log "=== Starting System Health Check ==="

$overallHealthy = $true
$checks = @()

try {
    # Determine which checks to run
    $runAll = $CheckAll -or (-not ($CheckServices -or $CheckDisks -or $CheckMemory -or $CheckCPU))
    
    # Run service checks
    if ($runAll -or $CheckServices) {
        Write-Log "--- Checking Services ---"
        
        # List of critical services to check (modify as needed)
        $services = @(
            @{ Name = "WinRM"; DisplayName = "Windows Remote Management" },
            @{ Name = "EventLog"; DisplayName = "Windows Event Log" },
            @{ Name = "W3SVC"; DisplayName = "World Wide Web Publishing Service" }
        )
        
        foreach ($service in $services) {
            if (-not (Test-ServiceHealth -ServiceName $service.Name -DisplayName $service.DisplayName)) {
                $overallHealthy = $false
            }
        }
        
        $checks += "Services"
    }
    
    # Run disk checks
    if ($runAll -or $CheckDisks) {
        Write-Log "--- Checking Disk Space ---"
        
        # Check all fixed drives
        $disks = Get-PSDrive -PSProvider 'FileSystem' | Where-Object { $_.DisplayRoot -ne $null }
        
        foreach ($disk in $disks) {
            if (-not (Test-DiskSpace -Drive $disk.Name)) {
                $overallHealthy = $false
            }
        }
        
        $checks += "Disks"
    }
    
    # Run memory check
    if ($runAll -or $CheckMemory) {
        Write-Log "--- Checking Memory Usage ---"
        
        if (-not (Test-MemoryUsage)) {
            $overallHealthy = $false
        }
        
        $checks += "Memory"
    }
    
    # Run CPU check
    if ($runAll -or $CheckCPU) {
        Write-Log "--- Checking CPU Usage ---"
        
        if (-not (Test-CPUUsage)) {
            $overallHealthy = $false
        }
        
        $checks += "CPU"
    }
    
    # Log overall status
    $checkList = if ($checks.Count -gt 0) { $checks -join ", " } else { "No checks performed" }
    
    if ($overallHealthy) {
        Write-Log "=== Health check completed successfully (Checks: $checkList) ==="
        exit 0
    }
    else {
        Write-Log "=== Health check completed with warnings or errors (Checks: $checkList) ==="
        exit 1
    }
}
catch {
    Write-Log "ERROR: $_"
    Write-Log $_.ScriptStackTrace
    Write-Log "=== Health check failed with errors ==="
    exit 1
}
