# AI Agent Knowledge Base & Standards Library

This repository serves as the **central brain** for your development workflow. It contains the rules, standards, and reusable code modules that ensure every project is built consistently, securely, and efficiently.

## 📚 Purpose

Instead of explaining your coding preferences to an AI agent every time, you simply point it to this repository. It tells the agent **how** to build (Standards) and gives it the **tools** to build with (Modules).

## 🗂️ Directory Layout

```text
/
├── standards/                  # "The Rules" - How we build software
│   ├── git-flow.md             # Branching, committing, and repo setup
│   ├── documentation.md        # How to write and organize docs
│   ├── project-structure.md    # Standard file layout for new projects
│   ├── configuration.md        # Rules for env vars and config files
│   ├── sitemap.md              # How to build SEO-ready sitemaps
│   ├── seo-automation.md       # Automated metadata generation & Schema.org
│   ├── cms/
│   │   └── blog-architecture.md # Standard Blog/CMS schema & workflow
│   ├── ui/
│   │   └── chat-interface.md   # Standard AI Chat UI (Bubbles, Uploads, Memory)
│   ├── database/
│   │   ├── schema.md           # SQL conventions, multi-tenancy, comments
│   │   └── settings-schema.md  # Standard settings/env var table design
│   ├── architecture/
│   │   ├── backend-module-plan.md      # Backend architecture guide
│   │   ├── supabase-ssr-api-routes.md  # Supabase SSR API patterns
│   │   ├── supabase-local-setup.md     # Local Dev & Container Isolation
│   │   └── runtime-ai-agents.md        # AI Agent architecture
│   └── security/
│       └── access-control.md   # RLS and Authorization policies
│
├── modules/                    # "The Tools" - Copy/Pasteable Code
│   ├── backend-api/            # Next.js API route wrappers with Supabase SSR
│   ├── auth-profile-sync/      # Auth & User Profile synchronization logic
│   ├── ai-agent-kit/           # Runtime AI Agent framework (Prompts, Tools)
│   ├── ai-chat-ui/             # React components for Chat, Attachments, Memory
│   ├── blog-engine/            # Full CMS schema & service layer
│   ├── settings-manager/       # Database-backed settings & secrets
│   ├── logger-module/          # Structured JSON logging (Pino wrapper)
│   ├── error-handler/          # Result pattern, Circuit Breaker, Auto-retry
│   ├── sitemap-module/         # Sitemap generator for Supabase Storage
│   └── testing-module/         # Mocks for Supabase & Logging (Vitest)
│
├── standards/development-checklists/    # "The Process" - Quality Assurance Checklists
│   ├── pre-flight-checklist.md     # Run this before writing code
│   └── pr-review-checklist.md      # Run this before merging code
│
└── .cursor/                    # "The Persona" - AI Instructions
    └── rules/                  # Auto-loaded rules for Cursor
        └── ai-interaction-rules.md # Critical directives (e.g., "Always comment SQL")
```

## 🚀 How to Use This Repository

### For New Projects: Integration Guide

**📖 See [`INTEGRATION_GUIDE.md`](./INTEGRATION_GUIDE.md) for complete instructions on applying these rules and commands to a new project.**

Quick start for AI agents:
> "Integrate the workflow rules from this repository. Copy `.cursor/rules/`, `.cursor/commands/`, `standards/development-checklists/`, and `templates/general/AGENTS-TEMPLATE.md` (rename to `AGENTS.md`). Then adapt them for this project's stack and configuration."

### 1. Starting a New Project
Tell your AI Agent:
> "Initialize a new project following the structure in `standards/project-structure.md`. Use `templates/general/env.example` as the base configuration."

### 2. Building API Routes (Backend)
Use the standardized handler that manages Auth, Validation, and Errors automatically:
> "Create an API route for 'get-posts'. Use the `modules/backend-api` pattern with Zod validation and `requireAuth: true`. Ensure it uses Supabase SSR."

### 3. Adding AI Features
*   **Chat UI:** "Build a Chat UI using `modules/ai-chat-ui` components and the `useChatWithAttachments` hook."
*   **Agent Logic:** "Set up a new Runtime Agent using `modules/ai-agent-kit`. Create a 'Support Agent' with tools to look up user orders."

### 4. Designing the Database
Ensure consistency by referencing the schema guide:
> "Create a migration for a 'projects' table. Follow the conventions in `standards/database/schema.md`, specifically regarding the `tenant_id` column, RLS policies, and **mandatory SQL comments**."

### 5. Automating SEO & Sitemaps
> "Set up sitemap auto-generation. Use the architecture defined in `standards/sitemap.md` and the code from `modules/sitemap-module`."

## 🤖 AI Agent Instructions (Meta-Rules)

If you are an AI Agent reading this:
1.  **Read `standards/` first.** Do not guess conventions.
2.  **Check `modules/` second.** Do not reinvent the wheel. Use `backend-api` for routes.
3.  **Enforce Hygiene.** Always add comments to DB tables. Always update `CHANGELOG.md`.
4.  **Self-Correct.** If you see a file >200 lines, refactor it. If a port is busy, kill the process (after verifying ownership).

### For AI Agents Setting Up New Projects

When integrating this repository into a new project, follow these steps:

1. **Copy Essential Files:**
   - Copy `.cursor/rules/` directory (all files)
   - Copy `.cursor/commands/` directory (all files)
   - Copy `standards/development-checklists/` directory (all files)
   - Copy `templates/general/AGENTS-TEMPLATE.md` and rename to `AGENTS.md`

2. **Adapt for Project:**
   - Update `AGENTS.md` with project-specific context
   - Review `.cursor/rules/environment.mdc` for stack-specific settings
   - Review `.cursor/commands/launch.mdc` for startup process

3. **Verify Integration:**
   - Confirm rules are active (list `.cursor/rules/` files)
   - Test launch command
   - Verify self-healing rules work

**See [`INTEGRATION_GUIDE.md`](./INTEGRATION_GUIDE.md) for detailed instructions and checklist.**
