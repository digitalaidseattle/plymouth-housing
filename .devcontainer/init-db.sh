#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

reset=false
if [[ "${1:-}" == "--reset" ]]; then
  reset=true
elif [[ -n "${1:-}" ]]; then
  echo "Usage: $0 [--reset]" >&2
  exit 2
fi

sql() {
  pwsh -NoProfile -Command "
    Import-Module SqlServer -ErrorAction Stop
    \$b = [Microsoft.Data.SqlClient.SqlConnectionStringBuilder]::new(\$env:DATABASE_CONNECTION_STRING)
    \$b['Initial Catalog'] = 'master'
    (Invoke-Sqlcmd -ConnectionString \$b.ConnectionString -Query \"$1\" -ErrorAction Stop).Item(0)
  "
}

echo "Waiting for SQL Server..."
for attempt in $(seq 1 30); do
  if sql "SELECT 1" >/dev/null 2>&1; then
    break
  fi
  if [[ $attempt -eq 30 ]]; then
    echo "SQL Server didn't respond after 60 seconds." >&2
    exit 1
  fi
  sleep 2
done

if [[ "$reset" == false ]]; then
  # Assigned on its own line so a failed query stops the script under set -e
  # instead of reading as "no database" and running the destructive bootstrap.
  db_id="$(sql "SELECT DB_ID(N'Inventory')")"
  if [[ -n "${db_id//[[:space:]]/}" ]]; then
    echo "The Inventory database already exists. Run '$0 --reset' to drop and recreate it."
    exit 0
  fi
fi

pwsh -NoProfile -File ./database/bootstrap_db.ps1
