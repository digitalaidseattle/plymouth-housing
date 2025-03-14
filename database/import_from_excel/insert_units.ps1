function Get-BuildingId {
    param (
        [string]$code
    )

    $BuildingMap = @{
        'ALM' = 1
        'BKH' = 2
        'CAM' = 3
        'COL' = 4
        'HUM' = 5
        'KBP' = 6
        'PCR' = 7
        'PFH' = 8
        'PPL' = 9
        'PST' = 10
        'SGO/LEW' = 11
        'SIM' = 12
        'SYL' = 13
        'TFT' = 14
        'WIL' = 15
    }

    return $BuildingMap[$code]
}

try {
    # Create Excel COM object
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = $false

    # Open workbook and select Sheet1 sheet
    $workbook = $excel.Workbooks.Open("$PSScriptRoot\All_Buildings_All_Units.xlsx")
    $worksheet = $workbook.Worksheets("Sheet1")

    # Get used range
    $usedRange = $worksheet.UsedRange
    $lastRow = $usedRange.Rows.Count
    $lastColumn = $usedRange.Columns.Count

    # Initialize output string
    $output = "DELETE FROM Units;`nGO`n`n"

    # Iterate through columns (building codes)
    for ($col = 1; $col -le $lastColumn; $col++) {
        # Get building code from column header
        $buildingCode = $worksheet.Cells.Item(1, $col).Text
        $buildingId = Get-BuildingId -code $buildingCode

        # Iterate through rows (unit numbers)
        for ($row = 2; $row -le $lastRow; $row++) {
            # Get unit number from cell
            $unitNumber = $worksheet.Cells.Item($row, $col).Text

            # Check if unit number is empty
            if (-not [string]::IsNullOrEmpty($unitNumber)) {
                # Create SQL insert statement
                $output += "INSERT INTO Units (building_id, unit_number) VALUES ($buildingId, '$unitNumber');`n"
            }
        }
    }

    $output += "GO`n"

    # Save to file
    $output | Out-File "$PSScriptRoot\unit_data.sql" -Encoding UTF8

}
finally {
    # Release COM objects
    if ($workbook) {
        $workbook.Close($false)
        [System.Runtime.Interopservices.Marshal]::ReleaseComObject($workbook)
    }
    if ($excel) {
        $excel.Quit()
        [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel)
    }
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()
}