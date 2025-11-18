---
alwaysApply: true
---

# Launch Application Rule

- Agents must **never** start the application stack via ad-hoc shell commands. Always invoke the Cursor commands stored in `.cursor/commands/`:
  - `/launch_application_dev` for any local development workflow (Vite + optional Supabase).
  - `/launch_application_prod` for production-grade builds, previews, or deployment steps.
- The launch commands already resolve `PROJECT_ROOT_URL` / `PORT`, manage `.env.development` / `.env.production`, check Git ignore rules for secrets, run lint/tests (unless `skip-tests=true`), and guard against port conflicts. Do not duplicate that logic elsewhere.
- Logging & errors:
  - All install/lint/build/runtime output streams directly to the Cursor terminal because the commands execute sequential shell steps (`npm install`, `npm run lint`, `npm run dev`, `supabase db push`, etc.). Review the terminal buffer to diagnose failures.
  - Each command exits non-zero on failure (npm/supabase return codes). Stop, fix the reported issue, then re-run the same launch command.
  - Warnings about missing env values or busy ports are printed with `[launch_application_*]` prefixes—address them instead of bypassing the automation.
- When additional services need to start (Supabase, orchestrated “all”), pass the appropriate `service`, `skip-tests`, or `skip-install` parameters to the launch command instead of crafting new scripts.
