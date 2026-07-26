# Branch Protection Setup for esign-ts

Configure branch protection rules on GitHub to match the esign-php repository standards.

## Settings → Branches → Branch protection rules → Add rule

### Rule: `main`

**Required checks:**
- ✅ Require status checks to pass before merging
  - Required checks: `Node 18`, `Node 20`, `Node 22` (CI job names)
- ✅ Require branches to be up to date before merging

**Pull request reviews:**
- ✅ Require pull request reviews before merging
  - Required approving reviews: 1
  - Dismiss stale reviews when new commits are pushed: ✅
  - Require review from code owners: ✅ (if CODEOWNERS exists)

**Restrictions:**
- ✅ Do not allow bypassing the above settings
- ✅ Restrict pushes that create files matching patterns: (optional)
- ✅ Require signed commits: (optional, recommended)

**Other:**
- ✅ Allow force pushes: ❌ (deny)
- ✅ Allow deletions: ❌ (deny)
- ✅ Require linear history: ✅ (recommended)

---

## CODEOWNERS (optional but recommended)

Create `.github/CODEOWNERS`:

```
* @kiiskominfokepri/owners
```

---

## Status check names

The CI workflow creates these status check names (used in branch protection):
- `Node 18` / `test (Node 18)`
- `Node 20` / `test (Node 20)`
- `Node 22` / `test (Node 22)`

Use exact names from the Actions tab after first CI run.