# Database Setup

## Intro

The app uses a SQL database. We will use an Azure SQL Serverless database with Managed Identity. 

There are tutorials here:
- https://learn.microsoft.com/en-us/azure/static-web-apps/database-azure-sql
- https://learn.microsoft.com/en-us/azure/app-service/tutorial-connect-msi-azure-database

## Production/Staging

1. Create an Azure SQL database in the Azure portal. General Purpose, Serverless is most likely sufficient for our needs. The steps are outlined [here](https://learn.microsoft.com/en-us/azure/static-web-apps/database-azure-sql?tabs=bash&pivots=static-web-apps-rest)

1. You can (and likely should) use **Managed Identity** to access your SQL server. There is not a step-by-step tutorial, but [this is a good introduction](https://learn.microsoft.com/en-us/azure/app-service/tutorial-connect-app-access-storage-javascript?tabs=azure-portal) to enable Managed Identity for the SWA. You can stop at **Create a storage account**. 

1. Then you need to tell SQL to allow your SWA. You can run the SQL query [from this article](https://www.pluralsight.com/resources/blog/guides/how-to-use-managed-identity-with-azure-sql-database#:~:text=In%20order%20to%20allow%20managed%20identities%20to%20connect%20to%20Azure) to add the user. 

    ```
    create user [my-swa] from external provider;
    alter role db_datareader add member [my-swa];
    alter role db_datawriter add member [my-swa];
    ```

    Replace the [my-swa] the name of your SWA.

1. The rest of the steps to connect the database are in [the tutorial mentioned earlier](https://learn.microsoft.com/en-us/azure/static-web-apps/database-azure-sql?tabs=bash&pivots=static-web-apps-rest).  

## Database for Development

A note on permission with PowerShell. 
You might get a warning that untrusted scripts are not allowed to run. Here is how to turn that off on Windows. 
1. Open an admin PowerShell prompt.  
1. Allow unrestricted script execution:  
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy Unrestricted
   ```
1. Run the script as instructed below. 
1. Reset the execution policy back to restricted:  
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy Undefined
   ```

### Local Database on Windows

#### **Step 1: Install SQL Server**
- Install a local edition of SQL Server.  
  - Recommended: Free editions like **SQL Server Developer Edition** or **SQL Server Express**.  

#### **Step 2: Install SQL Server Extension for VS Code**
- Install the **SQL Server (mssql)** extension from Microsoft in VS Code.  

#### **Step 3: Create and Bootstrap the Database**
1.  Set the environment var:

    ```$env:DATABASE_CONNECTION_STRING = "Server=localhost,1433;Initial Catalog=master;User ID=sa;Password={Password};Encrypt=False;TrustServerCertificate=True;"```

1. Use the `create_db.sql` script in VS Code:  
   - Open the script and click the **play button** to execute.  
1. Initialize the database:  
   - Run the PowerShell script located at `./database/bootstrap_db.ps1`.  

> **Warning:** Running `bootstrap_db.ps1` will wipe out all existing data in the database. Proceed with caution. Especially if you are pointing to staging or prod!

---

### **macOS: SQL Server Setup via Docker**

#### **Step 1: Install Docker**
- Download and install **Docker Desktop** for macOS.  
- Start Docker Desktop and verify it is running.

#### **Step 2: Set Up SQL Server in Docker**
1. Open your terminal and run the following commands:  
   ```bash
   # Pull the SQL Server 2022 image
   docker pull mcr.microsoft.com/mssql/server:2022-latest

   # Run a container (replace YourStrongPassword123! with your desired password)
   docker run -d --name local_sql_server \
   -e 'ACCEPT_EULA=Y' \
   -e 'SA_PASSWORD=YourStrongPassword123!' \
   -p 1433:1433 \
   -v sqlserverdata:/var/opt/mssql \
   mcr.microsoft.com/mssql/server:2022-latest
   ```

#### **Step 3: Install PowerShell and SqlServer Module**
1. Install **PowerShell 7** using Homebrew:  
   ```bash
   brew install --cask powershell
   ```
2. Launch PowerShell:  
   ```bash
   pwsh
   ```
3. Install the `SqlServer` module in PowerShell:  
   ```powershell
   Install-Module SqlServer
   ```

#### **Step 4: Configure the Database Connection**
1. Set the connection string as an environment variable:  
   ```powershell
   $env:DATABASE_CONNECTION_STRING = "Server=localhost,1433;Initial Catalog=master;User ID=sa;Password={Password};Encrypt=False;TrustServerCertificate=True;"
   ```
   > **Note:** Ensure the password matches the one used in the Docker container.  

#### **Step 5: Initialize the Database**
1. Run the bootstrap script:  
   ```powershell
   pwsh -File "/Users/yourusername/path/to/database/bootstrap_db.ps1"
   ```
2. Your database is now initialized and ready for development.

---

## **Environment Variables**

### **Linux**
1. Update the `DATABASE_CONNECTION_STRING` in `.env.local`.  
2. Load the updated connection string:  
   ```bash
   source .env.local
   ```

### **Windows**
1. Set the connection string in command prompt :
   ```cmd
   SET DATABASE_CONNECTION_STRING="YOUR_CONNECTION_STRING"
   ```
1. Or with powershell:
   ```PowerShell
   $env:DATABASE_CONNECTION_STRING='YOUR_CONNECTION_STRING'   
   ```

### **macOS**
1. Set the connection string in the terminal:  
   ```bash
   export DATABASE_CONNECTION_STRING="YOUR_CONNECTION_STRING"
   ```
2. Verify it:  
   ```bash
   echo $DATABASE_CONNECTION_STRING
   ```

---

### **Cloud Database Setup**

You can use an Azure SQL database for development as well. It is not recommended to use the staging database for reasons of conflicts. 

1. Create an **Azure SQL Database**.  
1. Use SQL Authentication for easier connection.  
1. Add your local IP to the **Security/Networking** section of the Azure SQL Server (not the database).  
1. Test the connection by adding it to the VS Code SQL Server extension.

