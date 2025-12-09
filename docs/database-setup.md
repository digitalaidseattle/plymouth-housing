# Database Setup

## Intro

The app uses a SQL database. For production we use an Azure SQL Serverless database. 

There are tutorials here:
- https://learn.microsoft.com/en-us/azure/static-web-apps/database-azure-sql
- https://learn.microsoft.com/en-us/azure/app-service/tutorial-connect-msi-azure-database

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
  - Recommended: Free editions like **SQL Server Express** (highly recommended because of its size) or **SQL Server Developer Edition**. 
  - At the end of the install sequence, take note of the connection string if it is displayed. 

#### **Step 2: Install SQL Server Extension for VS Code**
- Install the **SQL Server (mssql)** extension from Microsoft in VS Code.  

#### **Step 3: Create and Bootstrap the Database**
1.  Open a Powershell terminal in VS Code. Setting the $env variables and running the .ps1 script should happen in PowerShell. 
1.  Set the environment var, e.g.:

    ```$env:DATABASE_CONNECTION_STRING='Server=localhost\SQLEXPRESS;Database=master;Persist Security Info=False;Integrated Security=SSPI;TrustServerCertificate=True;'```

1. Use the `create_db.sql` script in VS Code:  
   - Open the script and click the **play button** to execute.
   - This will create the **inventory** database

1.  Change the connection string to point to the inventory database instead of master:

    ```$env:DATABASE_CONNECTION_STRING='Server=localhost\SQLEXPRESS;Database=Inventory;Persist Security Info=False;Integrated Security=SSPI;TrustServerCertificate=True;'```

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

### SQL on WSL 

1. Follow the steps [here](https://learn.microsoft.com/en-us/sql/linux/quickstart-install-connect-wsl-2). Make sure you install SQL Express, as that is the lightest and quickest option. Just install SQL. 
1. Make sure you remember the username (likely sa) and password. 
1. You can use this connection string to the **Master** database:

   ```Server=localhost,1433;Database=Master;User Id=your_username;Password=your_password;TrustServerCertificate=True```

1. Install the SQL Server Visual Studio Code Add-In. 
1. In the VS Code SQL server add-in, connect to the SQL server with the connection string above. 
1. Now you can create the database by running [create_db.sql](database/create_db.sql) and hitting the play button. 
1. Install Powershell from [here](https://learn.microsoft.com/en-us/powershell/scripting/install/install-ubuntu?view=powershell-7.5)
1. Once in Powershell, set the environment variable for the connection string to the **Inventory** database:
   ```$env:DATABASE_CONNECTION_STRING='Server=localhost,1433;Database=Inventory;User Id=your_username;Password=your_password;TrustServerCertificate=True'```
1. Install the PS module for SQL server:

   ```Install-Module -Name SqlServer```
1. Now you can bootstrap the database by running [bootstrap_db.ps1](../database/bootstrap_db.ps1)


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

## Production/Staging

1. Create an Azure SQL database in the Azure portal. General Purpose, Serverless is most likely sufficient for our needs. The steps are outlined [here](https://learn.microsoft.com/en-us/azure/static-web-apps/database-azure-sql?tabs=bash&pivots=static-web-apps-rest)

1. You can (and likely should) use **Managed Identity** to access your SQL server. Enable Managed Identity on your Azure Container App (the one running Data API Builder). [This is a good introduction](https://learn.microsoft.com/en-us/azure/app-service/tutorial-connect-app-access-storage-javascript?tabs=azure-portal) to the concept. For DAB-specific setup, see [DAB-setup.md](DAB-setup.md).

1. Grant SQL access to your Container App's managed identity. Run this SQL query [from this article](https://www.pluralsight.com/resources/blog/guides/how-to-use-managed-identity-with-azure-sql-database#:~:text=In%20order%20to%20allow%20managed%20identities%20to%20connect%20to%20Azure):

    ```sql
    create user [container-app-name] from external provider;
    alter role db_datareader add member [container-app-name];
    alter role db_datawriter add member [container-app-name];
    ```

    Replace `[container-app-name]` with the name of your Azure Container App running DAB.

1. The database connection is configured in the Container App environment variables. See [DAB-setup.md](DAB-setup.md) for complete deployment instructions.  

