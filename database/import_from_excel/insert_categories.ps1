function Get-UniqueExcelValues {
    param (
        [Parameter(Mandatory=$true)]
        [string]$FilePath,
        [Parameter(Mandatory=$true)]
        [string]$ColumnName,
        [string]$SheetName = "Floor Inventory"
    )
    
    try {
        $excel = New-Object -ComObject Excel.Application
        $excel.Visible = $false
        $excel.DisplayAlerts = $false

        $workbook = $excel.Workbooks.Open("$PSScriptRoot\$FilePath")
        $worksheet = $workbook.Worksheets($SheetName)
        
        # Find category column
        $header = $worksheet.Range("A1:ZZ1")
        $column = $null
        for ($i = 1; $i -le $header.Columns.Count; $i++) {
            if ($header.Cells(1, $i).Text -eq $ColumnName) {
                $column = $i
                break
            }
        }
        
        if (-not $column) {
            throw "Column '$ColumnName' not found"
        }

        # Get unique categories with limits
        $categories = @{}
        $usedRange = $worksheet.UsedRange
        $lastRow = $usedRange.Rows.Count

        for ($row = 2; $row -le $lastRow; $row++) {
            $value = $worksheet.Cells($row, $column).Text
            if ($value) {
                if ($value -match '(.*?)\s*\((\d+)\)') {
                    $categoryName = $matches[1].Trim()
                    $limit = $matches[2]
                    $categories[$categoryName] = $limit
                }
            }
        }

        # Generate SQL
        $sql = "DELETE FROM [Categories];`nGO`n`n"
        $sql += "SET IDENTITY_INSERT Categories ON;`n`n"
        $sql += "INSERT INTO Categories (id, Name, Checkout_Limit) VALUES`n"
        
        $id = 1
        foreach ($category in $categories.GetEnumerator()) {
            $sql += "($id, '$($category.Key)', $($category.Value)),`n"
            $id++
        }
        

        $sql += "(15, 'Welcome Basket', 1);"
        $sql += "`n`nSET IDENTITY_INSERT Categories OFF;`nGO"
        
        # Save to file
        $sql | Out-File "$PSScriptRoot\category_data.sql" -Encoding UTF8

    } finally {
        if ($workbook) {
            $workbook.Close($false)
        }
        if ($excel) {
            $excel.Quit()
            [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel)
        }
    }
}

# Execute
Get-UniqueExcelValues -FilePath "PSC_inventory.xlsx" -ColumnName "Category"