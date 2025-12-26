# Release Process

This document describes the step-by-step process for releasing a new version of the GroundCTRL Backend.

---

## Pre-Release Checklist

Before starting the release process, ensure:

- [ ] All planned phases for this release are complete and merged
- [ ] All tests pass (`npm test`)
- [ ] Code is linted without errors (`npm run lint`)
- [ ] CHANGELOG.md `[Unreleased]` section is complete and accurate
- [ ] ARCHITECTURE.md and README.md are up to date
- [ ] Swagger documentation reflects all API changes
- [ ] No known critical bugs or security issues
- [ ] Team has reviewed and approved the release

---

## Release Steps

### 1. Determine Version Number

Based on VERSIONING.md guidelines, determine the new version number:

- **PATCH (x.y.Z)**: Bug fixes, docs only, no breaking changes
- **MINOR (x.Y.z)**: New features, backwards compatible
- **MAJOR (X.y.z)**: Breaking changes

**Example:**
- Current: `1.0.0`
- Changes: New satellites API (backwards compatible)
- New version: `1.1.0`

---

### 2. Update CHANGELOG.md

Move changes from `[Unreleased]` to a new version section:

```markdown
## [1.1.0] - 2025-01-15

### Added
- Satellites API with full CRUD operations
- Factory-driven implementation with ownership enforcement

### Changed
- Updated Swagger documentation for satellites endpoints

### Fixed
- Minor bug fixes in token validation
```

Keep the `[Unreleased]` section for future changes:

```markdown
## [Unreleased]

### Added
- (future changes go here)
```

Update the version history at the bottom:

```markdown
## Version History

- **[1.1.0]** - 2025-01-15 - Added satellites API
- **[1.0.0]** - 2025-12-25 - Initial release
```

---

### 3. Update package.json

Update the version field in `package.json`:

```bash
npm version [major|minor|patch] --no-git-tag-version
```

**Examples:**
```bash
npm version patch --no-git-tag-version  # 1.0.0 → 1.0.1
npm version minor --no-git-tag-version  # 1.0.0 → 1.1.0
npm version major --no-git-tag-version  # 1.0.0 → 2.0.0
```

Or manually edit `package.json`:
```json
{
  "version": "1.1.0"
}
```

---

### 4. Update VERSIONING.md (if needed)

Update the "Current Version" at the top:

```markdown
**Current Version:** 1.1.0  
**Last Updated:** 2025-12-22
```

---

### 5. Create Release Branch and Commit Changes

Create a release branch and commit all release changes:

```bash
git checkout -b release/v1.1.0
git add CHANGELOG.md package.json package-lock.json VERSIONING.md
git commit -m "Release v1.1.0"
```

**Commit message format:** `Release vX.Y.Z`

---

### 6. Push and Create Pull Request

Push the release branch and create a PR:

```bash
git push origin release/v1.1.0
```

Then create a Pull Request:
- **Title:** `Release v1.1.0 - Satellites API`
- **Description:** Include highlights from CHANGELOG.md
- **Reviewers:** Assign at least 1 backend team member for approval

---

### 7. Merge Pull Request

After receiving approval:
1. Merge the PR to main
2. Delete the release branch
3. **Checkout main locally:** `git checkout main && git pull origin main`

---

### 8. Create Git Tag (After PR Merge)

After the PR is merged to main, create the git tag:

```bash
git checkout main
git pull origin main
git tag -a v1.1.0 -m "Release v1.1.0 - Satellites API"
git push origin v1.1.0
```

**Tag format:**
- Name: `vX.Y.Z` (e.g., `v1.1.0`)
- Message: Brief description of the release

---

### 9. Create GitHub Release (Optional)

If using GitHub:

1. Go to repository → Releases → Draft a new release
2. Select the tag you just created (`v1.1.0`)
3. Release title: `v1.1.0 - Satellites API`
4. Description: Copy relevant sections from CHANGELOG.md
5. Check "Set as the latest release" (if applicable)
6. Click "Publish release"

---

### 10. Post-Release Actions

After releasing:

- [ ] Notify the team via agreed communication channels
- [ ] Update any dependent services or documentation
- [ ] Monitor for issues in the first 24-48 hours
- [ ] Update project management boards/tracking tools

---

## Hotfix Release Process

For critical bugs or security issues that need immediate release:

### 1. Create Hotfix Branch

```bash
git checkout -b hotfix/1.1.1 v1.1.0
```

### 2. Fix the Issue

Make the minimal changes needed to fix the critical issue.

### 3. Update CHANGELOG.md

Add a new PATCH version section:

```markdown
## [1.1.1] - 2025-01-16

### Fixed
- CRITICAL: Fixed authentication bypass vulnerability
- Fixed crash in satellite validation

### Security
- Patched JWT token validation vulnerability (CVE-XXXX-XXXXX)
```

### 4. Follow Normal Release Steps

- Update package.json to `1.1.1`
- Commit: `git commit -m "Hotfix v1.1.1"`
- Tag: `git tag -a v1.1.1 -m "Hotfix v1.1.1 - Critical security patch"`
- Push: `git push origin hotfix/1.1.1 --follow-tags`

### 5. Merge Hotfix Back

```bash
git checkout main
git merge hotfix/1.1.1
git push origin main
git branch -d hotfix/1.1.1
```

---

## Rollback Process

If a release has critical issues:

### Option 1: Quick Hotfix (Preferred)

Release a new PATCH version with the fix (see Hotfix Release Process above).

### Option 2: Revert to Previous Version

```bash
# Revert to previous tag
git checkout v1.0.0

# Create new branch
git checkout -b revert-v1.1.0

# Update package.json to previous version
# Update CHANGELOG.md to document the revert

git commit -m "Revert to v1.0.0 due to critical issues in v1.1.0"
git tag -a v1.0.1 -m "Reverted v1.1.0 due to critical issues"
git push origin revert-v1.1.0 --follow-tags
```

**Note:** This creates a new tag (v1.0.1) rather than deleting v1.1.0, maintaining history.

---

## Version Naming Conventions

### Standard Releases
- Format: `vX.Y.Z` (e.g., `v1.2.0`)
- Always include the `v` prefix in tags
- Use three numbers (major.minor.patch)

### Pre-Release Versions (if needed)
- Alpha: `v1.2.0-alpha.1`
- Beta: `v1.2.0-beta.1`
- Release Candidate: `v1.2.0-rc.1`

---

## Release Schedule

GroundCTRL follows **checkpoint-based releases** rather than time-based releases:

- **Checkpoint A** (after Phase 0.5): Docs/process baseline
- **Checkpoint B** (after Phase 4): Security + validation
- **Checkpoint C** (after Phase 8): Core domain APIs
- **Checkpoint D** (after Phase 11): Complete feature set

Releases happen after team review at each checkpoint.

---

## Emergency Release Procedure

For critical security vulnerabilities:

1. **Immediately** notify team lead and security officer
2. Create hotfix branch from latest stable tag
3. Fix vulnerability with minimal changes
4. **Fast-track** review (security officer + 1 peer minimum)
5. Release ASAP following hotfix process
6. Document in CHANGELOG.md under `### Security`
7. Notify all stakeholders immediately after release

---

## Release Announcement Template

```markdown
# GroundCTRL Backend v1.1.0 Released

We're excited to announce version 1.1.0 of the GroundCTRL Backend!

## Highlights
- 🛰️ New Satellites API with full CRUD operations
- 🔒 Enhanced security with improved validation
- 📝 Updated documentation and Swagger specs

## Breaking Changes
None - this release is fully backwards compatible.

## Upgrade Instructions
Update your package.json dependency:
```
"groundctrl-backend": "^1.1.0"
```

## Full Changelog
See CHANGELOG.md for complete details.

## Questions or Issues?
Contact the backend team or open an issue on GitHub.
```

---

## Checklist Summary

**Pre-Release:**
- [ ] All planned work merged and tested
- [ ] CHANGELOG.md updated
- [ ] Version number decided

**Release:**
- [ ] CHANGELOG.md finalized
- [ ] package.json version updated
- [ ] VERSIONING.md updated
- [ ] Release commit created
- [ ] Git tag created
- [ ] Changes pushed to remote

**Post-Release:**
- [ ] GitHub release created (optional)
- [ ] Team notified
- [ ] Monitoring for issues

---

## Questions?

If you're unsure about any step in this process:
1. Consult VERSIONING.md for version number guidance
2. Review CONTRIBUTING.md for team workflow
3. Ask the backend team lead for clarification
4. Discuss in team meeting if needed

---

## References

- VERSIONING.md - Version number guidelines
- CHANGELOG.md - Release history
- CONTRIBUTING.md - Team workflow
- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
