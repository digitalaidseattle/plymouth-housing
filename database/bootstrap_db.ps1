# Make sure you set your connection string first, like so.
# $env:DATABASE_CONNECTION_STRING='Server=localhost\SQLEXPRESS;Database=master;Persist Security Info=False;Integrated Security=SSPI;TrustServerCertificate=True;'
#
# This script creates the Inventory database and applies the SQL scripts from the database folder.
Import-Module SqlServer

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
    $scriptText = Get-Content -Path $FilePath -Raw
    # Split SQL batches on GO statements.
    # Note: This splitter only supports GO appearing by itself on a line.
    # It does not support sqlcmd syntax such as:
    #   GO 5
    #   GO -- comment
    # If future scripts require those features, use Invoke-Sqlcmd instead.
    $batches = $scriptText -split '(?mi)^\s*GO\s*$'

    $connection = [Microsoft.Data.SqlClient.SqlConnection]::new($ConnectionString)
    $connection.Open()

    try {
        foreach ($batch in $batches) {
            $trimmedBatch = $batch.Trim()
            if ([string]::IsNullOrWhiteSpace($trimmedBatch)) {
                continue
            }

            $command = $connection.CreateCommand()
            $command.CommandText = $trimmedBatch
            $command.CommandTimeout = 600
            $command.ExecuteNonQuery() | Out-Null
        }
    }
    finally {
        $connection.Close()
        $connection.Dispose()
    }

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
    Write-Host "All done."
}
catch {
    Write-Host "An error occurred : $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}


