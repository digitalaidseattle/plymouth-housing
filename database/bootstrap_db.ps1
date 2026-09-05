# Make sure you set your connection string first, like so.
# $env:DATABASE_CONNECTION_STRING='Server=localhost\SQLEXPRESS;Database=master;Persist Security Info=False;Integrated Security=SSPI;TrustServerCertificate=True;'
#
# This script creates the Inventory database and applies the SQL scripts from the database folder.
Import-Module SqlServer -ErrorAction Stop

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
        [string]$ConnectionString
    )

    Write-Host "Processing Folder: $Folder" -ForegroundColor Green
    Get-ChildItem -Path $Folder | Sort-Object Name | ForEach-Object {
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
    Invoke-Scripts-In-Folder -Folder "./database/data_seed/" -ConnectionString $inventoryConnectionString
    Invoke-Scripts-In-Folder -Folder "./database/data_test/" -ConnectionString $inventoryConnectionString

    # Last, because it grants SELECT on tables that have to exist first.
    Write-Host "Creating the read-only analytics login" -ForegroundColor Green
    if ($env:ASK_DATA_PASSWORD) {
        Invoke-SqlScriptFile -FilePath "./database/create_analytics_db_user.sql" -ConnectionString $masterConnectionString -Variables @("ASK_DATA_PASSWORD=$($env:ASK_DATA_PASSWORD)")
    }
    else {
        Write-Host "- skipping (set `$env:ASK_DATA_PASSWORD to create the Ask the Data login)" -ForegroundColor Yellow
    }

    Write-Host "All done."
}
catch {
    Write-Host "An error occurred : $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}


