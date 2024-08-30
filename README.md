<p align='center'>
    <a href='https://www.digitalaidseattle.org'>
        <img src='https://avatars.githubusercontent.com/u/3466034?s=200&v=4' height='128'>
    </a>
    <h2 align='center'>Digital Aid Seattle</h2>
    <h1 align='center'>Plymouth Housing</h1>
</p>
<p align='center'>
    <img alt="GitHub commit activity (main)" src="https://img.shields.io/github/commit-activity/m/openseattle/open-seattle-website/main">
</p>

## Introduction

Digital Aid Seattle aims to amplify community impact with technology by connecting organizations who need technical solutions with skilled volunteers.

People across thousands of Seattle civic and nonprofit organizations have dedicated their lives to making the world safer, more equitable, and more sustainable. This work is responsible for so much good in the world, and we owe them a huge debt of gratitude.

Unfortunately, many of these organizations lack access to digital tools that are vital to success in the modern age. Nonprofits struggle to create and scale their impact without the resources they need.

Just outside their doors is a fleet of experts and technologists with the talent, capacity, and drive to build.

Seattle is world-renowned as a hub for technology talent, full of motivated builders, designers, and creators that want to use their skills for good. Digital Aid Seattle is bringing these communities together to create a sum greater than its parts.

This website is for organizations that want to [learn more about partnering with Digital Aid Seattle](https://www.digitalaidseattle.org/partner) and for passionate, skilled Seattlites who want to [learn more about volunteering!](https://www.digitalaidseattle.org/volunteer)

## Technology Stack

The website is built using [Vite](https://vitejs.dev/guide/).

[Supabase](https://supabase.com/) is used for Postgres database services and authentication with Google and Azure accounts via OAuth. 


## System Requirements

Install:
1. [Node.js](https://nodejs.org/en/)
1. [Docker Desktop](https://www.docker.com/products/docker-desktop/)
1. [VS Code](https://code.visualstudio.com/download)
1. [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

## Local Environment Setup

### Setup NextJS Application
    
1. Go in the folder you want the project to exist, run:

   ```bash
   git clone https://github.com/digitalaidseattle/plymouth-housing
   ```

1. Open VS code.

1. (Optional but recommended!) From VS code, open the command palette using `⇧⌘P` on Mac or `Ctrl+Shift+P` on Windows and type:
    ```
    Dev Containers: Open Folder in Container...
    ```

    _Note: For more information check out: https://code.visualstudio.com/docs/devcontainers/containers_

1. Open a shell and install dependecies by running:
    ```bash
    npm install
    ```

### Setup Environment Variables

This setup uses a shared cloud Supabase database for simplicity.
1. Run the command:
   ```bash
   cp .env.local.example .env.local
   ```
2. Request the `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from the team or go to settings > api from the Supabase Dashboard tp get them yourself. Other variables in `.env.local` can be ignored for now.

### Run the application
1. Run the command in your terminal from the project directory:
```bash
   npm run dev
   ```

## Testing

- To run all tests: `npm run test`.

## Setup Application with Local Database (Optional)

This section is only needed if you want to isolate your database and not use a shared environment.

### Configure Environmental Variables
Local setup requires a few one-time steps. In the following steps, you will start Supabase locally and put values from Supabase into your .env.local file.

1. Like before, create a copy of .env.local.example:

   ```bash
   cp .env.local.example .env.local
   ```

1. Open the .env.local file in VSCode. You will need to put values in this file after the next step, so keep it open.

1. Install supabase CLI from [here](https://supabase.com/docs/guides/cli/getting-started?queryGroups=platform&platform=linux)

1. Initialize Supabase locally. You will have to do this on the local system, not in the devcontainer since supabase will run in docker on the host. 

    Open a *[local terminal window](https://stackoverflow.com/questions/59815283/open-local-terminal-in-vscode-when-running-in-ssh-mode?rq=1)* from the plymouth-housing folder and run: 
   ```bash 
   supabase init
   ```

1. Start Supabase locally. In the same local terminal window run: 

   ```bash 
   supabase start
   ```

    Enter "y" when/if asked to install the Supabase package.

    Give it a moment to spin up the containers. When it's finished, it will display URLs and keys that need to go into your local environment file.
    
    Put the API URL after `VITE_SUPABASE_URL=` variable and the anon key after the `VITE_SUPABASE_ANON_KEY=` variable in the .env.local file. Double-check you copied the value correctly then save the file.

    (These steps are derived from the [Original Supabase instructions here](https://supabase.com/docs/guides/cli/local-development#start-supabase-services))

    _Note: If you have existing Supabase containers running, you may need to run `supabase stop --no-backup` to reset your environment. Careful, this will delete anything saved in your local database._

1. Run `supabase stop` to close Supabase when you are done.

#### Configure OAuth Environment Variables

1. If you need to use OAuth, be sure to follow the steps listed in _.env.local.example_ to set the OAuth variables. Once the variables are set, run:
    ```bash
    supabase stop # You need to stop Supabase execution so that the new configuration changes will be picked up.
    source .env.local
    supabase start
    ```

### Running the application and backend locally (optional still)

#### Run the frontend

1. Open a shell inside the docker container (default option when opening shells with Dev Container).

1. Load the values from the env file into the environment by running:
    ```bash
      source .env.local
    ```

1. Start development server
   ```bash
   yarn dev
   ```

1. Open local instance in browser: <http://localhost:3000>.

1. Use `Ctrl+C` to stop the server when you are done.

#### Generate lots of fake data (optional)
1. Open a *[local terminal window](https://stackoverflow.com/questions/59815283/open-local-terminal-in-vscode-when-running-in-ssh-mode?rq=1)* from the seattle-humane-app folder and run: 
    ```bash
    npm run gen-seed-data
    ```
    This will overwrite `supabase/seed.sql` and supabase will use the generated data when starting up.

1. If you've already started supabase, first you have to stop it and clear the data by running
    ```bash
    npx supabase stop --no-backup
    ```
    Then [Run Supabase](#run-supabase)

#### Run Supabase

1. Open a *[local terminal window](https://stackoverflow.com/questions/59815283/open-local-terminal-in-vscode-when-running-in-ssh-mode?rq=1)* from the seattle-humane-app folder.

1. Run `supabase start`. If Supabase is already running, you can stop it by running `supabase stop` first.

1. Run `supabase stop` when you are done.

## Manually updating Supabase types

- To login to supabase: npx supabase login.
- To update type file: npx supabase gen types typescript --project-id "liuebfxbxugpfsfwbkks" --schema public > supabase/database.types.ts
