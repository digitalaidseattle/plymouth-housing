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

function Invoke-SqlFileIfExists {
    param([string]$FilePath)
    if (Test-Path $FilePath) {
        Write-Host "- running $FilePath" -ForegroundColor Blue
        Invoke-Sqlcmd -InputFile $FilePath -ConnectionString $env:DATABASE_CONNECTION_STRING -ErrorAction Stop
        Write-Host "    - done"
    }
    else {
        Write-Host "- skipping $FilePath (not found)" -ForegroundColor Yellow
    }
}

try {
    # These have to be executed in order. Run cleanup first.
    Invoke-Scripts-In-Folder -Folder "./database/cleanup/"

    # Run table creation in explicit order to respect FK dependencies.
    Write-Host "Processing Tables in explicit order" -ForegroundColor Green
    $tablesOrder = @(
        "./database/tables/building.sql",
        "./database/tables/unit.sql",
        "./database/tables/residents.sql",
        "./database/tables/user.sql",
        "./database/tables/category.sql",
        "./database/tables/inventory.sql",
        "./database/tables/tracking.sql",
        "./database/tables/transaction_type.sql",
        "./database/tables/transaction.sql",
        "./database/tables/transaction_item.sql"
    )
    foreach ($f in $tablesOrder) { Invoke-SqlFileIfExists $f }

    # Now run dependency constraints and other artifacts
    Invoke-Scripts-In-Folder -Folder "./database/dependencies/"
    Invoke-Scripts-In-Folder -Folder "./database/types/"
    Invoke-Scripts-In-Folder -Folder "./database/procedures/"
    Invoke-Scripts-In-Folder -Folder "./database/views/"
    Invoke-Scripts-In-Folder -Folder "./database/data_seed/"
    Invoke-Scripts-In-Folder -Folder "./database/data_test/"
    Write-Host "All done."
}
catch {
    Write-Host "An error occurred : $($_.Exception.Message)" -ForegroundColor Red
}


