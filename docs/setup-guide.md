# Setting up Solution

## Intro

In Azure we use Static Web Apps (SWA) as our hosting platform. All the documentation for SWA is [here](https://learn.microsoft.com/en-us/azure/static-web-apps/). In addition we are using Azure SQL and the [SWA database connection feature](https://learn.microsoft.com/en-us/azure/static-web-apps/database-overview) based on [Data API builder](https://learn.microsoft.com/en-us/azure/data-api-builder/).

## Requirements

- Access to an Azure subscription, either one for yourself or for venture partner.

## Create the App

1. Create a new repo from the [DAS Template](https://github.com/digitalaidseattle/das-admin-template). (This will likely have to change to an DAS Azure template. The current one is very biased towards Supabase/Firebase)

1. Log into the Azure portal and create a new resource. Search for "Static Web App" (SWA). Create or select a **Resource Group** and give your app a name. 
    
1. For hosting plan you can select **Free**, but if you need Managed Identity for your SWA (see later), you'll have to select **Standard**

1. Under **deployment** select Github. Point it to the repo you just created under 1.

1. Click Next to go to the **Advanced** tab. We are not using Azure Functions so we can leave this alone. 

1. We are also not using **Tags** in the next tab, so you can click Create

1. This will bootstrap your github repo with some deployment details under `.github/workflows/{file}.yml`. This file contains the workflows that Github will perform when there is a PR and a merge on the repo. It also added a secret to the Github repo that is referenced in the yml file. 

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

### Local Database for Development

You will have to use a local installation of SQL server for development. There are [free editions](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) for developers and SQL Express. 

Once you have one installed:

- install the VS Code Extension **SQL Server (mssql)** from Microsoft to work with your SQL Server. 

- create your database with the [create_db.sql](../database/create_db.sql) script. (hit the play button) .

- After that you can bootstrap the database with the PowerShell script in ./database/bootstrap_db.ps1.

- **For macOS users**
  - Setup SQL Server in Docker and Execute `bootstrap_db.ps1` on macOS
    - This guide walks you through downloading SQL Server via Docker and executing a PowerShell bootstrap script (`bootstrap_db.ps1`) to initialize your database.
    - 1. Install and Start Docker Desktop
      - Download and install [Docker Desktop](https://www.docker.com/products/docker-desktop) for your operating system.
      - Launch Docker Desktop and ensure that Docker is running.
    - 2. Download and Run SQL Server 2022 Docker Container
      - Open your terminal and run the following commands:

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

    - 3. Install PowerShell and the SqlServer Module on macOS
      - Install PowerShell 7, If you haven't already installed PowerShell (version 7 or higher is recommended), use Homebrew:
        ```bash
        brew install --cask powershell
        ```
      - Launch PowerShell by typing:
        ```bash
        pwsh
        ```
    - 4. Install the SqlServer Module
      - Inside PowerShell, run:
        ```powershell
        brew install --cask powershell
        ```
    - 5. Configure the Database Connection String Environment Variable
      - In PowerShell, set the environment variable for your database connection string. Adjust the database name and credentials as necessary:
        ```powershell
        $env:DATABASE_CONNECTION_STRING = "Server=localhost,1433;Initial Catalog=master;User ID=sa;Password=YourStrongPassword123!;Encrypt=False;TrustServerCertificate=True;"
        ```
      - Note: Ensure that the Password matches the one used when starting the container.
    - 6. Execute the ```bootstrap_db.ps1``` Script
      - Assuming your PowerShell bootstrap script is located at /Users/yourusername/path/to/database/bootstrap_db.ps1, run:
        ```powershell
        pwsh -File "/Users/yourusername/path/to/database/bootstrap_db.ps1"
        ```
    - 7. After completing these steps, your SQL Server Docker container is set up, and your database is initialized using the PowerShell bootstrap script. Enjoy your development!

#### Environment Variables

Make sure to update the `DATABASE_CONNECTION_STRING` in your environment:

- **Linux**
  - Update the `DATABASE_CONNECTION_STRING` in `.env.local`.
  - Then run:
    ```bash
    source .env.local
    ```
    to load your updated connection string.

- **Windows**
  - You have to set the connection string with:
    ```powershell
    SET DATABASE_CONNECTION_STRING=localhost\SQLEXPRESS;Database=Inventory;Persist Security Info=False;Integrated Security=SSPI;TrustServerCertificate=True;
    ```

- **macOS**
  - You can set the connection string in your zsh terminal by typing:
    ```bash
    export DATABASE_CONNECTION_STRING="YOUR_CONNECTION_STRING"
    ```
    > **Warning:** If your `DATABASE_CONNECTION_STRING` contains an exclamation mark (`!`), you may need to escape it by adding a backslash (`\`) before the exclamation mark to avoid issues with zsh history expansion. 
  - Then verify by:
      ```bash
      echo $DATABASE_CONNECTION_STRING
      ```

- Adding `TrustServerCertificate=True` to the connection string will help you avoid a security error. (Obviously, not recommended for any scenario other than local dev.)

### Cloud Database for Development

Similar as above, but create a Azure SQL database. Easiest way to connect is to use SQL Authentication. 
Make sure that you add your local IP to **Security/Networking** of the SQL Server (not the database)
Just make sure that you can access the database from your local machine. 
You can verify by adding it to the VS Code extension. 

### Bootstrapping the Database

There are .sql scripts under ./database. 
You can run them one by one or with the ```bootstrap_db.ps1``` PS script. 

In order to run the script you need to

- open a admin PowerShell prompt
- change the PS Execution Policies (defined [here](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_execution_policies)). 

    ```Set-ExecutionPolicy -ExecutionPolicy Unrestricted```
- from that same admin PS session, run: 

    ```Import-Module SQLPS```

Now you can run the ```bootstrap_db.ps1``` PS script from a non-admin PS window (e.g., in VS Code).

Steps: 

1. set the environment variable for your connection string, e.g.:

    ```$env:DATABASE_CONNECTION_STRING="Server=CUDA-BOX\SQLEXPRESS;Database=Inventory;Persist Security Info=False;Integrated Security=SSPI;TrustServerCertificate=True;"```

1. run the ```bootstrap_db.ps1```

The database should be recreated. 

>CAREFULL!!! THIS WILL WIPE OUT ALL EXISTING DATA IN THE DATABASE

Make sure you reset the Execution scope back to restricted with 

    ```Set-ExecutionPolicy -ExecutionPolicy Undefined```

## CI/CD

In .github/workflows you'll find three files: one for CI, one for CD, one for deployment to prod. 

### CI
The CI file runs on every push to the repo. It will run the linter, the unit tests, and builds the app. It will not deploy. 

### CD
CD runs on a merge to main. It will build and deploy to staging. 

### Deploy to prod
This workflow triggers on a version change in ```package.json```. 
When that happens, a github tag for that version is created. 
It then builds from that tag, and deploys to production. 

The idea is that the version bump happens manually when staging has been tested and deemed stable. 
