# integrate-cursor-workflow-standards

## Metadata
- **Status:** Active
- **Created:** 12-04-2025 14:32:51 EST
- **Last Updated:** 12-04-2025 14:32:51 EST
- **Version:** 1.0.0
- **Description:** Integrate the workflow rules from the cursor-workflow-rules repository. Copy .cursor/rules/, .cursor/commands/, checklists/, and AGENTS.md, then adapt them for this project's stack and verify everything is working.
- **Type:** Executable Command
- **Audience:** AI agents integrating workflow standards into new projects
- **Applicability:** When integrating workflow rules and standards into a new project, or when setting up a project to use the cursor-workflow-rules system
- **How to Use:** Run this command to integrate workflow rules from the cursor-workflow-rules repository. Follow the instructions in INTEGRATION_GUIDE.md to copy files, adapt them, and verify integration
- **Dependencies:** [STANDARDS_INTEGRATION_GUIDE.md](../../STANDARDS_INTEGRATION_GUIDE.md)
- **Related Cursor Commands:** [create-agents-file.md](./create-agents-file.md)
- **Related Cursor Rules:** None
- **Related Standards:** [project-planning/documentation.md](../../standards/project-planning/documentation.md)

---

## Purpose

Integrate the workflow rules from the cursor-workflow-rules repository. Copy `.cursor/rules/`, `.cursor/commands/`, checklists/, and AGENTS.md, then adapt them for this project's stack and verify everything is working.

---

## When to Use

- When integrating workflow rules and standards into a new project
- When setting up a project to use the cursor-workflow-rules system
- When onboarding a project to the standards library

---

## Prerequisites

- [ ] Access to cursor-workflow-rules repository (GitHub or local clone)
- [ ] Current project is a git repository
- [ ] Project structure is ready for integration
- [ ] INTEGRATION_GUIDE.md is available for reference

---

## Steps

### Step 1: Review Integration Guide

1. **Read INTEGRATION_GUIDE.md:**
   - Understand integration process
   - Note required files and directories
   - Review adaptation requirements

2. **Identify Project-Specific Needs:**
   - Note project stack (Node.js, Python, etc.)
   - Identify project-specific configurations
   - Plan adaptations needed

### Step 2: Copy Required Files

1. **Copy Rules:**
   - Copy `.cursor/rules/` directory from source repository
   - Preserve directory structure
   - Verify all rule files copied

2. **Copy Commands:**
   - Copy `.cursor/commands/` directory from source repository
   - Preserve directory structure
   - Verify all command files copied

3. **Copy Checklists:**
   - Copy `standards/process/checklists/` directory
   - Preserve directory structure
   - Verify all checklist files copied

4. **Copy AGENTS.md:**
   - Copy AGENTS.md template or use `create-agents-file` command
   - Adapt to project-specific needs

### Step 3: Adapt for Project Stack

1. **Update Configuration:**
   - Modify rules/commands for project stack
   - Update paths and references
   - Adjust for project structure

2. **Remove Project-Specific Content:**
   - Remove references to source repository specifics
   - Update project names and paths
   - Adapt to current project context

3. **Verify Dependencies:**
   - Check all file references are valid
   - Update broken links
   - Verify standards references

### Step 4: Verify Integration

1. **Test Rules:**
   - Verify rules apply correctly
   - Test auto-applied rules
   - Check rule triggers

2. **Test Commands:**
   - Verify commands are accessible
   - Test command execution
   - Check command dependencies

3. **Validate Structure:**
   - Verify all files in correct locations
   - Check metadata completeness
   - Validate cross-references

---

## Expected Output

### Success Case
```
✅ Workflow standards integrated successfully.

Files Copied:
- .cursor/rules/: 15 files
- .cursor/commands/: 28 files
- standards/process/checklists/: 5 files
- AGENTS.md: Created

Adaptations:
- Updated paths for Node.js project
- Removed Supabase-specific rules (not applicable)
- Updated project references

Ready to use workflow standards.
```

### Failure Case
```
❌ Integration incomplete.

Issues:
- Source repository not accessible
- Files missing from source
- Adaptation errors
- Verification failures
```

---

## Validation

After integration:

- [ ] All required files copied
- [ ] Files adapted for project stack
- [ ] Dependencies verified
- [ ] Rules and commands functional
- [ ] Integration verified

---

## Related Files

- **Commands:**
  - [create-agents-file.md](./create-agents-file.md) - Create project-specific AGENTS.md
- **Rules:**
  - None
- **Standards:**
  - [project-planning/documentation-management.md](../../standards/project-planning/documentation-management.md) - Documentation management standards
- **Guides:**
  - [STANDARDS_INTEGRATION_GUIDE.md](../../STANDARDS_INTEGRATION_GUIDE.md) - Detailed integration instructions
