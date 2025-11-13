# Connect to SQL in Azure

This guide provides instructions on how to connect to SQL Server in the Azure Portal. It is the starting point for all changes to be made to the SQL database. 

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

## Important Considerations

*   **Staging** You should always first try on the staging database to verify your query, only then use it in production. 
*   **Backup:** Before making any changes to your database, it's always a good idea to create a backup.  You can do this in the Azure portal from the SQL database overview page.
*   **Case Sensitivity:**  SQL Server is often case-insensitive by default, but it's best practice to ensure that the item name in the `WHERE` clause exactly matches the name in the database.

## Alternative: Using SQL Server Management Studio (SSMS)

While this guide focuses on the Azure portal, you can also use SQL Server Management Studio (SSMS) to connect to your Azure SQL database and execute the same `UPDATE` script.  SSMS provides a more feature-rich environment for database management.