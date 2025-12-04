# Tech_Stack_Documentation_Standard_v1.1

## Metadata
- **Status:** Active
- **Created:** 19-11-2025
- **Last Updated:** 04-12-2025 16:00:00 EST
- **Version:** 1.1
- **Description:** Standard for creating and maintaining TECH_STACK.md documentation files
- **Type:** Governing Standard - Defines requirements for documenting technology stack decisions
- **Applicability:** Every project - TECH_STACK.md file is mandatory as single source of truth for technical decisions
- **Dependencies:**
  - [documentation-management.md](./documentation-management.md) - Documentation management standards
  - [documentation-standards.md](./documentation-standards.md) - Required documentation files (Section 2.2)
- **Related Standards:**
  - [project-structure.md](./project-structure.md) - File organization standards
- **How to Use:** Reference this standard when creating TECH_STACK.md for a new project or documenting technology choices

## When to Apply This Standard

Apply this standard to:
- Every new project (create TECH_STACK.md during initial setup)
- When adding major dependencies or frameworks
- When changing core technology decisions
- During project audits to verify tech stack is documented

---

## 1. Overview

The `TECH_STACK.md` file serves as the single source of truth for all technology choices in a project. It prevents "stack drift" (accidentally using conflicting tools) and provides quick onboarding for developers and AI agents.

### 1.1 Purpose

- **Clarity:** Any developer or AI agent knows exactly what tools are available
- **Consistency:** Prevents duplicate or conflicting dependencies (e.g., don't use `axios` if `fetch` is the standard)
- **Onboarding:** New team members can read one file to understand the entire technology ecosystem
- **Decision History:** Documents why specific technologies were chosen

### 1.2 Benefits

- Reduces decision paralysis (team agrees on standard tools)
- Prevents "dependency bloat" (adding redundant packages)
- Enables AI agents to make informed technology choices
- Provides context for code review and architectural decisions

---

## 2. File Location and Naming

### 2.1 Location
- **Required Location:** `docs/TECH_STACK.md`
- **Never:** Root level or other directories
- **Reason:** Consistent location makes it easy to find across all projects

### 2.2 Naming Convention
- **Format:** `TECH_STACK.md` (all caps)
- **No versioning:** This is a living document that's updated in place
- **No suffix:** Not `TECH_STACK_v1.md` or similar

---

## 3. Required Content and Template

```markdown
# Technology Stack

## 1. Core Frameworks
- **Frontend:** [e.g., Next.js 14 (App Router)]
- **Backend:** [e.g., Supabase Edge Functions]
- **Language:** [e.g., TypeScript 5.x]

## 2. Infrastructure & Database
- **Database:** [e.g., Postgres 15 (Supabase)]
- **Auth:** [e.g., Supabase Auth]
- **Hosting:** [e.g., Vercel]
- **File Storage:** [e.g., Supabase Storage]

## 3. UI & Styling
- **Styling Engine:** [e.g., Tailwind CSS]
- **Component Library:** [e.g., shadcn/ui, Radix UI]
- **Icons:** [e.g., Lucide React]
- **Animations:** [e.g., Framer Motion]

## 4. Key Libraries (The "Standard Kit")
- **State Management:** [e.g., Zustand, React Context]
- **Data Fetching:** [e.g., TanStack Query, SWR]
- **Forms:** [e.g., React Hook Form + Zod]
- **Dates:** [e.g., date-fns]

## 5. AI & LLM Integration
- **Model Provider:** [e.g., OpenAI, Anthropic]
- **Orchestration:** [e.g., LangChain, Vercel AI SDK]

## 6. Development Tools
- **Linting:** [e.g., ESLint, Prettier]
- **Testing:** [e.g., Vitest, Playwright]
- **Package Manager:** [e.g., pnpm]
```

### 3.1 Section Guidelines

#### Section 1: Core Frameworks
**Purpose:** Document the foundational technologies
- Include version numbers for major frameworks
- Specify architectural patterns (e.g., "App Router" for Next.js)
- List primary programming language and version

#### Section 2: Infrastructure & Database
**Purpose:** Document backend services and infrastructure
- Database type and version
- Authentication provider
- Hosting platform
- File storage solution
- Any other infrastructure services

#### Section 3: UI & Styling
**Purpose:** Document frontend styling and UI libraries
- CSS framework or methodology
- Component library (if using one)
- Icon library
- Animation library (if applicable)

#### Section 4: Key Libraries (The "Standard Kit")
**Purpose:** Document standard libraries for common tasks
- State management approach
- Data fetching strategy
- Form handling
- Date manipulation
- Any other commonly-used utilities

#### Section 5: AI & LLM Integration (Optional)
**Purpose:** Document AI/ML services if used
- Model provider (OpenAI, Anthropic, etc.)
- Orchestration framework (LangChain, Vercel AI SDK, etc.)
- Include only if project uses AI features

#### Section 6: Development Tools
**Purpose:** Document development tooling
- Linting and formatting tools
- Testing frameworks
- Package manager
- Build tools (if not framework default)

---

## 4. Best Practices

### 4.1 Keep It Current
- ✅ Update immediately when adding major dependencies
- ✅ Include version numbers for critical packages
- ✅ Remove entries when deprecating technologies
- ❌ Don't list every single npm package (only major/architectural ones)

### 4.2 Be Specific
- ✅ Good: "Next.js 14 (App Router)"
- ❌ Bad: "Next.js"
- ✅ Good: "TanStack Query (React Query v5)"
- ❌ Bad: "Data fetching library"

### 4.3 Explain Choices (When Needed)
For non-obvious choices, add brief rationale:

```markdown
## 4. Key Libraries
- **Date Handling:** date-fns (chosen over moment.js for smaller bundle size and tree-shaking)
- **State Management:** Zustand (chosen for simplicity over Redux)
```

### 4.4 Check Before Installing
**Before adding a new dependency:**
1. Check TECH_STACK.md for existing solutions
2. Verify you're not installing a duplicate (e.g., `moment` when `date-fns` is listed)
3. Update TECH_STACK.md after installing major dependencies

---

## 5. Maintenance Workflow

### 5.1 When to Update

Update `TECH_STACK.md` when:
- Adding a new major framework or library
- Changing core technology decisions
- Upgrading major versions (e.g., Next.js 13 → 14)
- Removing deprecated technologies
- Discovering technology choices aren't documented

### 5.2 Update Process

1. **Add new technology** to appropriate section
2. **Include version number** for major packages
3. **Add brief rationale** if choice isn't obvious
4. **Update CHANGELOG.md** for significant changes
5. **Notify team** if change affects existing code

### 5.3 Review Frequency

- **Quarterly:** Review for accuracy and completeness
- **Pre-Release:** Verify documentation matches actual stack
- **Onboarding:** Use as checklist when setting up new environments

---

## 6. Example: Complete TECH_STACK.md

```markdown
# Technology Stack

## Metadata
- **Last Updated:** 2025-12-04
- **Project:** My Awesome App
- **Stack Type:** Full-stack web application

---

## 1. Core Frameworks
- **Frontend:** Next.js 14 (App Router)
- **Backend:** Next.js API Routes + Supabase Edge Functions
- **Language:** TypeScript 5.3
- **Runtime:** Node.js 20 LTS

## 2. Infrastructure & Database
- **Database:** PostgreSQL 15 (Supabase)
- **Auth:** Supabase Auth (built-in JWT, OAuth, MFA)
- **Hosting:** Vercel (Edge Network)
- **File Storage:** Supabase Storage
- **Email:** Resend API
- **Monitoring:** Vercel Analytics + Sentry

## 3. UI & Styling
- **Styling Engine:** Tailwind CSS 3.4
- **Component Library:** shadcn/ui (built on Radix UI)
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Typography:** Inter (Google Fonts)

## 4. Key Libraries (The "Standard Kit")
- **State Management:** Zustand (client state) + React Context (auth/theme)
- **Data Fetching:** TanStack Query v5 (React Query)
- **Forms:** React Hook Form + Zod validation
- **Dates:** date-fns (chosen for tree-shaking and smaller bundle)
- **HTTP Client:** fetch (native) + Supabase client
- **Routing:** Next.js App Router (file-based)

## 5. AI & LLM Integration
- **Model Provider:** OpenAI GPT-4 Turbo
- **Orchestration:** Vercel AI SDK
- **Embeddings:** OpenAI text-embedding-3-small
- **Vector Store:** Supabase pgvector

## 6. Development Tools
- **Linting:** ESLint 8 (Next.js config)
- **Formatting:** Prettier 3
- **Testing:** Vitest (unit) + Playwright (e2e)
- **Package Manager:** pnpm 8
- **Type Checking:** TypeScript strict mode
- **Pre-commit:** Husky + lint-staged

## 7. Architecture Decisions

### Why Next.js App Router?
- Server components reduce client bundle size
- Built-in streaming and suspense
- Improved data fetching patterns

### Why Supabase?
- PostgreSQL with built-in auth and storage
- Real-time subscriptions out of the box
- Edge Functions for serverless backend

### Why TanStack Query?
- Automatic caching and refetching
- Optimistic updates
- Better developer experience than native fetch

---

**Note:** Before installing a new dependency, check this document to ensure we're not duplicating functionality or adding conflicting tools.
```

---

## 7. Integration with Project Documentation

### 7.1 Related Files

- **README.md** - Link to TECH_STACK.md for technical details
- **CHANGELOG.md** - Reference major stack changes
- **Architecture docs** - Reference technology choices from TECH_STACK.md

### 7.2 AI Agent Instructions

When AI agents need to:
- **Install a package** → Check TECH_STACK.md first for existing solutions
- **Choose a library** → Follow technology choices listed in TECH_STACK.md
- **Document architecture** → Reference TECH_STACK.md for technology details
- **Onboard to project** → Read TECH_STACK.md to understand ecosystem

---

## 8. Common Pitfalls to Avoid

### 8.1 Too Granular
❌ **Bad:** Listing every npm package  
✅ **Good:** Only major frameworks and architectural libraries

### 8.2 Outdated Information
❌ **Bad:** "Next.js 13" when actually using 14  
✅ **Good:** Keep versions current during upgrades

### 8.3 No Rationale
❌ **Bad:** Just listing technologies without context  
✅ **Good:** Brief explanation for non-obvious choices

### 8.4 Missing Version Numbers
❌ **Bad:** "React Query"  
✅ **Good:** "TanStack Query v5 (React Query)"

---

## 9. Quick Reference Checklist

When creating or updating TECH_STACK.md:

- [ ] File is located at `docs/TECH_STACK.md`
- [ ] All 6 standard sections are present (or marked N/A)
- [ ] Version numbers included for major frameworks
- [ ] Rationale provided for non-obvious choices
- [ ] No duplicate or conflicting tools listed
- [ ] Last Updated date is current
- [ ] Team has been notified of major changes
- [ ] CHANGELOG.md updated if significant changes

---

## 10. Related Documentation

- **Documentation Standards:** `standards/project-planning/documentation-standards.md` - Section 2.2 lists TECH_STACK.md as required
- **Documentation Management:** `standards/project-planning/documentation-management.md` - Metadata and naming conventions
- **Project Structure:** `standards/project-planning/project-structure.md` - Where TECH_STACK.md fits in project structure

---

*This standard defines how to create and maintain TECH_STACK.md documentation. For complete documentation requirements, see `standards/project-planning/documentation-standards.md`.*
