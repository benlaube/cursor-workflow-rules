# AI Agent Context & Memory (AGENTS.md)

> **CRITICAL NOTE:** This file is for the **AI Developer Agent** (the entity writing code in the IDE) ONLY.
> - It is **NOT** accessible to runtime AI agents (e.g., chatbots embedded in the web app).
> - It contains build-time context, architectural decisions, and developer memory.
> - **Do not** store runtime secrets or user data here.

> **To the Developer Agent:** Read this file at the start of every session. It contains the high-level context, active goals, and persistent memory of the project. Update it when you complete major milestones or learn something new about the codebase.

---

## 1. Project Mission
**[One-Sentence Mission Statement Here]**
*Example: Build a scalable, AI-powered CRM that automates data enrichment for real estate professionals.*

## 2. Current Phase: [Phase Name, e.g., "Foundation"]
We are currently focusing on:
- [ ] Setting up the core infrastructure (Supabase, Next.js).
- [ ] Establishing coding standards.
- [ ] Building the first "vertical slice" (Auth + Profile).

## 3. Active Context (The "Now")
*What is being worked on right now? Keep this fresh.*
- **Latest Task:** [Insert Task]
- **Blocking Issues:** [Insert Blockers]
- **Next Up:** [Insert Next Steps]

## 4. System Architecture Highlights
*Quick reference for the agent. For full details, see `docs/TECH_STACK.md`.*

> **Action:** Read `docs/TECH_STACK.md` now to understand the allowed tools and libraries.

- **Frontend:** Next.js / React
- **Backend:** Supabase (Edge Functions, Postgres)
- **Auth:** Supabase Auth
- **Styling:** Tailwind CSS

## 5. Persistent Memory (Learnings & Patterns)
*Record things that are not obvious from code but are important.*
- "We decided to use `kebab-case` for all files."
- "Do not use the `fs` module in Edge Functions; use Supabase Storage."
- "When testing, always mock the database using `modules/testing-module`."

## 6. Agent Rules of Engagement
1.  **Check Standards First:** Look in `standards/` before guessing.
2.  **Update Docs:** If you change the architecture, update the docs.
3.  **Log Complex Logic:** If running a big migration, write to `/logs/migration_X.log` first.
4.  **Safe Mode:** Do not delete data without confirmation.

---
*Last Updated: [Date]*
