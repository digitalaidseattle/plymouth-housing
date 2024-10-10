# Setting up Solution

## Intro

In Azure we use Static Web Apps (SWA) as our hosting platform. All the documentation for SWA is [here](https://learn.microsoft.com/en-us/azure/static-web-apps/). 

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


## Cloud Database for Production/Staging

The template uses a SQL database. We use an Azure SQL Serverless database with Managed Identity. 

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

## Local Database for Development

You can also develop locally against a local install of SQL server. There are free editions for developers and SQL Express. 

- make sure to update the ```DATABASE_CONNECTION_STRING``` in ```.env.local``` and reload with ```source .env.local```
- you will get this error likely:

    *The certificate chain was issued by an authority that is not trusted*

    Adding ```TrustServerCertificate=True``` to the connection string will get you around that. (Yes, not recommended for any scenario other than local dev.)

    ```DATABASE_CONNECTION_STRING=Server=localhost\SQLEXPRESS;Database=mySampleDatabase;Trusted_Connection=True;TrustServerCertificate=True```