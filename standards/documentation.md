# Rule: Documentation_Management_v1.5

## Metadata
- **Created:** 2025-11-17
- **Last Updated:** 2025-11-18
- **Version:** 1.5

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

# End of Rule – Documentation_Management_v1.5
