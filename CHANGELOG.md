# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Integration Guide for New Projects** (`INTEGRATION_GUIDE.md`)
  - Comprehensive guide for integrating rules, commands, and standards into new projects
  - Step-by-step instructions for both developers and AI agents
  - Integration checklist with verification steps
  - Troubleshooting guide for common integration issues
  - Best practices for maintaining rules across multiple projects
  - Quick reference guide (`QUICK_INTEGRATION.md`) for fast setup

- **Temporal Awareness for AI Agent** (`.cursor/rules/environment.mdc`)
  - Added Section 5: Temporal Awareness (Date & Time) to environment rules
  - Instructs AI agent to check current date when responding to time-sensitive prompts
  - Guidelines for when to check date (deadlines, timestamps, relative dates, etc.)
  - Instructions for getting current date via terminal commands
  - Updated `AGENTS.md` with temporal awareness reminder in Rules of Engagement

### Changed
- **README.md** - Added integration guide references and AI agent setup instructions

## [1.3.0] - 2025-01-27

### Added
- **Supabase Data API Documentation** (`standards/architecture/supabase-data-api.md`)
  - Comprehensive guide to PostgREST auto-generated REST endpoints
  - Explanation that tables automatically get REST API endpoints
  - Query parameters reference (select, filter, order, pagination, relationships)
  - Direct REST usage vs JavaScript client
  - RLS integration with Data API
  - AI Agent workflow: "Create table → REST endpoints exist automatically"
  - Performance tips and best practices

- **Multi-Tenancy Auth Guide** (`standards/architecture/supabase-multi-tenant-auth.md`)
  - Complete guide for implementing multi-tenant authentication
  - Architecture patterns (JWT claims, membership table, hybrid approach)
  - Tenant context management (getting, setting, switching)
  - RLS policies for multi-tenancy with helper functions
  - Auth API patterns (sign up with tenant, invite users, accept invitation)
  - Database schema templates (tenants, tenant_memberships, tenant-scoped tables)
  - Frontend patterns (tenant selector component)
  - Complete code examples for all patterns

- **Database Functions Guide** (`standards/architecture/supabase-database-functions.md`)
  - Decision tree: Database Functions vs Edge Functions
  - When to use each (triggers, RLS helpers, external APIs, etc.)
  - Database function patterns (SECURITY DEFINER/INVOKER, triggers, validation)
  - Function security best practices
  - Testing strategies
  - Common patterns (auto-update timestamps, soft delete, job queues)
  - AI Agent instructions and function templates

- **Updated AI Agent Guide** (`standards/architecture/supabase-ai-agent-guide.md`)
  - Added section on auto-generated Data API
  - Added section on multi-tenancy implementation
  - Added decision tree for Database Functions vs Edge Functions
  - Added integration patterns for Data API and multi-tenancy
  - Updated quick reference with new documentation
  - Expanded additional resources section

### Added
- **Enhanced Supabase Core Features** (`modules/supabase-core/src/core/`)
  - **Automatic Error Handling:**
    - `safeQuery()`, `safeMutation()`, `safeStorage()`, `safeAuth()` - Result-pattern wrappers
    - `createSafeClient()` - Safe client wrapper returning Result types
    - Integration with `@modules/error-handler` (optional, with fallback)
  - **Automatic Logging:**
    - `EnhancedSupabaseClient` - Client with automatic structured logging
    - Operation interceptors for custom logging logic
    - Integration with `@modules/logger-module` (optional)
  - **Performance Monitoring:**
    - Automatic metrics collection (operation count, avg duration, error rate)
    - `getMetrics()` - Retrieve performance metrics
    - `resetMetrics()` - Reset metrics collection
  - **Health Checks:**
    - `checkSupabaseHealth()` - Comprehensive health check for all Supabase services
    - `isSupabaseReachable()` - Simple connectivity check
    - Configurable timeouts and service checks
  - **Operation Interceptors:**
    - `OperationInterceptor` - Middleware-like functionality
    - `createDefaultInterceptor()` - Pre-configured interceptor with logging
    - Custom interceptor support for rate limiting, caching, etc.
  - **Enhanced Documentation:**
    - `ENHANCED_FEATURES.md` - Complete guide to enhanced features
    - Updated README with enhanced features section
    - Integration examples with error-handler and logger modules

### Changed
- **Supabase Core Module** (`modules/supabase-core/`)
  - Added peer dependencies for `@modules/error-handler` and `@modules/logger-module`
  - Enhanced client now supports automatic error handling and logging
  - All operations can now use Result pattern for safe error handling
  - Retry utilities updated to integrate with error-handler module

## [1.2.0] - 2025-01-27

### Added
- **Supabase Core Module** (`modules/supabase-core/`) - Phase 1 & 2 Complete
  - Unified Supabase utilities module providing client factories, query builders, and storage helpers
  - **Client Utilities:**
    - `createClient()` - Automatic environment detection (local vs production)
    - `createServerClient()` - Server-side client with SSR integration
    - `createServiceRoleClient()` - Service role client (server-side only)
  - **Database Utilities:**
    - `QueryBuilder` - Fluent API for common query patterns
    - `paginate()` - Built-in pagination helpers
    - `executeTransaction()` - Transaction execution utilities
    - RLS helpers (`checkRLSEnabled`, `getCurrentUserId`, `getCurrentUserRole`, `hasRole`)
  - **Storage Utilities:**
    - `uploadFile()` / `uploadFiles()` - File upload with validation
    - `downloadFile()` - File download utilities
    - `getImageUrl()` / `getThumbnailUrl()` - Image transformation helpers
    - `getSignedUrl()` - Signed URL generation for private files
  - **Real-time Utilities:**
    - `SubscriptionManager` - Subscription lifecycle management
    - Event handler utilities (filtered, debounced, conditional)
  - **Utility Functions:**
    - `normalizeError()` - Consistent error handling
    - `withRetry()` - Retry logic for transient errors
    - `QueryCache` - Query result caching
  - **Type Generation:**
    - Type generation setup and instructions
    - Placeholder database types file
  - Comprehensive README with usage examples

- **Supabase AI Agent Guide** (`standards/architecture/supabase-ai-agent-guide.md`)
  - Comprehensive guide for AI Agents on using Supabase modules
  - Module decision tree (which module to use when)
  - Integration patterns with complete code examples
  - Best practices and common pitfalls
  - Troubleshooting guide
  - Quick reference and common commands

- **Supabase Module Enhancement Plan** (`standards/architecture/supabase-module-enhancement-plan.md`)
  - Roadmap for Supabase module improvements
  - Current state analysis and gap identification
  - Implementation priorities and success criteria

### Changed
- **Backend API Module** (`modules/backend-api/`)
  - Now uses `supabase-core`'s `createServerClient` instead of direct `@supabase/ssr` usage
  - Updated auth middleware to leverage `supabase-core` utilities
  - Added `@modules/supabase-core` as peer dependency
  - Updated README to reference `supabase-core` integration

- **Auth Profile Sync Module** (`modules/auth-profile-sync/`)
  - Updated README to reference `supabase-core` module
  - Added note about using `supabase-core` utilities for client creation and RLS helpers

### Added
- **Backend API Module** (`modules/backend-api/`)
  - Standardized API handler wrapper for Next.js with Supabase SSR integration
  - Automatic error handling, input validation (Zod), and authentication
  - Standardized response format (`{ data, error, meta }`)
  - Auth middleware using `@supabase/ssr` for automatic JWT handling
  - Complete integration guide and examples

- **Supabase SSR Documentation** (`standards/architecture/supabase-ssr-api-routes.md`)
  - Comprehensive guide explaining how Supabase's `@supabase/ssr` simplifies API route creation
  - Examples of automatic JWT extraction, verification, and token refresh
  - Comparison of manual vs Supabase SSR implementation

- **Auth System Enhancements** (`modules/auth-profile-sync/`)
  - Email verification flow documentation and implementation guide
  - OAuth provider setup guide (Google, GitHub, etc.)
  - MFA (Multi-Factor Authentication) helpers and examples
  - Database schema updates for email verification and OAuth provider tracking

- **Sitemap Automation** (`modules/sitemap-module/`)
  - Complete database schema for automatic sitemap regeneration
  - Database triggers that detect content changes and queue jobs
  - Supabase Edge Function for generating and uploading sitemap.xml
  - Integration guide with step-by-step setup instructions
  - Next.js route examples for serving sitemap (proxy, static, redirect)

- **Supabase Local Setup** (`standards/architecture/supabase-local-setup.md`)
  - Comprehensive installation and configuration guide
  - Container isolation rules for multi-project environments
  - Environment variable configuration
  - Database setup, Edge Functions, and Storage setup

- **Supabase Secrets Management** (`standards/architecture/supabase-secrets-management.md`)
  - Guide for storing secrets in Supabase (environment variables, project secrets, database)
  - Decision matrix for choosing appropriate storage method
  - Integration with `settings-manager` module for user-configurable secrets

- **Container Isolation Rules**
  - Updated `.cursor/rules/environment.mdc` with container management rules
  - Updated `.cursor/commands/launch.mdc` with Supabase startup checks
  - Updated `.cursor/rules/self_healing.mdc` with container-specific error recovery
  - Ensures AI agents only affect project-specific Docker/Supabase containers

### Changed
- **Configuration Standards** (`standards/configuration.md`)
  - Added Supabase-specific configuration section
  - Updated to reference Supabase local setup guide
  - Incremented version to 1.2

- **Environment Template** (`templates/general/env.example`)
  - Added Supabase local and production environment variables
  - Included instructions for retrieving local credentials

### Fixed
- Container management commands now only affect project-specific instances
- Port conflict resolution now verifies container ownership before stopping

## [1.0.0] - 2025-01-27

### Added
- Initial project structure and standards
- Module structure standards
- Auth profile sync module
- Sitemap module (basic generator)
- Error handler module
- Logger module
- Settings manager module
- Testing module
- Documentation standards
- Security and access control standards

---

## Types of Changes

- **Added** - New features, modules, or documentation
- **Changed** - Changes to existing functionality or standards
- **Deprecated** - Features that will be removed in future versions
- **Removed** - Features that have been removed
- **Fixed** - Bug fixes
- **Security** - Security-related changes

---

*For detailed technical changes, see git commit history.*

