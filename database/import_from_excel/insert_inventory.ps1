function Get-CategoryId {
    param (
        [string]$category
    )
    
    $categoryMap = @{
        'Bathroom' = 5
        'Bedding' = 8
        'Cleaning' = 11
        'Jacket' = 13
        'Food' = 6
        'Home goods' = 1
        'Miscellaneous' = 4
        'Personal care' = 10
        'Harm reduction' = 7
        'Kitchen' = 3
        'Appliance' = 2
        'Décor' = 9
        'Garments' = 12
    }
    
    # Remove anything after parenthesis and trim
    $cleanCategory = $category -replace '\s*\(.*\)', ''
    $cleanCategory = $cleanCategory.Trim()
    
    return $categoryMap[$cleanCategory]
}

try {
    # Create Excel COM object
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = $false
    
    # Open workbook and select Floor Inventory sheet
    $workbook = $excel.Workbooks.Open("$PSScriptRoot\PSC_inventory.xlsx")
    $worksheet = $workbook.Worksheets("Floor Inventory")
    
    # Get used range
    $usedRange = $worksheet.UsedRange
    $lastRow = $usedRange.Rows.Count
    
    # Create SQL file
    $output = "DELETE FROM Items;`nGO`n`n"
    $output += "INSERT INTO Items (name, type, category_id, quantity, low, medium, description) VALUES`n"
    
    # Process each row
    for ($row = 2; $row -le $lastRow; $row++) {
        $name = $worksheet.Cells($row, 2).Text
        $category = $worksheet.Cells($row, 1).Text
        $quantity = $worksheet.Cells($row, 5).Text
        $description = $worksheet.Cells($row, 6).Text
        
        if ($name) {
            $categoryId = Get-CategoryId -category $category
            $low = Get-Random -Minimum 1 -Maximum 11
            $medium = Get-Random -Minimum 10 -Maximum 31
            
            # Escape single quotes in strings
            $name = $name.Replace("'", "''")
            $description = $description.Replace("'", "''")
            
            $output += "('$name', 'General', $categoryId, $quantity, $low, $medium, '$description'),`n"
        }
    }
    
    # Remove last comma and add GO statement
    $output = $output.TrimEnd(",`n")
    $output += ";`nGO"
    
    # Save to file
    $output | Out-File "$PSScriptRoot\inventory_data.sql" -Encoding UTF8
    
} finally {
    $workbook.Close($false)
    $excel.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel)
}