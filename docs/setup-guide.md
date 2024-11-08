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

To allow the appropriate level of permissions on the API and the routes, you need to follow [these steps](https://learn.microsoft.com/en-us/azure/static-web-apps/authentication-custom?tabs=aad%2Cinvitations#manage-roles). 
This will allow you to set the ```permissions``` on the ```entities``` in [```staticwebapp.database.config.json```](..//swa-db-connections/staticwebapp.database.config.json).



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

You can also develop locally against a local install of SQL server. There are free editions for developers and SQL Express. 

- use the VS Code Extension **SQL Server (mssql)** from Microsoft to work with your SQL Server. 

- Once you have that installed, you can create your database with the [create_db.sql](../database/create_db.sql) script. (hit the play button) .

- After that you can create the [Tables](../database/Tables/) and the [testdata](../database/testdata/).

- make sure to update the ```DATABASE_CONNECTION_STRING``` in ```.env.local``` and reload with ```source .env.local``` on Linux. On Windows you will have to set the connection string with:

    ```
    SET DATABASE_CONNECTION_STRING=
    localhost\SQLEXPRESS;Database=Inventory;Persist Security Info=False;Integrated Security=SSPI;TrustServerCertificate=True;
    ```

    Adding ```TrustServerCertificate=True``` to the connection string will get you around a security error. (Obviously, not recommended for any scenario other than local dev.)

### Cloud Database for Development

Similar as above, but create a Azure SQL database. Easiest way to connect is to use SQL Authentication. 
Make sure that you add your local IP to **Security/Networking** of the SQL Server (not the database)
Just make sure that you can access the database from your local machine. 
You can verify by adding it to the VS Code extension. 

## Local Development

You need to install all dependencies with ```npm install```. One of the dev dependencies is the [SWA CLI](https://azure.github.io/static-web-apps-cli/docs/intro). You can start the app with ```npm run dev``` but that doesn't set up the Data API layer. 

The back end API is bootstrapped with configuration out of [```staticwebapp.database.config.json```](../swa-db-connections/staticwebapp.database.config.json). See documentation for all the settings. 

Start the app locally with 

```
swa start --data-api-location swa-db-connections 
```
Note: for debugging you can add ```--verbose=silly``` to the ```swa``` command.

By default, you can go to http://localhost:4280. (The default Vite port 3000 is also available, but the app won't be able to access the REST API from there.) 

The REST API is serviced from 5000. You can see it live with Swagger: http://localhost:5000/swagger

