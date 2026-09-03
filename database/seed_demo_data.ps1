# Local dev only. Seeds ~60 fictional demo residents, a couple of "needs
# review" stock levels, and demo transaction history, so the Admin Analytics
# page has something to show in a local environment. Re-runnable: the first
# script in database/data_demo/ wipes the previous demo run before reseeding.
#
# Make sure you set your connection string first, like so.
# $env:DATABASE_CONNECTION_STRING='Server=localhost\SQLEXPRESS;Database=master;Persist Security Info=False;Integrated Security=SSPI;TrustServerCertificate=True;'
#
# Then run:
#   ./database/seed_demo_data.ps1
#
# This only ever runs against a local SQL Server instance -- it refuses to
# run if the connection string's Data Source doesn't look local, and there is
# no bypass flag.
Import-Module SqlServer -ErrorAction Stop

if (-not $env:DATABASE_CONNECTION_STRING) {
    throw 'Please set $env:DATABASE_CONNECTION_STRING before running this script.'
}

function Assert-LocalDataSource {
    param([string]$ConnectionString)

    $builder = [Microsoft.Data.SqlClient.SqlConnectionStringBuilder]::new($ConnectionString)
    $dataSource = $builder['Data Source']

    # Accept only data sources that clearly point at a local SQL Server
    # instance: localhost, ., (local), 127.0.0.1, and machine-local named
    # instances of those (e.g. localhost\SQLEXPRESS, .\SQLEXPRESS,
    # (local)\SQLEXPRESS). Anything else -- e.g. *.database.windows.net --
    # is refused. There is deliberately no override for this check.
    $isLocal =
        ($dataSource -match '^(localhost|127\.0\.0\.1|\.)(\\.+)?$') -or
        ($dataSource -match '^\(local\)(\\.+)?$')

    if (-not $isLocal) {
        throw "The demo seeder is local-dev only. Data Source '$dataSource' does not look like a local SQL Server instance (expected localhost, ., (local), 127.0.0.1, or a \SQLEXPRESS-style local named instance). Refusing to run."
    }
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
        [string]$ConnectionString
    )

    Write-Host "Processing Folder: $Folder" -ForegroundColor Green
    Get-ChildItem -Path $Folder | Sort-Object Name | ForEach-Object {
        Invoke-SqlScriptFile -FilePath $_.FullName -ConnectionString $ConnectionString
    }
}

try {
    Assert-LocalDataSource -ConnectionString $env:DATABASE_CONNECTION_STRING

    $inventoryConnectionString = Get-ConnectionStringForDatabase -DatabaseName 'Inventory'

    Write-Host "Seeding demo data" -ForegroundColor Green
    Invoke-Scripts-In-Folder -Folder "./database/data_demo/" -ConnectionString $inventoryConnectionString
    Write-Host "All done."
}
catch {
    Write-Host "An error occurred : $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
