# review-all-docs

## Metadata
- **Status:** Active
- **Created:** 12-04-2025 14:32:51 EST
- **Last Updated:** 12-04-2025 14:32:51 EST
- **Version:** 1.0.0
- **Description:** Review all .md files within the project folder starting with those in /docs. Performs comprehensive review of documentation files to identify issues, inconsistencies, or areas needing updates.
- **Type:** Executable Command
- **Audience:** AI agents reviewing documentation
- **Applicability:** When reviewing project documentation, before documentation updates, or as part of documentation audits
- **How to Use:** Run this command to review all .md files within the project folder, starting with those in /docs
- **Dependencies:** None
- **Related Cursor Commands:** [audit-docs.md](./audit-docs.md), [audit-readmes.md](./audit-readmes.md)
- **Related Cursor Rules:** [documentation-metadata.mdc](../rules/documentation-metadata.mdc)
- **Related Standards:** [project-planning/documentation.md](../../standards/project-planning/documentation.md)

---

## Purpose

Review all .md files within the project folder starting with those in /docs. Performs comprehensive review of documentation files to identify issues, inconsistencies, or areas needing updates.

---

## When to Use

- When reviewing project documentation
- Before documentation updates
- As part of documentation audits
- When onboarding to a project

---

## Prerequisites

- [ ] Project repository is accessible
- [ ] Documentation files are readable
- [ ] Sufficient permissions to read project files

---

## Steps

### Step 1: Locate Documentation Files

1. **Start with `/docs` directory:**
   - List all `.md` files in `docs/`
   - Note subdirectories and organization
   - Identify main documentation files

2. **Expand to Root and Other Directories:**
   - Check root-level `.md` files (README.md, CHANGELOG.md, etc.)
   - Check for documentation in other directories
   - Note any documentation scattered across project

### Step 2: Review Documentation Structure

1. **Check Organization:**
   - Verify logical organization
   - Check for missing documentation
   - Note duplicate or redundant docs

2. **Review Metadata:**
   - Check for metadata sections in documentation
   - Verify version numbers and dates
   - Note outdated documentation

### Step 3: Identify Issues

1. **Content Issues:**
   - Outdated information
   - Missing sections
   - Inconsistent formatting
   - Broken links

2. **Structure Issues:**
   - Missing required files
   - Poor organization
   - Duplicate content

### Step 4: Generate Report

1. **Document Findings:**
   - List all documentation files found
   - Categorize issues (content, structure, metadata)
   - Prioritize issues (critical, high, medium, low)

2. **Provide Recommendations:**
   - Suggest updates needed
   - Recommend reorganization
   - Identify missing documentation

---

## Expected Output

### Success Case
```
✅ Documentation review complete.

Summary:
- Files Reviewed: 25
- Issues Found: 3
  - 1 outdated README section
  - 1 missing metadata
  - 1 broken link

Recommendations:
- Update README.md installation section
- Add metadata to docs/architecture.md
- Fix link in docs/api.md
```

### Failure Case
```
❌ Documentation review incomplete.

Issues:
- Unable to access docs/ directory
- Documentation files not found
- Insufficient permissions
```

---

## Validation

After reviewing documentation:

- [ ] All documentation files identified
- [ ] Issues categorized and prioritized
- [ ] Recommendations provided
- [ ] Report generated

---

## Related Files

- **Commands:**
  - [audit-docs.md](./audit-docs.md) - Comprehensive documentation audit
  - [audit-readmes.md](./audit-readmes.md) - README-specific audit
- **Rules:**
  - [documentation-metadata.mdc](../rules/documentation-metadata.mdc) - Documentation metadata validation
- **Standards:**
  - [project-planning/documentation-management.md](../../standards/project-planning/documentation-management.md) - Documentation management standards