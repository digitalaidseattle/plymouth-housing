# Incident: staging deploy overwrote production, disabling the test-account guard

| | |
|---|---|
| **Date of incident** | 2026-08-03 21:15 UTC |
| **Date detected** | 2026-08-05 |
| **Detected by** | Manual login with a `test`-role account on production |
| **Duration** | 2026-08-03 21:15 UTC → 2026-08-07, when v1.5.2 reached production (~4 days) |
| **Severity** | Medium as it played out — no data loss, no user-visible failure. Would have been High had `staging` carried a schema or DAB change; see [Near miss](#near-miss-the-frontend-moved-the-backend-did-not) |
| **Status** | Resolved. Fix shipped in v1.5.2 via PR #596 (→ `staging`) and PR #602 (`staging` → `main`). Verification and the remaining hardening items are tracked in [Action items](#action-items). |

---

## Summary

For roughly two days, the production site served a bundle built with
`VITE_ENVIRONMENT=staging`. Because the production test-account guard keys off that
build-time value, it evaluated `"staging" === "production"` as `false` and admitted
`test`-role accounts into production — the exact case it was written to prevent.

The guard code was correct and deployed the whole time. The wrong *build* was on the host.

---

## Impact

- **Test accounts could sign into production.** A volunteer test account (roles `volunteer`,
  `test`) logged in and reached the app normally.
- **Production ran a staging build** — differing from the released `main` build in both
  source *and* build-time configuration. At the moment of the overwrite `staging` (`7ffb89e`)
  was **107 commits and 3,744 changed lines ahead** of `main` (`33aa186`, v1.5.1): the
  `dev` → `staging` merge of 2026-07-15 (`f97dafa`) had already brought in the button and
  dialog standardization, the rows-per-page pagination work, the `src/types/` refactor and
  the tablet/mobile layout fixes. All of it went live to real users on 2026-08-03, without
  a release, and stayed there for four days.

  > An earlier revision of this report described the two builds as "identical in source."
  > That was wrong, and it understated the incident: this was not merely a
  > mis-configured build of already-released code, it was an unreleased frontend
  > promoted to production by accident. The severity call above stays at Medium only
  > because the changes happened to be frontend-only and non-breaking — see
  > [Near miss](#near-miss-the-frontend-moved-the-backend-did-not).
- **Telemetry attribution is suspect for the window.** The staging workflow injects
  `VITE_CLARITY_PROJECT_ID` and `VITE_APPINSIGHTS_CONNECTION_STRING` from the GitHub
  `staging` environment. If those secrets differ from the `production` ones, production
  traffic from **2026-08-03 21:15 UTC** — when the overwrite completed — until the
  production redeploy was reported to the staging Clarity/App Insights resources.
  **Not yet verified** — requires comparing the two GitHub environments.
- **No data loss or corruption.** Both builds talk to the same relative `/api` endpoint on
  the same Static Web App, so the database in use never changed.

The guard is documented as a guardrail against *accidental* testing against production,
not a security boundary — a direct API call bypasses it regardless. The durable backstop
remains keeping test accounts and test data out of the production database.

### Near miss: the frontend moved, the backend did not

We got lucky on timing. Those 107 commits were entirely frontend — no `database/` or `dab/`
files among the 88 changed — so the staging frontend stayed compatible with production's
backend and users saw nothing wrong. The luck was in *what* had accumulated on `staging`,
not in how much.

Nothing about the deploy guaranteed that. The frontend and the backend are deployed by
entirely separate mechanisms:

- **Frontend** — pushed automatically by the SWA workflows on every branch push.
- **DAB config** (`dab/dab-config.json`) — uploaded by hand to Azure Files and picked up by
  the Container App on restart ([dab-deployment.md](../dab-deployment.md)). Not referenced
  by any workflow.
- **Database schema** (`database/`) — applied by hand.

So a staging→production overwrite ships an unreviewed frontend against the **production**
database and the **production** DAB entity set. Had any of those 107 commits carried a
schema change — a new entity, a renamed column, a new stored procedure — the production
frontend would have started calling endpoints that production's DAB does not expose, or
columns that do not exist, and real users would have hit API errors on the affected pages.
That is a user-visible outage, not a silent guardrail failure.

Note that the blast radius is set by how far `staging` has drifted, and the drift grows
with every day `staging` waits to be promoted. On 2026-08-03 it had been accumulating for
19 days. This is the true reach of the defect, and it is why item 4 below matters even
though this particular occurrence was harmless.

---

## Timeline

| When (UTC) | Event |
|---|---|
| 2026-07-28 23:14 | Commit `19b402d` removes `deployment_environment: 'staging'` from the staging workflow, reacting to an `Unexpected input(s)` warning in the run log. |
| 2026-08-01 16:22 | v1.5.1 deploys to production (run #450). Test-account guard goes live and works. |
| 2026-08-03 21:15 | Push to `staging` (PR #589) runs the staging workflow. With no target environment it uploads to the SWA's default environment — **production**. |
| 2026-08-05 | A `test`-role account signs into production and is not blocked. Investigation begins. |
| 2026-08-05 | Root cause confirmed from the live bundle and CI logs. Fix opened as PR #596. |
| 2026-08-05 21:58 | PR #596 merges to `staging`: `deployment_environment` restored, version bumped to 1.5.2. Backported to `dev` as PR #600. |
| 2026-08-07 | Promotion PR #602 (`staging` → `main`) opened. The merge conflicts in four files — see [Aftermath](#aftermath-the-hotfix-branches-had-diverged). |
| 2026-08-07 | v1.5.2 deploys to production. The production bundle is rebuilt with `VITE_ENVIRONMENT=production`, re-arming the guard, and telemetry returns to the production resources. |

---

## Root cause

The staging workflow authenticates with **the same Static Web App token as production**
(`AZURE_STATIC_WEB_APPS_API_TOKEN_SALMON_ISLAND_01BE9BF1E`). One deploy token, one Azure
resource — the branch a workflow runs on does not influence where the artifact lands.

Separation depended entirely on a single input:

```yaml
deployment_environment: 'staging'
```

Without it, `Azure/static-web-apps-deploy` uploads to the app's *default (production)*
environment. Commit `19b402d` removed that line, so the next `staging` push replaced the
live site.

### Why the line was removed

The action logs, on every run:

```text
Unexpected input(s) 'deployment_environment', valid inputs are ['entryPoint', 'args',
'action', 'app_location', 'azure_static_web_apps_api_token', ...]
```

This warning is **cosmetic and misleading**, and Microsoft has said so. In
[Azure/static-web-apps Discussion #787](https://github.com/Azure/static-web-apps/discussions/787),
Anthony Chu introduced the input on 2022-04-20 — *"so new that we haven't documented it
yet!"* — and, asked directly about the warning, replied:

> "Yes it understands the `deployment_environment` input but will generate a warning right
> now. The warning should go away soon."

A user confirmed the following day that deployments to `dev`, `test`, `uat` and `production`
all worked despite it. Four years on, the warning still fires and the input still works: the
action's `action.yml` does not declare it, while the entrypoint reads
`INPUT_DEPLOYMENT_ENVIRONMENT` from the environment regardless.

The usage is **officially documented** —
[Create named preview environments in Azure Static Web Apps](https://learn.microsoft.com/en-us/azure/static-web-apps/named-environments)
shows `deployment_environment` on `Azure/static-web-apps-deploy@v1`, with no mention of any
warning. Stale warnings are a known pattern for this action; see
[issue #952](https://github.com/Azure/static-web-apps/issues/952), where the same `@v1`
action emits an obsolete `set-output` deprecation notice.

There is no bug report or support incident tracking the warning. Nobody is going to fix it,
so the only defence is knowing it is expected.

CI logs prove the input was honoured despite the warning:

| Run | `deployment_environment` | Warning printed | Deployed to |
|---|---|---|---|
| Jul 28, pre-removal | present | yes | `salmon-island-01be9bf1e-staging.westus2.5.azurestaticapps.net` |
| Aug 3, post-removal | absent | no | `salmon-island-01be9bf1e.5.azurestaticapps.net` ← **production** |

The July 28 run printed the warning *and* passed `INPUT_DEPLOYMENT_ENVIRONMENT` into the
container *and* deployed to the correct staging hostname. Acting on the warning is what
broke the isolation.

### Contributing factors

1. **Shared deploy token.** A single credential for both environments makes correct
   targeting depend on one optional YAML line rather than on credentials.
2. **Silent success.** The staging run reported green and printed its deploy URL, but
   nothing compares that URL against the expected staging hostname.
3. **A 2-day detection gap.** Nothing observes which build is on which host. The only
   signal was a human noticing a test account was not blocked.
4. **Guard input is build-time only.** The guard trusts a value baked in at build time. It
   has no way to notice that a correctly-built staging bundle is being served from the
   production hostname.
5. **Environment is invisible in telemetry.** `ENVIRONMENT` is attached only as a property
   of the `TestAccountBlockedInProduction` event, which by definition never fires in this
   failure mode. No query could answer "which build is live?"; the answer had to be read
   out of the minified bundle in DevTools.

---

## Detection

The account's claims at `/.auth/me` on production confirmed the role was present:

```json
{ "clientPrincipal": { "userDetails": "<volunteer test account>",
    "userRoles": ["volunteer", "test", "anonymous", "authenticated"] } }
```

Searching the live bundle in DevTools for `TestAccountBlockedInProduction` found the guard
intact, and the environment constant next to it read:

```js
KT = `staging`
```

That single line identified the deployed artifact as a staging build and ended the
investigation.

---

## Resolution

PR #596 (targeting `staging`):

1. Restores `deployment_environment: 'staging'`, with a comment recording that the token
   targets the production app, that omitting the line overwrote production on 2026-08-03,
   and that the `Unexpected input(s)` warning is expected and must not be acted on.
2. Bumps `1.5.1` → `1.5.2`. The production workflow only deploys when the `package.json`
   version has no matching tag, so without a bump no production build can replace the
   staging bundle currently live.

PR #602 then promoted `staging` → `main` on 2026-08-07, which is what actually ended the
incident: the production workflow saw an untagged version, rebuilt the bundle with
`VITE_ENVIRONMENT=production`, and redeployed. That rebuild is the fix — the guard's input
is baked in at build time, so nothing short of a production build could re-arm it.

**Verification, every staging run from here on** — the run must log:

```text
Visit your site at: https://salmon-island-01be9bf1e-staging.westus2.5.azurestaticapps.net
```

A region-less hostname means the input did not take and production was overwritten again.
This check is manual until action item 4 automates it.

### Aftermath: the hotfix branches had diverged

Promoting `staging` was not the clean merge [hotfix-handling.md](../hotfix-handling.md)
describes. PR #602 conflicted in four files — the staging workflow, `MainLayout/index.tsx`,
`package.json` and `package-lock.json`.

The cause was that the July/August hotfixes were **re-applied** on parallel branches rather
than backported by merging `main`. Each fix exists twice, as two commits with identical
patch-ids and different hashes:

| Change | on `main` | on `staging` |
|---|---|---|
| `fix: remove unsupported deployment_environment input` | `19b402d` | `0a07141` |
| `update url to staging.` | `fbc9798` | `7ada2ab` |
| `docs: document production test-account guard` | `4817f06` | `24b1533` |
| `fix: gate rendering on the production test-account guard` | `3a7867d` | `084059e` |

Git cannot tell that these are the same change, so it reported a conflict on every file
they touched. Every conflict resolved to `staging`'s side, and the merged tree came out
byte-identical to `origin/staging` — `main` contributed nothing that `staging` did not
already have. The divergence was noise, but it was noise that had to be resolved by hand
during an incident recovery, on the release that was fixing the incident.

[hotfix-handling.md](../hotfix-handling.md) has been updated to require backporting by
merging `main` rather than re-applying the change on a fresh branch.

---

## Action items

| # | Action | Addresses | Status |
|---|---|---|---|
| 1 | Restore `deployment_environment` with an explanatory comment | Root cause | **Done** — PR #596 |
| 2 | Bump to 1.5.2 so production can be redeployed | Impact | **Done** — PR #596 |
| 3 | Give staging its own SWA resource or its own deploy token, so targeting does not depend on an optional input | Factor 1 | Resource constraint |
| 4 | Assert the deployed hostname in the workflow — fail the run if `static_web_app_url` is not the expected environment | Factor 2 | Open |
| 5 | Add a telemetry initializer stamping `ENVIRONMENT` on all App Insights events, so "which build is live" is a query | Factor 5 | Open |
| 6 | Have the guard cross-check `window.location.hostname` against the production host, not just the build-time constant, so a mismatched build fails closed | Factor 4 | Open |
| 7 | Add a post-deploy smoke check that fetches the site and asserts the expected environment | Factor 3 | Open |
| 8 | Verify whether production telemetry was routed to staging Clarity / App Insights during the window | Impact | Open |
| 9 | Run CI on PRs targeting `staging` (the workflow currently runs only on push, so PR #596 merged unverified) | Process | Open |
| 10 | Confirm from the v1.5.2 production run log that the deployed bundle reads `ENVIRONMENT = "production"` | Verification | Open |
| 11 | Backport hotfixes by merging `main` instead of re-applying them, so `main` and `staging` stop diverging | [Aftermath](#aftermath-the-hotfix-branches-had-diverged) | **Done** — `hotfix-handling.md` updated |
| 12 | Promote `staging` on a schedule rather than on demand, so the drift that sets the blast radius stays small | [Near miss](#near-miss-the-frontend-moved-the-backend-did-not) | Open |

**"Resource constraint"** means accepted-and-not-planned: this is a volunteer project with
limited people and limited Azure budget, and a second Static Web App resource is not
something we can take on. Item 3 is recorded because it is the structurally correct fix,
not because it is queued.

Since item 3 will not happen, **item 4 carries the weight**. The shared token stays, so a
missing `deployment_environment` will always point at production; asserting the deployed
hostname in the workflow is a few lines of YAML and turns that from a silent overwrite into
a failed run. Items 4, 5 and 6 are all small, code-only changes — they are the affordable
half of this list and cover the same failure.

---

## Lessons

**A warning that is wrong is worse than no warning.** `Unexpected input(s)` was emitted on
every successful run for months while the input worked perfectly. It eventually prompted a
tidy-up that removed a production safeguard. Where a known-bogus warning cannot be
silenced, the code it points at needs a comment saying so.

**Shared credentials make isolation a matter of discipline.** Two environments behind one
deploy token means any omission defaults to hitting production. Separate credentials would
have made this mistake impossible rather than merely unlikely — but a second Azure resource
is beyond what a volunteer project can carry, so the shared token stays and the workflow
has to check its own work instead.

**Automatic frontend deploys plus manual backend deploys means the two can desynchronise.**
The blast radius of a misrouted frontend deploy is set by how far `staging` has drifted from
production's schema and DAB config. This time the drift was 107 commits of frontend-only
work and the backend was untouched, so nothing broke. The next time it need not be.

**A long-lived `staging` is a loaded gun pointed at production.** The 19 days `staging` sat
un-promoted did not cause the misrouted deploy, but they decided what it cost. A branch
that is one day ahead of production makes an accidental overwrite a non-event; one that is
three weeks ahead makes it an unreviewed release. Promotion cadence is a safety control,
not just a planning preference.

**Re-applying a change is not backporting it.** Cherry-picking the same fix onto `main` and
`staging` separately leaves Git with two unrelated commits and guarantees a conflict at the
next promotion — which is how the release that *fixed* this incident ended up needing four
manual conflict resolutions. Merge the branch that has the fix; do not retype it.

**A guard is only as trustworthy as its inputs.** The guard logic was correct, tested, and
deployed — and useless, because the one value it reads was set by a workflow that had no
idea it was deploying to production.
