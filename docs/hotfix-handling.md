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

> **Backport by merging `main`. Do not re-apply the fix on a fresh branch.**
>
> It is tempting, when the `main` → `staging` PR looks awkward, to just make the same edit
> again on a branch off `staging`. Don't. Git has no way to know the two commits are the
> same change, so it treats them as competing edits and every file they touch conflicts at
> the *next* promotion — which is typically the release you least want to be resolving
> conflicts in.
>
> This is not hypothetical. Four hotfixes in July/August 2026 were re-applied rather than
> merged, and the resulting duplicate commits made the `staging` → `main` promotion of
> v1.5.2 conflict in four files. See
> [the 2026-08-03 incident report](incident_reports/2026-08-03-staging-deploy-overwrote-production.md#aftermath-the-hotfix-branches-had-diverged).

If a backport PR does show conflicts, resolve them locally before pushing and request a
review. Check first whether the conflict is a duplicated commit from an earlier re-applied
hotfix — `git log --oneline main..staging` next to `git log --oneline staging..main` will
show the same subject lines on both sides if so. In that case the resolution is almost
always "take the branch that is ahead", and the merged tree should come out identical to
it.

Verify that before committing: `git write-tree` prints the tree of the resolved merge, and
`git rev-parse origin/<branch>^{tree}` prints the tree of the branch you took, `staging` or
`dev` depending on the direction. Matching hashes mean nothing was dropped.

A backport that only rejoins histories therefore has no file changes, and an empty Files
Changed tab is the expected result. Do not switch branches while the merge is uncommitted —
that discards the merge state and the follow-up commit silently creates nothing. Automated
reviewers skip empty diffs, so these PRs need a human approval.
