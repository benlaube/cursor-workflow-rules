# notion-sync-project-metadata

## Metadata
- **Status:** Active
- **Created:** 02-12-2025 00:00:00 EST
- **Last Updated:** 12-04-2025 14:32:51 EST
- **Version:** 1.0.0
- **Description:** Sync project metadata (status, last updated, repository info, etc.) to the bound Notion Dev Project. Collects repository info, git status, commit history, and updates the Notion project page with current metadata.
- **Type:** Executable Command
- **Audience:** AI agents syncing project status to Notion
- **Applicability:** After significant changes, periodically as part of regular maintenance, before releases, after project binding, or on-demand when user requests project status update
- **How to Use:** Run this command to sync project metadata to the bound Notion Dev Project. Requires a Notion Project Binding rule to exist first (see notion-create-project-binding-rule)
- **Dependencies:** [notion-create-project-binding-rule.md](./notion-create-project-binding-rule.md)
- **Related Cursor Commands:** [notion-create-project-binding-rule.md](./notion-create-project-binding-rule.md), [notion-task-creation.md](./notion-task-creation.md)
- **Related Cursor Rules:** None
- **Related Standards:** None

---

## Purpose

Sync project metadata (status, last updated, repository info, etc.) to the bound Notion Dev Project.

You are working in the ROOT of a single project (e.g., /benlaube/apps/<project>).

**Prerequisites:** This command should only be run if a Notion Project Binding rule already exists (see `notion-create-project-binding-rule`).

Your tasks:

1. Verify Notion project binding exists
   - Check for a Project Rule: Notion Project Binding in:
     - Top-level ".cursorrules" file
     - `.cursor/rules/project-rules.md` or similar
   - If no binding exists:
     - Inform the user: "No Notion project binding found. Please run `notion-create-project-binding-rule` first."
     - Exit without syncing.
   - If binding exists:
     - Extract the Notion Dev Project name and Project ID/Page ID.
     - Extract the "Dev Projects" database reference if available.
     - Proceed to next step.

2. Locate the "Dev Projects" database
   - Use the Notion MCP to find the "Dev Projects" database:
     a. Use `API-post-search` with query: "Dev Projects" and filter by object type "database".
     b. If found, retrieve the database schema using `API-retrieve-a-database` to understand:
        - Available fields (e.g., "Name", "Status", "Last Updated", "Repository", "Branch", "Commit", etc.)
        - Field types and options
        - Required vs optional fields
     c. If not found:
        - Inform the user: "Dev Projects database not found in Notion. Please create it or update the database name."
        - Exit gracefully.

3. Gather project metadata
   - Collect the following information from the project:
     a. **Repository Info:**
        - Repository path/name (from folder name or git remote)
        - Current git branch: `git branch --show-current`
        - Latest commit hash: `git rev-parse HEAD`
        - Latest commit message: `git log -1 --pretty=%B`
        - Latest commit date: `git log -1 --format=%ci`
     
     b. **Project Status:**
        - Determine status based on:
          - Git branch (main/master = "Production", feature branches = "Development")
          - Recent activity (commits in last 7 days = "Active", older = "Maintenance")
          - Presence of uncommitted changes (indicates "In Progress")
          - Or use a standard status like "Active", "In Progress", "Maintenance", "Archived"
     
     c. **Last Updated:**
        - Use the latest commit date, or current timestamp if no commits
        - Format as ISO 8601: `YYYY-MM-DDTHH:MM:SSZ`
     
     d. **Additional Metadata (if available):**
        - Package version (from `package.json` or `pyproject.toml`)
        - Environment status (dev/staging/prod from `.env` or config)
        - Recent changes summary (from `CHANGELOG.md` if present)

4. Find the project in Notion
   - Query the "Dev Projects" database to find the project:
     a. Use `API-post-database-query` with filter:
        - Match project name from binding rule, OR
        - Match Project ID/Page ID if available
     b. If project found:
        - Note the page ID for updating
     c. If project not found:
        - Inform the user: "Project '[name]' not found in Dev Projects database. Please create it manually or run `notion-create-project-binding-rule` again."
        - Exit gracefully.

5. Update project metadata in Notion
   - Use `API-patch-page` to update the project page with collected metadata:
     a. **Required Updates:**
        - "Last Updated" field: Set to current timestamp
        - "Status" field: Update based on gathered status
        - "Repository" field: Update with repository path/name
        - "Branch" field: Update with current branch name
        - "Commit" field: Update with latest commit hash (or link to commit)
     
     b. **Optional Updates (if fields exist in schema):**
        - "Commit Message": Latest commit message
        - "Version": Package version if available
        - "Environment": Environment status
        - "Recent Changes": Summary from CHANGELOG or recent commits
     
     c. **Update Strategy:**
        - Only update fields that exist in the database schema
        - Preserve existing values for fields not being updated
        - Use appropriate field types (date for timestamps, text for strings, etc.)

6. Add update comment (optional but recommended)
   - Use `API-patch-block-children` to append a comment block to the project page:
     - Include: "Metadata synced on [timestamp]"
     - Include: "Branch: [branch], Commit: [hash]"
     - Include: "Synced by: AI Agent"
     - This provides an audit trail of sync operations

7. Final summary
   - In chat, tell the user:
     - Which Notion project was updated (name and ID).
     - What metadata was synced (list the fields updated).
     - Any fields that couldn't be updated (e.g., field doesn't exist in schema).
     - Any follow-up steps needed (e.g., "Please add 'Version' field to Dev Projects database schema").

## Usage Scenarios

This command should be run:
- **After significant changes:** When completing major features, refactors, or releases
- **Periodically:** As part of regular maintenance (e.g., weekly)
- **Before releases:** To ensure project status is current
- **After project binding:** To initialize project metadata in Notion
- **On-demand:** When user requests project status update

## Integration with Other Commands

- **Prerequisite:** Requires `notion-create-project-binding-rule` to be run first
- **Related:** Works with `notion-task-creation` rule to maintain project-task linkage
- **Can be automated:** Can be called from `task_workflow.mdc` after task completion

## Error Handling

- If Notion MCP is unavailable:
  - Log the metadata that would have been synced
  - Suggest manual update in Notion
  - Include all metadata in the log message for easy copy-paste

- If project not found in database:
  - Provide clear instructions to create it manually
  - Or suggest re-running `notion-create-project-binding-rule`

- If schema mismatch:
  - List available fields in the database
  - Suggest which fields to add to match the metadata being synced
  - Continue with available fields, skip missing ones

