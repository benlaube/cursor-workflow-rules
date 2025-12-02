# Security Audit Checklist

**Type:** Comprehensive Security Audit Checklist – used by Cursor commands and human devs to validate security posture including secrets, dependencies, database security, API security, and logging practices.

**Description:** Comprehensive security audit checklist covering secrets management, dependency security, database security, API security, logging practices, configuration security, and authentication/authorization. This is the authoritative source for security audit requirements.

**Created:** 2025-11-25 11:30

**Last Updated:** 2025-12-02

**Version:** 1.1

**Related Command:** `.cursor/commands/audit-security.mdc`

**Related Standards:**
- `standards/security/access-control.md` - Access control and RLS standards
- `.cursor/rules/supabase-rls-policy-review.mdc` - Auto-applied RLS review rule

---

## How to Use This Checklist

This checklist combines detailed security standards with actionable validation items. Use it to:
- Perform comprehensive security audits
- Validate security posture before PRs
- Conduct periodic security reviews (weekly/monthly)
- Onboard new repositories

**Automated Checks:** The `audit-security.mdc` command performs many of these checks automatically. Use this checklist for manual verification and logical review.

---

## 1. Secrets & Environment Variables

### 1.1 Hardcoded Secrets Detection

**Checklist Items:**
- [ ] **Scan for Hardcoded Secrets:** Run comprehensive secret scan
- [ ] **Verify No Secrets in Code:** Review scan results and remove any found secrets
- [ ] **Check for Common Patterns:** API keys, tokens, credentials, connection strings

**Patterns to Scan For:**
- API Keys: `sk_live`, `sk_test`, `pk_live`, `pk_test`, `sk_live_`, `sk_test_`
- GitHub Tokens: `ghp_`, `gho_`, `ghu_`, `ghs_`, `ghr_`
- JWT Tokens: `eyJ` (base64 encoded JSON)
- AWS Keys: `AKIA`, `aws_access_key_id`
- Database Credentials: `postgres://`, `mysql://`, connection strings with passwords
- OAuth Secrets: `client_secret`, `oauth_token`
- Slack Tokens: `xoxb-`, `xoxp-`
- Stripe Keys: `sk_live_`, `sk_test_`

**Detection Command:**
```bash
# Comprehensive secret scan
grep -rE "sk_live|sk_test|pk_live|pk_test|sk_live_|sk_test_|ghp_|gho_|ghu_|ghs_|ghr_|xoxb-|xoxp-|eyJ|AKIA|aws_access_key_id|client_secret|oauth_token|postgres://|mysql://" . \
  --exclude-dir={node_modules,.git,dist,build,.next} \
  || true
```

**Remediation:**
- Move all secrets to environment variables
- Use `settings-manager` module for encrypted storage
- Never commit `.env` files
- Use `.env.example` with placeholder values only

### 1.2 .gitignore Validation

**Checklist Items:**
- [ ] **Verify .gitignore:** Ensure all sensitive files are ignored
- [ ] **Check Required Entries:** All required patterns are present
- [ ] **Verify .env Not Tracked:** Confirm `.env` is not committed to git

**Required Entries:**
- `.env`
- `.env.local`
- `.env.*.local`
- `*.pem`
- `*.key`
- `credentials.json`
- `logs/`
- `.secrets/`

**Validation Command:**
```bash
# Check if .env is ignored
git ls-files .env

# Should return nothing if properly ignored
```

### 1.3 Environment Variable Management

**Checklist Items:**
- [ ] **Review .env.example:** Confirm it contains NO real values, only placeholders
- [ ] **Document Required Variables:** Ensure all required variables are documented in README or setup guide
- [ ] **Use Secure Storage:** Use `settings-manager` module for encrypted storage when needed

**Rules:**
- All secrets must be in environment variables
- Use `.env.example` as template (NO real values)
- Document required variables in README or setup guide
- Use `settings-manager` module for encrypted storage when needed

---

## 2. Dependencies (Supply Chain Security)

### 2.1 Package Vulnerability Audit

**Checklist Items:**
- [ ] **Audit Packages:** Run `npm audit` or `pip audit` to find known vulnerabilities
- [ ] **Fix Critical Vulnerabilities:** Address all Critical vulnerabilities immediately
- [ ] **Fix High Vulnerabilities:** Address all High vulnerabilities within 24 hours
- [ ] **Review Medium Vulnerabilities:** Review and fix within 1 week
- [ ] **Document Low Vulnerabilities:** Document for future updates

**Node.js:**
```bash
npm audit
# or
yarn audit
# or
pnpm audit
```

**Python:**
```bash
pip-audit
# or
safety check
```

**Action Items:**
- Fix Critical and High vulnerabilities immediately
- Review Medium vulnerabilities
- Document Low vulnerabilities for future updates

### 2.2 Lockfile Requirements

**Checklist Items:**
- [ ] **Review Lockfiles:** Ensure `package-lock.json` / `yarn.lock` / `pnpm-lock.yaml` is present and up to date
- [ ] **Python Requirements:** Ensure `requirements.txt` has pinned versions

**Required:**
- `package-lock.json` (npm) or `yarn.lock` (yarn) or `pnpm-lock.yaml` (pnpm)
- `requirements.txt` with pinned versions (Python)

**Why:** Ensures reproducible builds and prevents supply chain attacks

### 2.3 Dependency Review

**Checklist Items:**
- [ ] **Check Unused Deps:** Identify and remove unused packages to reduce attack surface
- [ ] **Review Outdated Dependencies:** Check for security patches available
- [ ] **Check for Suspicious Packages:** Review for typosquatting or suspicious packages

**Check for:**
- Unused dependencies (reduce attack surface)
- Outdated dependencies (security patches)
- Suspicious packages (typosquatting)

**Tools:**
- `depcheck` (Node.js)
- `pip-check` (Python)

---

## 3. Database & Authentication Security (Supabase)

### 3.1 Row Level Security (RLS)

**Checklist Items:**
- [ ] **RLS Policies:** Verify RLS is ENABLED on all public tables
- [ ] **Policies Review:** Ensure policies are not too permissive (e.g., `using (true)` on update)
- [ ] **Policy Logic Review:** Manually review RLS policy logic for business-specific vulnerabilities

**Requirement:** RLS must be ENABLED on ALL public tables.

**Validation:**
- Check for `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` in migrations
- Use `.cursor/rules/supabase-rls-policy-review.mdc` rule for deep analysis (auto-applied when Supabase detected)

**Standards:**
- See `standards/security/access-control.md` for RLS policy patterns
- Never use `using (true)` on UPDATE/DELETE policies
- Always enforce tenant isolation for multi-tenant tables
- Use `auth.jwt()` for role checks, not public table columns

### 3.2 Service Role Key Security

**Checklist Items:**
- [ ] **Service Role Key Usage:** Ensure `SUPABASE_SERVICE_ROLE_KEY` is ONLY used in secure server-side contexts (Edge Functions), never in client code
- [ ] **Client Code Scan:** Verify no service role key references in client-side code
- [ ] **Review Edge Functions:** Ensure service role key is only used in Edge Functions with proper validation

**Critical Rule:** `SUPABASE_SERVICE_ROLE_KEY` must ONLY be used in:
- Edge Functions (server-side)
- Secure API routes (server-side)
- Admin scripts (local/server-side)

**Never:**
- Client-side code
- Browser JavaScript
- Public repositories

**Validation Command:**
```bash
# Check for service role key in client code
grep -r "SERVICE_ROLE" src/app src/components --exclude-dir=node_modules
```

### 3.3 Public Access (Anon Role)

**Checklist Items:**
- [ ] **Public Access:** Check if `anon` role has excessive permissions
- [ ] **Public Tables Review:** Are public tables properly protected?
- [ ] **Read-Only Check:** Is public data read-only where appropriate?

**Check:**
- Does `anon` role have excessive permissions?
- Are public tables properly protected?
- Is public data read-only?

---

## 4. API & Edge Functions Security

### 4.1 Input Validation

**Checklist Items:**
- [ ] **Input Validation:** Verify all Edge Functions validate input types and sizes
- [ ] **Validation Libraries:** Check for Zod (TypeScript) or Pydantic (Python) usage
- [ ] **Required Fields:** Ensure all required fields are validated
- [ ] **Format Validation:** Verify email, URL, and other format validations

**Requirement:** All Edge Functions and API routes must validate:
- Input types (string, number, object, etc.)
- Input sizes (max length, array limits)
- Required fields
- Format validation (email, URL, etc.)

**Tools:**
- Zod (TypeScript)
- Pydantic (Python)
- Built-in validation middleware

### 4.2 Rate Limiting

**Checklist Items:**
- [ ] **Rate Limiting:** Is there logic to prevent abuse? (e.g., captcha or simple counters)
- [ ] **Sensitive Endpoints:** Verify rate limiting on authentication and sensitive endpoints
- [ ] **IP-Based Throttling:** Check for IP-based throttling implementation

**Requirement:** Implement rate limiting to prevent abuse.

**Strategies:**
- Simple counters (in-memory or Redis)
- CAPTCHA for sensitive operations
- IP-based throttling
- User-based throttling

### 4.3 Error Handling

**Checklist Items:**
- [ ] **Error Messages:** Ensure production errors do not leak stack traces to the user
- [ ] **Generic Errors:** Verify generic error messages are returned to users
- [ ] **Server-Side Logging:** Ensure detailed errors are logged server-side only

**Rules:**
- Never expose stack traces in production
- Never leak sensitive information in error messages
- Return generic errors to users
- Log detailed errors server-side only

---

## 5. Output & Logging Security

### 5.1 Sensitive Data Logging

**Checklist Items:**
- [ ] **Sensitive Data Logging:** Ensure no PII or secrets are being logged to console or file
- [ ] **Password Logging:** Verify passwords are never logged
- [ ] **Token Logging:** Verify API keys and tokens are never logged
- [ ] **PII Logging:** Verify PII (credit cards, SSN, etc.) is never logged

**Never Log:**
- Passwords
- API keys
- Tokens
- Credit card numbers
- Social Security Numbers
- Personal Identifiable Information (PII)

**Validation Command:**
```bash
# Check for sensitive data in logs
grep -rE "password|api_key|token|secret" src/ --include="*.ts" --include="*.js" | grep -i "console.log\|logger"
```

### 5.2 Error Message Security

**Checklist Items:**
- [ ] **Error Messages:** Ensure production errors do not leak stack traces to the user
- [ ] **Generic Messages:** Verify generic error messages are used in production
- [ ] **Internal Details:** Ensure no internal system details are exposed

**Production Errors:**
- Return generic messages: "An error occurred. Please try again."
- Log detailed errors server-side
- Never expose:
  - Stack traces
  - Database errors
  - File paths
  - Internal system details

### 5.3 Logging Best Practices

**Checklist Items:**
- [ ] **Structured Logging:** Use structured logging (JSON format)
- [ ] **Log Levels:** Use appropriate log levels (ERROR, WARN, INFO, DEBUG)
- [ ] **Context Information:** Include context (user ID, request ID, trace ID)
- [ ] **PII Scrubbing:** Use logger module's built-in PII scrubbing
- [ ] **Console.log:** Avoid console.log in production code

**Use:**
- Structured logging (JSON format)
- Log levels (ERROR, WARN, INFO, DEBUG)
- Context information (user ID, request ID, trace ID)
- PII scrubbing (use logger module's built-in scrubbing)

**Avoid:**
- Console.log in production
- Logging entire request/response bodies
- Logging sensitive headers

---

## 6. Configuration Security

### 6.1 Secure Headers

**Checklist Items:**
- [ ] **Secure Headers:** Verify secure headers are configured (CSP, HSTS, etc.)
- [ ] **CSP Header:** Check for Content-Security-Policy header
- [ ] **HSTS Header:** Check for Strict-Transport-Security header
- [ ] **Other Headers:** Verify X-Content-Type-Options, X-Frame-Options, X-XSS-Protection

**Required Headers:**
- `Content-Security-Policy` (CSP)
- `Strict-Transport-Security` (HSTS)
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

**Implementation:**
- Next.js: `next.config.js` headers
- Express: Helmet middleware
- Edge Functions: Response headers

### 6.2 CORS Configuration

**Checklist Items:**
- [ ] **CORS Configuration:** Verify CORS is properly configured
- [ ] **No Wildcard:** Ensure CORS does not use wildcard `*` for allowed origins
- [ ] **Specific Domains:** Verify specific domains are configured
- [ ] **Environment Variables:** Use environment variables for allowed origins

**Rules:**
- Never use `*` for allowed origins
- Specify exact domains
- Use environment variables for allowed origins
- Validate origin on server-side

---

## 7. Authentication & Authorization

### 7.1 Password Security

**Checklist Items:**
- [ ] **Password Length:** Minimum 8 characters (prefer 12+)
- [ ] **Password Complexity:** Require complexity (uppercase, lowercase, numbers, symbols)
- [ ] **Secure Hashing:** Use secure hashing (bcrypt, argon2)
- [ ] **No Plaintext:** Never store plaintext passwords

**Requirements:**
- Minimum 8 characters (prefer 12+)
- Require complexity (uppercase, lowercase, numbers, symbols)
- Use secure hashing (bcrypt, argon2)
- Never store plaintext passwords

### 7.2 Session Management

**Checklist Items:**
- [ ] **Secure Cookies:** Use secure, HTTP-only cookies
- [ ] **Session Expiration:** Implement session expiration
- [ ] **Token Rotation:** Rotate session tokens
- [ ] **Logout Invalidation:** Invalidate sessions on logout

**Best Practices:**
- Use secure, HTTP-only cookies
- Implement session expiration
- Rotate session tokens
- Invalidate sessions on logout

### 7.3 Multi-Factor Authentication (MFA)

**Checklist Items:**
- [ ] **MFA for Admins:** Require MFA for admin accounts
- [ ] **MFA for Financial:** Require MFA for financial operations
- [ ] **MFA for Sensitive Data:** Require MFA for sensitive data access
- [ ] **MFA for Account Recovery:** Consider MFA for account recovery

**When to Require:**
- Admin accounts
- Financial operations
- Sensitive data access
- Account recovery

---

## 8. Enforcement & Integration

### 8.1 Automated Checks

**Automated:**
- RLS policy review is automatically applied via `.cursor/rules/supabase-rls-policy-review.mdc` when Supabase is detected
- See `standards/security/access-control.md` for policy patterns
- Run `audit-security` command before PRs

### 8.2 Manual Review

**Manual:**
- Review this checklist for logical flaws (e.g., bad RLS logic) that automated tools miss
- Review authentication/authorization logic for business-specific vulnerabilities
- Review third-party service integrations
- Review environment-specific configurations

### 8.3 Pre-PR Validation

**Pre-PR:**
- Run `audit-security` command (RLS review auto-applied if Supabase detected)
- Review this checklist for any security-sensitive changes
- Verify no secrets are committed
- Verify input validation is in place

### 8.4 Periodic Audits

**Periodic:**
- Run security audits weekly/monthly for active projects
- Review dependency vulnerabilities regularly
- Review and update security configurations
- Review access control policies

---

## 9. Quick Reference

**Quick Security Audit Checklist:**
1. ✅ Scan for hardcoded secrets
2. ✅ Verify .gitignore
3. ✅ Audit dependencies
4. ✅ Check RLS policies (if Supabase)
5. ✅ Validate input handling
6. ✅ Review error messages
7. ✅ Check logging practices
8. ✅ Verify secure headers
9. ✅ Review authentication/authorization
10. ✅ Check CORS configuration
11. ✅ Review session management
12. ✅ Verify MFA implementation (if applicable)

---

## 10. Related Resources

**Related Standards:**
- `standards/security/access-control.md` - Access control and RLS standards
- `standards/database/schema.md` - Database schema conventions

**Related Commands:**
- `.cursor/commands/audit-security.mdc` - Security audit command (automated checks)
- `.cursor/commands/pr-review-check.md` - Pre-PR validation (includes basic security checks)
- `.cursor/commands/project-audit.md` - Full project health check

**Related Rules:**
- `.cursor/rules/supabase-rls-policy-review.mdc` - Auto-applied RLS review rule (when Supabase detected)

---

*This is the authoritative source for security audit requirements. All security-related decisions should reference this document.*

