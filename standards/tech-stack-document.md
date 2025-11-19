# Rule: Tech_Stack_Documentation_Standard_v1.0

## Metadata
- **Created:** 2025-11-19
- **Version:** 1.0

## When to Apply This Rule
Apply this rule to every project. The `docs/TECH_STACK.md` file is mandatory and serves as the single source of truth for technical decisions.

## 1. High-Level Goals
- **Clarity:** Any developer or agent should know exactly what tools are available.
- **Constraint:** Prevent "stack drift" (e.g., accidentally using `axios` when `fetch` is the standard).
- **Onboarding:** New agents/humans can read one file to understand the ecosystem.

## 2. File Location
The file MUST be located at: `docs/TECH_STACK.md`.

## 3. Required Content Template

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

## 4. Maintenance
- **Update this file** whenever a new major dependency is added.
- **Check this file** before installing a new package to ensure no duplicates (e.g., don't install `moment` if `date-fns` is listed).

# End of Rule – Tech_Stack_Documentation_Standard_v1.0
