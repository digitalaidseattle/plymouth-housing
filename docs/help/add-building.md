
# Adding a Building and Units in Azure SQL Database

This guide provides instructions on how to add a new building and its units to your Azure SQL database using the Azure portal.

## Scenario

Let's say you want to add "Pacific Apartments" with the building code "PAC" and then add several units to this building.

## Steps

1.  **Connect to SQL:**

    *   As described [here](./connect-sql.md).

2.  **Add the Building:**

    *   In the query editor, run the following SQL statement to add the building:

    ```sql
    INSERT INTO Buildings (name, code) VALUES
    ('Pacific Apartments', 'PAC');
    ```

3.  **Verify the Building Code and Get the Building ID:**

    *   To confirm the building was added and to find its `id`, run:

    ```sql
    SELECT * 
      FROM Buildings
      WHERE code = 'PAC';
    ```

    *   Note the `id` value for the new building (for example, `id = 16`).

4.  **Add Units for the Building:**

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

*   **Data Integrity:** Double-check the building `id` before adding units to ensure they are linked to the correct building.