# Fabrikage Environment Setup Script
# Run this script as Administrator to set up system environment variables

# Define environment variables
$envVars = @{
    "FABRIKAGE_HOME" = "D:\busineshuboffline CHATGTP\Master"
    "FABRIKAGE_CORE" = "D:\busineshuboffline CHATGTP\Master\Core"
    "FABRIKAGE_LOGS" = "D:\busineshuboffline CHATGTP\Master\Logs"
    "FABRIKAGE_CONFIG" = "D:\busineshuboffline CHATGTP\Master\Config"
    "NODE_PATH" = "D:\busineshuboffline CHATGTP\Master\AI_Integration\node_modules"
}

# Set environment variables at user level
foreach ($var in $envVars.GetEnumerator()) {
    [System.Environment]::SetEnvironmentVariable($var.Key, $var.Value, [System.EnvironmentVariableTarget]::User)
    Write-Host "Set $($var.Key) = $($var.Value)"
}

# Add to system PATH if not already present
$path = [System.Environment]::GetEnvironmentVariable("Path", [System.EnvironmentVariableTarget]::User)
$fabrikageBin = "D:\busineshuboffline CHATGTP\Master\Core\Scripts"

if ($path -notlike "*$fabrikageBin*") {
    $newPath = $path + ";$fabrikageBin"
    [System.Environment]::SetEnvironmentVariable("Path", $newPath, [System.EnvironmentVariableTarget]::User)
    Write-Host "Added $fabrikageBin to PATH"
}

Write-Host "`nEnvironment setup complete. Please restart any open terminals for changes to take effect."
