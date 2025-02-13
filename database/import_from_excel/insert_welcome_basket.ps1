try {
    # Create Excel COM object
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = $false
    
    # Open workbook and select Welcome basket sheet
    $workbook = $excel.Workbooks.Open("$PSScriptRoot\PSC_inventory.xlsx")
    $worksheet = $workbook.Worksheets("Welcome basket Inventory")
    
    # Get used range
    $usedRange = $worksheet.UsedRange
    $lastRow = $usedRange.Rows.Count
    
    # Create SQL file
    $output = "-- Welcome Basket Items`n"
    $output += "INSERT INTO Items (name, type, category_id, quantity, low, medium, items_per_basket, description) VALUES`n"
    
    # Process each row
    for ($row = 2; $row -le $lastRow; $row++) {
        $name = $worksheet.Cells($row, 1).Text
        $quantity = $worksheet.Cells($row, 4).Text
        $itemsPerBasket = $worksheet.Cells($row, 5).Text
        
        if ($name) {
            $low = Get-Random -Minimum 1 -Maximum 11
            $medium = Get-Random -Minimum 11 -Maximum 21
            
            # Escape single quotes in strings
            $name = $name.Replace("'", "''")
            
            $output += "('$name', 'Welcome Basket', 14, $quantity, $low, $medium, $itemsPerBasket, NULL),`n"
        }
    }
    
    # Remove last comma and add GO statement
    $output = $output.TrimEnd(",`n")
    $output += ";`nGO"
    
    # Save to file
    $output | Out-File "$PSScriptRoot\welcome_basket_data.sql" -Encoding UTF8
    
} finally {
    if ($workbook) {
        $workbook.Close($false)
    }
    if ($excel) {
        $excel.Quit()
        [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel)
    }
}