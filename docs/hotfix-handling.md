# Hotfix Handling

When a `hotfix/*` branch is merged into `main` and deployed to prod, `main` must be back-merged into `staging` and then `dev` to keep all branches in sync.

**Owner:** the engineer who merged the hotfix is responsible for completing both back-merges before closing the incident.

**Steps:**

1. Open a PR from `main` into `staging`.
2. After it merges, open a PR from `staging` into `dev`.
3. If either merge has conflicts, resolve them locally before pushing and request a review.
