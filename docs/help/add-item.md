# Adding an Inventory Item to Azure SQL Database

This guide provides instructions on how to add a new item to your Azure SQL database using the Azure portal.

## Scenario

Let's say you want to add "Wash bin" under the "Cleaning" category.

## Steps

1.  **Connect to SQL:**

    *   As described [here](./connect-sql.md).

2.  **Add the Item:**

    *   In the query editor, run the following SQL statement to add the item. Replace the values as needed:

    ```sql
    INSERT INTO Items (name, type, category_id, quantity, description, threshold)
    VALUES ('Wash bin', 'General', (SELECT id FROM Categories WHERE name = 'Cleaning'), 0, 'Plastic wash bin, dish basin', 5);
    ```

    *   **Alternative:** If you prefer to look up the category ID separately first:

    ```sql
    -- Step 1: Find the category ID
    SELECT id, name FROM Categories WHERE name = 'Cleaning';

    -- Step 2: Use the ID (e.g., 12) in the INSERT
    INSERT INTO Items (name, type, category_id, quantity, description, threshold)
    VALUES ('Wash bin', 'General', 12, 0, 'Plastic wash bin, dish basin', 5);
    ```

    *   **Explanation of fields:**
        *   `name`: The display name of the item (required)
        *   `type`: Usually 'General' for most items (required)
        *   `category_id`: The ID from step 2 - use `12` for Cleaning (required)
        *   `quantity`: Current stock quantity - start with 0 if you don't have any yet (required)
        *   `description`: Alternate names or details to help with searching (optional)
        *   `threshold`: The minimum quantity before item shows as "Low Stock" (required)

3.  **Verify the Item:**

    *   To confirm the item was added successfully, run:

    ```sql
    SELECT *
    FROM Items
    WHERE name = 'Wash bin';
    ```

4.  **View the Item in its Category:**

    *   To see how the item appears in the Cleaning category with other items:

    ```sql
    SELECT i.id, i.name, i.description, i.quantity, c.name AS category
    FROM Items i
    LEFT JOIN Categories c ON c.id = i.category_id
    WHERE c.name = 'Cleaning'
    ORDER BY i.name;
    ```

## Important Considerations

*   **Data Integrity:** Always verify the category_id before adding items to ensure they are linked to the correct category.
*   **Description Field:** Add alternate names and search terms to help users find the item. For example, "dish basin" helps users searching for that term find "Wash bin".
*   **Threshold Value:** Set an appropriate threshold based on how often the item is checked out. Common values range from 1 (rarely used) to 15 (high demand).
*   **Case Sensitivity:** Item names will be displayed exactly as entered, so use proper capitalization.
