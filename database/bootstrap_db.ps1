# Make sure you set your connection string first, like so.
# $env:DATABASE_CONNECTION_STRING='Server=localhost\SQLEXPRESS;Database=master;Persist Security Info=False;Integrated Security=SSPI;TrustServerCertificate=True;'
#
# This script creates the Inventory database and applies the SQL scripts from the database folder.
#
#   ./database/bootstrap_db.ps1                 schema and reference data
#   ./database/bootstrap_db.ps1 -SeedDemoData   the same, plus analytics demo history
param(
    # Local dev only: fictional residents and a year of checkout history, so the
    # Admin Analytics page has something to show.
    [switch]$SeedDemoData
)
Import-Module SqlServer -ErrorAction Stop

# Opt-in, so a plain rebuild stays fast and never picks up fictional rows.
$demoDataScript = 'analytics_demo_data.sql'

if (-not $env:DATABASE_CONNECTION_STRING) {
    throw 'Please set $env:DATABASE_CONNECTION_STRING before running this script.'
}

function Get-ConnectionStringForDatabase {
    param([string]$DatabaseName)

    $builder = [Microsoft.Data.SqlClient.SqlConnectionStringBuilder]::new($env:DATABASE_CONNECTION_STRING)
    $builder['Initial Catalog'] = $DatabaseName
    return $builder.ConnectionString
}

function Invoke-SqlScriptFile {
    param(
        [Parameter(Mandatory = $true)]
        [string]$FilePath,
        [Parameter(Mandatory = $true)]
        [string]$ConnectionString
    )

    if (-not (Test-Path $FilePath)) {
        Write-Host "- skipping $FilePath (not found)" -ForegroundColor Yellow
        return
    }

    Write-Host "- running $FilePath" -ForegroundColor Blue
    Invoke-Sqlcmd -InputFile $FilePath -ConnectionString $ConnectionString -QueryTimeout 600 -Verbose -ErrorAction Stop
    Write-Host "    - done"
}

function Invoke-Scripts-In-Folder {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Folder,
        [Parameter(Mandatory = $true)]
        [string]$ConnectionString,
        [string[]]$Skip = @()
    )

    Write-Host "Processing Folder: $Folder" -ForegroundColor Green
    Get-ChildItem -Path $Folder | Where-Object { $Skip -notcontains $_.Name } | Sort-Object Name | ForEach-Object {
        Invoke-SqlScriptFile -FilePath $_.FullName -ConnectionString $ConnectionString
    }
}

try {
    $masterConnectionString = Get-ConnectionStringForDatabase -DatabaseName 'master'
    $inventoryConnectionString = Get-ConnectionStringForDatabase -DatabaseName 'Inventory'

    Write-Host "Creating database" -ForegroundColor Green
    Invoke-SqlScriptFile -FilePath "./database/create_db.sql" -ConnectionString $masterConnectionString

    Write-Host "Processing Tables" -ForegroundColor Green
    Invoke-Scripts-In-Folder -Folder "./database/tables/" -ConnectionString $inventoryConnectionString

    # Now run dependency constraints and other artifacts
    Invoke-Scripts-In-Folder -Folder "./database/dependencies/" -ConnectionString $inventoryConnectionString
    Invoke-Scripts-In-Folder -Folder "./database/types/" -ConnectionString $inventoryConnectionString
    Invoke-Scripts-In-Folder -Folder "./database/procedures/" -ConnectionString $inventoryConnectionString
    Invoke-Scripts-In-Folder -Folder "./database/views/" -ConnectionString $inventoryConnectionString
    Invoke-Scripts-In-Folder -Folder "./database/data_seed/" -ConnectionString $inventoryConnectionString -Skip $demoDataScript
    Invoke-Scripts-In-Folder -Folder "./database/data_test/" -ConnectionString $inventoryConnectionString

    if ($SeedDemoData) {
        Write-Host "Seeding analytics demo data" -ForegroundColor Green
        Invoke-SqlScriptFile -FilePath "./database/data_seed/$demoDataScript" -ConnectionString $inventoryConnectionString
    }

    Write-Host "All done."
}
catch {
    Write-Host "An error occurred : $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}


