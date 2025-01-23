# Deployment Guide

## Intro

In Azure we use Static Web Apps (SWA) as our hosting platform. All the documentation for SWA is [here](https://learn.microsoft.com/en-us/azure/static-web-apps/). In addition we are using Azure SQL and the [SWA database connection feature](https://learn.microsoft.com/en-us/azure/static-web-apps/database-overview) based on [Data API builder](https://learn.microsoft.com/en-us/azure/data-api-builder/).

## Requirements

- Access to an Azure subscription, either one for yourself or for venture partner.

## Create the App

1. Fork this repo. 

1. Log into the Azure portal and create a new resource. Search for "Static Web App" (SWA). Create or select a **Resource Group** and give your app a name. 
    
1. For hosting plan you can select **Free**, but if you need Managed Identity for your SWA (see later), you'll have to select **Standard**

1. Under **deployment** select Github. Point it to the repo you just created under 1.

1. Click Next to go to the **Advanced** tab. We are not using Azure Functions so we can leave this alone. 

1. We are also not using **Tags** in the next tab, so you can click Create

1. This will bootstrap your github repo with some deployment details under `.github/workflows/{file}.yml`. This file contains the workflows that Github will perform when there is a PR and a merge on the repo. It also added a secret to the Github repo that is referenced in the yml file. See below for other workflows in CI/CD

## Adding OAuth

You might need help from your partner's Azure admin. Some of the Azure Entra ID steps are privileged. 

There are tutorials that will help you get started:
- https://learn.microsoft.com/en-us/azure/static-web-apps/add-authentication
- https://learn.microsoft.com/en-us/azure/static-web-apps/assign-roles-microsoft-graph


1. For OAuth to work, you will need callback URIs. The [substeps in this Tutorial](https://learn.microsoft.com/en-us/azure/static-web-apps/assign-roles-microsoft-graph#create-a-microsoft-entra-application) will tell you how to create an Entra App Registration and set up the callback URIs.

    >Create only the App Registration and stop at **Create a client secret**. That is only required in case you need APIs (used for custom Role Authentication in the tutorial).

1. Make sure you add both the URL for your production site as well as http://localhost:3000 to the callback URLs. The last one ensures you can debug locally. 

1. Add the following settings to your ```.env.local```:

    ```
    # appid as in Entra App Registration
    VITE_AUTH_CLIENT_ID=7c5c1bb2-faea-4bcf-babd-4fd023fabfd6 
    VITE_AUTH_AUTHORITY=https://login.microsoftonline.com/common 
    VITE_AUTH_REDIRECT_URI=http://localhost:3000 # callback URI
    ```

    >Note that Vite will pick up ```.env.local``` [all by itself](https://vite.dev/guide/env-and-mode), even without executing ```source```. 


1. You also need to add these settings for your build process. When the github action builds your app, it wil pull the variables out of the github repo section and inject them in the build process. 
    
    a. add these settings to your ```.github/workflows/{name}.yml file```:

    ```
        env:
          VITE_AUTH_CLIENT_ID: ${{ vars.VITE_AUTH_CLIENT_ID }}
          VITE_AUTH_AUTHORITY: ${{ vars.VITE_AUTH_AUTHORITY }}
          VITE_AUTH_REDIRECT_URI: ${{ vars.VITE_AUTH_REDIRECT_URI }}
    ```
    b. Make sure these same variables are also under ```Secrets and variables/Actions/Variables/Repository variables``` in your Github repo settings. 



1. Create the roles as is explained [a bit further in the Tutorial](https://learn.microsoft.com/en-us/azure/static-web-apps/assign-roles-microsoft-graph#create-roles).

1. Add users to the roles. Follow the steps on the page "Assign users to a Role". 

1. Now OAuth is enabled on the website and you will have to sign in to access it. 

### Securing the API and the Routes

To allow the appropriate level of permissions on the API and the routes, you need to follow 
- [these steps from the SWA documentation](https://learn.microsoft.com/en-us/azure/static-web-apps/authentication-custom?tabs=aad%2Cinvitations#manage-roles) and 
- [these from the DAP documentation](https://learn.microsoft.com/en-us/azure/data-api-builder/authorization). 

This will allow you to set the ```permissions``` on the ```entities``` in [```staticwebapp.database.config.json```](..//swa-db-connections/staticwebapp.database.config.json). 

Permission on the routes only work for server side routing. This React app is purely client side, so routing permissions with roles don't work. 

There are two requirements that need to be fullfilled:
- the X-MS-API-ROLE HEADER needs to be present on all REST API calls. It should be one of the roles (or the built-in roles authenticated or anonymous)
- the ```staticwebapp.config.json`` should not be blank but contain at least the default as in the documents. 

When you start the application with ```swa start```, it will now create a proxy page that allows you to enter the role it will propagate to the REST API. 

## Database 

### Production/Staging

The template uses a SQL database. We will use an Azure SQL Serverless database with Managed Identity. 

There are tutorials here:
- https://learn.microsoft.com/en-us/azure/static-web-apps/database-azure-sql
- https://learn.microsoft.com/en-us/azure/app-service/tutorial-connect-msi-azure-database

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

### Database for Development

A note on permission with PowerShell. 
You might get a warning that untrusted scripts are not allowed to run. Here is how to turn that off. 
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

#### Local Database on Windows

##### **Step 1: Install SQL Server**
- Install a local edition of SQL Server.  
  - Recommended: Free editions like **SQL Server Developer Edition** or **SQL Server Express**.  

##### **Step 2: Install SQL Server Extension for VS Code**
- Install the **SQL Server (mssql)** extension from Microsoft in VS Code.  

##### **Step 3: Create and Bootstrap the Database**
1.  Set the environment var:

    ```$env:DATABASE_CONNECTION_STRING = "Server=localhost,1433;Initial Catalog=master;User ID=sa;Password={Password};Encrypt=False;TrustServerCertificate=True;"```

1. Use the `create_db.sql` script in VS Code:  
   - Open the script and click the **play button** to execute.  
1. Initialize the database:  
   - Run the PowerShell script located at `./database/bootstrap_db.ps1`.  

> **Warning:** Running `bootstrap_db.ps1` will wipe out all existing data in the database. Proceed with caution.  

---

#### **macOS: SQL Server Setup via Docker**

##### **Step 1: Install Docker**
- Download and install **Docker Desktop** for macOS.  
- Start Docker Desktop and verify it is running.

##### **Step 2: Set Up SQL Server in Docker**
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

##### **Step 3: Install PowerShell and SqlServer Module**
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

##### **Step 4: Configure the Database Connection**
1. Set the connection string as an environment variable:  
   ```powershell
   $env:DATABASE_CONNECTION_STRING = "Server=localhost,1433;Initial Catalog=master;User ID=sa;Password={Password};Encrypt=False;TrustServerCertificate=True;"
   ```
   > **Note:** Ensure the password matches the one used in the Docker container.  

##### **Step 5: Initialize the Database**
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
1. Set the connection string:  
   ```cmd
   SET DATABASE_CONNECTION_STRING="YOUR_CONNECTION_STRING"
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

1. Create an **Azure SQL Database**.  
1. Use SQL Authentication for easier connection.  
1. Add your local IP to the **Security/Networking** section of the Azure SQL Server (not the database).  
1. Test the connection by adding it to the VS Code SQL Server extension.

---  

## CI/CD

In .github/workflows you'll find three files: one for CI, one for CD, one for deployment to prod. 

- [azure-static-web-apps-CI.yml](../.github/workflows/azure-static-web-apps-CI.yml).
The CI action runs on every push to the repo. It will run the linter, the unit tests, and builds the app. It will not deploy. 

- [azure-static-web-apps-CD.yml](../.github/workflows/azure-static-web-apps-CD.yml). The CD action runs on a merge to main. It will build and deploy to staging. 

- [azure-static-web-apps-prod.yml](../.github/workflows/azure-static-web-apps-prod.yml).
This workflow triggers on a version change in ```package.json```. 
When that happens, a github tag for that version is created. 
It then builds from that tag, and deploys to production. 

The idea is that the version bump happens manually when staging has been tested and deemed stable. 
