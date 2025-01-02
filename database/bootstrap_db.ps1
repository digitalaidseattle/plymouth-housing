# Make sure you set your connection string first, like so. 
# $env:DATABASE_CONNECTION_STRING=Server=CUDA-BOX\SQLEXPRESS;Database=Inventory;Persist Security Info=False;Integrated Security=SSPI;TrustServerCertificate=True;
# 
# This is a test script you can run. 
# Invoke-Sqlcmd -Query "SELECT COUNT(*) AS Count FROM Items" -ConnectionString $env:DATABASE_CONNECTION_STRING
#

function Invoke-Scripts-In-Folder {
    param([string]$Folder)
    Write-Host "Processing Folder: $Folder" -ForegroundColor Green
    Get-ChildItem -Path $Folder | ForEach-Object {
        Write-Host "- running $_" -ForegroundColor Blue
        Invoke-Sqlcmd -InputFile $_.FullName -ConnectionString $env:DATABASE_CONNECTION_STRING -ErrorAction Stop
        Write-Host "    - done"
    }
}

try {
    # These have to be executed in order, hence you can't loop through them. 
    Invoke-Scripts-In-Folder -Folder "./database/cleanup/"
    Invoke-Scripts-In-Folder -Folder "./database/tables/"
    Invoke-Scripts-In-Folder -Folder "./database/dependencies/"
    Invoke-Scripts-In-Folder -Folder "./database/types/"
    Invoke-Scripts-In-Folder -Folder "./database/procedures/"
    Invoke-Scripts-In-Folder -Folder "./database/data_seed/"
    Invoke-Scripts-In-Folder -Folder "./database/data_test/"
    Write-Host "All done."
}
catch {
    Write-Host "An error occurred : $($_.Exception.Message)" -ForegroundColor Red
}


