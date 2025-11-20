# Project Roadmap (v1.1)

## Metadata
- **Created:** 2025-11-18
- **Last Updated:** 2025-01-27
- **Version:** 1.1
- **Status:** Active

## High-Level Goals
1.  **Foundation:** Establish a stable, self-healing dev environment (Done).
2.  **Core Product:** Build the User Dashboard and Marketing Site.
3.  **Growth:** Implement the AI Content Engine.

---

## Q4 2025 Priorities

### 1. Infrastructure (Foundation)
- [x] **Standardize Repo:** implement `cursor-workflow-rules`.
- [x] **Auth System:** Setup Supabase Auth & Profile Sync.
  - ✅ Basic profile sync with database triggers
  - ✅ Email verification flow documentation and helpers
  - ✅ OAuth provider setup guides (Google, GitHub, etc.)
  - ✅ MFA (Multi-Factor Authentication) helpers
- [x] **Backend API Module:** Standardized API handler with Supabase SSR
  - ✅ Handler wrapper with error handling, validation, auth
  - ✅ Supabase SSR integration for automatic JWT handling
  - ✅ Standardized response format
  - ✅ Complete integration guide
- [x] **Sitemap Automation:** Auto-generate sitemap from DB
  - ✅ Database schema with triggers and job queue
  - ✅ Supabase Edge Function for generation
  - ✅ Integration guide and Next.js serving examples
- [ ] **CI/CD:** GitHub Actions for automated testing.

### 2. MVP Features (Core Product)
- [ ] **Marketing Site:** Landing page with value prop.
- [ ] **User Dashboard:** Auth protected route.
- [ ] **Subscription:** Stripe integration.

### 3. AI Features (Growth)
- [ ] **Content Engine:** Edge function for text enrichment.
- [x] **Sitemap Automation:** Auto-generate sitemap from DB (Completed above).

---

## Recent Milestones (v1.0 → v1.1)

### Completed in v1.1
1. **Backend API Module** - Complete implementation with Supabase SSR integration
2. **Auth System Enhancements** - Email verification, OAuth, and MFA support
3. **Sitemap Automation** - Full automation with database triggers and Edge Function
4. **Documentation** - Comprehensive guides for Supabase setup, secrets management, and SSR
5. **Changelog Management** - Established CHANGELOG.md and documentation standards
6. **Task Workflow** - Added auto-launch dev server after task completion

### Next Steps (v1.2)
1. **CI/CD Pipeline** - Set up GitHub Actions for automated testing and deployment
2. **Marketing Site** - Build landing page with value proposition
3. **User Dashboard** - Create auth-protected dashboard route
4. **Content Engine** - Implement AI-powered text enrichment Edge Function

---

## Future Ideas (Backlog)
*Ideas we are considering but haven't committed to.*
- Mobile App (React Native).
- Multi-tenant team accounts.
- Voice interface for the agent.
- Rate limiting middleware for Backend API module.
- Multi-sitemap support for large sites (>50k pages).

---

## Version History
- **v1.1** (2025-01-27) - Backend API, Auth enhancements, Sitemap automation
- **v1.0** (2025-11-18) - Initial roadmap with foundation goals

