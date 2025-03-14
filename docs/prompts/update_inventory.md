# Update Database from Excel

These instructions detail how to generate SQL scripts from the provided Excel spreadsheet (`PSC_Inventory.xlsx`) to update the database.  After the application is in production, these scripts should no longer be needed, as the application will become the source of truth.  The PowerShell scripts are located in the [database/import_from_excel](../../database/import_from_excel) directory.

## Important Considerations (Known Issues)

Before generating the SQL scripts, be aware of these potential issues in the Excel spreadsheet:

*   **Welcome Basket Inventory Tab:** The "quantity per basket" column should have all rows set to `0` *after* SQL generation but *before* running `bootstrap_db.sql`.
*   **Actual amount on hand:** Replace any "N/A" values in the "Actual amount on hand" column with `9999`.
*   **Floor Inventory Tab:** Remove any total rows at the end of the "Floor Inventory" tab before executing the SQL.
*   **Category "décor":** There may be issues with the "décor" category.  Review the generated SQL carefully.
*   **General:** Always review the generated SQL scripts for any necessary adjustments before applying them to the database. Use source control (VS Copilot add-in) to compare changes.

## Generating SQL Scripts

The following sections provide prompts for generating PowerShell scripts using VS Copilot. These scripts extract data from `PSC_Inventory.xlsx` and create `.sql` files. The scripts will be created in the [database/import_from_excel](../../database/import_from_excel) directory. A `*_data.sql` file will be created in the local directory for review before copying to the `data_seed` folder.

### 1. Categories (`category.sql`)

**Prompt:**
Write a PowerShell script that generates SQL `INSERT` statements for the `Categories.sql` table. The data should be extracted from the "Floor Inventory" tab of the provided Excel sheet. Follow these rules:

- Extract unique values from the `Category` column.
- The number inside parentheses `()` in the `Category` column represents the `checkout_limit` for that category.
- At the end of the script, insert an additional category named "Welcome Basket" with a `checkout_limit` of `1`.

The resulting file is [create_categories.ps1](../../database/import_from_excel/create_categories.ps1). Out of precaution it will first create the [category_data.sql](../../database/import_from_excel/category_data.sql) file in the local folder, so you can compare it with the original.

### 2. Inventory (`inventory.sql`)

#### General

**Prompt:**
Write a PowerShell script that generates SQL `INSERT` statements for the `inventory.sql` table. The data should be extracted from the "Floor Inventory" tab of the provided Excel sheet. Use the following mappings:
- Set the `category` column to the corresponding number from `category_data.sql`.
- Set `type` to `"General"` for all entries.
- Use the `"quantity"` column for the `quantity` field.
- Generate a random value between `1-10` for `low` and between `11-20` for `medium`.

The resulting file is [insert_inventory.ps1](../../database/import_from_excel/insert_inventory.ps1). Out of precaution it will first create the [inventory_data.sql](../../database/import_from_excel/inventory_data.sql) file in the local folder, so you can compare it with the original.

#### Welcome Basket

**Prompt:**
Write a PowerShell script that generates SQL `INSERT` statements for the `inventory.sql` table. The data should be extracted from the "Welcome Basket Inventory" tab of the provided Excel sheet. Use the following mappings:
- Set the `category` column to `14` for all entries.
- Set `type` to `"Welcome Basket"` for all entries.
- Use the `"Actual amount on hand"` column for the `quantity` field.
- Use the `"Quantity per basket"` column for `items_per_basket`.
- Generate a random value between `1-10` for `low` and between `11-20` for `medium`.