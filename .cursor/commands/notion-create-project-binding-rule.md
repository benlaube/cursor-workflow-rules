# notion-create-project-binding-rule

# Command: notion-create-project-binding-rule
# Version: 2.0.0
# Purpose: Create or update a Project Rule that binds this repo to a Notion Dev Project.

You are working in the ROOT of a single project (e.g., /benlaube/apps/<project>).

Your tasks:

1. Determine project identity
   - Get the folder name for this project (e.g., "crm-master").
   - Compute a Repo Path like "/benlaube/apps/<folder-name>".
   - Derive a suggested Notion project name from the folder name (e.g., "crm-master" → "CRM Master" or "CRM Master Project").

2. Locate the project rules file
   - Prefer a top-level ".cursorrules" file if present.
   - If not, use the most appropriate local rules file under ".cursor/rules" (e.g., "project-rules.md").
   - Do NOT create multiple competing rule files; choose one canonical place.

3. Search for existing Notion projects
   - Use the Notion MCP to search for existing projects:
     a. First, try to find the "Dev Projects" database by searching Notion:
        - Use `API-post-search` with query: "Dev Projects" and filter by object type "database".
        - If found, query the database using `API-post-database-query` to list all projects.
     b. If "Dev Projects" database is not found, search for projects by the derived project name:
        - Use `API-post-search` with the derived project name as the query.
        - Look for pages or databases that match the project name.
   - Collect all matching projects and their details (name, ID, URL if available).

4. Present options to the user
   - If existing projects are found:
     a. Display a numbered list of matching projects with their names and any relevant metadata.
     b. Include an option to "Create a new project" with the derived name.
     c. Ask the user: "Which project should be bound to this repo? (Enter number, or 'new' to create a new project)"
   - If no existing projects are found:
     a. Inform the user: "No existing Notion projects found matching '[derived name]'."
     b. Propose: "Should I create a new Notion project called '[derived name]'? (yes/no)"
   - Wait for user selection before proceeding.

5. Handle project selection or creation
   - If user selects an existing project:
     - Use the selected project's name as the Notion project name.
     - Note the project ID/page ID for future reference (store in the rule if helpful).
   - If user chooses to create a new project:
     a. If you have access to create pages/databases via Notion MCP:
        - Create a new page in the appropriate location (e.g., in a "Dev Projects" database or workspace).
        - Use the derived project name.
        - If creating in a database, ensure it follows the database schema (e.g., has required fields like "Name", "Status", etc.).
     b. If you cannot create via MCP:
        - Use the derived project name as the binding name.
        - Inform the user they need to create the project manually in Notion and can update the rule later.
   - If an env var or config file clearly defines a Notion project name (e.g., NOTION_PROJECT_NAME), use that instead (but still search to verify it exists).

6. Upsert the Project Rule block
   - In the chosen rules file, create or update a block like:

     # Project Rule: Notion Project Binding v2.0.0

     For this project:
     - The corresponding Notion Dev Project name is: "<SELECTED_OR_CREATED_PROJECT_NAME>".
     - Project ID/Page ID: "<PROJECT_ID_IF_AVAILABLE>" (optional, for reference)
     - When performing non-trivial work (new features, refactors, config changes, cleanup tasks), you should:
       1. Sync metadata with the Notion "Dev Projects" database using the semantics of app_notion:sync-current-project.
       2. Check the Notion "Dev Tasks" database for open tasks linked to this project.
       3. When you complete or significantly progress a task, update its Status in Notion and leave a short note referencing the relevant commit/PR/file.

     Do NOT modify or close tasks clearly owned by humans without leaving context.

   - If a previous Project Binding rule exists, update it in place (idempotent), rather than duplicating.

7. Final summary
   - In chat, tell the user:
     - Which file you updated (e.g., .cursorrules).
     - The Notion Project name that was selected or created.
     - The project ID/page ID if available.
     - Any actions taken (e.g., "Created new Notion project" or "Bound to existing project '[name]'").
     - Any follow-up steps needed (e.g., "Please verify the project exists in Notion and update the rule if the name differs").

