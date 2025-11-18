# Rule: Documentation_Management_v1.4

## When to Apply This Rule
Apply this rule whenever documentation is created, updated, reorganized, or found to be inconsistent, ensuring the project’s `/docs` structure remains clean, current, and aligned with these standards.

## Documentation Management Standards

### 1. Primary Documentation Location
- All general project documentation must be stored inside the `/docs` directory.
- `/docs` is the central source of truth for architecture, workflows, processes, and release planning.

### 2. Protected Files (Never Move or Rename)
The following files must remain in their exact original locations and names because they are referenced by tools:
- `AGENTS.md`
- `.cursorrules`
- Root-level `README.md`
- Any markdown referenced by configuration files or tooling (CI/CD configs, package.json, MCP configs, Cursor workspace settings).

If uncertain, the agent must not modify the file.

### 3. Required File Structure Under /docs
```
/docs
  Roadmap_vX.X.md
  /roadmap
    release_v1_0_0.md
    release_v1_0_0_migration.md
  /specs
    feature_spec_template_v1_0.md
    component_specs/
  /process
    development_workflow_v1_0.md
    testing_standards_v1_0.md
    deployment_process_v1_0.md
  /archive
    (deprecated files moved here)
```

### 4. Required Metadata for Every Documentation File

Every documentation file must begin with the following block:
```
# Title_With_Version_Number_vX.X

Description: One sentence describing the purpose of this document.
Created: YYYY-MM-DD HH:MM (24-hour format)
Last_Updated: YYYY-MM-DD HH:MM (24-hour format)
```

### 5. Naming Conventions

- All documentation filenames must use **snake_case** (e.g., `api_design_overview_v1_2.md`).
- Every documentation filename must include a **version number suffix** using the format `_vX_X`.
- Titles inside documents must also include the version number (e.g., `# Deployment_Process_v1.2`).

### 6. Allowed Cleanup Actions

#### 6.1 Organize Documentation
- Move stray docs into appropriate `/docs` subfolders (except protected files).
- Use purpose-based organization:
  - `/roadmap` for roadmap and release planning
  - `/specs` for technical specifications
  - `/process` for workflows and operational rules
  - `/archive` for deprecated content

#### 6.2 Rename Files Correctly
- Convert all non-protected doc names to snake_case.
- Add or update version numbers in filenames.
- Ensure the title inside the file matches the versioned filename.

#### 6.3 Merge Duplicate Content
- Identify duplicate or overlapping documentation.
- Merge into a single authoritative file.
- Remove redundant or outdated copies unless referenced.

#### 6.4 Archive Old Documentation
- Move outdated docs to `/docs/archive`.
- Add an “Archived” indicator under the metadata block.

#### 6.5 Normalize Formatting
Ensure each document has:
- A versioned title
- Required metadata block
- Clean, consistent heading levels
- Uniform spacing and list formatting

#### 6.6 Remove Low-Value Artifacts
- Delete empty placeholders
- Delete TODO-only files with no actionable content
- Remove abandoned stubs with no purpose

#### 6.7 Update Internal References
- Fix internal links after reorganizing or renaming files.
- Ensure no links break after cleanup.

### 7. Safety Requirements

- Never modify or move protected files.
- If any action risks breaking build tools, imports, configs, or referenced paths, the agent must halt and request user confirmation.
- When unsure about file dependencies, prefer minimal changes.

# End of Rule – Documentation_Management_v1.4