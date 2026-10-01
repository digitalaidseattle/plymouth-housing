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

You need:

1. **Git**
2. **Docker Engine with the Compose plugin.** How you get it depends on your operating system:
   - **Windows:** Docker Engine installed **inside WSL**. See [Windows: Docker inside WSL](#windows-docker-inside-wsl) below.
   - **macOS:** [Docker Desktop](https://www.docker.com/products/docker-desktop/).
   - **Linux:** [Docker Engine](https://docs.docker.com/engine/install/) with the Compose plugin.
3. **[Visual Studio Code](https://code.visualstudio.com/download)** (recommended). On Windows, also install the **WSL** extension.

Check that Docker works:

```bash
docker compose version
```

You should see `Docker Compose version v2.x` or later.

> **Apple Silicon Mac users (M1 and later):** the SQL Server image is built for Intel. In Docker Desktop, open **Settings → General** and turn on **"Use Rosetta for x86_64/amd64 emulation on Apple Silicon"**. SQL Server will start more slowly than on other machines, but it works.

### Windows: Docker inside WSL

On Windows, the project runs entirely inside WSL (Windows Subsystem for Linux): your code, Docker and the containers all live in an Ubuntu distro. We don't use Docker Desktop. Running Docker inside the distro keeps everything in one place, gives fast file access and working hot reload, and works with WSL's links to Windows turned off (see [Step 3](#step-3-optional-limit-what-wsl-can-do-on-windows)).

We run Docker in **rootless mode**: the Docker daemon and the containers run as your own Linux user instead of as root. If a container or a malicious package is compromised, it doesn't get root in your distro, and so it can't undo the settings in Step 3.

Run every command in this guide in an **Ubuntu terminal**, not PowerShell, and keep the repo in your Linux home folder (for example `~/repos`), **not** under `C:\` or `/mnt/c`.

#### Step 1: Install WSL with Ubuntu

In a PowerShell window **run as Administrator**:

```powershell
wsl --install -d Ubuntu-24.04
```

Restart Windows if asked, then open **Ubuntu** from the Start menu and create your Linux username and password.

If you already use WSL for other things, you can give this project its own distro instead. On recent WSL versions, add a name (run `wsl --update` first if `--name` isn't recognized):

```powershell
wsl --install -d Ubuntu-24.04 --name plymouth
```

#### Step 2: Make sure systemd is on

Docker runs as a systemd service. Recent Ubuntu installs have systemd on already. Check:

```bash
systemctl is-system-running
```

If this prints `running` or `degraded`, go to Step 3. Otherwise, add these lines to `/etc/wsl.conf` (for example with `sudo nano /etc/wsl.conf`):

```ini
[boot]
systemd=true
```

Then run `wsl --shutdown` in PowerShell and reopen Ubuntu.

#### Step 3 (optional): Limit what WSL can do on Windows

By default, any program running in WSL can **start Windows programs as you** (this is called "interop") and **read and write your Windows files** through `/mnt/c`. So a malicious npm package that runs in WSL can do almost anything you can do on Windows. This project has hundreds of npm dependencies, so this is a real risk.

To turn both off, add these lines to `/etc/wsl.conf` (keep the `[boot]` section from Step 2):

```ini
[interop]
enabled=false
appendWindowsPath=false

[automount]
enabled=false
```

Then run `wsl --shutdown` in PowerShell and reopen Ubuntu.

What still works: the VS Code WSL extension, opening the app in your Windows browser, and connecting to the database from Windows. What stops working: running Windows programs from the Ubuntu terminal, such as `code .`, `explorer.exe .` or `clip.exe`, and seeing your `C:` drive at `/mnt/c`. To open the project in VS Code, start VS Code on Windows and use **WSL: Connect to WSL** instead.

These settings only hold as long as nothing gets root in your distro, because root can change `/etc/wsl.conf`. Rootless Docker (Step 6) and a `sudo` password help keep it that way.

#### Step 4: If Docker Desktop is installed, uninstall it

Skip this step if you've never installed Docker Desktop.

Docker Desktop would compete with the Docker Engine in your distro for the `docker` command and for ports, and it leaves settings behind that break Docker Engine. Uninstall it from **Windows Settings → Apps → Installed apps → Docker Desktop → Uninstall**. This deletes all containers and data inside Docker Desktop, so first back up anything you need.

Then, in PowerShell, check that its WSL distros are gone:

```powershell
wsl -l -v
```

If `docker-desktop` (or `docker-desktop-data`) is still listed, remove it, then restart WSL:

```powershell
wsl --unregister docker-desktop
```

```powershell
wsl --shutdown
```

Finally, in Ubuntu, remove the links and settings Docker Desktop left in your distro. Check for leftover links first:

```bash
ls -l /usr/bin/docker*
```

Remove any that point to `/mnt/wsl/docker-desktop/...` or `/Docker/host/...`, for example:

```bash
sudo rm /usr/bin/docker /usr/bin/docker-compose /usr/bin/docker-credential-desktop.exe
```

Docker Desktop also leaves a `~/.docker` folder that tells Docker to fetch credentials from a Windows program. Move it out of the way; Docker creates a fresh one:

```bash
mv ~/.docker ~/.docker.desktop-backup
```

#### Step 5: Install Docker Engine

These commands follow Docker's official [Ubuntu install guide](https://docs.docker.com/engine/install/ubuntu/). If anything here doesn't work, that guide is the source of truth.

Add Docker's package repository:

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

Install Docker Engine, the Compose plugin, and the extra packages rootless mode needs:

```bash
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin docker-ce-rootless-extras uidmap dbus-user-session
```

#### Step 6: Switch Docker to rootless mode

These steps follow Docker's [rootless mode guide](https://docs.docker.com/engine/security/rootless/).

The installer started a Docker daemon that runs as root. Turn it off:

```bash
sudo systemctl disable --now docker.service docker.socket
```

```bash
sudo rm -f /var/run/docker.sock
```

Set up rootless Docker for your user. Run this **without** `sudo`:

```bash
dockerd-rootless-setuptool.sh install
```

Tell the `docker` command to use it:

```bash
docker context use rootless
```

Let your rootless Docker keep running when no terminal is open, so containers don't stop when you close Ubuntu:

```bash
sudo loginctl enable-linger $USER
```

Check that it works:

```bash
docker run --rm hello-world
```

You should see `Hello from Docker!`. To confirm you're in rootless mode:

```bash
docker info --format '{{.SecurityOptions}}'
```

The output should include `name=rootless`.

> **Don't add yourself to the `docker` group.** Many guides tell you to. Members of that group control the root Docker daemon, which effectively gives them root on the distro, and that defeats the point of rootless mode. If you're already in it, leave it with `sudo gpasswd -d $USER docker` and open a new terminal.

#### Opening the app from Windows

WSL forwards ports to Windows automatically, so your normal Windows browser can open http://localhost:4280 once the containers are running. VS Code tools on Windows (such as the SQL Server extension) can connect to `localhost,1433` the same way. This port forwarding is separate from interop, so it still works with Step 3 applied.

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

### `docker` says "Cannot connect to the Docker daemon"

Your rootless Docker service isn't running. Start it (no `sudo`):

```bash
systemctl --user start docker
```

If that doesn't help, check that the `docker` command points at rootless Docker: `docker context ls` should show a `*` next to `rootless`. If not, run `docker context use rootless`.

On Windows, if `ls -l /usr/bin/docker` points to `/mnt/wsl/docker-desktop/...`, you're still using Docker Desktop's link. Follow [Step 4](#step-4-if-docker-desktop-is-installed-uninstall-it).

### "port is already allocated" or "address already in use"

Something else on your machine is using port `1433`, `5000` or `4280`. Common culprits:

- A SQL Server you installed earlier (SQL Express on Windows, or SQL Server on WSL). Stop it, or change the port in `.env` (see [Configuration reference](#configuration-reference)).
- An older SQL Server container from the [database-setup.md](database-setup.md) instructions. List all containers with `docker ps -a` and stop the old one with `docker stop <name>`.
- **Windows:** containers running in Docker Desktop. Docker Desktop publishes ports on Windows `localhost` too, so uninstall it (see [Step 4](#step-4-if-docker-desktop-is-installed-uninstall-it)).
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

- **Windows:** your repo is probably under `C:\` or `/mnt/c`. Move it into your WSL home folder (see [Windows: Docker inside WSL](#windows-docker-inside-wsl)).
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
- **Ports open on your machine only.** Every published port is bound to `127.0.0.1` (for example `127.0.0.1:1433:1433`), so SQL Server, DAB and the app can't be reached from other machines on your network, whatever your WSL or firewall settings.
- **Rootless Docker on Windows.** The containers run as your Linux user, not root, so a compromised container or dependency can't change your WSL settings or reach into Windows through them.
- **Local only.** Nothing here changes how staging or production are built or deployed.
- **Tests run in the `web` container.** The Python UI tests ([e2e-automation-test.md](e2e-automation-test.md)) still run on your machine, against the app at http://localhost:4280.
