# Local Development with Docker

> **Status: proposed.** This document describes the Docker setup we intend to build. The files it refers to (`docker-compose.yml`, `docker/`) do not exist yet. Review this document first; the implementation will follow it.

## Introduction

This guide gets the whole app running on your machine with one command: the SQL database, the API layer (Data API Builder, "DAB") and the React frontend. Each runs in its own Docker container, so you don't need to install SQL Server, .NET, PowerShell or the DAB CLI.

If you'd rather install everything on your machine directly, the original guides still work: [database-setup.md](database-setup.md), [DAB-setup.md](DAB-setup.md) and [swa-setup.md](swa-setup.md).

### How the pieces fit together

```
 your browser
     │
     ▼
 ┌────────────────────────┐        ┌──────────────┐        ┌──────────────┐
 │ web        :4280       │ /data-api  dab   :5000 │  SQL   │ sql   :1433  │
 │ SWA CLI + Vite (React) │───────▶│ Data API     │───────▶│ SQL Server   │
 │ mock login at /.auth   │        │ Builder      │        │ 2022         │
 └────────────────────────┘        └──────────────┘        └──────▲───────┘
                                                                  │ creates and
                                                     ┌────────────┴───────┐
                                                     │ db-init (runs once)│
                                                     └────────────────────┘
```

| Container | What it does | Port on your machine |
|---|---|---|
| `sql` | SQL Server 2022. The data is kept in a Docker volume, so it survives restarts. | `1433` |
| `db-init` | Runs the existing [bootstrap_db.ps1](../database/bootstrap_db.ps1) to create and seed the `Inventory` database, then exits. **It does nothing if the database already exists.** | none |
| `dab` | Data API Builder, using [dab/dab-config.json](../dab/dab-config.json). Turns the database into a REST API. | `5000` |
| `web` | The Static Web Apps (SWA) CLI and the Vite dev server. Serves the app, emulates the Azure login, and forwards `/data-api` calls to `dab`. | `4280` |

Your source code is shared with the `web` container, so when you save a file the browser reloads, the same as running Vite yourself.

---

## Prerequisites

You only need three things:

1. **Git**
2. **Docker**
   - **Windows:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) with the WSL 2 backend (the default). Also install [WSL](https://learn.microsoft.com/en-us/windows/wsl/install) with Ubuntu.
   - **macOS:** [Docker Desktop](https://www.docker.com/products/docker-desktop/).
   - **Linux:** [Docker Engine](https://docs.docker.com/engine/install/) with the Compose plugin.
3. **[Visual Studio Code](https://code.visualstudio.com/download)** (recommended). On Windows, also install the **WSL** extension.

Check that Docker works:

```bash
docker compose version
```

You should see `Docker Compose version v2.x` or later.

> **Windows users:** run every command in this guide in an **Ubuntu (WSL) terminal**, not PowerShell, and clone the repo inside WSL (for example `~/repos`), **not** under `C:\` or `/mnt/c`. Files on the Windows drive are slow inside containers and break hot reload.

> **Apple Silicon Mac users (M1 and later):** the SQL Server image is built for Intel. In Docker Desktop, open **Settings → General** and turn on **"Use Rosetta for x86_64/amd64 emulation on Apple Silicon"**. SQL Server will start more slowly than on other machines, but it works.

---

## First-time setup

### Step 1: Clone the repository

```bash
git clone https://github.com/digitalaidseattle/plymouth-housing.git
```

```bash
cd plymouth-housing
```

### Step 2: Create your `.env` file

The `.env` file holds your local settings. It is ignored by git, so your password never gets committed.

```bash
cp .env.example .env
```

Open `.env` and set a password for the SQL Server admin (`sa`) account:

```
MSSQL_SA_PASSWORD=Choose-A-Strong-Passw0rd
```

SQL Server **refuses to start** if the password is too weak. It must be at least 8 characters and include three of these four: uppercase letters, lowercase letters, numbers, symbols.

You don't need to write a connection string. Docker Compose builds it from this password.

### Step 3: Start everything

```bash
docker compose up --build
```

The first run takes several minutes. Docker downloads the images, installs the npm packages and creates the database. Later starts take seconds.

You'll see logs from all four containers mixed together, each line prefixed with the container name. Wait until you see:

- `db-init` reporting `All done.` and then `exited with code 0`
- `dab` reporting `Now listening on: http://[::]:5000`
- `web` reporting that the emulator is available at `http://localhost:4280`

### Step 4: Log in to the app

1. Open **http://localhost:4280**.
2. You'll see the SWA mock login screen (this stands in for the Azure login used in production):

   ![SWA Authentication](./assets/azure-swa-auth.png)

3. Type any username.
4. In **User's roles**, add **exactly one** role: `admin` or `volunteer`.
   - With no role, every API call fails.
   - With both roles, the app shows an error.
5. Click **Login**.

If you log in as a volunteer, the app asks you to pick a name and enter a PIN. The test volunteers' PINs are the numbers at the end of their names. For example, **John Doe 1234** has PIN **1234**. See [users_data.sql](../database/data_test/users_data.sql) for the full list.

You're set up. 🎉

---

## Everyday use

| I want to… | Command |
|---|---|
| Start everything in the background | `docker compose up -d` |
| See the logs | `docker compose logs -f` (or `docker compose logs -f web` for one container) |
| Check what's running | `docker compose ps` |
| Stop everything (keeps your data) | `docker compose down` |
| Restart DAB after editing `dab/dab-config.json` | `docker compose restart dab` |
| Reinstall npm packages after `package.json` changes | `docker compose run --rm web npm ci` and then `docker compose restart web` |
| Run the unit tests | `docker compose exec web npm test` |
| Run the linter | `docker compose exec web npm run lint` |
| Browse the API | http://localhost:5000/swagger |

The API in Swagger is useful for seeing what endpoints exist. Most calls will fail from Swagger, though, because the app's requests carry login information that SWA adds (see [DAB-setup.md](DAB-setup.md#testing-the-api)).

### Connecting to the database from VS Code

Install the **SQL Server (mssql)** extension and add a connection with:

| Setting | Value |
|---|---|
| Server | `localhost,1433` |
| Authentication | SQL Login |
| User | `sa` |
| Password | your `MSSQL_SA_PASSWORD` |
| Database | `Inventory` |
| Trust server certificate | Yes |

---

## Changing the database

### Rebuilding the database from scratch

Do this after you pull changes that touch `database/`, or when your local data is in a bad state:

```bash
docker compose run --rm db-init --reset
```

This **deletes all data in your local `Inventory` database** and recreates it from the scripts in `database/`. It only affects your machine.

To also throw away the SQL Server volume itself (a completely clean start):

```bash
docker compose down -v
```

```bash
docker compose up -d
```

### Trying out a single SQL script

To run one script without rebuilding everything, for example a stored procedure you're editing:

```bash
docker compose exec sql /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -C -d Inventory -i /database/procedures/process_checkout.sql
```

The `database/` folder is shared into the `sql` container at `/database`. If `$MSSQL_SA_PASSWORD` isn't set in your shell, run `set -a; source .env; set +a` first.

---

## Troubleshooting

### "port is already allocated" or "address already in use"

Something else on your machine is using port `1433`, `5000` or `4280`. Common culprits:

- A SQL Server you installed earlier (SQL Express on Windows, or SQL Server on WSL). Stop it, or change the port in `.env` (see [Configuration reference](#configuration-reference)).
- An older SQL Server container from the [database-setup.md](database-setup.md) instructions. List all containers with `docker ps -a` and stop the old one with `docker stop <name>`.
- `dab start` or `swa start` still running in another terminal. Stop them with `Ctrl+C`.

### The `sql` container keeps restarting or exits

Check its logs:

```bash
docker compose logs sql
```

If you see a message about the password not meeting policy, choose a stronger `MSSQL_SA_PASSWORD` (see [Step 2](#step-2-create-your-env-file)). SQL Server only reads the password **the first time** it creates its volume. If you change the password later, you also need to reset the volume with `docker compose down -v`.

### `db-init` failed

```bash
docker compose logs db-init
```

The log shows which SQL file failed. Fix the script, then run `docker compose run --rm db-init --reset`.

### The app loads, but the data doesn't

- Make sure you logged in with **exactly one** role (`admin` or `volunteer`). To log in again, go to http://localhost:4280/.auth/logout.
- Check that DAB is running and connected: `docker compose logs dab`.

### Saving a file doesn't reload the browser

- **Windows:** your repo is probably under `C:\` or `/mnt/c`. Move it into your WSL home folder (see [Prerequisites](#prerequisites)).
- Run `docker compose restart web`.

### Starting over completely

This removes all containers, volumes (including the database) and cached npm packages for this project:

```bash
docker compose down -v --rmi local
```

Then follow [Step 3](#step-3-start-everything) again.

---

## Configuration reference

### Environment variables in `.env`

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `MSSQL_SA_PASSWORD` | Yes | none | Password for the SQL Server `sa` account. |
| `SQL_PORT` | No | `1433` | Port for SQL Server on your machine. |
| `DAB_PORT` | No | `5000` | Port for DAB on your machine. |
| `WEB_PORT` | No | `4280` | Port for the app on your machine. |
| `DAB_HOST_MODE` | No | `development` | DAB logging mode. `development` gives detailed errors. |
| `VITE_APPINSIGHTS_CONNECTION_STRING` | No | empty | Application Insights. Leave empty locally. |

Docker Compose sets `DATABASE_CONNECTION_STRING` for the `dab` container itself, pointing at the `sql` container. A `DATABASE_CONNECTION_STRING` in your `.env` (used by the non-Docker setup) is ignored by the containers.

### Files

| File | Purpose |
|---|---|
| `docker-compose.yml` | Defines the four containers and how they connect. |
| `docker/web.Dockerfile` | Image for the `web` container: Node 22 and the SWA CLI. |
| `docker/db-init.sh` | Waits for SQL Server, checks whether `Inventory` exists, and runs `bootstrap_db.ps1` if it doesn't (or always, with `--reset`). |
| `.dockerignore` | Keeps `node_modules`, `dist`, `coverage` and `venv` out of image builds. |

### Design notes

- **One bootstrap script.** `db-init` runs the existing `bootstrap_db.ps1` inside a PowerShell container rather than a separate copy of its logic, so the Docker and non-Docker setups always build the same database.
- **Safe by default.** `bootstrap_db.ps1` drops the database. `db-init` only runs it when `Inventory` doesn't exist, or when you explicitly pass `--reset`. Restarting containers never deletes data.
- **Same images as production and CI.** `sql` uses the `mcr.microsoft.com/mssql/server:2022-latest` image that CI uses. `dab` uses the official `mcr.microsoft.com/azure-databases/data-api-builder` image, the same one that runs in Azure Container Apps, pinned to a specific version so everyone runs the same one.
- **Local only.** Nothing here changes how staging or production are built or deployed.
- **Tests run in the `web` container.** The Python UI tests ([e2e-automation-test.md](e2e-automation-test.md)) still run on your machine, against the app at http://localhost:4280.
