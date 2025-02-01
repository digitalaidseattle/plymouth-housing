# Update Inventory

Below are prompts for ChatGPT that create Powershell scripts to get the data out of the PH provided Excel sheet into the database. 

You should execute these prompts in VS Copilot. 
The results are created in the [database folder /import_from_excel](../../database/import_from_excel).
Make sure you check the results before copying them over. 
ChatGPT makes mistakes!

## Categories

You need to give the prompt:

- PSC_Inventory.xlsx
- category_data.sql

```
write a powershell script that creates a SQL insert statement for the Categories.sql table. Use the Floor Inventory tab from the excel sheet. Get the unique values out of the category column. The value between brackets is the checkout_limit for that category. At the end, insert a category called "Welcome Basket".
```

The resulting file is [create_categories.ps1](../../database/import_from_excel/create_categories.ps1). Out of precaution it will first create the [category_data.sql](../../database/import_from_excel/category_data.sql) file in the local folder, so you can compare it with the original.

## Inventory

### General

You need to give it:

- PSC_Inventory.xlsx
- inventory.sql
- 

```
write a powershell script that creates a SQL insert statement for the inventory.sql table. Use the Floor Inventory tab from the excel sheet. Replace the category column from the sheet with the number found in catagory_data. All types need to be General.
```

The resulting file is [insert_inventory.ps1](../../database/import_from_excel/insert_inventory.ps1). Out of precaution it will first create the [inventory_data.sql](../../database/import_from_excel/inventory_data.sql) file in the local folder, so you can compare it with the original.

### Welcome Basket

You need to give it:

- PSC_Inventory.xlsx
- inventory.sql
- 

```
write a powershell script that creates a SQL insert statement for the inventory.sql table. Use the "Welcome basket Inventory" tab from the excel sheet. Set the category column to 14.  All types need to be "Welcome Basket". The quantity should be "actual amount on hand" column. items_per_basket is the "Quantity per basket" column. Generate a random value between 1-10 for low, and between 11-20 for medium. 
```