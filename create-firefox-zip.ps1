# PowerShell script to create Firefox extension ZIP with proper path separators
# This ensures compatibility with Firefox Add-ons store

Write-Host "Creating Firefox extension ZIP..." -ForegroundColor Green

# Check if firefox directory exists
$firefoxDir = Join-Path $PSScriptRoot "firefox"
if (-not (Test-Path $firefoxDir)) {
    Write-Error "Firefox directory not found. Run build-firefox.js first."
    exit 1
}

# Get version from manifest
$manifestPath = Join-Path $firefoxDir "manifest.json"
if (-not (Test-Path $manifestPath)) {
    Write-Error "Firefox manifest.json not found."
    exit 1
}

$manifest = Get-Content $manifestPath | ConvertFrom-Json
$version = $manifest.version
$zipName = "shadowgag-firefox-v$version.zip"
$zipPath = Join-Path $PSScriptRoot $zipName

# Remove existing zip if it exists
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
    Write-Host "Removed existing ZIP file" -ForegroundColor Yellow
}

# Create ZIP using .NET compression with proper path handling
Add-Type -AssemblyName System.IO.Compression.FileSystem

try {
    # Create the zip file
    $zip = [System.IO.Compression.ZipFile]::Open($zipPath, 'Create')
    
    # Get all files in firefox directory recursively
    $files = Get-ChildItem -Path $firefoxDir -Recurse -File
    
    foreach ($file in $files) {
        # Calculate relative path from firefox directory
        $relativePath = $file.FullName.Substring($firefoxDir.Length + 1)
        
        # Convert Windows backslashes to forward slashes for Firefox compatibility
        $entryName = $relativePath.Replace('\', '/')
        
        Write-Host "Adding: $entryName" -ForegroundColor Cyan
        
        # Add file to zip with proper entry name
        $entry = $zip.CreateEntry($entryName)
        $entryStream = $entry.Open()
        $fileStream = [System.IO.File]::OpenRead($file.FullName)
        
        $fileStream.CopyTo($entryStream)
        
        $fileStream.Close()
        $entryStream.Close()
    }
    
    $zip.Dispose()
    
    Write-Host "Successfully created: $zipName" -ForegroundColor Green
    
    # Show file size
    $zipSize = (Get-Item $zipPath).Length
    $zipSizeKB = [math]::Round($zipSize / 1024, 1)
    Write-Host "ZIP size: $zipSizeKB KB" -ForegroundColor Green
    
    Write-Host "Location: $zipPath" -ForegroundColor Green
    Write-Host "Ready for Firefox Add-ons submission!" -ForegroundColor Green
    
} catch {
    Write-Error "Failed to create ZIP file: $($_.Exception.Message)"
    if ($zip) {
        $zip.Dispose()
    }
    exit 1
} 