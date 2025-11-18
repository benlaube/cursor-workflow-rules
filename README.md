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
│   ├── database/
│   │   ├── schema.md           # SQL conventions, multi-tenancy, comments
│   │   └── settings-schema.md  # Standard settings/env var table design
│   └── architecture/
│       └── backend-module-plan.md # Future backend architecture guide
│
├── modules/                    # "The Tools" - Copy/Pasteable Code
│   ├── settings-manager/       # Database-backed settings & secrets
│   ├── logger-module/          # Structured JSON logging (Pino wrapper)
│   ├── error-handler/          # Result pattern, Circuit Breaker, Auto-retry
│   ├── sitemap-module/         # Sitemap generator for Supabase Storage
│   └── testing-module/         # Mocks for Supabase & Logging (Vitest)
│
├── checklists/                 # "The Process" - Quality Assurance
│   ├── pre-flight-check.md     # Run this before writing code
│   └── pr-review-check.md      # Run this before merging code
│
└── .cursor/                    # "The Persona" - AI Instructions
    └── rules/                  # Auto-loaded rules for Cursor
        └── ai-interaction-rules.md # Critical directives (e.g., "Always comment SQL")
```

## 🚀 How to Use This Repository

### 1. Starting a New Project
Tell your AI Agent:
> "Initialize a new project following the structure in `standards/project-structure.md`. Use `templates/general/env.example` as the base configuration."

### 2. Adding Features with Modules
Don't write boilerplate from scratch. Ask the Agent:
> "I need to add logging to my backend. Implement the `modules/logger-module` from the standards repo."
> "Implement a robust error handler using the `modules/error-handler` pattern, including the Circuit Breaker."

### 3. Designing the Database
Ensure consistency by referencing the schema guide:
> "Create a migration for a 'projects' table. Follow the conventions in `standards/database/schema.md`, specifically regarding the `tenant_id` column, RLS policies, and **mandatory SQL comments**."

### 4. Automating SEO & Sitemaps
> "Set up sitemap auto-generation. Use the architecture defined in `standards/sitemap.md` and the code from `modules/sitemap-module`."

## 🤖 AI Agent Instructions (Meta-Rules)

If you are an AI Agent reading this:
1.  **Read `standards/` first.** Do not guess conventions.
2.  **Check `modules/` second.** Do not reinvent the wheel.
3.  **Enforce Hygiene.** Always add comments to DB tables. Always update `CHANGELOG.md`.
4.  **Self-Correct.** If you see a file >200 lines, refactor it. If a port is busy, kill the process.
