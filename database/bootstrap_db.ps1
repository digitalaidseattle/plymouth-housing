# Make sure you set your connection string first, like so.
# $env:DATABASE_CONNECTION_STRING='Server=localhost\SQLEXPRESS;Database=master;Persist Security Info=False;Integrated Security=SSPI;TrustServerCertificate=True;'
#
# This script creates the Inventory database and applies the SQL scripts from the database folder.
#
#   ./database/bootstrap_db.ps1                        schema and reference data
#   ./database/bootstrap_db.ps1 -SeedDemoData          the same, plus analytics demo history
#   ./database/bootstrap_db.ps1 -CreateAnalyticsUser   the same, plus the Ask the Data login
param(
    # Local dev only: fictional residents and a year of checkout history.
    [switch]$SeedDemoData,

    # The read-only login the Ask the Data card connects as.
    [switch]$CreateAnalyticsUser
)
Import-Module SqlServer -ErrorAction Stop

if (-not $env:DATABASE_CONNECTION_STRING) {
    throw 'Please set $env:DATABASE_CONNECTION_STRING before running this script.'
}

# Checked now, so a missing password fails before a full rebuild rather than after.
if ($CreateAnalyticsUser -and -not $env:ASK_DATA_PASSWORD) {
    throw 'Please set $env:ASK_DATA_PASSWORD before running with -CreateAnalyticsUser.'
}

# Sits in data_seed with the reference data, but is skipped unless asked for.
$demoDataScript = 'analytics_demo_data.sql'

function Get-ConnectionStringForDatabase {
    param([string]$DatabaseName)

    $builder = [Microsoft.Data.SqlClient.SqlConnectionStringBuilder]::new($env:DATABASE_CONNECTION_STRING)
    $builder['Initial Catalog'] = $DatabaseName
    return $builder.ConnectionString
}

function Assert-LocalDataSource {
    param([string]$ConnectionString)

    $builder = [Microsoft.Data.SqlClient.SqlConnectionStringBuilder]::new($ConnectionString)
    $dataSource = $builder['Data Source']

    # localhost, ., (local), 127.0.0.1, and named instances of those. Anything
    # else, such as *.database.windows.net, is refused, with no override.
    $isLocal =
        ($dataSource -match '^(localhost|127\.0\.0\.1|\.)(\\.+)?$') -or
        ($dataSource -match '^\(local\)(\\.+)?$')

    if (-not $isLocal) {
        throw "Demo data is local-dev only, and Data Source '$dataSource' is not local. Expected localhost, ., (local), 127.0.0.1, or a named instance of one."
    }
}

function Invoke-SqlScriptFile {
    param(
        [Parameter(Mandatory = $true)]
        [string]$FilePath,
        [Parameter(Mandatory = $true)]
        [string]$ConnectionString,
        # sqlcmd variables, as "NAME=value", for scripts that take one.
        [string[]]$Variables = @()
    )

    if (-not (Test-Path $FilePath)) {
        Write-Host "- skipping $FilePath (not found)" -ForegroundColor Yellow
        return
    }

    $options = @{}
    if ($Variables.Count -gt 0) { $options['Variable'] = $Variables }

    Write-Host "- running $FilePath" -ForegroundColor Blue
    Invoke-Sqlcmd -InputFile $FilePath -ConnectionString $ConnectionString -QueryTimeout 600 -Verbose -ErrorAction Stop @options
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
        # Checked here, not at the top: bootstrapping staging is fine, seeding it is not.
        Assert-LocalDataSource -ConnectionString $env:DATABASE_CONNECTION_STRING
        Write-Host "Seeding analytics demo data" -ForegroundColor Green
        Invoke-SqlScriptFile -FilePath "./database/data_seed/$demoDataScript" -ConnectionString $inventoryConnectionString
    }

    if ($CreateAnalyticsUser) {
        # Last, because it grants SELECT on tables that have to exist first.
        Write-Host "Creating the read-only analytics login" -ForegroundColor Green
        Invoke-SqlScriptFile -FilePath "./database/create_analytics_db_user.sql" -ConnectionString $masterConnectionString -Variables @("ASK_DATA_PASSWORD=$($env:ASK_DATA_PASSWORD)")
    }

    Write-Host "All done."
}
catch {
    Write-Host "An error occurred : $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}


