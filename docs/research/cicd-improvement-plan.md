# CI/CD Improvement Plan

## Problem Statement

The current CI/CD setup has three issues:

1. **No stable test environment** — staging updates on every merge to `main`, so QA is testing against a constantly moving target.
2. **No preview environment** — feature branches only get CI (lint/test/build), never a live URL. Reviewers can't see changes running.
3. **Hotfixes are risky** — no clean path to patch prod without risking shipping unready dev work.

### Current setup (for reference)

- All branches except `main` → CI only (lint, test, build)
- Push to `main` → always deploys to staging slot
- Push to `main` + version bump in `package.json` → deploys to prod (with GitHub release + tag)
- E2E tests run after staging deployment

So staging is ahead of prod, but it moves on every single merge to `main`.

---

## Proposed Solution: Git Flow with mapped environments

### Branch flow

```
feature/* ──► dev ──► staging ──► main (prod)
                                    ▲
hotfix/* ───────────────────────────┘
               └──► (back-merge to staging + dev)
```

### Environment mapping

| Branch | Environment | Who uses it |
|---|---|---|
| `feature/*` PRs to `dev` | PR preview URLs (ephemeral, auto-created by Azure SWA) | Developers reviewing PRs |
| `dev` | Dev SWA (persistent) | Developers, internal demos |
| `staging` | Staging slot on existing prod SWA | QA / testers |
| `main` | Prod | Everyone |

### What this solves

- **Stable test env**: QA works against `staging`, which only updates when dev is deliberately promoted — not on every feature merge.
- **Preview environment**: Every PR to `dev` gets its own live URL automatically (Azure SWA does this natively).
- **Hotfixes**: `hotfix/*` → PR directly to `main` → deploy to prod → back-merge to `staging` and `dev`.

---

## What needs to change

### Azure (manual steps)

1. Create a new Azure Static Web App resource for the `dev` environment.
2. Copy its deployment token → add as GitHub secret `AZURE_STATIC_WEB_APPS_API_TOKEN_DEV`.
3. Create a dedicated DAB instance and Azure SQL database for dev.
4. Link the dev DAB to the dev SWA in Azure Portal → SWA → Settings → APIs.

> Staging already works as a named environment slot on the existing prod SWA — no new Azure resource needed for staging.

> **Current status**: Steps 3–4 are not yet done. The dev SWA is deployed but has no backend wired up — API calls will fail until a DAB + DB is provisioned and linked. If standing up a separate dev database is a blocker, a short-term fallback is to share the existing staging DAB, accepting that dev and staging data will not be isolated (see trade-offs below).

### Dev backend trade-offs

| Option | Pro | Con |
|---|---|---|
| Dedicated dev DAB + DB | Full isolation; DAB config changes in dev don't affect staging | Requires new Azure resources; DB needs seeding |
| Share staging DAB + DB | No new Azure resources needed | Dev data changes affect staging; DAB config changes in dev immediately affect staging QA |

PR preview environments (ephemeral per-PR) always share whichever backend is linked to the dev SWA — per-PR database isolation is not feasible with Azure SWA.

### GitHub Actions workflows

| File | Change |
|---|---|
| `azure-static-web-apps-dev.yml` | **New** — push to `dev` + PR previews for PRs targeting `dev`. Needs `AZURE_STATIC_WEB_APPS_API_TOKEN_DEV`. No `api_location`. Include `VITE_CLARITY_PROJECT_ID` and `VITE_APPINSIGHTS_CONNECTION_STRING` env vars. |
| `azure-static-web-apps-CD.yml` | **Modify** — change trigger from `main` → `staging` branch. |
| `e2e-tests.yml` | **Modify** — ensure it still triggers after the staging CD workflow (name unchanged, trigger branch changes). |
| `azure-static-web-apps-prod.yml` | **No change** — stays triggered by `main` + version bump logic. |
| `azure-static-web-apps-CI.yml` | **No change** — already runs on all branches except `main`. |
| `azure-sql-CI.yml` | **No change** |

### New branches to create

- `dev` (from `main`)
- `staging` (from `main`)

Both should be set as protected branches in GitHub with required PR reviews.
