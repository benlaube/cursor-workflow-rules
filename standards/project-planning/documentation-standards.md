# Standard: Documentation_Standards_v1.3

## Metadata

- **Status:** Active
- **Created:** 02-12-2025
- **Last Updated:** 04-12-2025 15:37:07 EST
- **Version:** 1.3
- **Description:** Comprehensive reference guide defining what documentation files should exist in every application, organized by priority and use case with detailed subfolder structure.
- **Type:** Reference Guide - Used by developers and AI agents for documentation planning
- **Applicability:** When starting new projects, auditing documentation, planning improvements, or running project-audit
- **Related Standards:**
  - [documentation-management.md](./documentation-management.md) - How to manage and organize documentation (governing rules)
  - [project-structure.md](../project-structure.md) - Overall project file structure
  - [tech-stack-documentation-standard.md](./tech-stack-documentation-standard.md) - TECH_STACK.md format requirements
- **How to Use:** Use as a checklist when starting projects or auditing existing documentation to ensure all required files exist

> **NOTE:** This is the authoritative source for documentation standards. Previously a copy existed at `docs/DOCUMENTATION_STANDARDS.md` but that has been removed to maintain a single source of truth in the `standards/` directory.

## When to Apply This Standard

Apply this standard when:

- Starting a new project (use as a checklist)
- Auditing existing documentation
- Onboarding new team members
- Planning documentation improvements
- Running `project-audit` command

---

## 1. Overview

This document provides a comprehensive list of standard documentation files that should exist in every application, organized by priority and use case. It also defines the recommended subfolder structure within the `/docs` directory.

**Role:** This is a comprehensive reference guide (WHAT docs should exist). For governing rules on HOW to manage documentation, see `standards/project-planning/documentation-management.md`.

**Related Standards:**

- `standards/project-planning/documentation-management.md` - How to manage and organize documentation (governing rules)
- `standards/project-planning/project-structure.md` - Overall project file structure

---

## 2. Core Foundation Documents (Required for All Projects)

### 2.1 Root Level Files

These files must remain in the project root and should never be moved:

| File                                                   | Purpose                                                     | Required?          |
| ------------------------------------------------------ | ----------------------------------------------------------- | ------------------ |
| `README.md`                                            | Project landing page - "What is this?" and "How to run it?" | ✅ Always          |
| `AGENTS.md`                                            | AI Developer Agent context and memory (if using AI agents)  | ⚠️ If using AI     |
| `CHANGELOG.md`                                         | User-facing change log (Keep a Changelog format)            | ✅ Always          |
| `CHANGELOG-DATABASE.md`                                | Database schema changes (timestamped)                       | ⭐ Recommended     |
| `.env.example`                                         | Environment variable template                               | ✅ Always          |
| `.gitignore`                                           | Git ignore rules                                            | ✅ Always          |
| `package.json` / `requirements.txt` / `pyproject.toml` | Dependency definitions                                      | ✅ Always          |
| `.cursorrules`                                         | Cursor-specific rules (if using Cursor)                     | ⚠️ If using Cursor |

### 2.2 Documentation Directory - Core Files

| File              | Location               | Purpose                                     | Required?      |
| ----------------- | ---------------------- | ------------------------------------------- | -------------- |
| `TECH_STACK.md`   | `docs/TECH_STACK.md`   | Single source of truth for technology stack | ✅ Always      |
| `Roadmap_vX.X.md` | `docs/Roadmap_vX.X.md` | High-level project roadmap                  | ⭐ Recommended |

**Note:** See `standards/tech-stack-document.md` for `TECH_STACK.md` format requirements.

---

## 3. Complete Documentation Subfolder Structure

The following structure should be used within the `/docs` directory. Not all folders need to exist immediately - create them as needed.

```
/docs
├── TECH_STACK.md                    # Required: Technology stack reference
├── Roadmap_vX.X.md                  # Recommended: Project roadmap
│
├── /architecture                     # Architecture and design documentation
│   ├── ARCHITECTURE.md              # System architecture overview
│   ├── ARCHITECTURE_DECISIONS.md    # Architecture Decision Records (ADRs)
│   ├── /adr                         # Alternative: ADR folder structure
│   │   ├── 0001-record-architecture-decisions.md
│   │   └── 0002-use-supabase-for-auth.md
│   └── COMPONENT_DIAGRAMS/          # Architecture diagrams
│
├── /api                             # API documentation (for APIs/libraries)
│   ├── API_REFERENCE.md             # Complete API reference
│   ├── API_DESIGN.md                # API design principles and conventions
│   ├── API_VERSIONING.md            # API versioning strategy
│   └── /endpoints                   # Per-endpoint documentation
│       └── users.md
│
├── /deployment                      # Deployment and operations
│   ├── DEPLOYMENT.md                # Deployment procedures
│   ├── ENVIRONMENT_VARIABLES.md    # All environment variables documented
│   ├── CI_CD.md                     # CI/CD pipeline documentation
│   ├── MONITORING.md                # Monitoring and observability
│   ├── PERFORMANCE.md               # Performance documentation
│   ├── SCALING.md                   # Scaling guide (for high-traffic apps)
│   ├── DISASTER_RECOVERY.md         # Disaster recovery plan
│   └── INCIDENT_RESPONSE.md         # Incident response procedures
│
├── /development                     # Developer documentation
│   ├── DEVELOPER_SETUP.md           # Developer onboarding and setup
│   ├── CONTRIBUTING.md              # Contribution guidelines
│   ├── DEVELOPMENT_WORKFLOW.md      # Development process and workflow
│   ├── TESTING.md                   # Testing documentation
│   ├── TESTING_STRATEGY.md          # Testing strategy (for complex projects)
│   ├── TOOLING.md                   # Development tools documentation
│   ├── CONFIGURATION.md             # Configuration guide
│   └── TROUBLESHOOTING.md           # Troubleshooting guide
│
├── /database                         # Database documentation
│   ├── DATABASE_SCHEMA.md           # Database schema documentation
│   ├── DATA_MIGRATION.md             # Data migration guides
│   └── BACKUP_STRATEGY.md            # Backup and restore procedures
│
├── /security                         # Security documentation
│   ├── SECURITY.md                  # Security documentation
│   ├── PRIVACY.md                   # Privacy policy (if handling user data)
│   ├── COMPLIANCE.md                # Compliance documentation (if needed)
│   └── THREAT_MODEL.md              # Threat modeling (for complex apps)
│
├── /user                             # User-facing documentation
│   ├── USER_GUIDE.md                # End-user documentation
│   ├── QUICK_START.md               # Quick start guide
│   └── FAQ.md                        # Frequently asked questions
│
├── /integration                      # Integration documentation
│   ├── STANDARDS_INTEGRATION_GUIDE.md # Main integration guide (or root level)
│   ├── QUICK_INTEGRATION.md         # Quick integration (or root level)
│   └── THIRD_PARTY_SERVICES.md      # Third-party services documentation
│
├── /project                          # Project management documentation
│   ├── ROADMAP_vX.X.md              # Project roadmap (or root docs/)
│   ├── RELEASE_NOTES.md             # Release notes (alternative to CHANGELOG)
│   ├── KNOWN_ISSUES.md              # Known issues and limitations
│   └── COMMON_TASKS.md              # Common tasks cookbook
│
├── /process                          # Process documentation (REQUIRED STRUCTURE)
│   ├── development_workflow_v1_0.md # Development workflow (if exists)
│   └── (Note: Checklists located in `standards/process/checklists/` - see `standards/project-planning/documentation-management.md` Section 4.4)
│   └── (Note: Security audit standards moved to `standards/security/security-audit.md`)
│   └── (other process standards)
│
├── /specs                            # Technical specifications
│   ├── feature_spec_template_v1_0.md # Feature spec template
│   ├── /component_specs             # Component specifications
│   └── /feature_specs               # Feature specifications
│       └── user-authentication-v1.md
│
├── /roadmap                          # Roadmap documentation
│   ├── roadmap_v1_0.md              # Versioned roadmaps
│   ├── roadmap_v1_1.md
│   └── /releases                     # Release-specific roadmaps
│       └── release_v1_0_0.md
│
├── /specialized                      # Specialized documentation (as needed)
│   ├── MULTI_TENANCY.md             # Multi-tenancy documentation
│   ├── I18N.md                       # Internationalization guide
│   ├── ACCESSIBILITY.md              # Accessibility documentation
│   ├── ANALYTICS.md                  # Analytics and tracking
│   └── MIGRATION_GUIDES/             # Migration guides
│       └── v1-to-v2-migration.md
│
└── /archive                          # Deprecated documentation
    └── (moved here when no longer active)
```

---

## 4. Documentation by Category

### 4.1 Development & Onboarding

**Purpose:** Help developers get started and understand the codebase.

| Document              | Location                                   | When to Create               |
| --------------------- | ------------------------------------------ | ---------------------------- |
| Developer Setup       | `docs/development/DEVELOPER_SETUP.md`      | Before first contributor     |
| Contributing Guide    | `docs/development/CONTRIBUTING.md`         | When accepting contributions |
| Development Workflow  | `docs/development/DEVELOPMENT_WORKFLOW.md` | When establishing processes  |
| Testing Documentation | `docs/development/TESTING.md`              | When tests exist             |
| Tooling Guide         | `docs/development/TOOLING.md`              | When using specialized tools |
| Troubleshooting       | `docs/development/TROUBLESHOOTING.md`      | When common issues arise     |

**Example Structure:**

```markdown
# Developer_Setup_v1.0

## Metadata

- **Created:** YYYY-MM-DD
- **Last Updated:** YYYY-MM-DD
- **Version:** 1.0

## Prerequisites

- Node.js 18+
- Supabase CLI
- Docker Desktop

## Installation Steps

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env`
4. Start Supabase: `supabase start`
   ...
```

### 4.2 Integration & Usage

**Purpose:** Help users integrate and use the project.

| Document             | Location                                                                                   | When to Create                 |
| -------------------- | ------------------------------------------------------------------------------------------ | ------------------------------ |
| Integration Guide    | `docs/integration/STANDARDS_INTEGRATION_GUIDE.md` or root `STANDARDS_INTEGRATION_GUIDE.md` | For reusable modules/libraries |
| Quick Integration    | `docs/integration/QUICK_INTEGRATION.md` or root `QUICK_INTEGRATION.md`                     | For fast-start scenarios       |
| User Guide           | `docs/user/USER_GUIDE.md`                                                                  | For end-user applications      |
| API Reference        | `docs/api/API_REFERENCE.md`                                                                | For APIs/libraries             |
| Third-Party Services | `docs/integration/THIRD_PARTY_SERVICES.md`                                                 | When using external services   |

### 4.3 Security & Compliance

**Purpose:** Document security practices and compliance requirements.

| Document               | Location                        | When to Create                     |
| ---------------------- | ------------------------------- | ---------------------------------- |
| Security Documentation | `docs/security/SECURITY.md`     | Always for production apps         |
| Privacy Policy         | `docs/security/PRIVACY.md`      | When handling user data            |
| Compliance             | `docs/security/COMPLIANCE.md`   | When subject to regulations        |
| Threat Model           | `docs/security/THREAT_MODEL.md` | For complex/security-critical apps |

**Note:** Root-level `SECURITY_CHECKLIST.md` is optional for quick reference, but authoritative checklist is `standards/security/security-audit-checklist.md`.

### 4.4 Deployment & Operations

**Purpose:** Guide deployment and operational procedures.

| Document              | Location                                   | When to Create                 |
| --------------------- | ------------------------------------------ | ------------------------------ |
| Deployment Guide      | `docs/deployment/DEPLOYMENT.md`            | Before first production deploy |
| Environment Variables | `docs/deployment/ENVIRONMENT_VARIABLES.md` | When env vars exist            |
| CI/CD Documentation   | `docs/deployment/CI_CD.md`                 | When CI/CD is set up           |
| Monitoring            | `docs/deployment/MONITORING.md`            | When monitoring is configured  |
| Performance           | `docs/deployment/PERFORMANCE.md`           | When performance is critical   |
| Disaster Recovery     | `docs/deployment/DISASTER_RECOVERY.md`     | For production systems         |
| Incident Response     | `docs/deployment/INCIDENT_RESPONSE.md`     | For production systems         |

### 4.5 Database & Data

**Purpose:** Document database structure and data management.

| Document        | Location                           | When to Create           |
| --------------- | ---------------------------------- | ------------------------ |
| Database Schema | `docs/database/DATABASE_SCHEMA.md` | When database exists     |
| Data Migration  | `docs/database/DATA_MIGRATION.md`  | When migrations exist    |
| Backup Strategy | `docs/database/BACKUP_STRATEGY.md` | For production databases |

**Note:** `CHANGELOG-DATABASE.md` should remain at root level for database changes.

### 4.6 Architecture

**Purpose:** Document system design and architecture decisions.

| Document               | Location                                                | When to Create              |
| ---------------------- | ------------------------------------------------------- | --------------------------- |
| Architecture Overview  | `docs/architecture/ARCHITECTURE.md`                     | For complex systems         |
| Architecture Decisions | `docs/architecture/ARCHITECTURE_DECISIONS.md` or `/adr` | When making major decisions |
| Component Diagrams     | `docs/architecture/COMPONENT_DIAGRAMS/`                 | When diagrams exist         |

### 4.7 API Documentation (for APIs/Libraries)

**Purpose:** Document API endpoints and usage.

| Document       | Location                     | When to Create                      |
| -------------- | ---------------------------- | ----------------------------------- |
| API Reference  | `docs/api/API_REFERENCE.md`  | For all APIs                        |
| API Design     | `docs/api/API_DESIGN.md`     | When establishing API patterns      |
| API Versioning | `docs/api/API_VERSIONING.md` | When versioning APIs                |
| Endpoint Docs  | `docs/api/endpoints/`        | For detailed endpoint documentation |

### 4.8 Project Management

**Purpose:** Track project progress and planning.

| Document      | Location                                                 | When to Create                  |
| ------------- | -------------------------------------------------------- | ------------------------------- |
| Roadmap       | `docs/Roadmap_vX.X.md` or `docs/roadmap/roadmap_vX.X.md` | For active projects             |
| Release Notes | `docs/project/RELEASE_NOTES.md`                          | Alternative to CHANGELOG format |
| Known Issues  | `docs/project/KNOWN_ISSUES.md`                           | When issues are tracked         |
| Common Tasks  | `docs/project/COMMON_TASKS.md`                           | For frequently performed tasks  |

### 4.9 Process Documentation (Required Structure)

**Purpose:** Define development processes and validation.

**Location:** `docs/process/` (this structure is required per `standards/project-planning/documentation-management.md`)

| Document             | Location                                    | When to Create                          |
| -------------------- | ------------------------------------------- | --------------------------------------- |
| Development Workflow | `docs/process/development_workflow_v1_0.md` | When establishing workflow              |
| Checklists           | `standards/process/checklists/*.md`         | Required for validation                 |
| Process Standards    | `docs/process/*_standards_v1_0.md`          | For process requirements (if any exist) |

**Checklists Required:**

- `standards/process/checklists/pre_flight_checklist_v1_0.md` - Environment validation
- `standards/process/checklists/pr_review_checklist_v1_0.md` - Pre-PR validation
- `standards/process/checklists/project_audit_checklist_v1_0.md` - Project structure validation
- `standards/security/security-audit-checklist.md` - Security validation
- `.cursor/rules/supabase-rls-policy-review.mdc` - RLS policy validation (auto-applied rule when Supabase detected)

### 4.10 Specialized Documentation

**Purpose:** Domain-specific documentation as needed.

| Document             | Location                             | When to Create               |
| -------------------- | ------------------------------------ | ---------------------------- |
| Multi-Tenancy        | `docs/specialized/MULTI_TENANCY.md`  | For multi-tenant apps        |
| Internationalization | `docs/specialized/I18N.md`           | For multi-language apps      |
| Accessibility        | `docs/specialized/ACCESSIBILITY.md`  | For public-facing apps       |
| Analytics            | `docs/specialized/ANALYTICS.md`      | When using analytics         |
| Migration Guides     | `docs/specialized/MIGRATION_GUIDES/` | For major version migrations |

---

## 5. Documentation by Application Type

### 5.1 Web Application

**Required:**

- Core Foundation (Section 2)
- `docs/development/DEVELOPER_SETUP.md`
- `docs/user/USER_GUIDE.md`
- `docs/deployment/DEPLOYMENT.md`
- `docs/security/SECURITY.md`
- `docs/security/PRIVACY.md` (if handling user data)
- `docs/deployment/MONITORING.md`
- `docs/deployment/PERFORMANCE.md`

**Recommended:**

- `docs/architecture/ARCHITECTURE.md`
- `docs/database/DATABASE_SCHEMA.md`
- `docs/development/TESTING.md`
- `docs/project/KNOWN_ISSUES.md`

### 5.2 API/Backend Service

**Required:**

- Core Foundation (Section 2)
- `docs/api/API_REFERENCE.md`
- `docs/api/API_DESIGN.md`
- `docs/deployment/DEPLOYMENT.md`
- `docs/security/SECURITY.md`
- `docs/deployment/MONITORING.md`
- `docs/database/DATABASE_SCHEMA.md`

**Recommended:**

- `docs/architecture/ARCHITECTURE.md`
- `docs/deployment/ENVIRONMENT_VARIABLES.md`
- `docs/deployment/CI_CD.md`
- `docs/development/TESTING.md`

### 5.3 Library/Package

**Required:**

- Core Foundation (Section 2)
- `docs/integration/STANDARDS_INTEGRATION_GUIDE.md` or root `STANDARDS_INTEGRATION_GUIDE.md`
- `docs/api/API_REFERENCE.md`
- `docs/development/CONTRIBUTING.md`

**Recommended:**

- `docs/development/DEVELOPMENT_WORKFLOW.md`
- `docs/development/TESTING.md`
- `docs/project/RELEASE_NOTES.md`

### 5.4 Monorepo/Multi-Module Project

**Required:**

- Core Foundation (Section 2)
- `docs/architecture/ARCHITECTURE.md` (monorepo structure)
- `docs/development/DEVELOPMENT_WORKFLOW.md` (workspace management)
- Module-specific READMEs in each module

**Recommended:**

- `docs/development/TOOLING.md` (workspace tools)
- `docs/deployment/CI_CD.md` (monorepo CI/CD)
- `docs/project/ROADMAP_vX.X.md`

---

## 6. Priority Matrix

Use this matrix to determine which documents to create based on project stage and complexity.

| Priority                  | When Needed            | Documents                                    |
| ------------------------- | ---------------------- | -------------------------------------------- |
| **P0 - Always**           | Every project          | Core Foundation (Section 2)                  |
| **P1 - Most Projects**    | Web apps, APIs         | Development & Integration (Section 4.1, 4.2) |
| **P2 - Production**       | Production deployments | Security & Operations (Section 4.3, 4.4)     |
| **P3 - Complex Projects** | Large/complex systems  | Architecture & Database (Section 4.5, 4.6)   |
| **P4 - As Needed**        | Specific requirements  | Specialized (Section 4.10)                   |

### 6.1 Minimum Viable Documentation (MVP)

For a new project, start with:

1. ✅ `README.md` (root)
2. ✅ `CHANGELOG.md` (root)
3. ✅ `.env.example` (root)
4. ✅ `docs/TECH_STACK.md`
5. ⭐ `docs/development/DEVELOPER_SETUP.md`
6. ⭐ `docs/development/CONTRIBUTING.md` (if open source)

### 6.2 Production-Ready Documentation

Before production deployment, ensure:

1. All MVP documentation
2. ✅ `docs/deployment/DEPLOYMENT.md`
3. ✅ `docs/deployment/ENVIRONMENT_VARIABLES.md`
4. ✅ `docs/security/SECURITY.md`
5. ✅ `docs/deployment/MONITORING.md`
6. ✅ `docs/database/BACKUP_STRATEGY.md`
7. ⭐ `docs/deployment/DISASTER_RECOVERY.md`
8. ⭐ `docs/deployment/INCIDENT_RESPONSE.md`

---

## 7. File Naming Conventions

### 7.1 Documentation Files

- **Format:** `snake_case.md` (preferred) or `UPPER_SNAKE_CASE.md` (acceptable for docs/ files)
- **Note:** See `standards/project-planning/documentation-management.md` Section 5 for authoritative naming rules
- **Examples:**
  - `DEVELOPER_SETUP.md` (UPPER_SNAKE_CASE - acceptable in docs/)
  - `API_REFERENCE.md` (UPPER_SNAKE_CASE - acceptable in docs/)
  - `TECH_STACK.md` (UPPER_SNAKE_CASE - acceptable in docs/)
  - `api_design_overview_v1_2.md` (snake_case - preferred for new files)

### 7.2 Versioned Documents

- **Format:** `{name}_v{X}_{Y}.md`
- **Examples:**
  - `Roadmap_v1_0.md`
  - `development_workflow_v1_0.md`
  - `standards/security/security-audit.md` (moved from `docs/process/`)

### 7.3 Checklists

- **Format:** `{purpose}_checklist_v{X}_{Y}.md`
- **Examples:**
  - `pre_flight_checklist_v1_0.md`
  - `security_audit_checklist_v1_0.md`

### 7.4 Standards

- **Format:** `{topic}_standards_v{X}_{Y}.md`
- **Examples:**
  - `standards/security/security-audit.md` (moved from `docs/process/`)
  - `documentation_standards_v1_0.md`

---

## 8. Documentation Metadata

Every documentation file must include metadata at the top. See `standards/project-planning/documentation-management.md` Section 4 for complete format requirements, or `.cursor/rules/documentation-metadata.mdc` for auto-applied validation.

### 8.1 Standard Format

```markdown
# Title_With_Version_Number_vX.X

## Metadata

- **Created:** YYYY-MM-DD
- **Last Updated:** YYYY-MM-DD
- **Version:** X.X
- **Description:** One sentence describing the purpose of this document.
```

### 8.2 Checklist Format

```markdown
# Checklist_Name_v1.0

**Type:** Checklist – used by Cursor commands and human devs to validate X before proceeding.

**Description:** Brief description of what this checklist validates.

**Created:** YYYY-MM-DD HH:MM
**Last_Updated:** YYYY-MM-DD HH:MM

**Related Command:** `.cursor/commands/command_name.md`
**Related Standard:** `standards/standard_name.md` or `docs/process/standard_name_v1_0.md`
```

---

## 9. Documentation Maintenance

### 9.1 When to Update Documentation

- **Code Changes:** Update relevant docs when code changes
- **Architecture Changes:** Update architecture docs when design changes
- **Process Changes:** Update process docs when workflows change
- **Quarterly Review:** Review all documentation quarterly
- **Major Releases:** Update docs before major releases

### 9.2 Documentation Lifecycle

1. **Create** - Add new documentation as needed
2. **Update** - Keep documentation in sync with code
3. **Review** - Quarterly or per major release
4. **Archive** - Move outdated docs to `docs/archive/`
5. **Delete** - Only if truly obsolete (rare)

### 9.3 Archiving Documentation

When documentation becomes outdated:

1. Move to `docs/archive/`
2. Append `_archived_YYYY-MM-DD` to filename if needed
3. Update any references to point to new location
4. Add note in archived file explaining why it was archived

**Example:**

```
docs/archive/old_deployment_guide_archived_2025-12-01.md
```

---

## 10. File Locations Quick Reference

### 10.1 Process Documentation

- **Checklists:** `standards/process/checklists/`
- **Process Standards:** `docs/process/*_standards_v*.md` (if any exist) or `standards/` (for domain standards like security)
- **Process Guides:** `docs/process/*.md` (if any exist)

### 10.2 General Standards

- **Architecture:** `standards/architecture/`
- **Database:** `standards/database/`
- **Security:** `standards/security/`
- **Documentation:** `standards/project-planning/documentation-management.md`
- **Module Structure:** `standards/module-structure.md`
- **Project Structure:** `standards/project-structure.md`

### 10.3 Module Documentation

- **Module READMEs:** `modules/{module-name}/README.md`
- **Module Integration Guides:** `modules/{module-name}/INTEGRATION_GUIDE.md`

### 10.4 Commands

- **Cursor Commands:** `.cursor/commands/*.md`

### 10.5 Master Reference

- **AGENTS.md:** Root level - master brain with lifecycle and references

## 11. Cross-References and Linking

### 11.1 Linking Between Documents

Always link related documents:

```markdown
See `docs/deployment/DEPLOYMENT.md` for deployment procedures.
For API documentation, see `docs/api/API_REFERENCE.md`.
```

### 11.2 Master References

- **`AGENTS.md`** - Master reference for AI agents (Section 8)
- **`standards/project-planning/documentation-management.md`** - Documentation management rules (governing standards)
- **`standards/project-planning/documentation-standards.md`** - Comprehensive reference and checklist (this file)

### 11.3 Module Documentation

Module-specific documentation lives in `modules/{module-name}/`:

- `README.md` - Module usage guide
- `INTEGRATION_GUIDE.md` - Module integration guide
- `QUICK_REFERENCE.md` - Module quick reference

See `standards/module-structure.md` for module documentation requirements.

---

## 12. Quick Reference Checklist

Use this checklist when starting a new project or auditing documentation:

### Core Foundation

- [ ] `README.md` (root)
- [ ] `CHANGELOG.md` (root)
- [ ] `CHANGELOG-DATABASE.md` (root, if using database)
- [ ] `.env.example` (root)
- [ ] `docs/TECH_STACK.md`
- [ ] `docs/Roadmap_vX.X.md` (recommended)

### Development

- [ ] `docs/development/DEVELOPER_SETUP.md`
- [ ] `docs/development/CONTRIBUTING.md` (if open source)
- [ ] `docs/development/DEVELOPMENT_WORKFLOW.md`
- [ ] `docs/development/TESTING.md`

### Deployment (Production)

- [ ] `docs/deployment/DEPLOYMENT.md`
- [ ] `docs/deployment/ENVIRONMENT_VARIABLES.md`
- [ ] `docs/deployment/MONITORING.md`
- [ ] `docs/deployment/DISASTER_RECOVERY.md` (recommended)

### Security

- [ ] `docs/security/SECURITY.md`
- [ ] `docs/security/PRIVACY.md` (if handling user data)
- [ ] `SECURITY_CHECKLIST.md` (root, for quick reference)

### Process (Required Structure)

- [ ] `standards/process/checklists/pre_flight_checklist_v1_0.md`
- [ ] `standards/process/checklists/pr_review_checklist_v1_0.md`
- [ ] `standards/process/checklists/project_audit_checklist_v1_0.md`
- [ ] `standards/security/security-audit-checklist.md`

### Application-Specific

- [ ] API docs (if API/library)
- [ ] User guide (if end-user app)
- [ ] Database schema (if using database)
- [ ] Architecture docs (if complex system)

---

## 13. Related Documentation

- **`standards/project-planning/documentation-management.md`** - Documentation management rules and metadata format (includes three-layer system explanation)
- **`standards/project-structure.md`** - Overall project file structure
- **`standards/tech-stack-document.md`** - TECH_STACK.md format requirements
- **`AGENTS.md`** - AI agent context and lifecycle (Section 8 for documentation references)

---

## 14. Examples

### 13.1 Small Project Structure

```
/docs
├── TECH_STACK.md
├── Roadmap_v1_0.md
├── /development
│   ├── DEVELOPER_SETUP.md
│   └── CONTRIBUTING.md
└── /process
    └── (Note: Checklists moved to `standards/process/checklists/`)
```

### 13.2 Medium Project Structure

```
/docs
├── TECH_STACK.md
├── Roadmap_v1_0.md
├── /architecture
│   └── ARCHITECTURE.md
├── /development
│   ├── DEVELOPER_SETUP.md
│   ├── CONTRIBUTING.md
│   ├── DEVELOPMENT_WORKFLOW.md
│   └── TESTING.md
├── /deployment
│   ├── DEPLOYMENT.md
│   └── ENVIRONMENT_VARIABLES.md
├── /security
│   └── SECURITY.md
└── /process
    └── (Note: Checklists moved to `standards/process/checklists/`)
```

### 13.3 Large/Complex Project Structure

```
/docs
├── TECH_STACK.md
├── Roadmap_v1_0.md
├── /architecture
│   ├── ARCHITECTURE.md
│   ├── /adr
│   │   └── 0001-record-architecture-decisions.md
│   └── COMPONENT_DIAGRAMS/
├── /api
│   ├── API_REFERENCE.md
│   ├── API_DESIGN.md
│   └── /endpoints
├── /deployment
│   ├── DEPLOYMENT.md
│   ├── ENVIRONMENT_VARIABLES.md
│   ├── CI_CD.md
│   ├── MONITORING.md
│   ├── PERFORMANCE.md
│   ├── DISASTER_RECOVERY.md
│   └── INCIDENT_RESPONSE.md
├── /development
│   ├── DEVELOPER_SETUP.md
│   ├── CONTRIBUTING.md
│   ├── DEVELOPMENT_WORKFLOW.md
│   ├── TESTING.md
│   ├── TESTING_STRATEGY.md
│   └── TOOLING.md
├── /database
│   ├── DATABASE_SCHEMA.md
│   ├── DATA_MIGRATION.md
│   └── BACKUP_STRATEGY.md
├── /security
│   ├── SECURITY.md
│   ├── PRIVACY.md
│   └── COMPLIANCE.md
├── /process
│   ├── development_workflow_v1_0.md (if exists)
│   └── (Note: Checklists located in `standards/process/checklists/` - see `standards/project-planning/documentation-management.md` Section 4.4)
│   └── (Note: Security audit standards moved to `standards/security/security-audit.md`)
│   └── (Note: RLS policy review is now a rule at `.cursor/rules/supabase-rls-policy-review.mdc`)
└── /archive
```

---

_This document provides a comprehensive guide to standard documentation requirements. Start with the minimum viable documentation and expand as your project grows._
