# Incident: automated and manual testing ran against production

> **DRAFT — needs facts only the team has.** Everything in *Established from the
> repository* below is verified from git and CI history. Everything marked
> **[CONFIRM]** is a gap I could not close from the repo and must be filled in or
> corrected before this report is considered accurate. See
> [Open questions](#open-questions).

| | |
|---|---|
| **Date of incident** | 2026-07-27 or earlier **[CONFIRM]** |
| **Date detected** | **[CONFIRM]** |
| **Detected by** | **[CONFIRM]** |
| **Duration** | Recurring — reported as ~5 separate occurrences before the guard was built |
| **Severity** | **[CONFIRM]** — depends on what the runs wrote to the production database |
| **Status** | Preventive control shipped (v1.5.1), then disabled by a second incident; see [2026-08-03](2026-08-03-staging-deploy-overwrote-production.md) |

---

## Summary

Test runs — automated E2E, manual, or both — executed against the **production**
environment rather than staging. Nothing in the pipeline or the application prevented a
test account from operating on production, so the runs proceeded normally and wrote to the
production database.

This was not a one-off. PR #583, which introduced the fix, opens with:

> Developers have unintentionally tested against **production** ~5 times. The E2E suite
> (and manual testing) targets whatever `URL`/environment is set, and nothing stops a test
> account from operating on prod.

---

## Established from the repository

These points are verified from git and CI history.

**The E2E workflow pointed at a URL nobody could see.** Until 2026-07-27 the job read
`URL: ${{ secrets.URL }}` — a *secret*, so its value was invisible in the workflow file, in
run logs, and in review. Nothing tied the name `URL` to any particular environment.

**It was retargeted on 2026-07-27.** Commit `fbc9798`, message *"update url to staging."*,
changed the line to `secrets.STAGING_URL`:

```diff
-      URL: ${{ secrets.URL }}
+      URL: ${{ secrets.STAGING_URL }}
```

PR #592 later moved it to `vars.STAGING_URL` so the value is visible as a repository
variable rather than hidden in a secret, noting *"there is no `URL` variable"*. That is the
current state ([e2e-tests.yml](../../.github/workflows/e2e-tests.yml)).

**The smoke suite writes data.** `pytest -m smoke` is not read-only. Among the
`@pytest.mark.smoke` tests:

- `tests/test/test_history.py::test_checkout_increases_history_count` — performs a checkout
  and asserts the history count increases.
- `tests/test/test_volunteer_edit_flow.py::test_edit_prefills_data` — exercises the edit
  flow.

Against production these create real transactions, real history rows, and inventory
movements attributable to a test volunteer. **[CONFIRM]** what actually landed and whether
it was cleaned up.

**The workflow can be fired by hand.** Beyond the automatic `workflow_run` trigger on a
successful staging deploy, `e2e-tests.yml` exposes `workflow_dispatch`, so a manual run
against whatever `URL` resolved to was always one click away.

**The fix was the sign-in guard.** PR #583 (opened 2026-07-25, merged 2026-08-01, shipped
in v1.5.1) added the `test` role and the production guard in
[`MainLayout/index.tsx`](../../src/layout/MainLayout/index.tsx), refusing any `test`-role
account when `ENVIRONMENT === 'production'` and emitting `TestAccountBlockedInProduction`.

---

## Contributing factors

1. **Environment selection was invisible.** Storing the target URL in a *secret* meant no
   reviewer, log, or diff could show which environment a run was aimed at. A wrong value
   was undetectable by inspection — the failure mode was structural, not careless.
2. **Nothing on the receiving end objected.** Production accepted test-account traffic
   indistinguishably from staff traffic. There was no role, header, or check that said "you
   are not supposed to be here."
3. **Test accounts exist in the production database.** The guard is explicitly *not* a
   security boundary; the durable backstop is keeping test accounts and test data out of
   production, which is not currently the case. **[CONFIRM]** whether the test accounts
   still exist in the production DB.
4. **Destructive-by-design smoke tests.** A suite that checks out inventory is safe against
   staging and harmful against production. Nothing distinguishes the two at the test layer.
5. **It recurred ~5 times before being addressed.** The repetition indicates the pipeline
   made the mistake easy rather than any individual being careless.

---

## Resolution

The guard shipped in v1.5.1 on 2026-08-01 and worked as designed.

**It is currently inert.** On 2026-08-03 a staging deploy overwrote production with a
`VITE_ENVIRONMENT=staging` build, so the guard's environment check evaluates to `false` and
test accounts are admitted again. Full detail in
[2026-08-03-staging-deploy-overwrote-production.md](2026-08-03-staging-deploy-overwrote-production.md);
the fix is PR #596. **Until that reaches `main`, the control described here is not in
effect.**

The E2E workflow's target is now a visible repository variable (`vars.STAGING_URL`), which
addresses factor 1 independently of the guard.

---

## Action items

| # | Action | Addresses | Status |
|---|---|---|---|
| 1 | Restore the guard by landing PR #596 through to `main` | Resolution | Open |
| 2 | Confirm the `test` role is assigned to every test account on the production SWA, so the guard has something to match | Factor 2 | **[CONFIRM]** |
| 3 | Establish what test data reached the production database and whether it needs removing | Factor 4 | **[CONFIRM]** |
| 4 | Delete the now-unused `URL`, `ADMIN_USERNAME`, `VOLUNTEER_USERNAME`, `STAGING_URL` **secrets** so the visible variables are the single source of truth | Factor 1 | Open (noted in PR #592) |
| 5 | Have the E2E suite assert its target host before running, and refuse to run against the production hostname | Factors 1, 4 | Open |
| 6 | Consider removing test accounts from the production database entirely — the only durable backstop | Factor 3 | **[CONFIRM]** feasibility |

Item 5 is the cheap structural fix: a few lines in `conftest.py` comparing `URL` against a
denylist, failing the run before any browser starts. It does not depend on the frontend
guard being deployed, does not depend on roles being assigned correctly, and cannot be
disabled by a misrouted deploy — the three ways the current control has already failed.

---

## Open questions

To be answered before this report is final:

1. **When did last week's occurrence happen, and what was run** — the automated suite via
   `workflow_dispatch`, a local `pytest` run, or manual clicking through the UI?
2. **How was it noticed?** Someone spotting unexpected data, a failing assertion, or
   something else?
3. **What reached the production database** — checkout transactions, history rows,
   inventory changes, edited residents? Was any of it cleaned up, and is any still there?
4. **Was there user-visible impact** — did staff see wrong inventory counts or unfamiliar
   history entries?
5. **Is `2026-07-27` the right date** for the filename and header, or should this be dated
   to the actual run?

---

## Relationship to the 2026-08-03 incident

These two reports are about the same control, from opposite ends:

- **This report** — the problem the guard was built to solve.
- **[2026-08-03](2026-08-03-staging-deploy-overwrote-production.md)** — how a deployment
  defect silently switched that guard off two days after it shipped.

Read together they make the same point: a guardrail that depends on a build-time value,
correct role assignment, and a correctly targeted deploy has three ways to fail silently.
Action item 5 above has none of those dependencies.
