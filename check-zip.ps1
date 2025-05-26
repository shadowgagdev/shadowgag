# Check ZIP file contents
Add-Type -AssemblyName System.IO.Compression.FileSystem

$zipPath = "shadowgag-firefox-v1.0.zip"
if (Test-Path $zipPath) {
    Write-Host "Contents of ${zipPath}:" -ForegroundColor Green
    $zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
    foreach ($entry in $zip.Entries) {
        Write-Host "  $($entry.FullName)" -ForegroundColor Cyan
    }
    $zip.Dispose()
} else {
    Write-Host "ZIP file not found: $zipPath" -ForegroundColor Red
} 