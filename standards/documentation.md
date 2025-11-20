# Rule: Documentation_Management_v1.5

## Metadata
- **Created:** 2025-11-17
- **Last Updated:** 2025-01-27
- **Version:** 1.6

## When to Apply This Rule
Apply this rule whenever documentation is created, updated, reorganized, or found to be inconsistent. This standard is enforced by the **Task Workflow Rule**.

## 1. Primary Documentation Location
- All general project documentation must be stored inside the `/docs` directory.
- `/docs` is the central source of truth for architecture, workflows, processes, and release planning.

## 2. Protected Files (Never Move or Rename)
The following files must remain in their exact original locations and names:
- `AGENTS.md`
- `.cursorrules`
- Root-level `README.md`
- Any markdown referenced by configuration files or tooling.

## 3. Required File Structure Under /docs
```
/docs
  Roadmap_vX.X.md
  /roadmap
    release_v1_0_0.md
  /specs
    feature_spec_template_v1_0.md
    component_specs/
  /process
    development_workflow_v1_0.md
  /archive
    (deprecated files moved here)
```

## 4. Required Metadata for Every Documentation File
Every documentation file must begin with:
```markdown
# Title_With_Version_Number_vX.X

## Metadata
- **Created:** YYYY-MM-DD
- **Last Updated:** YYYY-MM-DD
- **Version:** X.X
- **Description:** One sentence describing the purpose of this document.
```

## 5. Naming Conventions
- **Filenames:** `snake_case` (e.g., `api_design_overview_v1_2.md`).
- **Suffix:** Must include version number `_vX_X`.
- **Titles:** Inside the file, match the filename version.

## 6. Documentation Maintenance & Cleanup Actions

### 6.1 When to Clean Up
- After a major release.
- When a feature spec is superseded by a newer version.
- When the `/docs` root becomes cluttered (>10 files).

### 6.2 Allowed Cleanup Actions
1.  **Archiving:**
    - Move outdated files to `/docs/archive/`.
    - Do **not** delete them unless they are empty or duplicates.
    - Append `_archived` to the filename if needed to avoid collision.
2.  **Consolidation:**
    - If multiple small docs describe the same topic, merge them into a single authoritative file and archive the originals.
3.  **Indexing:**
    - Maintain a `docs/INDEX.md` (or update `README.md`) if the number of docs is large, linking to current active specifications.

### 6.3 Forbidden Actions
- **Do not** delete `README.md` or `AGENTS.md`.
- **Do not** move files referenced by external tools without updating the tool config.
- **Do not** remove version numbers from filenames (they are crucial for history).

## 7. Changelog Management

### 7.1 CHANGELOG.md Purpose

The `CHANGELOG.md` file serves as a **user-facing summary** of notable changes to the project. It complements git history by providing:
- High-level summaries of major changes
- User-visible feature additions
- Breaking changes and migration notes
- Release notes format

**Git history** remains the source of truth for:
- Detailed technical changes
- Code diffs
- Commit-by-commit history
- Pull request reviews

### 7.2 When to Update CHANGELOG.md

Update `CHANGELOG.md` for:

- ✅ **New modules or major features** - When adding significant new functionality
- ✅ **Breaking changes** - When changes require migration or configuration updates
- ✅ **User-facing improvements** - Features that affect how the project is used
- ✅ **Major documentation additions** - New comprehensive guides or standards
- ✅ **Architecture changes** - Significant structural or design changes

Do **not** update for:
- ❌ Minor bug fixes (unless user-visible)
- ❌ Internal refactoring
- ❌ Documentation typo fixes
- ❌ Test additions

### 7.3 Changelog Format

Follow the [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format:

```markdown
## [Unreleased]

### Added
- New feature description

### Changed
- Change description

### Fixed
- Bug fix description

## [1.0.0] - YYYY-MM-DD

### Added
- Initial release features
```

### 7.4 Update Process

1. **Add entries to `[Unreleased]` section** as work is completed
2. **Group changes by type** (Added, Changed, Fixed, etc.)
3. **Use clear, user-friendly language** (avoid technical jargon when possible)
4. **Link to related documentation** when helpful
5. **When releasing**, move `[Unreleased]` to a versioned section with date

### 7.5 Examples

**Good Entry:**
```markdown
### Added
- **Backend API Module** - Standardized API handler wrapper with Supabase SSR integration
  - Automatic error handling and input validation
  - Complete integration guide and examples
```

**Bad Entry:**
```markdown
### Added
- Fixed bug in handler.ts line 45
- Updated dependencies
```

# End of Rule – Documentation_Management_v1.6
