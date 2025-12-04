# create-agents-file

## Metadata
- **Status:** Active
- **Created:** 12-04-2025 14:32:51 EST
- **Last Updated:** 12-04-2025 14:32:51 EST
- **Version:** 1.0.1
- **Description:** Create a project-specific `AGENTS.md` file in THIS repo, based on the shared `templates/AGENTS-TEMPLATE.md` from the `benlaube/cursor-workflow-rules` repo, if `AGENTS.md` does not already exist. The generated file is meant to be the AI Developer Agent context & memory document described in the template.
- **Type:** Executable Command
- **Audience:** AI agents setting up new projects
- **Applicability:** When setting up a new project that needs an AGENTS.md file, or when onboarding a project to the workflow rules system
- **How to Use:** Run this command to create a project-specific AGENTS.md file based on the template. The command will adapt the template to the current project's structure and requirements
- **Dependencies:** [templates/AGENTS-TEMPLATE.md](../../templates/general/AGENTS-TEMPLATE.md)
- **Related Cursor Commands:** [integrate-cursor-workflow-standards.md](./integrate-cursor-workflow-standards.md)
- **Related Cursor Rules:** None
- **Related Standards:** [project-planning/documentation.md](../../standards/project-planning/documentation.md)

---

## Purpose

Create a project-specific `AGENTS.md` file in THIS repo, based on the shared `templates/AGENTS-TEMPLATE.md` from the `benlaube/cursor-workflow-rules` repo, **if `AGENTS.md` does not already exist**. The generated file is meant to be the **AI Developer Agent context & memory** document described in the template.

> NOTE: This command assumes the template has the structure shown in `templates/AGENTS-TEMPLATE.md` (sections 1–9: Project Mission, Current Phase, Active Context, Architecture Highlights, Persistent Memory, Developer Lifecycle, Agent Rules of Engagement, Checklists & Commands, Quick Reference).

---

## A. Project Identity & Existing Files

1. Assume the current working directory is the project root (e.g., `/benlaube/apps/<project>`).
2. Derive:
   - `PROJECT_NAME` from the folder name.
   - `PROJECT_PATH` as a relative or canonical path (e.g., `/benlaube/apps/<project>`).
3. Look for the following files in this project:
   - `AGENTS.md`
   - `PROJECT_AUDIT.md`
   - `README.md`
   - `docs/TECH_STACK.md`
   - `.cursorrules` or project rules files (for Notion binding / commands info)
   - `.cursor/commands/` (for command names like `pre_flight_check`, `launch_application_dev`, etc.)

4. If `AGENTS.md` already exists:
   - **Do not overwrite it.**
   - Optionally:
     - Scan it for gross mismatches with the current standards (e.g., missing sections, clearly outdated references to non‑existent commands), but only make minimal, safe improvements.
   - In your final response, clearly state that `AGENTS.md` already existed and was not replaced.
   - **Stop the command here.**

---

## B. Fetch the Template Content

1. Obtain the contents of `templates/AGENTS-TEMPLATE.md` from the `benlaube/cursor-workflow-rules` repo:
   - If the repo is cloned locally and available, open `templates/AGENTS-TEMPLATE.md` from that clone.
   - Otherwise, fetch it from GitHub via its raw view if tools allow.
2. If the template cannot be read for any reason:
   - Do **not** invent a completely new structure.
   - Abort gracefully and report the failure in your final response.

> The template structure includes sections 1–9 (Project Mission, Current Phase, Active Context, System Architecture Highlights, Persistent Memory, Standard Developer Lifecycle, Agent Rules of Engagement, Related Checklists & Commands, Quick Reference).

---

## C. Adapt Template → Project-Specific AGENTS.md

You will **start from the template text as-is** and then selectively adapt/fill fields. The goal is to:
- Keep the template’s section structure and explanation paragraphs.
- Fill in what can be reasonably derived from this project.
- Leave other fields clearly marked as TODO for a human or later agent.

### C.1 Project Mission (Section 1)

1. If `PROJECT_AUDIT.md` or `README.md` contains a clear one‑sentence mission or tagline, use it to replace:
   - `**[One-Sentence Mission Statement Here]**`
2. If no clear mission statement is available:
   - Leave the placeholder text but prepend `TODO:` to make it obvious, e.g.:
     - `**TODO: [One-Sentence Mission Statement Here]**`

### C.2 Current Phase (Section 2)

1. If the project has an obvious phase documented (e.g., in `PROJECT_AUDIT.md` or README), populate:
   - `## 2. Current Phase: [Phase Name, e.g., "Foundation"]`
2. Otherwise, keep the placeholder but mark it with `TODO` and leave the example checklist bullets intact.

### C.3 Active Context (Section 3)

1. If there is a recent, clearly defined active task (from Notion binding, `CLEAN_UP_TO_DO.md`, or local docs), you may set:
   - **Latest Task** to that description (short).
   - **Blocking Issues** and **Next Up** if they are obvious.
2. If not, leave generic placeholders, but keep the text instructive for future updates.

### C.4 System Architecture Highlights (Section 4)

1. If `docs/TECH_STACK.md` exists:
   - Keep the reference line:
     > `> **Action:** Read docs/TECH_STACK.md now to understand the allowed tools and libraries.`
   - Optionally skim `docs/TECH_STACK.md` to fill:
     - **Frontend:** e.g., `Next.js / React`
     - **Backend:** e.g., `Supabase (Edge Functions, Postgres)`, `FastAPI`, etc.
     - **Auth:** e.g., `Supabase Auth`, `NextAuth.js`, etc.
     - **Styling:** e.g., `Tailwind CSS`.
2. If no tech stack doc exists:
   - Infer from `package.json` / `pyproject.toml` and fill what you can.
   - If still uncertain, leave placeholders, but keep section structure.

### C.5 Persistent Memory (Section 5)

1. Copy the template bullet examples **unchanged**, unless you already have project-specific learnings recorded elsewhere (e.g., in `PROJECT_AUDIT.md` or standards).
2. If you have real persistent learnings (e.g., naming conventions, testing patterns) in existing docs, you may add 1–3 bullets below the examples.
3. Preserve the idea that this list grows over time; do not over‑summarize.

### C.6 Standard Developer Lifecycle (Section 6)

This section heavily references commands and checklists.

1. Inspect `.cursor/commands/` for the presence of:
   - `pre_flight_check`
   - `launch_application_dev`
   - `pr_review_check`
   - `project_audit`
   - `security_audit`
   - `full_project_health_check`
   - `verify_access_control`

2. For each command referenced in the template:
   - If the command exists in this project, keep it as‑is.
   - If it does **not** exist:
     - Either:
       - a) Keep the entry but mark with `TODO: define this command in this project`, or
       - b) Remove/shorten the reference if this project follows a simpler lifecycle.
   - Do **not** claim commands exist when they don’t.

3. For checklists (pre-flight, PR review, project audit, security audit):
   - Check for the files referenced under `docs/process/checklists/`.
   - If missing, leave the references but annotate them with TODO in a gentle way, e.g.:
     - `<!-- TODO: Add project-specific checklist or update path -->`

### C.7 Agent Rules of Engagement (Section 7)

1. Keep the rules conceptually intact; they are generally applicable to your agent ecosystem.
2. If some referenced rules or `.cursor/rules/` files do not exist in this project (e.g., `supabase-rls-policy-review.mdc`), you may:
   - Add an inline note, like:
     - `> NOTE: This project does not currently implement Supabase RLS; this rule applies only if/when Supabase is added.`
3. Ensure the **Temporal Awareness** sub‑rule does not conflict with your newer date-source standard. If you have a canonical `current_date` file, you may update the reference to point to that standard.

### C.8 Related Checklists & Commands (Section 8) and Quick Reference (Section 9)

1. For each checklist and command listed:
   - Verify existence in this project.
   - If paths or names differ slightly, adjust them to match reality.
   - If entirely missing but desired, leave them and mark TODO.
2. The Quick Reference table (Section 9) should be consistent with the commands/checklists above; update entries to reflect the actual commands and files in this repo.

### C.9 Dates / metadata

1. Near the bottom, the template includes:
   - `*Last Updated: [Update this date when you customize the template]*`
2. Replace it using your canonical date source **if available**:
   - Read today’s date from `meta/current_date.md` or `.cursor/context/current-date.txt` if your global rules define such a file.
   - Format as `YYYY-MM-DD` (timezone: America/New_York).
3. If no canonical date source is available:
   - Do **not** guess.
   - Either leave the placeholder or insert `TODO: Set Last Updated date`.

---

## D. Write AGENTS.md

1. After adapting the template content, write it to a new file in the project root named:
   - `AGENTS.md`
2. Ensure:
   - Markdown structure is preserved.
   - All sections (1–9) are present and readable.
   - The file ends with a newline.

3. Do **not** add any secrets (API keys, tokens, private URLs) to AGENTS.md.
   - It may mention env var names, commands, standards, and file paths only.

---

## E. Cross-linking & Final Clean-up

1. If `PROJECT_AUDIT.md` exists:
   - Optionally add a short note inside `AGENTS.md` (e.g., in Section 4 or 6) like:
     - `> See PROJECT_AUDIT.md for current ports, Supabase mode, and configuration details.`

2. If README.md has a “Developer” or “Contributing” section:
   - Optionally add a one-line pointer:
     - `For AI Developer Agent context and lifecycle, see AGENTS.md.`

3. In your final chat response, summarize:
   - Whether AGENTS.md was created or skipped due to existing file.
   - Which sections were partially auto-filled (e.g., Tech Stack, commands) vs left as TODO.
   - Any obvious follow-up actions for the human (e.g., fill in mission statement, phase, or Notion project name).

4. Do not dump the entire contents of AGENTS.md into the chat unless explicitly requested; keep the summary concise.

