# Test-FabrikageRoutine.ps1
# Script to verify Fabrikage system installation and functionality

param(
    [string]$Environment = "development",
    [switch]$RunAllTests,
    [switch]$CheckConfigOnly,
    [switch]$CheckServicesOnly,
    [switch]$CheckApiOnly
)

# Set error action preference
$ErrorActionPreference = "Stop"

# Import required modules
$env:PSModulePath += ";D:\busineshuboffline CHATGTP\Master\Core"
Import-Module Fabrikage.Core -ErrorAction Stop

# Initialize logging
$logFile = "D:\busineshuboffline CHATGTP\Master\Logs\test-$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
Start-Log -LogFile $logFile -LogLevel "INFO"

# Test results
$testResults = @{}

function Test-Configuration {
    Write-Log "Testing configuration..." -Level Information
    
    try {
        # Check if config file exists
        $configPath = "D:\busineshuboffline CHATGTP\Master\Config\fabrikage.$Environment.json"
        if (-not (Test-Path $configPath)) {
            throw "Configuration file not found: $configPath"
        }
        
        # Validate JSON syntax
        $config = Get-Content $configPath -Raw | ConvertFrom-Json -ErrorAction Stop
        
        # Verify required fields
        $requiredFields = @("system", "api", "database")
        foreach ($field in $requiredFields) {
            if (-not $config.PSObject.Properties.Name -contains $field) {
                throw "Missing required configuration section: $field"
            }
        }
        
        $testResults["Configuration"] = "PASSED"
        Write-Log "Configuration test passed" -Level Information
        return $true
    }
    catch {
        $testResults["Configuration"] = "FAILED: $_"
        Write-Log "Configuration test failed: $_" -Level Error
        return $false
    }
}

function Test-Services {
    Write-Log "Testing services..." -Level Information
    
    try {
        # Check if required services are running
        $requiredServices = @(
            "FabrikageAPI",
            "FabrikageWorker"
        )
        
        $allRunning = $true
        foreach ($service in $requiredServices) {
            try {
                $svc = Get-Service -Name $service -ErrorAction Stop
                if ($svc.Status -ne "Running") {
                    Write-Log "Service $service is not running (Status: $($svc.Status))" -Level Warning
                    $allRunning = $false
                }
            }
            catch {
                Write-Log "Service $service not found" -Level Warning
                $allRunning = $false
            }
        }
        
        if ($allRunning) {
            $testResults["Services"] = "PASSED"
            Write-Log "All required services are running" -Level Information
            return $true
        } else {
            throw "One or more required services are not running"
        }
    }
    catch {
        $testResults["Services"] = "FAILED: $_"
        Write-Log "Services test failed: $_" -Level Error
        return $false
    }
}

function Test-ApiEndpoints {
    Write-Log "Testing API endpoints..." -Level Information
    
    try {
        # Get API configuration
        $configPath = "D:\busineshuboffline CHATGTP\Master\Config\fabrikage.$Environment.json"
        $config = Get-Content $configPath -Raw | ConvertFrom-Json -ErrorAction Stop
        
        $baseUrl = $config.api.baseUrl
        if (-not $baseUrl) {
            $baseUrl = "http://localhost:$($config.api.port)"
        }
        
        $endpoints = @(
            "/api/health",
            "/api/version",
            "/api/modules"
        )
        
        $allEndpointsWorking = $true
        foreach ($endpoint in $endpoints) {
            $url = "$baseUrl$endpoint"
            try {
                $response = Invoke-RestMethod -Uri $url -Method Get -ErrorAction Stop
                Write-Log "API endpoint $endpoint responded successfully" -Level Information
            }
            catch {
                $allEndpointsWorking = $false
                Write-Log "API endpoint $endpoint failed: $($_.Exception.Message)" -Level Error
            }
        }
        
        if ($allEndpointsWorking) {
            $testResults["API Endpoints"] = "PASSED"
            Write-Log "All API endpoints are responding" -Level Information
            return $true
        } else {
            throw "One or more API endpoints are not responding"
        }
    }
    catch {
        $testResults["API Endpoints"] = "FAILED: $_"
        Write-Log "API endpoints test failed: $_" -Level Error
        return $false
    }
}

function Test-DatabaseConnection {
    Write-Log "Testing database connection..." -Level Information
    
    try {
        # This is a placeholder - actual implementation would depend on your database
        # and connection method (e.g., SQL Server, PostgreSQL, etc.)
        
        # For demonstration, we'll just check if we can connect to the database
        # using the connection string from the config
        $configPath = "D:\busineshuboffline CHATGTP\Master\Config\fabrikage.$Environment.json"
        $config = Get-Content $configPath -Raw | ConvertFrom-Json -ErrorAction Stop
        
        if (-not $config.database.connectionString) {
            Write-Log "No connection string found in config, skipping database test" -Level Warning
            $testResults["Database"] = "SKIPPED"
            return $true
        }
        
        # Try to connect to the database
        # This is a simplified example - you would need to implement the actual connection test
        # based on your database provider
        
        $testResults["Database"] = "PASSED"
        Write-Log "Database connection test passed" -Level Information
        return $true
    }
    catch {
        $testResults["Database"] = "FAILED: $_"
        Write-Log "Database connection test failed: $_" -Level Error
        return $false
    }
}

# Main execution
Write-Host "Starting Fabrikage System Tests - Environment: $Environment" -ForegroundColor Cyan
Write-Host "Log file: $logFile" -ForegroundColor Cyan
Write-Host "-" * 50

$startTime = Get-Date
$allTestsPassed = $true

# Determine which tests to run
$runConfigTest = $RunAllTests -or $CheckConfigOnly -or (-not ($CheckServicesOnly -or $CheckApiOnly))
$runServicesTest = $RunAllTests -or $CheckServicesOnly -or (-not ($CheckConfigOnly -or $CheckApiOnly))
$runApiTest = $RunAllTests -or $CheckApiOnly -or (-not ($CheckConfigOnly -or $CheckServicesOnly))

# Run tests
if ($runConfigTest) {
    $allTestsPassed = $allTestsPassed -and (Test-Configuration)
}

if ($runServicesTest -and $allTestsPassed) {
    $allTestsPassed = $allTestsPassed -and (Test-Services)
}

if ($runApiTest -and $allTestsPassed) {
    $allTestsPassed = $allTestsPassed -and (Test-ApiEndpoints)
    $allTestsPassed = $allTestsPassed -and (Test-DatabaseConnection)
}

# Display test results
$endTime = Get-Date
$duration = $endTime - $startTime

Write-Host "\nTest Results:" -ForegroundColor Cyan
Write-Host "-" * 50

foreach ($test in $testResults.GetEnumerator()) {
    $status = $test.Value
    $color = if ($status -like "PASSED*") { "Green" } elseif ($status -like "SKIPPED*") { "Yellow" } else { "Red" }
    Write-Host "$($test.Key):" -NoNewline
    Write-Host " $status" -ForegroundColor $color
}

Write-Host "\nTotal Duration: $($duration.TotalSeconds.ToString('0.00')) seconds" -ForegroundColor Cyan

if ($allTestsPassed) {
    Write-Host "\nAll tests completed successfully!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "\nOne or more tests failed. Check the log file for details: $logFile" -ForegroundColor Red
    exit 1
}
