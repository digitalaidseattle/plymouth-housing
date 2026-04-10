# Hotfix Handling

When a critical bug needs to go directly to production, bypass the normal `dev` → `staging` → `main` flow using the steps below.

**Owner:** the engineer who merged the hotfix is responsible for completing all steps before closing the incident.

## Steps

### 1. Create a branch from `main`

```bash
git fetch origin
git checkout -b your-name/ticket-hotfix-description origin/main
```

> **Important:** branch from `origin/main`, not from `dev` or `staging`. Branching from `dev` will pull in unreleased changes and pollute the PR.

### 2. Make your changes

Fix the bug, then bump the patch version in `package.json` (e.g. `1.3.2` → `1.3.3`) in a separate commit:

```bash
git commit -m "fix: <description>"
git commit -m "Bump version from 1.3.x to 1.3.y"
```

### 3. Open a PR targeting `main`

```bash
git push -u origin your-name/ticket-hotfix-description
gh pr create --base main --title "fix: <description> (hotfix)"
```

Verify the PR shows only your commits (not commits from `dev`). If extra commits appear, the branch was not created from `main` — start over from step 1.

### 4. Merge and backport

After the PR merges into `main`:

```bash
# main → staging
gh pr create --base staging --head main --title "chore: backport hotfix x.x.x to staging"

# staging → dev (after the above merges)
gh pr create --base dev --head staging --title "chore: backport hotfix x.x.x to dev"
```

Both should be clean fast-forward merges. If either has conflicts, resolve them locally before pushing and request a review.
