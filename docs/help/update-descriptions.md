# Updating Item Descriptions in Azure SQL Database

This guide provides instructions on how to update the description of a specific item in your Azure SQL database using the Azure portal.

## Scenario

Let's say you want to add "cooking sheet" to the description of the "baking pan/dish" item.

## Steps

1.  **Connect to SQL:**

    *   As described [here](./connect-sql.md).

2.  **Write the UPDATE SQL Script:**

    *   In the query editor, write one of the following SQL `UPDATE` scripts.  Modify the `WHERE` clause to match the item you want to update.

    **Option 1: Replace the entire description**

    ```sql
    -- SQL UPDATE script to update the description of an item (replace existing)
    UPDATE Items
    SET description = 'baking pan/dish, cooking sheet'
    WHERE name = 'baking pan/dish';

    -- Verify the update
    SELECT id, name, description FROM Items WHERE name = 'baking pan/dish';
    ```

    **Option 2: Append to the existing description using CONCAT**

    ```sql
    -- SQL UPDATE script to update the description of an item (append using CONCAT)
    UPDATE Items
    SET description = CONCAT(description, ', cooking sheet')
    WHERE name = 'baking pan/dish';

    -- Verify the update
    SELECT id, name, description FROM Items WHERE name = 'baking pan/dish';
    ```

    *   **Explanation:**
        *   `UPDATE Items`:  This specifies that you are updating the `Items` table.
        *   `SET description = 'baking pan/dish, cooking sheet'` (Option 1): This sets the new description for the item, replacing the old one. Make sure to replace `'baking pan/dish, cooking sheet'` with the desired description.
        *   `SET description = CONCAT(description, ', cooking sheet')` (Option 2): This appends the string ', cooking sheet' to the existing description. The `CONCAT` function is used to combine the existing description with the new text.
        *   `WHERE name = 'baking pan/dish'`: This is the crucial part that identifies *which* item to update.  Replace `'baking pan/dish'` with the exact name of the item you want to modify.
        *   `SELECT id, name, description FROM Items WHERE name = 'baking pan/dish'`: This statement is optional, but it's good practice to verify that the update was successful.

3.  **Execute the Query:**

    *   Click the "Run" button in the query editor to execute the SQL script.

4.  **Verify the Update:**

    *   After the query executes successfully, examine the results in the "Results" pane to confirm that the description has been updated as expected.  The `SELECT` statement in the script will help you do this.

## Important Considerations

*   **Case Sensitivity:**  SQL Server is often case-insensitive by default, but it's best practice to ensure that the item name in the `WHERE` clause exactly matches the name in the database.
*   **Quotes:**  Make sure to enclose the new description in single quotes (`'...'`).
*   **CONCAT and NULLs:** If the existing `description` is `NULL`, `CONCAT` will often return `NULL`. If you want to avoid this, use `ISNULL(description, '')` in the `CONCAT` function:  `SET description = CONCAT(ISNULL(description, ''), ', cooking sheet')`