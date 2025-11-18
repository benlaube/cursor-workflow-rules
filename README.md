# Project Structure

This repository acts as a **Knowledge Base** and **Context Library** for AI agents. It contains standards, reusable modules, and templates to accelerate development.

## Directory Layout

```text
/
├── standards/                  # "How we do things" (The Rules)
│   ├── git-flow.md             # Git repository standards and workflow
│   ├── documentation.md        # Documentation management rules
│   ├── project-structure.md    # Standard project file structure
│   ├── sitemap.md              # Sitemap auto-generation guide
│   ├── database/
│   │   ├── schema.md           # Database schema conventions
│   │   └── settings-schema.md  # Settings table schema
│   ├── architecture/
│   │   └── supabase-edge-functions.md # When to use Edge Functions
│   └── deployment/             # Deployment and launch rules
│       ├── application-launch.md
│       └── launch-rule.md
├── modules/                    # "Code we can reuse" (The Tools)
│   ├── settings-manager/       # Settings and environment management
│   ├── logger-module/          # Standardized logging
│   ├── error-handler/          # Auto-healing and error tracking
│   └── archives/               # Old versions or zip packages
├── templates/                  # "Starting points"
│   └── general/                # General purpose templates (env, etc)
├── checklists/                 # Machine-readable checks
│   ├── pre-flight-check.md     # Before running code
│   └── pr-review-check.md      # Before merging code
└── .cursor/
    └── rules/                  # Rules specific to the AI editor
        └── ai-interaction-rules.md # Rules for AI agents
```

## Usage

AI Agents should reference the `standards/` directory to understand project conventions and the `modules/` directory to pull in pre-built capabilities.
