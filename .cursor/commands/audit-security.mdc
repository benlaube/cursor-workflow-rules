---
description: Perform a comprehensive security audit on the project.
version: 1.1.0
lastUpdated: 2025-12-02
globs: 
---

# Security Audit Command

Use this command to perform a comprehensive security audit of the project, scanning for vulnerabilities, secrets, misconfigurations, and security best practices.

**Source Checklist:** `standards/security/security-audit-checklist.md` (comprehensive security audit checklist)

## Usage

@agent: When asked to "audit security", "check for secrets", "security scan", or "scan for vulnerabilities", follow this procedure.

**Parameters:**
- `fix`: `true` or `false` (default: `false`). If true, attempt to fix minor issues (e.g., add to gitignore, create .env.example).

---

## Execution Steps

### 1. Secrets & Environment Variables Scan

#### 1.1 Comprehensive Secret Pattern Detection
1. **Scan for Hardcoded Secrets:** Search for all common secret patterns:
   - *Command:* `grep -rE "sk_live|sk_test|pk_live|pk_test|sk_live_|sk_test_|ghp_|gho_|ghu_|ghs_|ghr_|xoxb-|xoxp-|eyJ|AKIA|aws_access_key_id|client_secret|oauth_token|postgres://|mysql://" . --exclude-dir={node_modules,.git,dist,build,.next} || true`
   - *Patterns Checked:*
     - API Keys: `sk_live`, `sk_test`, `pk_live`, `pk_test`, `sk_live_`, `sk_test_`
     - GitHub Tokens: `ghp_`, `gho_`, `ghu_`, `ghs_`, `ghr_`
     - AWS Keys: `AKIA`, `aws_access_key_id`
     - Database Credentials: `postgres://`, `mysql://` (connection strings with passwords)
     - OAuth Secrets: `client_secret`, `oauth_token`
     - Slack Tokens: `xoxb-`, `xoxp-`
     - JWT Tokens: `eyJ` (base64 encoded JSON)
   - *Action:* Report any findings immediately with file locations and line numbers.
   - *Severity:* ❌ Critical - Secrets must be removed immediately

#### 1.2 .gitignore Validation
1. **Check Required Entries:** Verify all required sensitive files are ignored:
   - *Required Entries:*
     - `.env`
     - `.env.local`
     - `.env.*.local`
     - `*.pem`
     - `*.key`
     - `credentials.json`
     - `logs/`
     - `.secrets/`
   - *Command:* `grep -E "^\.env$|^\.env\.local$|^\.env\..*\.local$|^\*\.pem$|^\*\.key$|^credentials\.json$|^logs/$|^\.secrets/$" .gitignore || echo "Missing entries"`
   - *Action:* If `fix=true` and entries are missing, append them to `.gitignore`.
   - *Severity:* ⚠️ High - Missing entries could lead to secret exposure

#### 1.3 Environment File Security
1. **Check .env is Not Committed:**
   - *Command:* `git ls-files .env .env.local`
   - *Action:* If `.env` is tracked, warn immediately. Should return nothing.
   - *Severity:* ❌ Critical if `.env` is tracked

2. **Validate .env.example:**
   - *Check:* Ensure `.env.example` exists and contains NO real values (only placeholders)
   - *Command:* `grep -E "sk_live|ghp_|password.*=.*[^<]" .env.example 2>/dev/null || echo "No secrets found"`
   - *Action:* If `fix=true` and `.env.example` is missing, create template with placeholder values.
   - *Severity:* ⚠️ Medium - Missing or contains real values

3. **Environment Variable Documentation:**
   - *Check:* Verify required environment variables are documented in README or setup guide
   - *Action:* Report if documentation is missing
   - *Severity:* ⚠️ Low - Documentation gap

---

### 2. Dependencies (Supply Chain Security)

#### 2.1 Package Vulnerability Audit
1. **Node.js Projects:**
   - *Command:* `npm audit` (or `yarn audit`, `pnpm audit` based on lockfile)
   - *Action:* Categorize vulnerabilities:
     - ❌ Critical: Must fix immediately
     - ⚠️ High: Fix within 24 hours
     - ⚠️ Medium: Review and fix within 1 week
     - ℹ️ Low: Document for future updates
   - *Summary:* Count and list Critical/High vulnerabilities

2. **Python Projects:**
   - *Command:* `pip-audit` or `safety check` (if installed)
   - *Action:* Same categorization as Node.js
   - *Note:* If tools not installed, suggest installation

#### 2.2 Lockfile Validation
1. **Check Lockfile Presence:**
   - *Required Files:*
     - `package-lock.json` (npm)
     - `yarn.lock` (yarn)
     - `pnpm-lock.yaml` (pnpm)
     - `requirements.txt` with pinned versions (Python)
   - *Command:* Check for existence of appropriate lockfile
   - *Action:* Warn if lockfile is missing (prevents supply chain attacks)
   - *Severity:* ⚠️ High - Missing lockfile

#### 2.3 Unused Dependencies Check
1. **Identify Unused Packages:**
   - *Node.js:* Suggest running `depcheck` or `npm-check-unused`
   - *Python:* Suggest running `pip-check` or `pipdeptree`
   - *Action:* Report suggestion to reduce attack surface
   - *Severity:* ℹ️ Low - Optimization opportunity

#### 2.4 Dependency Remediation
1. **Auto-Fix (if fix=true):**
   - *Command:* `npm audit fix` (only if safe, with confirmation)
   - *Action:* Run fix for non-breaking updates only
   - *Note:* Always review breaking changes manually

---

### 3. Database & Authentication Security (Supabase)

#### 3.1 Supabase Detection
1. **Check for Supabase:**
   - *Indicators:* `supabase/` directory exists OR `SUPABASE_URL` environment variable is set
   - *Action:* If detected, proceed with Supabase-specific checks

#### 3.2 Row Level Security (RLS) Validation
1. **RLS Enablement Check:**
   - *Command:* Search migrations for `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
   - *Action:* Warn if public tables are missing RLS
   - *Severity:* ❌ Critical - Missing RLS on public tables
   - *Note:* Deep RLS analysis is automatically applied via `.cursor/rules/supabase-rls-policy-review.mdc` when Supabase is detected

2. **RLS Policy Review:**
   - *Check:* Ensure policies are not too permissive (e.g., `using (true)` on UPDATE/DELETE)
   - *Action:* Apply `.cursor/rules/supabase-rls-policy-review.mdc` rule automatically for detailed analysis
   - *Reference:* `standards/security/access-control.md` for policy patterns

#### 3.3 Service Role Key Security
1. **Check Service Role Key Usage:**
   - *Command:* `grep -r "SERVICE_ROLE\|service_role" src/ app/ components/ --exclude-dir=node_modules 2>/dev/null || echo "No service role usage found"`
   - *Action:* Verify `SUPABASE_SERVICE_ROLE_KEY` is ONLY used in:
     - ✅ Edge Functions (server-side)
     - ✅ Secure API routes (server-side)
     - ✅ Admin scripts (local/server-side)
   - *Never:* Client-side code, browser JavaScript, public repositories
   - *Severity:* ❌ Critical if found in client code

#### 3.4 Public Access (Anon Role) Review
1. **Check Anon Permissions:**
   - *Action:* Review if `anon` role has excessive permissions
   - *Check:* Are public tables properly protected?
   - *Check:* Is public data read-only where appropriate?
   - *Severity:* ⚠️ High if anon has write access to sensitive tables

#### 3.5 Database Documentation
1. **Table Comments (if Supabase MCP available):**
   - *Check:* Verify tables have descriptions/comments
   - *Action:* Report tables without comments
   - *Reference:* `standards/database/schema.md`
   - *Severity:* ℹ️ Low - Documentation gap

---

### 4. API & Edge Functions Security

#### 4.1 Input Validation
1. **Check for Validation Libraries:**
   - *Node.js/TypeScript:* Look for Zod schemas, Joi, or validation middleware
   - *Python:* Look for Pydantic models or validation decorators
   - *Command:* `grep -rE "zod|pydantic|joi|validate" src/ --include="*.ts" --include="*.js" --include="*.py" | head -20`
   - *Action:* Verify all API routes and Edge Functions validate:
     - Input types (string, number, object, etc.)
     - Input sizes (max length, array limits)
     - Required fields
     - Format validation (email, URL, etc.)
   - *Severity:* ⚠️ High if validation is missing

#### 4.2 Rate Limiting
1. **Check for Rate Limiting:**
   - *Indicators:* Look for rate limiting middleware, counters, CAPTCHA, or throttling logic
   - *Command:* `grep -rE "rate.?limit|throttle|captcha|abuse" src/ --include="*.ts" --include="*.js" --include="*.py" | head -10`
   - *Action:* Report if rate limiting is missing on sensitive endpoints
   - *Severity:* ⚠️ Medium - Missing rate limiting

#### 4.3 Error Handling Security
1. **Check Error Messages:**
   - *Command:* Review error handling in API routes and Edge Functions
   - *Check:* Ensure production errors do NOT expose:
     - Stack traces
     - Database errors
     - File paths
     - Internal system details
   - *Action:* Verify generic error messages are returned to users
   - *Severity:* ⚠️ High if stack traces are exposed

#### 4.4 Service Role Key in Client Code
1. **Double-Check Client Code:**
   - *Command:* `grep -r "SERVICE_ROLE\|service_role" src/app src/components --exclude-dir=node_modules 2>/dev/null`
   - *Action:* This is a critical security issue - report immediately if found
   - *Severity:* ❌ Critical

---

### 5. Logging & Output Security

#### 5.1 Sensitive Data in Logs
1. **Check for PII/Secrets in Logging:**
   - *Command:* `grep -rE "password|api_key|token|secret" src/ --include="*.ts" --include="*.js" --include="*.py" | grep -iE "console\.log|logger|print" | head -20`
   - *Patterns to Check:*
     - Passwords
     - API keys
     - Tokens
     - Credit card numbers
     - Social Security Numbers
     - Personal Identifiable Information (PII)
   - *Action:* Report any findings - sensitive data should never be logged
   - *Severity:* ❌ Critical if secrets are logged, ⚠️ High if PII is logged

#### 5.2 Console.log in Production
1. **Check for Debug Code:**
   - *Command:* `grep -r "console\.log\|debugger" src/ --exclude-dir=node_modules --include="*.ts" --include="*.js" | wc -l`
   - *Action:* Report count and suggest using structured logging instead
   - *Severity:* ⚠️ Medium - Should use logger module

#### 5.3 Structured Logging
1. **Check Logging Practices:**
   - *Indicators:* Look for logger module usage, log levels, structured format
   - *Action:* Verify use of:
     - Structured logging (JSON format)
     - Log levels (ERROR, WARN, INFO, DEBUG)
     - Context information (user ID, request ID, trace ID)
     - PII scrubbing (use logger module's built-in scrubbing)
   - *Reference:* `modules/logger-module` for best practices
   - *Severity:* ℹ️ Low - Best practice recommendation

---

### 6. Configuration Security

#### 6.1 Secure Headers Validation
1. **Check Next.js Configuration:**
   - *File:* `next.config.js` or `next.config.ts`
   - *Required Headers:*
     - `Content-Security-Policy` (CSP)
     - `Strict-Transport-Security` (HSTS)
     - `X-Content-Type-Options: nosniff`
     - `X-Frame-Options: DENY`
     - `X-XSS-Protection: 1; mode=block`
   - *Command:* `grep -E "headers|Content-Security-Policy|Strict-Transport-Security" next.config.* 2>/dev/null || echo "Headers not configured"`
   - *Action:* Report missing headers
   - *Severity:* ⚠️ High if headers are missing

2. **Check Express/Middleware:**
   - *Indicators:* Look for Helmet middleware or custom header configuration
   - *Action:* Verify secure headers are configured

#### 6.2 CORS Configuration
1. **Check CORS Settings:**
   - *Command:* `grep -rE "cors|CORS|Access-Control-Allow-Origin" . --include="*.ts" --include="*.js" --include="*.py" | grep -v node_modules | head -10`
   - *Check:* Never use `*` for allowed origins
   - *Check:* Specific domains are configured
   - *Check:* Environment variables are used for allowed origins
   - *Severity:* ❌ Critical if wildcard `*` is used

#### 6.3 Environment Variable Configuration
1. **Review .env.example (if fix=true):**
   - *Action:* Create `.env.example` template if missing
   - *Template:* Include all required variables with placeholder values only

---

### 7. Authentication & Authorization

#### 7.1 Password Security
1. **Check Password Requirements:**
   - *Indicators:* Look for password validation, complexity requirements
   - *Requirements:*
     - Minimum 8 characters (prefer 12+)
     - Require complexity (uppercase, lowercase, numbers, symbols)
     - Use secure hashing (bcrypt, argon2)
     - Never store plaintext passwords
   - *Action:* Report if requirements are too weak
   - *Severity:* ⚠️ High if weak password requirements

#### 7.2 Session Management
1. **Check Session Practices:**
   - *Indicators:* Look for session configuration, expiration, rotation
   - *Best Practices:*
     - Use secure, HTTP-only cookies
     - Implement session expiration
     - Rotate session tokens
     - Invalidate sessions on logout
   - *Action:* Report if best practices are missing
   - *Severity:* ⚠️ Medium if session management is weak

#### 7.3 Multi-Factor Authentication (MFA)
1. **Check MFA Implementation:**
   - *When Required:* Admin accounts, financial operations, sensitive data access
   - *Action:* Report if MFA should be implemented but isn't
   - *Severity:* ⚠️ Medium - Security enhancement opportunity

---

### 8. Report Generation

1. **Create Structured Report:**
   - *Location:* `logs/security_audit_<TIMESTAMP>.md`
   - *Format:* Structured markdown with sections:
     ```markdown
     # Security Audit Report
     
     **Date:** <TIMESTAMP>
     **Version:** 1.1.0
     **Project:** <PROJECT_NAME>
     
     ## Executive Summary
     - Total Issues: X
     - Critical: X
     - High: X
     - Medium: X
     - Low: X
     
     ## 1. Secrets & Environment Variables
     [Findings...]
     
     ## 2. Dependencies
     [Findings...]
     
     ## 3. Database & Authentication
     [Findings...]
     
     ## 4. API & Edge Functions
     [Findings...]
     
     ## 5. Logging & Output
     [Findings...]
     
     ## 6. Configuration
     [Findings...]
     
     ## 7. Authentication & Authorization
     [Findings...]
     
     ## Action Items (Prioritized)
     1. [Critical] Fix item 1
     2. [High] Fix item 2
     ...
     ```
   - *Include:* Summary statistics, prioritized action items, cross-references to standards

2. **Print Summary to Chat:**
   - *Format:* Use success/failure format (see Output Format section below)

---

## Output Format

### Success Case
```
✅ Security Audit complete – no critical issues found.

Summary:
- Secrets: ✅ No hardcoded secrets found
- Dependencies: ✅ No critical vulnerabilities
- Database: ✅ RLS enabled, service role secure
- API Security: ✅ Input validation present
- Logging: ✅ No sensitive data in logs
- Configuration: ✅ Secure headers configured
- Authentication: ✅ Password requirements adequate

Minor recommendations:
- ⚠️ Consider adding rate limiting to /api/users endpoint
- ℹ️ 3 unused dependencies detected (optimization opportunity)

Full report saved to: logs/security_audit_<TIMESTAMP>.md
```

### Failure Case
```
❌ Security Audit found critical security issues.

Issues Found:

**Secrets & Environment Variables:**
- ❌ [Critical] Found hardcoded API key in `src/config.ts:12`
- ⚠️ [High] `.env.local` not in `.gitignore`
- ⚠️ [Medium] `.env.example` missing

**Dependencies:**
- ❌ [Critical] 2 critical vulnerabilities in `lodash@4.17.20`
- ⚠️ [High] 5 high vulnerabilities in dependencies
- ⚠️ [High] `package-lock.json` missing

**Database & Authentication:**
- ❌ [Critical] Table `public.users` missing RLS
- ❌ [Critical] Service role key found in `src/components/UserList.tsx:45`
- ⚠️ [High] Anon role has write access to `public.posts`

**API & Edge Functions:**
- ⚠️ [High] Missing input validation in `src/api/users.ts`
- ⚠️ [Medium] No rate limiting on `/api/auth/login`

**Logging & Output:**
- ❌ [Critical] Password logged in `src/utils/auth.ts:78` (console.log)
- ⚠️ [Medium] 12 console.log statements in production code

**Configuration:**
- ⚠️ [High] Missing CSP header in `next.config.js`
- ❌ [Critical] CORS configured with wildcard `*` in `src/api/cors.ts`

**Authentication:**
- ⚠️ [High] Password minimum length is 6 (should be 8+)

---
Action Required (Prioritized):
1. [Critical] Remove hardcoded API key from `src/config.ts`
2. [Critical] Enable RLS on `public.users` table
3. [Critical] Remove service role key from client code
4. [Critical] Fix CORS wildcard configuration
5. [Critical] Remove password logging
6. [High] Add `.env.local` to `.gitignore`
7. [High] Fix critical dependency vulnerabilities
8. [High] Add input validation to API routes
9. [High] Add CSP header configuration
10. [High] Increase password minimum length

Full report saved to: logs/security_audit_<TIMESTAMP>.md
```

---

## Self-Healing (if fix=true)

If `fix=true`, this command will attempt to automatically fix:

1. **Gitignore Entries:**
   - Add missing standard entries (`.env`, `*.pem`, `logs/`, etc.)
   - Append to `.gitignore` if entries are missing

2. **.env.example Creation:**
   - Create `.env.example` template if missing
   - Include placeholder values for all detected environment variables

3. **Dependency Fixes:**
   - Run `npm audit fix` for non-breaking updates (with confirmation)
   - **Note:** Will NOT fix breaking changes automatically

4. **Suggestions Only:**
   - For other issues, provide specific remediation steps
   - **Will NOT:** Remove secrets (requires manual review)
   - **Will NOT:** Fix RLS policies (requires manual review)
   - **Will NOT:** Modify authentication logic (requires manual review)

---

## Manual Verification

**Important:** Automated tools cannot catch all security issues. Always:

1. **Review Checklist:** Manually review `standards/security/security-audit-checklist.md` for logical flaws
2. **RLS Logic:** Deep RLS policy analysis is automatically applied via `.cursor/rules/supabase-rls-policy-review.mdc` when Supabase is detected, but review policy logic manually
3. **Business Logic:** Review authentication/authorization logic for business-specific vulnerabilities
4. **Third-Party Services:** Review API keys and tokens for third-party services
5. **Environment-Specific:** Review production-specific configurations

---

## Integration with Other Commands

### Related Commands
- **`pre-flight-check`** (`.cursor/commands/pre-flight-check.md`) - Quick validation before coding
- **`pr-review-check`** (`.cursor/commands/pr-review-check.md`) - Pre-PR validation (includes basic security checks)
- **`project-audit`** (`.cursor/commands/project-audit.md`) - Full project health check (can include security audit with `deep=true`)
- **`full-project-health-check`** - Run all audits together (includes this command)

### Related Rules (Auto-Applied)
- **`.cursor/rules/supabase-rls-policy-review.mdc`** - Deep RLS policy analysis (automatically applied when Supabase is detected)

### Related Standards
- **`standards/security/security-audit-checklist.md`** - Comprehensive security audit checklist (authoritative source)
- **`standards/security/access-control.md`** - Access control and RLS standards
- **`standards/database/schema.md`** - Database schema conventions

### Related Checklists
- **`standards/security/security-audit-checklist.md`** - Comprehensive security audit checklist

### Integration Points
- This command is referenced in `AGENTS.md` as the **required step** for security-sensitive changes
- Run before PRs that touch security-sensitive code
- Run periodically (weekly/monthly) for active projects
- Included in `full-project-health-check` for comprehensive reviews

---

*This command provides comprehensive security scanning. For deep RLS analysis, the `.cursor/rules/supabase-rls-policy-review.mdc` rule is automatically applied when Supabase is detected.*
