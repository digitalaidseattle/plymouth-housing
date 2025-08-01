
# Adding a Building and Units in Azure SQL Database

This guide provides instructions on how to add a new building and its units to your Azure SQL database using the Azure portal.

## Scenario

Let's say you want to add "Pacific Apartments" with the building code "PAC" and then add several units to this building.

## Steps

1.  **Open the Azure Portal:**

    *   Navigate to the [Azure Portal](https://portal.azure.com/) and log in with your Azure account.

2.  **Navigate to your SQL Database:**

    *   In the Azure Portal, search for "SQL databases" and select it.
    *   Find and select the specific SQL database you want to modify.

3.  **Open the Query Editor:**

    *   In the SQL database overview, find and click on "Query editor (preview)" in the left-hand menu.
    *   You may be prompted to add your client IP address to the server's firewall rules. Follow the instructions to do so.
    *   Authenticate using your SQL Server credentials (username and password) or Azure Active Directory.

4.  **Add the Building:**

    *   In the query editor, run the following SQL statement to add the building:

    ```sql
    INSERT INTO Buildings (name, code) VALUES
    ('Pacific Apartments', 'PAC');
    ```

5.  **Verify the Building Code and Get the Building ID:**

    *   To confirm the building was added and to find its `id`, run:

    ```sql
    SELECT * 
      FROM Buildings
      WHERE code = 'PAC';
    ```

    *   Note the `id` value for the new building (for example, `id = 16`).

6.  **Add Units for the Building:**

    *   Use the `id` from the previous step (replace `16` with your actual building id if different):

    ```sql
    INSERT INTO Units (building_id, unit_number) VALUES (16, '13');
    INSERT INTO Units (building_id, unit_number) VALUES (16, '14');
    INSERT INTO Units (building_id, unit_number) VALUES (16, '15');
    INSERT INTO Units (building_id, unit_number) VALUES (16, '16');
    INSERT INTO Units (building_id, unit_number) VALUES (16, '18');
    -- Add more units as needed
    ```

7.  **Verify the Units:**

    *   To confirm the units were added, run:

    ```sql
    SELECT * FROM Units WHERE building_id = 16;
    ```

## Important Considerations

*   **Backup:** Azure automatically backs up SQL server. Make sure to make changes to production database on days when the Supply Center is not in use. 
*   **Permissions:** Ensure that the user account you are using to connect to the database has the necessary permissions to insert data into the `Buildings` and `Units` tables.
*   **Data Integrity:** Double-check the building `id` before adding units to ensure they are linked to the correct building.

## Alternative: Using SQL Server Management Studio (SSMS)

While this guide focuses on the Azure portal, you can also use SQL Server Management Studio (SSMS) to connect to your Azure SQL database and execute the same `INSERT` and `SELECT` scripts. SSMS provides a more feature-rich environment for database management.