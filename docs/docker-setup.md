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

1. **Git and a GitHub login.** See [Git and GitHub](#git-and-github) below.
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

If you already use WSL, consider creating a fresh distro for your development work rather than reusing an old one with leftovers in it. On recent WSL versions you can give it a name (run `wsl --update` first if `--name` isn't recognized):

```powershell
wsl --install -d Ubuntu-24.04 --name dev
```

To see which distro a terminal is in, run `echo $WSL_DISTRO_NAME`. All distros show the same name in the prompt by default (your Windows computer name); Step 2 shows how to change that.

#### Step 2: Make sure systemd is on

Docker runs as a systemd service. Recent Ubuntu installs have systemd on already. Check:

```bash
systemctl is-system-running
```

If this prints `running` or `degraded`, go to Step 3. Otherwise, open `/etc/wsl.conf` in the nano editor (it asks for your Linux password):

```bash
sudo nano /etc/wsl.conf
```

Add these lines, keeping anything already in the file:

```ini
[boot]
systemd=true
```

Save with `Ctrl+O` then `Enter`, and exit with `Ctrl+X`. To paste into the terminal, right-click.

Then run `wsl --shutdown` in PowerShell and reopen Ubuntu.

**Optional: give the distro its own name in the prompt.** Every distro uses your Windows computer name as its hostname, so two distros look identical in the terminal (`you@your-pc`). To tell them apart, add this to `/etc/wsl.conf` with your own choice of name:

```ini
[network]
hostname=dev
```

After `wsl --shutdown` and reopening, the prompt shows `you@dev`.

#### Step 3 (optional): Limit what WSL can do on Windows

By default, any program running in WSL can **start Windows programs as you** (this is called "interop") and **read and write your Windows files** through `/mnt/c`. So a malicious npm package that runs in WSL can do almost anything you can do on Windows. This project has hundreds of npm dependencies, so this is a real risk.

To turn both off, open `/etc/wsl.conf` again with `sudo nano /etc/wsl.conf` and make it look like this. Keep the `[boot]` section from Step 2, and any `[user]` section Ubuntu added:

```ini
[boot]
systemd=true

[user]
default=your-linux-username

[interop]
enabled=false
appendWindowsPath=false

[automount]
enabled=false
```

Save and exit (`Ctrl+O`, `Enter`, `Ctrl+X`), then run `wsl --shutdown` in PowerShell and reopen Ubuntu. To check: `ls /mnt/c` should now say "No such file or directory" or show an empty folder.

What still works: opening the app in your Windows browser, and Windows reaching into WSL (for example `\\wsl$\` paths in File Explorer). What stops working:

- Running Windows programs from the Ubuntu terminal, such as `code .`, `explorer.exe .` or `clip.exe`.
- Your `C:` drive at `/mnt/c`.
- **VS Code's WSL extension and its "execute in WSL" Dev Containers mode.** Both translate Windows paths with `wslpath`, which needs the `C:` drive mounted. They fail with `wsl: Failed to translate 'c:\Users\...'` and "VS Code Server for WSL closed unexpectedly." [Step 7](#step-7-connect-vs-code-to-your-distro) shows how to connect VS Code over SSH instead.

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

#### Step 7: Connect VS Code to your distro

VS Code runs on Windows and connects to your distro to work on files and run containers there.

**If you skipped Step 3**, use the **WSL** extension: install it, then press `Ctrl+Shift+P` and run **WSL: Connect to WSL using Distro...** and pick your distro. The bottom-left corner shows `WSL: <distro>`. You're done with this step.

**If you followed Step 3**, the WSL extension doesn't work (see above). Connect over SSH instead: you run a small SSH server in the distro that only accepts connections from your own PC, and VS Code's **Remote - SSH** extension connects to it. To VS Code, your distro then looks like any remote Linux machine.

The examples below use `dev` as the distro name and `you` as your Linux username. Replace both with your own (`echo $WSL_DISTRO_NAME` and `whoami` in the distro).

**7a. Install the SSH server** (in the distro):

```bash
sudo apt-get update && sudo apt-get install -y openssh-server netcat-openbsd
```

**7b. Restrict it to your own PC, port 2222, and keys only.** Create a settings file:

```bash
sudo nano /etc/ssh/sshd_config.d/10-local-only.conf
```

Paste this, replacing `you` with your Linux username, then save and exit (`Ctrl+O`, `Enter`, `Ctrl+X`):

```
ListenAddress 127.0.0.1
Port 2222
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin no
AllowUsers you
```

Ubuntu 24.04 starts SSH through systemd, so reload it:

```bash
sudo systemctl daemon-reload && sudo systemctl restart ssh.socket
```

Check that it's listening on `127.0.0.1:2222`:

```bash
ss -ltn | grep 2222
```

**7c. Create a key on Windows.** In PowerShell (press `Enter` at the passphrase prompt, or set one):

```powershell
ssh-keygen -t ed25519 -f $env:USERPROFILE\.ssh\wsl_dev
```

Check that you now have two **files**, `wsl_dev` and `wsl_dev.pub`:

```powershell
Get-ChildItem $env:USERPROFILE\.ssh
```

**7d. Give the distro your public key.** In PowerShell, replacing `dev` with your distro name:

```powershell
Get-Content $env:USERPROFILE\.ssh\wsl_dev.pub | wsl -d dev -e sh -c "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

**7e. Tell Windows how to reach the distro.** In PowerShell:

```powershell
notepad $env:USERPROFILE\.ssh\config
```

Add this, replacing `dev` (three times) and `you`, and **save** before you go on:

```
Host dev
  HostName 127.0.0.1
  Port 2222
  User you
  IdentityFile ~/.ssh/wsl_dev
  ProxyCommand C:\Windows\System32\wsl.exe -d dev -e nc 127.0.0.1 2222
```

The `ProxyCommand` line sends the connection through `wsl.exe`, which also **starts the distro if it isn't running**.

> Notepad sometimes saves this as `config.txt`. If `Get-ChildItem $env:USERPROFILE\.ssh` shows `config.txt`, rename it: `Rename-Item $env:USERPROFILE\.ssh\config.txt config`.

**7f. Test the connection.** In PowerShell:

```powershell
ssh dev
```

Type `yes` the first time it asks about the host. You should land at your distro's prompt. Type `exit`.

**7g. Connect VS Code.** In VS Code on Windows:

1. Install the **Remote - SSH** extension.
2. If the **WSL** extension is installed, **disable** it. Otherwise it keeps offering to reopen folders "in WSL", which fails.
3. Press `Ctrl+Shift+P`, run **Remote-SSH: Connect to Host...** and pick `dev`. If asked for the platform, choose **Linux**.

The first connection takes a minute while VS Code installs its server in the distro. The bottom-left corner shows `SSH: dev`. Next time, use **File → Open Recent**.

**If it doesn't work:**

- `ssh: Could not resolve hostname dev`: Windows didn't read your config. Make sure the file is called `config`, not `config.txt`, and that you saved it. `ssh -G dev | Select-String "^hostname|^port"` should show `hostname 127.0.0.1` and `port 2222`.
- `Permission denied (publickey)`: the key didn't reach the distro. Check `cat ~/.ssh/authorized_keys` in the distro and repeat 7d.
- `Connection refused`: the SSH server isn't listening. Repeat the restart command in 7b and check with `ss -ltn | grep 2222`.

### Git and GitHub

You need git to get the code, and a GitHub login to push your changes. On Windows, do this in your Ubuntu terminal.

Install git and the GitHub CLI (`gh`):

- **Windows (Ubuntu in WSL) and Linux (Ubuntu/Debian):**

  ```bash
  sudo apt-get update && sudo apt-get install -y git gh
  ```

- **macOS:** with [Homebrew](https://brew.sh/):

  ```bash
  brew install git gh
  ```

Tell git your name and email. These appear on your commits:

```bash
git config --global user.name "Your Name"
```

```bash
git config --global user.email "you@example.com"
```

Sign in to GitHub:

```bash
gh auth login
```

Choose **GitHub.com**, then **HTTPS**, then **Yes** to authenticate git, then **Login with a web browser**. If your browser doesn't open by itself (it won't if you followed Step 3 on Windows), open https://github.com/login/device in your browser and enter the one-time code `gh` shows you.

Check that it worked:

```bash
gh auth status
```

It should say `Logged in to github.com account <your username>`.

---

## First-time setup

### Step 1: Clone the repository

If you haven't set up git yet, do that first: see [Git and GitHub](#git-and-github).

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
