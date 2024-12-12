# Make sure you set your connection string first, like so. 
# $env:DATABASE_CONNECTION_STRING=Server=CUDA-BOX\SQLEXPRESS;Database=Inventory;Persist Security Info=False;Integrated Security=SSPI;TrustServerCertificate=True;
# 
# This is a test script you can run. 
# Invoke-Sqlcmd -Query "SELECT COUNT(*) AS Count FROM Items" -ConnectionString $env:DATABASE_CONNECTION_STRING
#

function Run-Scripts-In-Folder {
    param(
        [string]$Folder
    )
    Write-Host "Processing $Folder"
    Get-ChildItem -Path $Folder | ForEach-Object {
        Invoke-Sqlcmd -InputFile $_.FullName -ConnectionString $env:DATABASE_CONNECTION_STRING | Out-File -FilePath "bootstrap_db_results.rpt"
        Write-Host "- executed $_"
    }
}

Run-Scripts-In-Folder -Folder "./database/tables/"
Run-Scripts-In-Folder -Folder "./database/procedure/"
Run-Scripts-In-Folder -Folder "./database/testdata/"

Write-Host "All done."


