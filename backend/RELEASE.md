# Release Process

**Project:** GroundCTRL Backend  
**Purpose:** Define procedures for creating, tagging, and publishing releases  
**Related:** See [VERSIONING.md](https://github.com/E-Y-J/TR41-GroundCTRL/tree/main/backend/VERSIONING.md) for version numbering scheme

---

## Overview

This document outlines the release workflow for GroundCTRL Backend, from phase completion through GitHub release publication. For version numbering decisions and compatibility guarantees, consult [VERSIONING.md](./VERSIONING.md).

---

## Phase-Based Release Strategy

GroundCTRL releases align with implementation phase checkpoints defined in [IMPLEMENTATION_PLAN.md](https://github.com/E-Y-J/TR41-GroundCTRL/tree/main/backend/IMPLEMENTATION_PLAN.md):

| Checkpoint | Phases | Release Type | Trigger |
|------------|--------|--------------|---------|
| A | 0-0.5 | INITIAL (v1.0.0) | Documentation baseline complete |
| B | 1-4 | PATCH (v1.0.1) | Security/validation/CRUD hardening |
| C | 5-9 | MINOR (v1.1.0-1.5.0) | Each domain adds new endpoints |
| D | 10-11 | MINOR+PATCH (v1.6.0-1.6.1) | NOVA AI + testing complete |

**Key Principle:** One phase per PR. Releases occur after checkpoint completion.

---

## Pre-Release Checklist

Before initiating release process, confirm:

- [ ] **All checkpoint phases merged to main**
  - Each phase PR approved by 1+ backend developer
  - All phase PRs merged and passing CI checks
  
- [ ] **Local validation complete**
  - `npm run lint` passes with no errors
  - `npm test` passes (when tests exist)
  - Manual smoke testing of critical paths
  
- [ ] **Documentation updated**
  - CHANGELOG.md [Unreleased] section populated with all changes
  - Swagger/API docs reflect current state
  - README.md updated if needed
  
- [ ] **Team coordination**
  - QA team notified of pending release
  - Cybersecurity team notified if security-related
  - No blocking issues in Slack Project Tracker
  
- [ ] **Version decision made**
  - Consult [VERSIONING.md](https://github.com/E-Y-J/TR41-GroundCTRL/tree/main/backend/VERSIONING.md) for increment rules
  - Confirm PATCH vs MINOR vs MAJOR appropriateness

---

## Git Branch Strategy

GroundCTRL uses a **single-branch strategy** with `main` as the source of truth:

```
main (production-ready, always deployable)
├── phase-X-feature (feature branches for phase work)
└── hotfix/vX.Y.Z+1 (emergency fixes only)
```

**Rules:**
- All phase work branches from `main`
- All phase PRs target `main` and require peer review
- No separate development or release branches
- Hotfix branches only for critical production issues
- Tags created directly on `main` after version bump

---

## Release Workflow

### Step 1: Determine Version Bump

Consult [VERSIONING.md](https://github.com/E-Y-J/TR41-GroundCTRL/tree/main/backend/VERSIONING.md) decision matrix:

```bash
# For bug fixes, security patches, docs (no API changes)
npm version patch --no-git-tag-version  # 1.0.0 → 1.0.1

# For new endpoints, new domains (backward-compatible)
npm version minor --no-git-tag-version  # 1.0.1 → 1.1.0

# For breaking changes (rare, requires team discussion)
npm version major --no-git-tag-version  # 1.6.1 → 2.0.0
```

### Step 2: Update CHANGELOG.md

Move [Unreleased] content to new version section:

```markdown
## [Unreleased]

### Added
### Changed
### Fixed
### Security

---

## [X.Y.Z] - YYYY-MM-DD

### Checkpoint [A/B/C/D]: [Description]

[Move all Unreleased content here with full details]
```

**Format Requirements:**
- Use [Keep a Changelog](https://keepachangelog.com) format
- Include checkpoint name and description
- Date in ISO format (YYYY-MM-DD)
- Organize by categories: Added, Changed, Fixed, Security
- Reference phases completed (e.g., "Phases 0-4")

### Step 3: Update VERSIONING.md

Update metadata at top of file:

```markdown
**Current Version:** X.Y.Z
**Last Updated:** YYYY-MM-DD
```

Update version history table with actual release date.

### Step 4: Create Release Branch and Commit Changes

```bash
# Ensure main is up-to-date
git checkout main
git pull origin main

# Create release preparation branch
git checkout -b release/vX.Y.Z

# Stage version files
git add CHANGELOG.md VERSIONING.md package.json package-lock.json

# Commit with standard message format
git commit -m "Release vX.Y.Z"

# Push release branch
git push origin release/vX.Y.Z
```

### Step 5: Create Release PR

Create Pull Request on GitHub:
- **Base:** `main`
- **Compare:** `release/vX.Y.Z`
- **Title:** `Release vX.Y.Z - Checkpoint [A/B/C/D]`
- **Description:**

```markdown
## Release Summary
- **Version:** vX.Y.Z
- **Type:** PATCH / MINOR / MAJOR
- **Date:** YYYY-MM-DD
- **Phases:** [List phases, e.g., 0-4]

## Highlights
[Copy Added/Changed/Security sections from CHANGELOG.md]

## Breaking Changes
[If MAJOR release, list breaking changes and migration steps]
[If MINOR/PATCH, state "None"]

## Checklist
- [x] CHANGELOG.md updated
- [x] VERSIONING.md updated
- [x] package.json version bumped
- [x] All phase PRs merged
- [x] Local tests passing
- [ ] Peer review approved
- [ ] Ready to tag after merge
```

**Get peer review approval (1+ backend developer)**

### Step 6: Merge Release PR

After approval, merge PR to main using standard merge commit.

### Step 7: Create Git Tag

After release PR is merged to main:

```bash
# Checkout main and pull merged changes
git checkout main
git pull origin main

# Create annotated tag with release summary
git tag -a vX.Y.Z -m "vX.Y.Z - Checkpoint [A/B/C/D]: [Brief description]"

# Push tag to origin
git push origin vX.Y.Z
```

**Tag Format:**
- Name: `vX.Y.Z` (lowercase v prefix)
- Annotation: One-line summary from CHANGELOG.md
- Example: `v1.0.1 - Checkpoint B: Foundation Complete`

### Step 8: Create GitHub Release

Navigate to GitHub repository → Releases → "Draft a new release"

**Release Configuration:**
- **Tag:** Select `vX.Y.Z` (created in Step 5)
- **Release title:** `vX.Y.Z - [Checkpoint Name]`
- **Description:** Copy relevant section from CHANGELOG.md, format as:

```markdown
## Release Summary
- **Version:** vX.Y.Z
- **Type:** PATCH / MINOR / MAJOR
- **Date:** YYYY-MM-DD
- **Phases:** [List phases, e.g., 0-4]

## Highlights
[Copy Added/Changed/Security sections from CHANGELOG.md]

## Breaking Changes
[If MAJOR release, list breaking changes and migration steps]
[If MINOR/PATCH, state "None"]

## Installation
\`\`\`bash
npm install groundctrl-backend@X.Y.Z
\`\`\`

## Full Changelog
[Link to CHANGELOG.md]
```

- **Pre-release:** Check if beta/rc release
- **Set as latest release:** Check for stable releases
- **Publish release:** Click "Publish release" button

### Step 9: Post-Release Notifications

**Slack Notification Template:**
```
🚀 Release: GroundCTRL Backend vX.Y.Z

**Type:** PATCH/MINOR/MAJOR
**Checkpoint:** [A/B/C/D] - [Name]
**Phases:** [X-Y]

**Highlights:**
• [Key feature 1]
• [Key feature 2]
• [Key feature 3]

**Breaking Changes:** None / [List if MAJOR]

📖 Full notes: [GitHub release link]
📋 Changelog: [CHANGELOG.md link]

@qa-team - Ready for testing
@security-team - Security review [if applicable]
```

**Update IMPLEMENTATION_PLAN.md:**
- Mark checkpoint phases as DONE
- Update execution log table with release date
- Update status sections

---

## Hotfix Workflow

For critical production issues requiring immediate patch release:

### When to Use Hotfix Process

**Hotfix criteria:**
- Security vulnerability in production
- Critical bug causing service disruption
- Data corruption or loss risk
- Authentication/authorization failure

**NOT hotfix criteria:**
- Minor bugs with workarounds
- Feature requests
- Performance optimizations (non-critical)
- Documentation updates

### Hotfix Steps

#### 1. Create Hotfix Branch

```bash
# Branch from latest production release tag
git checkout -b hotfix/vX.Y.Z+1 vX.Y.Z

# Example: Fix for v1.1.0
git checkout -b hotfix/v1.1.1 v1.1.0
```

#### 2. Implement Fix

```bash
# Make minimal changes to fix issue
# ... edit files ...

# Verify fix locally
npm run lint
npm test

# Commit with descriptive message
git add .
git commit -m "Fix: [Brief description of issue]

- [Detail 1]
- [Detail 2]

Fixes #[issue-number]"
```

#### 3. Update CHANGELOG.md

Add new PATCH version section:

```markdown
## [X.Y.Z+1] - YYYY-MM-DD

### Fixed
- [Description of fix]

### Security
- [If security-related, describe vulnerability and fix]
```

#### 4. Bump Version

```bash
npm version patch --no-git-tag-version
git add CHANGELOG.md VERSIONING.md package.json package-lock.json
git commit -m "Release vX.Y.Z+1 (hotfix)"
```

#### 5. Push and Create PR

```bash
git push origin hotfix/vX.Y.Z+1
```

Create PR on GitHub:
- **Base:** `main`
- **Title:** `Hotfix vX.Y.Z+1 - [Brief Issue]`
- **Label:** `hotfix`, `priority-critical`
- **Description:**

```markdown
## Hotfix Summary
**Issue:** [Describe critical issue]
**Impact:** [Describe user/system impact]
**Fix:** [Describe solution]

## Testing
- [x] Local testing passed
- [x] Issue verified resolved
- [ ] QA verification (post-merge)

## Related
Fixes #[issue-number]
```

#### 6. Fast-Track Review

- Request immediate review from 1+ backend developer
- Skip non-critical review items for speed
- QA can test after merge to main

#### 7. Merge and Tag

```bash
# After PR approval, merge to main
# Then checkout main and pull
git checkout main
git pull origin main

# Create hotfix tag
git tag -a vX.Y.Z+1 -m "Hotfix vX.Y.Z+1 - [Brief issue description]"
git push origin vX.Y.Z+1
```

#### 8. Create GitHub Release

Follow Step 6 from main release workflow, marking as:
- **Pre-release:** No (unless still testing)
- **Title:** `vX.Y.Z+1 (Hotfix) - [Issue]`

#### 9. Clean Up

```bash
# Delete hotfix branch locally
git branch -d hotfix/vX.Y.Z+1

# Delete hotfix branch remotely
git push origin --delete hotfix/vX.Y.Z+1
```

#### 10. Notify Team

```
🚨 Hotfix Released: vX.Y.Z+1

**Issue:** [Brief description]
**Severity:** Critical
**Fixed:** [What was fixed]

📖 Release: [GitHub link]

@qa-team - Please verify in production
@team - Update local environments
```

---

## Release Validation

After release publication, verify:

### GitHub Checks
- [ ] Tag visible in GitHub repository tags list
- [ ] Release appears in GitHub Releases page
- [ ] Release marked as "Latest" (if stable)
- [ ] Release notes formatted correctly

### Package Checks
- [ ] package.json version matches release tag
- [ ] package-lock.json version matches release tag
- [ ] CHANGELOG.md includes release entry
- [ ] VERSIONING.md metadata updated

### Documentation Checks
- [ ] Swagger docs reflect current API state
- [ ] README.md version badge updated (if present)
- [ ] Migration guides included (if MAJOR release)

### Notification Checks
- [ ] Slack team notification sent
- [ ] QA team notified and testing
- [ ] Security team notified (if security-related)
- [ ] IMPLEMENTATION_PLAN.md execution log updated

---

## Rollback Procedure

If critical issues discovered immediately after release:

### Option 1: Quick Hotfix (Preferred)
- Follow hotfix workflow above
- Issue new PATCH release with fix
- Faster than rollback, maintains forward progress

### Option 2: Rollback Release (Emergency)
```bash
# Revert to previous version in package.json
npm version [previous-version] --no-git-tag-version

# Create revert commit
git add package.json package-lock.json
git commit -m "Revert to v[previous-version] due to [issue]"
git push origin main

# Mark GitHub release as pre-release
# (Edit release on GitHub, check "Pre-release")

# Notify team immediately
```

**Rollback Communication Template:**
```
⚠️ ROLLBACK: vX.Y.Z Reverted

**Reason:** [Critical issue description]
**Action:** Reverted to vX.Y.Z-1
**Status:** Investigating issue

@team - Update local environments to vX.Y.Z-1
@qa-team - Stop testing vX.Y.Z

Follow-up: [Link to issue tracker]
```

---

## Automation Opportunities

### Future GitHub Actions Integration

Potential workflow automations:
- **Version bump validation:** Verify version increased correctly
- **CHANGELOG validation:** Ensure version entry exists
- **Tag creation:** Auto-create tag after version commit
- **Release draft:** Auto-generate release from CHANGELOG
- **Slack notification:** Auto-post to Slack on release

### CI/CD Pipeline Integration

Recommended checks:
- Version format validation (X.Y.Z)
- CHANGELOG entry verification
- Breaking change detection (API diff)
- Documentation build and deploy
- Automated smoke tests on tag

---

## Quick Reference

### Standard Release Commands
```bash
# 1. Create release branch
git checkout main && git pull origin main
git checkout -b release/vX.Y.Z

# 2. Update version
npm version [patch|minor|major] --no-git-tag-version

# 3. Commit and push changes
git add CHANGELOG.md VERSIONING.md package.json package-lock.json
git commit -m "Release vX.Y.Z"
git push origin release/vX.Y.Z

# 4. Create PR on GitHub (base: main, compare: release/vX.Y.Z)
# Get peer review and merge to main

# 5. After PR merged, create and push tag
git checkout main && git pull origin main
git tag -a vX.Y.Z -m "vX.Y.Z - Checkpoint [X]: [Description]"
git push origin vX.Y.Z

# 6. Create GitHub Release (manual via web UI)
```

### Hotfix Commands
```bash
# 1. Create hotfix branch from tag
git checkout -b hotfix/vX.Y.Z+1 vX.Y.Z

# 2. Fix, test, commit
git add .
git commit -m "Fix: [description]"

# 3. Bump version
npm version patch --no-git-tag-version
git add CHANGELOG.md VERSIONING.md package.json package-lock.json
git commit -m "Release vX.Y.Z+1 (hotfix)"
git push origin hotfix/vX.Y.Z+1

# 4. Create PR, merge, tag
git checkout main && git pull origin main
git tag -a vX.Y.Z+1 -m "Hotfix vX.Y.Z+1 - [issue]"
git push origin vX.Y.Z+1

# 5. Clean up
git branch -d hotfix/vX.Y.Z+1
git push origin --delete hotfix/vX.Y.Z+1
```

---

## Related Documentation

- **[VERSIONING.md](https://github.com/E-Y-J/TR41-GroundCTRL/tree/main/backend/VERSIONING.md)** - Version numbering scheme and increment rules
- **[CHANGELOG.md](https://github.com/E-Y-J/TR41-GroundCTRL/tree/main/backend/CHANGELOG.md)** - Complete version history and changes
- **[IMPLEMENTATION_PLAN.md](https://github.com/E-Y-J/TR41-GroundCTRL/tree/main/backend/IMPLEMENTATION_PLAN.md)** - Phase definitions and checkpoints
- **[CONTRIBUTING.md](https://github.com/E-Y-J/TR41-GroundCTRL/tree/main/backend/CONTRIBUTING.md)** - Contribution workflow and standards
- **[Keep a Changelog](https://keepachangelog.com)** - CHANGELOG format standard
- **[Semantic Versioning](https://semver.org)** - Version numbering standard
