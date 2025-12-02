# notion-task-creation

# Command: notion-task-creation
# Version: 1.0.0
# Purpose: Create a project rule that guides the AI agent on when and how to create tasks in Notion for bugs, incomplete work, and future development.

You are working in the ROOT of a single project (e.g., /benlaube/apps/<project>).

**Prerequisites:** This command should only be run if a Notion Project Binding rule already exists (see `notion-create-project-binding-rule`).

Your tasks:

1. Verify Notion project binding exists
   - Check for a Project Rule: Notion Project Binding in:
     - Top-level ".cursorrules" file
     - `.cursor/rules/project-rules.md` or similar
   - If no binding exists:
     - Inform the user: "No Notion project binding found. Please run `notion-create-project-binding-rule` first."
     - Exit without creating the rule.
   - If binding exists:
     - Extract the Notion Dev Project name and Project ID/Page ID if available.
     - Proceed to next step.

2. Locate the project rules file
   - Use the same file where the Notion Project Binding rule exists.
   - If no binding rule file found, prefer:
     - Top-level ".cursorrules" file if present.
     - Otherwise, use the most appropriate local rules file under ".cursor/rules" (e.g., "project-rules.md").
   - Do NOT create multiple competing rule files; choose one canonical place.

3. Search for "Dev Tasks" database in Notion
   - Use the Notion MCP to find the "Dev Tasks" database:
     a. Use `mcp_notionApi_API-post-search` with query: "Dev Tasks" and filter by object type "database".
     b. If found, retrieve the database schema using `mcp_notionApi_API-retrieve-a-database` to understand:
        - Required fields (e.g., "Title", "Status", "Project", "Priority", "Type")
        - Field types and options (e.g., Status options: "Backlog", "In Progress", "Done")
        - Relations (e.g., relation to "Dev Projects" database)
     c. If not found:
        - Inform the user: "Dev Tasks database not found in Notion. Please create it or update the database name."
        - Still create the rule, but note this limitation.

4. Create the Task Creation Rule block
   - In the chosen rules file, create or update a block like:

     # Project Rule: Notion Task Creation v1.0.0

     For this project (bound to Notion Project: "<PROJECT_NAME>"):
     
     **When to Create Tasks in Notion:**
     
     The AI agent should create tasks in the Notion "Dev Tasks" database in the following scenarios:
     
     1. **Bugs Discovered During Development:**
        - When a bug is found that cannot be fixed immediately (e.g., requires investigation, affects other systems, or is out of scope for current work).
        - When a bug is fixed but similar issues might exist elsewhere (create a follow-up task to audit/refactor).
        - When a bug reveals a design flaw that needs architectural consideration.
     
     2. **Incomplete Work:**
        - When work is partially completed but must be paused (e.g., blocked by dependencies, requires user input, or time constraints).
        - When a feature is implemented but missing tests, documentation, or edge case handling.
        - When refactoring is started but not completed (create task to finish the refactor).
     
     3. **Future Development:**
        - When implementing a feature reveals related improvements or optimizations that should be tracked.
        - When code review or testing suggests enhancements (e.g., performance improvements, better error handling).
        - When technical debt is identified that should be addressed later.
        - When user feedback or requirements suggest future features.
     
     4. **Technical Debt & Maintenance:**
        - When deprecated patterns or libraries are identified that need updating.
        - When code quality issues are found that don't block current work but should be addressed.
        - When documentation gaps are discovered.
     
     **How to Create Tasks:**
     
     1. **Use Notion MCP to create tasks:**
        - Use `mcp_notionApi_API-post-page` to create a new page in the "Dev Tasks" database.
        - Set the parent to the "Dev Tasks" database ID.
        - Include required properties:
          - **Title:** Clear, descriptive task title (e.g., "Fix memory leak in contact sync service")
          - **Project:** Link to the bound Notion project (use Project ID from binding rule)
          - **Status:** Set to "Backlog" for new tasks, "In Progress" if actively working on it
          - **Type:** "Bug", "Feature", "Refactor", "Documentation", or "Technical Debt" as appropriate
          - **Priority:** "Low", "Medium", "High", or "Critical" based on impact
          - **Description:** Detailed description in the page body using `mcp_notionApi_API-patch-block-children`:
            - Include context about where the issue was found (file paths, function names)
            - Explain why it needs to be addressed
            - Include any relevant code snippets or error messages
            - Add links to related commits, PRs, or files if applicable
     
     2. **Task Title Format:**
        - Use descriptive, action-oriented titles
        - Include the affected component/system if relevant
        - Examples:
          - ✅ "Fix memory leak in contact sync service"
          - ✅ "Add error handling for API rate limits in webhook processor"
          - ✅ "Refactor duplicate validation logic in contact-dedupe-service"
          - ❌ "Fix bug" (too vague)
          - ❌ "Improve code" (not actionable)
     
     3. **Task Description Content:**
        - **Context:** Where/when was this discovered?
        - **Problem:** What is the issue or gap?
        - **Impact:** Why does this matter? (performance, security, maintainability, user experience)
        - **Suggested Approach:** If known, how should this be addressed?
        - **Related Files:** List relevant file paths
        - **Related Commits/PRs:** Reference commit hashes or PR numbers
     
     4. **Linking to Project:**
        - Always link the task to the bound Notion project using the Project relation field.
        - This ensures tasks appear in project views and can be tracked together.
     
     **When NOT to Create Tasks:**
     
     - For issues that are fixed immediately as part of the current work (no need to track).
     - For minor code style issues that can be fixed with a simple lint/format pass.
     - For tasks that are clearly documented elsewhere (e.g., in a roadmap or existing task).
     - For work that is explicitly out of scope for this project.
     
     **Task Updates:**
     
     - When starting work on a task, update its Status to "In Progress" in Notion.
     - When completing a task, update its Status to "Done" and add a comment with:
       - Commit hash or PR number
       - Brief summary of what was done
       - Any follow-up tasks created
     - When a task becomes obsolete, update Status to "Cancelled" with a note explaining why.
     
     **Best Practices:**
     
     - Create tasks proactively when issues are discovered, not retroactively.
     - Group related issues into a single task when they share a root cause.
     - Use clear, searchable titles that will be easy to find later.
     - Include enough context that someone else can pick up the task later.
     - Don't create duplicate tasks—search existing tasks first using `mcp_notionApi_API-post-database-query`.
     
     **Error Handling:**
     
     - If Notion MCP is unavailable or creation fails:
       - Log the task details to console with a clear message.
       - Suggest the user create it manually in Notion.
       - Include all the information needed (title, description, type, priority) in the log message.

   - If a previous Task Creation rule exists, update it in place (idempotent), rather than duplicating.

5. Final summary
   - In chat, tell the user:
     - Which file you updated (e.g., .cursorrules).
     - The Notion Project name this rule is bound to.
     - Whether the "Dev Tasks" database was found and its schema understood.
     - Any limitations or follow-up steps needed (e.g., "Dev Tasks database not found—please create it in Notion").

