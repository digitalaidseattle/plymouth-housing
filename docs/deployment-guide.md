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

## Adding Authentication and Authorization

You might need help from your partner's Azure admin. Some of the Azure Entra ID steps are privileged. 

There are tutorials that will help you get started:
- https://learn.microsoft.com/en-us/azure/static-web-apps/add-authentication
- https://learn.microsoft.com/en-us/azure/static-web-apps/assign-roles-microsoft-graph


1. Create the roles as is explained [a bit further in the Tutorial](https://learn.microsoft.com/en-us/azure/static-web-apps/assign-roles-microsoft-graph#create-roles).

1. Add users to the roles. Follow the steps on the page "Assign users to a Role". 

1. Make sure you have a ```staticwebapp.config.json``` as mentioned below. 

1. Now OAuth is enabled on the website and you will have to sign in to access it. 

### Securing the API and the Routes

To allow the appropriate level of permissions on the API and the routes, you need to follow 
- [these steps from the SWA documentation](https://learn.microsoft.com/en-us/azure/static-web-apps/authentication-custom?tabs=aad%2Cinvitations#manage-roles) and 
- [these from the DAP documentation](https://learn.microsoft.com/en-us/azure/data-api-builder/authorization). 

This will allow you to set the ```permissions``` on the ```entities``` in [```staticwebapp.database.config.json```](..//swa-db-connections/staticwebapp.database.config.json). 

Permission on the routes only work for server side routing. This React app is purely client side, so routing permissions with roles don't work. 

There are two requirements that need to be fullfilled:
- the X-MS-API-ROLE HEADER needs to be present on all REST API calls. It should be one of the roles (or the built-in roles authenticated or anonymous)
- the ```staticwebapp.config.json``` should not be blank but contain at least the default as in the documents. 

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

1. Finally, create and bootstrap the database as in the [database-setup.md](database-setup.md)

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
