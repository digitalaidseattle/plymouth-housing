# Update Inventory

Below are prompts for ChatGPT that create Powershell scripts to get the data out of the PH provided Excel sheet into the database. 

You should execute these prompts in VS Copilot. 
The results are created in the [database folder /import_from_excel](../../database/import_from_excel).
Make sure you check the results before copying them over. 
ChatGPT makes mistakes!

## Categories

You need to give the prompt:

- PSC_Inventory.xlsx
- category.sql

--------
Write a PowerShell script that generates SQL `INSERT` statements for the `Categories.sql` table. The data should be extracted from the "Floor Inventory" tab of the provided Excel sheet. Follow these rules:

- Extract unique values from the `Category` column.
- The number inside parentheses `()` in the `Category` column represents the `checkout_limit` for that category.
- At the end of the script, insert an additional category named "Welcome Basket" with a `checkout_limit` of `1`.

-------------

The resulting file is [create_categories.ps1](../../database/import_from_excel/create_categories.ps1). Out of precaution it will first create the [category_data.sql](../../database/import_from_excel/category_data.sql) file in the local folder, so you can compare it with the original.

## Inventory

### General

You need to give it:

- PSC_Inventory.xlsx
- category_data.sql
- inventory.sql

Script:

---------------
Write a PowerShell script that generates SQL `INSERT` statements for the `inventory.sql` table. The data should be extracted from the "Floor Inventory" tab of the provided Excel sheet. Use the following mappings:
- Set the `category` column to the corresponding number from `category_data.sql`.
- Set `type` to `"General"` for all entries.
- Use the `"quantity"` column for the `quantity` field.
- Generate a random value between `1-10` for `low` and between `11-20` for `medium`.
----------------------


The resulting file is [insert_inventory.ps1](../../database/import_from_excel/insert_inventory.ps1). Out of precaution it will first create the [inventory_data.sql](../../database/import_from_excel/inventory_data.sql) file in the local folder, so you can compare it with the original.

### Welcome Basket

You need to give it:

- PSC_Inventory.xlsx
- inventory.sql
- 

---------------
Write a PowerShell script that generates SQL `INSERT` statements for the `inventory.sql` table. The data should be extracted from the "Welcome Basket Inventory" tab of the provided Excel sheet. Use the following mappings:
- Set the `category` column to `14` for all entries.
- Set `type` to `"Welcome Basket"` for all entries.
- Use the `"Actual amount on hand"` column for the `quantity` field.
- Use the `"Quantity per basket"` column for `items_per_basket`.
- Generate a random value between `1-10` for `low` and between `11-20` for `medium`.
----------------------