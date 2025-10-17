# Deployment Guide

## Intro

In Azure we use Static Web Apps (SWA) as our hosting platform. All the documentation for SWA is [here](https://learn.microsoft.com/en-us/azure/static-web-apps/).

For the API layer, we use [Data API builder (DAB)](https://learn.microsoft.com/en-us/azure/data-api-builder/) running in **Azure Container Apps**. This replaces the deprecated SWA database connection feature and provides a containerized REST API layer between the frontend and Azure SQL Database.

For detailed DAB setup instructions, see [DAB-setup.md](DAB-setup.md).

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

To allow the appropriate level of permissions on the API and the routes, you need to follow:
- [These steps from the SWA documentation](https://learn.microsoft.com/en-us/azure/static-web-apps/authentication-custom?tabs=aad%2Cinvitations#manage-roles) for route authentication
- [These from the DAB documentation](https://learn.microsoft.com/en-us/azure/data-api-builder/authorization) for API permissions

This will allow you to set the `permissions` on the `entities` in [`dab/dab-config.json`](../dab/dab-config.json).

Permission on the routes only work for server side routing. This React app is purely client side, so routing permissions with roles don't work.

There are two requirements that need to be fulfilled:
- The X-MS-API-ROLE header needs to be present on all REST API calls. It should be one of the roles (or the built-in roles authenticated or anonymous)
- The `staticwebapp.config.json` should not be blank but contain at least the default as in the documents

When you start the application with `swa start`, it will now create a proxy page that allows you to enter the role it will propagate to the REST API. 

## Database and API Layer

### Production/Staging Database Setup

The application uses Azure SQL Serverless database with Managed Identity. For detailed database setup instructions, see [database-setup.md](database-setup.md).

**Quick overview:**

1. Create an Azure SQL database in the Azure portal (General Purpose, Serverless)
2. Set up Managed Identity for your Container App (see [DAB-setup.md](DAB-setup.md))
3. Grant the Container App's managed identity access to SQL Server:
   ```sql
   create user [container-app-name] from external provider;
   alter role db_datareader add member [container-app-name];
   alter role db_datawriter add member [container-app-name];
   ```
4. Bootstrap the database using the scripts in [database-setup.md](database-setup.md)

### API Layer (Data API Builder)

The API layer uses **Data API Builder (DAB)** running in **Azure Container Apps**. This provides a REST API for the frontend to access the database.

**For complete DAB setup and deployment instructions, see [DAB-setup.md](DAB-setup.md).**

Key steps:
1. Create an Azure Container App Environment
2. Deploy DAB using the official Microsoft Container Registry (MCR) image
3. Configure your `dab-config.json` file
4. Link the Container App to your Static Web App
5. Configure environment variables and managed identity

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
