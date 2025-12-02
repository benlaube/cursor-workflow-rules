# Security_Audit_Checklist_v1.0

**Type:** Checklist – used by Cursor commands and human devs to validate security posture including secrets, dependencies, database security, API security, and logging practices.

**Description:** Checklist to perform a security audit of the codebase, focusing on secrets, dependencies, database security, API security, and logging practices.

**Created:** 2025-11-25 11:30

**Last_Updated:** 2025-11-25 11:30

**Related Command:** `.cursor/commands/security_audit.md`

**Related Standard:** `docs/process/security_audit_standards_v1_0.md` (comprehensive standard)

---

Use this checklist to perform a security audit of the codebase, focusing on secrets, dependencies, and configuration.

## 1. Secrets & Environment Variables
- [ ] **Scan for Hardcoded Secrets:** Run `grep -r "sk_live" .` or similar to find exposed keys.
- [ ] **Verify .gitignore:** Ensure `.env`, `*.pem`, `*.key`, `logs/` are ignored.
- [ ] **Review .env.example:** Confirm it contains NO real values, only placeholders.

## 2. Dependencies (Supply Chain)
- [ ] **Audit Packages:** Run `npm audit` or `pip audit` to find known vulnerabilities.
- [ ] **Review Lockfiles:** Ensure `package-lock.json` / `yarn.lock` is present and up to date.
- [ ] **Check Unused Deps:** Identify and remove unused packages to reduce attack surface.

## 3. Database & Auth (Supabase)
- [ ] **RLS Policies:** Verify RLS is ENABLED on all public tables.
- [ ] **Policies Review:** Ensure policies are not too permissive (e.g., `using (true)` on update).
- [ ] **Public Access:** Check if `anon` role has excessive permissions.

## 4. API & Edge Functions
- [ ] **Service Role Key Usage:** Ensure `SUPABASE_SERVICE_ROLE_KEY` is ONLY used in secure server-side contexts (Edge Functions), never in client code.
- [ ] **Input Validation:** Verify all Edge Functions validate input types and sizes.
- [ ] **Rate Limiting:** Is there logic to prevent abuse? (e.g., captcha or simple counters).

## 5. Output & Logging
- [ ] **Sensitive Data Logging:** Ensure no PII or secrets are being logged to console or file.
- [ ] **Error Messages:** Ensure production errors do not leak stack traces to the user.

---
*Automated by Cursor Workflow Rules*

