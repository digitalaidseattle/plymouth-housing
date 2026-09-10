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

In .github/workflows you'll find three files for the frontend deployment pipeline.

- [azure-static-web-apps-dev.yml](../.github/workflows/azure-static-web-apps-dev.yml).
Triggers on push to `dev` or on any PR targeting `dev`. Runs lint, unit tests, and build, then deploys to the dev environment. Cleans up the preview deployment when a PR is closed.

- [azure-static-web-apps-staging.yml](../.github/workflows/azure-static-web-apps-staging.yml).
Triggers on push to `staging`. Runs the same CI steps, then deploys to the staging environment. To promote dev to staging, open a PR from `dev` → `staging` and merge it.

> **All three workflows deploy to the same Static Web App resource, using the same deploy
> token.** Nothing about the branch a workflow runs on decides where the artifact lands.
> What separates the environments is a single input:
>
> ```yaml
> deployment_environment: 'staging'
> ```
>
> Omit it and the deploy action uploads to the app's *default* environment, which is
> **production** — silently, on a green run. This happened on 2026-08-03 and left a staging
> build serving the live site for four days
> ([incident report](incident_reports/2026-08-03-staging-deploy-overwrote-production.md)).
>
> The action also logs `Unexpected input(s) 'deployment_environment'` on every run. That
> warning is **wrong** and must not be acted on — the input is honoured regardless. The
> workflow carries a comment saying so; leave both in place.
>
> After any change to a deploy workflow, check the run log's `Visit your site at:` line and
> confirm the hostname matches the environment you intended. A region-less hostname
> (`salmon-island-01be9bf1e.5.azurestaticapps.net`) means production.

- [azure-static-web-apps-prod.yml](../.github/workflows/azure-static-web-apps-prod.yml).
Triggers on push to `main`. Reads the version from `package.json` and checks whether a matching git tag (e.g. `v1.2.3`) already exists. If the tag is new, it creates the tag, generates a GitHub Release, and deploys to production. If the tag already exists, the deploy is skipped entirely. This makes the workflow idempotent — pushing to `main` multiple times is safe.

To promote staging to production:
1. Bump the version in `package.json` on `staging`
2. Open a PR from `staging` → `main` and merge it
3. The workflow detects the new version tag and deploys automatically

The version bump in step 1 is not bookkeeping — it is what makes the deploy happen at all.
Without it the tag already exists, the workflow skips, and `main` moves while production
does not.

If step 2 reports conflicts, `main` and `staging` have diverged, usually because a hotfix
was re-applied on both instead of backported. See
[hotfix-handling.md](hotfix-handling.md#4-merge-and-backport) — the fix is to open the PR
from a branch off `staging` with `origin/main` merged into it, rather than resolving the
conflicts in the GitHub web editor.

Promote on a regular cadence rather than only when a release is needed. A `staging` branch
that has drifted weeks ahead of production turns any misrouted deploy into an unreviewed
release; the 2026-08-03 incident put 107 unreleased commits into production this way.

## Preventing test access to production

Test accounts must never be able to log into production. The app enforces this
at sign-in: any account that carries the `test` role is refused when the build's
environment is `production` — the session is torn down (redirect to
`/.auth/logout` → `login.html`) and a `TestAccountBlockedInProduction` event is
sent to Application Insights. In a production build the layout renders nothing
until the guard has cleared the session, so a blocked account never mounts the
app shell or any page behind it. See the guard in
[`src/layout/MainLayout/index.tsx`](../src/layout/MainLayout/index.tsx).

> This is a guardrail against *accidental* testing against prod, not a security
> boundary — a direct API call bypasses the frontend. The durable backstop is
> keeping test accounts and test data out of the production database.

Two pieces make it work:

1. **Environment is injected at build time** via the `VITE_ENVIRONMENT` variable.
   It is set in each deploy workflow's build step — `production` in
   [azure-static-web-apps-prod.yml](../.github/workflows/azure-static-web-apps-prod.yml)
   and `staging` in
   [azure-static-web-apps-staging.yml](../.github/workflows/azure-static-web-apps-staging.yml).
   It is a Vite build-time value (must be `VITE_`-prefixed); a SWA runtime
   Application Setting does **not** reach the bundle. Unset locally, so local dev
   is treated as non-production and never blocked.
2. **The `test` role** must be assigned to every account used for automated or
   manual testing (in addition to its functional `admin`/`volunteer` role). How
   you assign it depends on the role model — see
   [aad-swa-roles.md](research/aad-swa-roles.md).

To test the guard locally, start the dev server with the variable set, e.g.
`VITE_ENVIRONMENT=production swa start`, and sign in with a `test`-role user.
