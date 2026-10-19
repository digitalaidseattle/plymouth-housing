# Incident: full E2E suite ran against production

| | |
|---|---|
| **Date of incident** | 2026-07-23 |
| **Date detected** | 2026-07-23 |
| **Detected by** | UX designer, who noticed the transactions appearing in the app |
| **Remediation** | Manual rollback of every transaction, over a weekend |
| **Severity** | High — the production database was written to by an automated test run and required hand remediation |
| **Status** | Preventive control shipped in v1.5.1, inert 2026-08-03 → 2026-08-07 (see [2026-08-03](2026-08-03-staging-deploy-overwrote-production.md)), **in effect since v1.5.2** |

---

## Summary

The **full** E2E suite was executed against **production**. It ran to completion, writing
checkout transactions, history entries and inventory movements into the production database
as though a real volunteer had performed them.

It was caught the same day, by a UX designer noticing the transactions in the app — not by
any automated check. Remediation was manual: every transaction rolled back by hand, a
weekend of work.

This was not the first occurrence. PR #583, which introduced the preventive fix, opens with:

> Developers have unintentionally tested against **production** several times. The E2E suite
> (and manual testing) targets whatever `URL`/environment is set, and nothing stops a test
> account from operating on prod.

---

## Why the suite could write to production

`pytest` without `-m smoke` runs everything, including the checkout and edit flows. Even the
smoke subset is not read-only — `tests/test/test_history.py::test_checkout_increases_history_count`
performs a checkout and asserts the history count rises. A full run exercises considerably
more. Against staging this is correct behaviour; against production it is data entry.

The suite resolves its target with no validation whatsoever
([tests/utilities/data.py](../../tests/utilities/data.py)):

```python
URL = os.getenv("URL")
```

Whatever `URL` holds is where the tests run. There is no allowlist, no denylist, and no
confirmation step.

---

## The run came from a developer machine, not CI

This matters for choosing the fix, and it is verifiable: **there were no CI E2E runs in that
window at all.** The workflow's run history skips from 2026-07-15 to 2026-07-28 — no
`workflow_run`, no `workflow_dispatch`, nothing on 7/22 or 7/23.

So the run took its `URL` from a developer's local shell environment. It never passed
through GitHub Actions, which means **no repository variable, secret, or workflow guard
could have prevented it**, then or now.

### Corroborating timeline

| When | Event |
|---|---|
| 2026-07-22 07:32 UTC | `VOLUNTEER_PIN` secret created — the volunteer PIN step is what unlocks the full volunteer flow, and therefore checkout |
| 2026-07-23 06:05 UTC | Commit `de63ab0`, *"Stabilize staging login and checkout history tests"*, on branch `fix/staging-login-and-history-tests` — reworks `conftest.py`, `login_page.py`, `history_page.py` and the checkout tests (1,460 insertions) |
| 2026-07-23 | Transactions noticed in production by the UX designer |

Active local iteration on the login and checkout flows, on exactly the day the production
transactions appeared. The `VOLUNTEER_PIN` secret added the day before is what made an
unattended volunteer checkout possible end to end.

---

## Contributing factors

1. **Environment selection was invisible.** Until 2026-07-27 the CI workflow read
   `URL: ${{ secrets.URL }}` — a *secret*, so no diff, log, or reviewer could show which
   environment a run pointed at. Commit `fbc9798` (*"update url to staging."*) retargeted it
   to `secrets.STAGING_URL`; PR #592 later moved it to `vars.STAGING_URL` so the value is
   visible. Locally, the same variable is whatever the shell happens to hold.
2. **Nothing on the receiving end objected.** Production accepted test-account traffic
   indistinguishably from staff traffic. No role, header, or check said "you are not
   supposed to be here."
3. **Destructive-by-design tests.** A suite that performs checkouts is correct against
   staging and harmful against production. Nothing at the test layer distinguishes them.
4. **Detection was human and incidental.** A UX designer happened to look at the app. There
   was no alert, no anomaly detection, and no reconciliation that would have caught this —
   nor would anything have caught it had nobody been looking.
5. **Remediation was manual and expensive.** Rolling the transactions back by hand cost a
   weekend. There is no scripted path to undo a bad test run.
6. **It recurred several times before being addressed.** The repetition points at a pipeline
   that made the mistake easy, not at individual carelessness.

---

## Resolution

PR #583 (merged 2026-08-01, shipped in v1.5.1) added the `test` role and a production
sign-in guard in [`MainLayout/index.tsx`](../../src/layout/MainLayout/index.tsx): any
account carrying the `test` role is refused when `ENVIRONMENT === 'production'`, and a
`TestAccountBlockedInProduction` event is sent to Application Insights.

**The guard was inert for four days.** On 2026-08-03 a staging deploy overwrote production
with a `VITE_ENVIRONMENT=staging` build, so its environment check evaluated to `false` and
test accounts were admitted again — five days after this control shipped. It was restored
on 2026-08-07 when v1.5.2 reached production and the bundle was rebuilt with
`VITE_ENVIRONMENT=production`. Detail in
[2026-08-03-staging-deploy-overwrote-production.md](2026-08-03-staging-deploy-overwrote-production.md).

That episode is worth keeping attached to this one: the control described here has a
dependency the report above did not originally state, which is that **the production
bundle must actually have been built by the production workflow**. A correct guard, a
correctly assigned role, and a misrouted deploy still add up to no protection.

Note also that the guard blocks the browser session at sign-in, which is enough to stop a
UI-driven suite, but it is explicitly not a security boundary and does not stop direct API
calls.

---

## Action items

| # | Action | Addresses | Status |
|---|---|---|---|
| 1 | Restore the guard by landing PR #596 through to `main` | Resolution | **Done** — v1.5.2, PR #602, 2026-08-07 |
| 2 | Make the test suite refuse to run against production — assert `URL` in `conftest.py` before any browser starts | Factors 1, 3 | Too brittle |
| 3 | Confirm the `test` role is assigned to every test account on the production SWA, so the guard has something to match | Factor 2 | Confirmed |
| 4 | Delete the now-unused `URL` / username / `STAGING_URL` **secrets** so the visible variables are the single source of truth | Factor 1 | Done |
| 5 | Remove test accounts from the production database entirely — the only durable backstop | Factor 2 | Not feasible — resource constraints |
| 6 | Write down the rollback procedure while it is still fresh, so a repeat costs a day rather than a weekend | Factor 5 | Open |

---

## Relationship to the 2026-08-03 incident

These two reports concern the same control, from opposite ends:

- **This report** — the problem the guard was built to solve.
- **[2026-08-03](2026-08-03-staging-deploy-overwrote-production.md)** — how a deployment
  defect silently switched that guard off two days after it shipped.

Together they make one point: a guardrail depending on a build-time value, on correct role
assignment in Azure, and on a correctly targeted deploy has three ways to fail silently, and
two of them have already happened. With the alternatives above ruled out as brittle or
unaffordable, that single guard is the control we have.

As of v1.5.2 it is back in effect, so item 1 is closed — but closing it restored the
*status quo*, it did not add protection. The guard has now been switched off once by
accident, and nothing yet would tell us if it happened again; detection both times was a
person noticing. Items 4, 5 and 6 of the [2026-08-03 report](2026-08-03-staging-deploy-overwrote-production.md#action-items)
are what would change that, and they remain the highest-value work attached to either
incident.
