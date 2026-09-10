# Ask the Data Setup

## What it is

The Ask the Data card on the Analytics page takes a plain English question, has Gemini write
one `SELECT`, runs it as a read-only SQL login, and shows the rows. It is an Azure Function in
[`api/`](../api/), the only part of the app that does not go through DAB.

> **Status: local development only.** There is no deployment plan for it yet.

## How it fits together

Four things run locally. The first three are the normal dev setup, the fourth is new.

| Port | What | Started by |
|---|---|---|
| 1433 | SQL Express | Windows service |
| 5000 | DAB | `dab start -c ./dab/dab-config.json` |
| 7071 | Ask the Data Function | `npm start --prefix api` |
| 4280 | SWA emulator, the URL you browse | `npx swa start` |

The browser only talks to :4280. The emulator forwards `/api/*` to :7071 because of
`apiDevserverUrl` in [`swa-cli.config.json`](../swa-cli.config.json), everything else to Vite
on :3000. If :7071 is not running, only this card fails.

## Setup

Do the normal setup first: [database-setup.md](database-setup.md),
[DAB-setup.md](DAB-setup.md), [swa-setup.md](swa-setup.md).

Then steps 1 to 3 once per machine, and 4 to 6 once per checkout.

### 1. Install Azure Functions Core Tools

```powershell
npm install -g azure-functions-core-tools@4
func --version   # expect 4.x
```

### 2. Get a Gemini API key

Create one at [aistudio.google.com/apikey](https://aistudio.google.com/apikey). The free tier
is enough. Ask the team lead if you would rather use the project's key.

### 3. Turn on SQL logins and TCP

**Windows SQL Express only.** macOS Docker and WSL installs already have both, skip to step 4.

The Function connects as a SQL username and password over TCP. A default SQL Express install
allows neither. DAB never noticed because .NET can use shared memory and Windows auth. The
Function's Node driver cannot.

Run in an **admin** PowerShell:

```powershell
# Confirm your instance folder name first (SQL Server 2025 Express is MSSQL17.SQLEXPRESS)
(Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\Instance Names\SQL').SQLEXPRESS

$k = "HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\MSSQL17.SQLEXPRESS\MSSQLServer"
Set-ItemProperty $k -Name LoginMode -Value 2                        # allow SQL logins
Set-ItemProperty "$k\SuperSocketNetLib\Tcp" -Name Enabled -Value 1  # allow TCP
Get-ChildItem "$k\SuperSocketNetLib\Tcp" | ForEach-Object { Set-ItemProperty $_.PSPath -Name Enabled -Value 1 }
Set-ItemProperty "$k\SuperSocketNetLib\Tcp\IPAll" -Name TcpDynamicPorts -Value ''
Set-ItemProperty "$k\SuperSocketNetLib\Tcp\IPAll" -Name TcpPort -Value '1433'
Restart-Service 'MSSQL$SQLEXPRESS' -Force

# Should print a row. Nothing means the service did not pick up the change.
Get-NetTCPConnection -LocalPort 1433 -State Listen
```

`Requested registry access is not allowed` means the shell is not elevated. The same two
switches live in SQL Server Configuration Manager (Protocols for SQLEXPRESS, TCP/IP) and SSMS
(Server Properties, Security), if you prefer clicking.

Your existing `Server=localhost\SQLEXPRESS` string keeps working for DAB and the bootstrap
script. Only the Ask the Data string uses `Server=localhost,1433`.

### 4. Install the api packages

`api/` is its own npm package. The root `npm install` does not touch it.

```powershell
npm install --prefix api
```

### 5. Create the read-only login

The card connects as `analytics_reader`, which can only `SELECT` and has no grant on `Users`,
where volunteer PINs are stored. [`bootstrap_db.ps1`](../database/bootstrap_db.ps1) creates it.

You choose the password. The same string goes in `.env` in step 6, so keep it to hand.

```powershell
$env:DATABASE_CONNECTION_STRING = 'Server=localhost\SQLEXPRESS;Database=Inventory;Persist Security Info=False;Integrated Security=SSPI;TrustServerCertificate=True;'
$env:ASK_DATA_PASSWORD = 'AskData-Local-ReadOn1yUser'
powershell -ExecutionPolicy Bypass -File .\database\bootstrap_db.ps1 -SeedDemoData -CreateAnalyticsUser
```

| Switch | What it adds | Needed because |
|---|---|---|
| `-CreateAnalyticsUser` | The `analytics_reader` login, plus `SELECT` on the nine analytics tables | The Function has no login to connect as without it |
| `-SeedDemoData` | ~60 residents and a year of fake checkout history | A fresh database has no transactions, so every question answers zero |

> This rebuilds the Inventory database from scratch. Normal locally, never point it at staging
> or prod. See the warning in [database-setup.md](database-setup.md).

Already seeded and you only want the login? Drop `-SeedDemoData`. It still drops and recreates
the database, there is no add-only mode.

Re-running with a different `$env:ASK_DATA_PASSWORD` resets the login to the new one, so the
script and your `.env` cannot drift apart. Check it works before going further:

```powershell
sqlcmd -S "localhost,1433" -U analytics_reader -P "$env:ASK_DATA_PASSWORD" -d Inventory -C -Q "SELECT COUNT(*) FROM Residents;"
```

A row count means the login, the port and the password are all correct. `Login failed for user
'analytics_reader'` means the password does not match the login.

### 6. Fill in `.env`

In the repo root, next to `package.json`. Copy [`.env.example`](../.env.example) if you have no
`.env` yet. Both keys are already there as blanks:

```
GEMINI_API_KEY=<the key from step 2>
DATABASE_CONNECTION_STRING_ASK_DATA=Server=localhost,1433;Database=Inventory;User Id=analytics_reader;Password=AskData-Local-ReadOn1yUser;TrustServerCertificate=True;
```

- `Server=localhost,1433`, with a **comma**. Not `localhost\SQLEXPRESS`, the Node driver cannot
  resolve named instances. Same on macOS Docker and WSL.
- `Password=` must be the exact `$env:ASK_DATA_PASSWORD` from step 5.
- `DATABASE_CONNECTION_STRING_ASK_DATA` is required. The Function does not fall back to
  `DATABASE_CONNECTION_STRING`, ensuring generated queries never receive the main application's
  write-capable credentials.

## Run it

Three terminals, in this order. The second compiles `api/` before it starts, so give it a few
seconds the first time.

```powershell
dab start -c ./dab/dab-config.json
npm start --prefix api
npx swa start
```

The api terminal is ready when it prints:

```
askData: [POST] http://localhost:7071/api/ask-data
```

Open http://localhost:4280, sign in with **admin** in the roles box, go to Analytics, and ask
something like "how many residents are there".

## When it does not work

Read the card's message first, it points at the step to go back to.

| Message on the card | Cause | Fix |
|---|---|---|
| Could not reach the assistant. | Nothing listening on :7071 | Start terminal two. Starting it after `swa start` is fine, no restart needed |
| Admins only. | Signed in without the `admin` role | Sign out at http://localhost:4280/.auth/logout, sign in again with `admin` in the roles box |
| Ask the data is not configured. | `GEMINI_API_KEY` missing from `.env` | Step 6 |
| The assistant is busy. Ask again in a moment. | Every Gemini model returned 429 or 503 | Wait and retry, nothing to fix |
| Could not answer that one. Try rewording the question. | Anything that failed server-side | Check the api terminal, table below |

In the api terminal:

| Log line | Cause | Fix |
|---|---|---|
| `Port for SQLEXPRESS not found in localhost` | TCP is off, or the string still says `localhost\SQLEXPRESS` | Steps 3 and 6 |
| `Login failed for user 'analytics_reader'` | Password mismatch, or the login was never created | Steps 5 and 6 |
| `No connection string is configured.` | Neither connection string is in `.env` | Step 6 |
| A Gemini or quota error | Bad or rate-limited key | Step 2 |

At startup the api terminal prints `injected env (4) from ..\.env`. A count of 0 means it is
not reading your `.env`, check you started it from the repo root.

## What keeps it safe

- `analytics_reader` can only `SELECT`, and has no grant on `Users`, where volunteer PINs are
  stored in plain text. A query that got past the validator still could not write, or read PINs.
- The Function checks the SWA `admin` role on every call, and allows 40 questions per hour per
  user. The card shows the count against that limit.
- Only rows come back to the browser. The prompt and the schema stay on the server. The
  generated SQL is shown on the card on purpose, so an admin can see what ran.
