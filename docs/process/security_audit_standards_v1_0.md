# Security_Audit_Standards_v1.0

**Type:** Governing Standard – comprehensive security standards and best practices for the ai-agent-knowledge-base.

**Description:** Comprehensive security standards covering secrets management, dependency security, database security, API security, and logging practices. This is the authoritative source for security requirements.

**Created:** 2025-11-25 11:30

**Last_Updated:** 2025-11-25 11:30

**Related Checklist:** `docs/process/checklists/security_audit_checklist_v1_0.md` (condensed validation checklist)

**Related Command:** `.cursor/commands/security_audit.md`

---

## 1. Secrets & Environment Variables

### 1.1 Hardcoded Secrets Detection

**Patterns to Scan For:**
- API Keys: `sk_live`, `sk_test`, `pk_live`, `pk_test`
- GitHub Tokens: `ghp_`, `gho_`, `ghu_`, `ghs_`, `ghr_`
- JWT Tokens: `eyJ` (base64 encoded JSON)
- AWS Keys: `AKIA`, `aws_access_key_id`
- Database Credentials: `postgres://`, `mysql://`, connection strings with passwords
- OAuth Secrets: `client_secret`, `oauth_token`
- Slack Tokens: `xoxb-`, `xoxp-`
- Stripe Keys: `sk_live_`, `sk_test_`

**Detection Commands:**
```bash
# Comprehensive secret scan
grep -rE "sk_live|ghp_|xoxb-|eyJ|AKIA|client_secret" . \
  --exclude-dir={node_modules,.git,dist,build,.next} \
  || true
```

**Remediation:**
- Move all secrets to environment variables
- Use `settings-manager` module for encrypted storage
- Never commit `.env` files
- Use `.env.example` with placeholder values only

### 1.2 .gitignore Validation

**Required Entries:**
- `.env`
- `.env.local`
- `.env.*.local`
- `*.pem`
- `*.key`
- `*.cert`
- `credentials.json`
- `secrets.json`
- `logs/`
- `.secrets/`

**Validation:**
```bash
# Check .gitignore contains required entries
grep -q "^\.env$" .gitignore && \
grep -q "^\*\.pem$" .gitignore && \
grep -q "^logs/$" .gitignore
```

### 1.3 .env.example Validation

**Requirements:**
- Must exist if `.env` is used
- Must contain NO real values
- Must use clear placeholder format: `YOUR_KEY_HERE` or `example_value`
- Must document what each variable is for

**Example:**
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

---

## 2. Dependencies (Supply Chain Security)

### 2.1 Package Audit

**Node.js:**
```bash
npm audit
# Or
yarn audit
# Or
pnpm audit
```

**Python:**
```bash
pip-audit
# Or
safety check
```

**Action Items:**
- Critical vulnerabilities: Fix immediately
- High vulnerabilities: Fix within 1 week
- Medium vulnerabilities: Fix within 1 month
- Low vulnerabilities: Review and fix as time permits

### 2.2 Lockfile Validation

**Requirements:**
- `package-lock.json` (npm) or `yarn.lock` (yarn) or `pnpm-lock.yaml` (pnpm) must exist
- Lockfile must be committed to version control
- Lockfile must be up to date with `package.json`

**Validation:**
```bash
# Check lockfile exists and is recent
test -f package-lock.json && \
  test package-lock.json -nt package.json
```

### 2.3 Unused Dependencies

**Detection:**
```bash
# Node.js
npx depcheck

# Python
pip-autoremove --dry-run
```

**Action:**
- Remove unused dependencies to reduce attack surface
- Review dependencies regularly (quarterly)

---

## 3. Database & Auth (Supabase)

### 3.1 RLS Policy Requirements

**Mandatory:**
- All public tables MUST have RLS enabled
- Exception: System tables (managed by Supabase)

**Validation:**
```sql
-- Check tables without RLS
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename NOT IN (SELECT tablename FROM pg_tables WHERE rowsecurity = true);
```

**Enforcement:**
- Use `rls_policy_review` command for deep analysis
- See `standards/security/access-control.md` for policy patterns

### 3.2 Policy Permissiveness

**Dangerous Patterns:**
- `using (true)` on UPDATE/DELETE operations
- Policies without tenant checks on multi-tenant tables
- Policies that allow ownership changes

**Safe Patterns:**
- `using (true)` ONLY for SELECT on public read-only data
- Tenant checks: `tenant_id = (SELECT tenant_id FROM auth.users WHERE id = auth.uid())`
- Ownership checks: `user_id = auth.uid()`

### 3.3 Public Access (anon role)

**Requirements:**
- `anon` role should have minimal permissions
- Use RLS policies to restrict access, not role grants
- Never grant `anon` role write access to sensitive tables

**Validation:**
```sql
-- Check anon role grants
SELECT grantee, privilege_type, table_name
FROM information_schema.role_table_grants
WHERE grantee = 'anon'
  AND privilege_type IN ('INSERT', 'UPDATE', 'DELETE');
```

---

## 4. API & Edge Functions

### 4.1 Service Role Key Usage

**CRITICAL RULE:**
- `SUPABASE_SERVICE_ROLE_KEY` MUST ONLY be used in:
  - Supabase Edge Functions (server-side)
  - Secure backend API routes (server-side only)
  - NEVER in client-side code
  - NEVER in browser JavaScript
  - NEVER in public repositories

**Detection:**
```bash
# Check for service role key in client code
grep -r "SUPABASE_SERVICE_ROLE_KEY" \
  --include="*.tsx" \
  --include="*.jsx" \
  --include="*.ts" \
  --include="*.js" \
  --exclude-dir={node_modules,.next,dist} \
  src/ app/ components/
```

**Safe Usage:**
- Edge Functions: ✅ Safe (server-side only)
- Next.js API routes: ✅ Safe (server-side only)
- Next.js Server Components: ✅ Safe (server-side only)
- React Client Components: ❌ NEVER

### 4.2 Input Validation

**Requirements:**
- All Edge Functions MUST validate input types
- All Edge Functions MUST validate input sizes
- Use Zod (TypeScript) or Pydantic (Python) for validation

**Pattern:**
```typescript
// TypeScript/Edge Function
import { z } from 'zod';

const inputSchema = z.object({
  userId: z.string().uuid(),
  limit: z.number().int().min(1).max(100),
});

export default async function handler(req: Request) {
  const input = inputSchema.parse(await req.json());
  // ... rest of handler
}
```

### 4.3 Rate Limiting

**Requirements:**
- Implement rate limiting on public endpoints
- Use Supabase Edge Function rate limiting or middleware
- Consider CAPTCHA for sensitive operations

**Patterns:**
- Simple counter: Track requests per IP in Redis or database
- Token bucket: Use rate limiting library
- CAPTCHA: For sensitive operations (password reset, etc.)

---

## 5. Output & Logging

### 5.1 Sensitive Data Logging

**Forbidden in Logs:**
- Passwords
- API keys
- Tokens (JWT, OAuth)
- Credit card numbers
- Social Security Numbers
- Personal Identifiable Information (PII)

**Detection:**
```bash
# Check for sensitive data in logs
grep -rE "password|api_key|token|ssn|credit_card" \
  --include="*.log" \
  --include="*.txt" \
  logs/
```

**Safe Logging:**
- Log user IDs (not emails)
- Log operation types (not data)
- Log error types (not stack traces with data)
- Use structured logging with redaction

### 5.2 Error Messages

**Requirements:**
- Production errors MUST NOT leak stack traces to users
- Production errors MUST NOT reveal internal structure
- Use generic error messages for users
- Log detailed errors server-side only

**Pattern:**
```typescript
// ❌ Bad
throw new Error(`Database error: ${error.message}`);

// ✅ Good
logger.error('Database error', { error, userId });
throw new Error('An error occurred. Please try again.');
```

---

## 6. Security Headers

### 6.1 HTTP Security Headers

**Required Headers:**
- `Content-Security-Policy` (CSP)
- `Strict-Transport-Security` (HSTS)
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY` or `SAMEORIGIN`
- `X-XSS-Protection: 1; mode=block`

**Next.js Configuration:**
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline';"
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains'
  },
  // ... more headers
];
```

---

## 7. Audit Frequency

**Recommended Schedule:**
- **Pre-commit:** Run `security_audit` before every commit
- **Pre-PR:** Run `security_audit` and `rls_policy_review` before PR
- **Weekly:** Full security audit for active projects
- **Monthly:** Dependency audit and update
- **Quarterly:** Comprehensive security review

---

## 8. Related Resources

- **Checklist:** `docs/process/checklists/security_audit_checklist_v1_0.md`
- **Command:** `.cursor/commands/security_audit.md`
- **RLS Standards:** `standards/security/access-control.md`
- **Database Standards:** `standards/database/schema.md`
- **Supabase Security:** `standards/architecture/supabase-secrets-management.md`

---

## 9. Compliance Checklist

Use this for comprehensive audits:

- [ ] No hardcoded secrets in code
- [ ] `.env` is git-ignored
- [ ] `.env.example` exists with placeholders only
- [ ] All dependencies audited (no critical/high vulnerabilities)
- [ ] Lockfiles present and up to date
- [ ] Unused dependencies removed
- [ ] All public tables have RLS enabled
- [ ] RLS policies enforce tenant isolation
- [ ] RLS policies enforce ownership
- [ ] Service role key never used in client code
- [ ] All Edge Functions validate input
- [ ] Rate limiting implemented on public endpoints
- [ ] No sensitive data in logs
- [ ] Production errors don't leak stack traces
- [ ] Security headers configured
- [ ] Regular security audits scheduled

---

*This standard is the authoritative source for security requirements. The checklist (`security_audit_checklist_v1_0.md`) provides a condensed validation format.*

