# Applying Schema Changes to Production

## Why this doc exists

The frontend deploys automatically (see [deployment-guide.md](deployment-guide.md)) and the DAB
config is uploaded by hand (see [dab-deployment.md](dab-deployment.md)). The **database schema has
no automated path to production** — this runbook covers how we apply it.

> **The trap:** `bootstrap_db.ps1` and every file in [`database/tables/`](../database/tables/) begin
> with `DROP TABLE IF EXISTS`. They are written to build a *fresh* database and **will erase all
> production data** if run against prod. Never point bootstrap at staging or prod.

## How we do it

We do **not** keep a migration history — no `migrations/` folder, no version table, no numbered
delta files. The process is deliberately lightweight:

1. **Write a one-off `ALTER` statement** and run it manually against the database.
2. **Update the canonical table definition** in [`database/tables/`](../database/tables/) so the
   `CREATE TABLE` reflects the new shape. A fresh bootstrap then produces the same schema the live
   database now has.
3. **Throw the `ALTER` away.** It was a means to an end; the repo's `CREATE TABLE` is the single
   source of truth, not a chain of deltas.

The repo file is always the desired *end state*. The live database is brought to that end state by
hand, once per environment, **run directly in the Azure Portal SQL query editor**. Staging gets the
change first and soaks for a few weeks before the same SQL is replayed on prod.

## What the CI does and does not do

[`azure-sql-CI.yml`](../.github/workflows/azure-sql-CI.yml) spins up a throwaway SQL container on
every push to `dev`/`staging` that touches `database/**/*.sql`, applies the full schema from the repo
files, and runs the tests in [`database/tests/`](../database/tests/). This is a **validation gate
only** — it proves your updated `CREATE TABLE` definitions are internally consistent. It never
connects to a real database and never deploys anything.

## Procedures, views, and types are different

These objects hold no data, so their repo files are already `DROP ... IF EXISTS` + `CREATE`. There is
no `ALTER` dance — just **re-run the changed file** against the live database and it replaces the
object in place. The file *is* the change.

## Procedure

We run all schema SQL **directly in the Azure Portal SQL query editor** for the target database —
not through a local connection string or `bootstrap_db.ps1`. Staging gets the change first, then it
**soaks for a few weeks** so the team can use it and give feedback, then the *exact same* SQL is
applied to prod.

### 1. Stage the change
1. In the Azure Portal, open the **staging** SQL database → **Query editor**, and run your
   `ALTER TABLE ...`. Add columns as `NULL` or with a default to avoid failing on existing rows.
2. Update the matching `CREATE TABLE` in [`database/tables/`](../database/tables/) to mirror the
   altered table. Re-run any changed `procedures/`, `views/`, or `types/` files in the query editor.
3. Ship the corresponding DAB + frontend changes to staging (see step 3) and smoke-test.

### 2. Soak on staging
Leave the change on staging for **a few weeks** so the team exercises it and surfaces issues before
it reaches prod. Keep the exact SQL you ran on staging — you will replay it verbatim on prod.

### 3. Apply to production
1. Confirm a recent backup / point-in-time restore is available (see [restore-db.md](restore-db.md)).
2. In the Azure Portal, open the **prod** SQL database → **Query editor**.
3. Run the **same** `ALTER` (and any changed `procedures/`, `views/`, `types/`) you ran on staging.
4. Spot-check with a read-only query.

### 4. Ship DAB, then frontend
1. Upload the new `dab-config.json` and restart the Container App ([dab-deployment.md](dab-deployment.md)).
2. Bump `package.json` and merge `staging → main` to deploy the frontend ([deployment-guide.md](deployment-guide.md)).

> **Ordering is not optional.** Schema → DAB → frontend. The frontend calls DAB, which reads the new
> schema. Deploy them out of order and prod breaks for the duration of the gap.

## Trade-off to be aware of

Because we keep no history, the only record that a column was added is the commit that edited the
`CREATE TABLE` file. There is no automatic check that prod actually received the `ALTER` — that
guarantee lives entirely in running the change against each environment by hand.

During the soak window, staging and prod are **intentionally** different: staging has the new schema,
prod does not yet. That is expected. The risk is *forgetting* to replay the SQL on prod when the soak
ends — at which point the repo's table definition (and staging) say one thing while prod silently
lags. Keep the exact SQL you ran on staging until it has been applied to prod, and treat "replay on
prod" as the explicit close-out step for the change.

## Rollback

Schema is the hardest layer to roll back. Prefer **roll forward** — write a corrective `ALTER` and
update the table definition again. Use point-in-time restore ([restore-db.md](restore-db.md)) only as
a last resort, and remember it reverts *data* too, not just schema.
