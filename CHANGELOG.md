# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Logger Module - ILogger Interface** (2025-12-01 22:38:43)
  - **ILogger Interface:** Added `ILogger` interface for dependency injection and type safety
  - **Type Guard:** Added `isILogger()` function to check if an object implements the logger interface
  - **Logger Class Implementation:** `Logger` class now implements `ILogger` interface
  - **Documentation:** Added usage examples for dependency injection with `ILogger` interface
  - **Benefits:** Enables better testability, dependency injection, and type-safe logger parameters

- **Enhanced Logger Module - Universal Runtime Support** (2025-12-01 22:25:06)
  - **Universal Runtime Support:** Full support for Node.js, Browser, and Edge runtimes with automatic environment detection
  - **Multi-Dimensional Categorization:** `[source|action|component]` prefix on all logs for easy filtering and searching
  - **Context Propagation:** Automatic context inheritance across async boundaries using AsyncLocalStorage (Node.js), AsyncContext (Browser), or request-scoped (Edge)
  - **Multi-Destination Logging:**
    - Console handler with colorized output (Node.js) or JSON (browser/edge)
    - File handler with session-based logs and rotation (Node.js only)
    - Database handler with batched writes and runtime-aware batching (all environments)
  - **Distributed Tracing:** Request/trace ID generation and propagation with OpenTelemetry support
  - **Security Features:** PII scrubbing, error sanitization, circular reference handling
  - **Performance Features:** Log sampling, batched database writes, backpressure handling
  - **Framework Integration:** Express, Next.js, Fastify, and Browser middleware for automatic request/response logging
  - **Testing Support:** `createMockLogger()` function for testing-module integration
  - **Type Safety:** Complete TypeScript interfaces with Zod runtime validation
  - **Session Management:** Universal session IDs with runtime-specific storage (env vars, localStorage, memory)
  - **Custom Log Levels:** USER_ACTION, TRACE, NOTICE, SUCCESS, FAILURE matching Python logger
  - **Helper Functions:** `logWithContext()`, `logApiCall()`, `createChildLogger()` with type-safe metadata
  - **Metrics & Health:** Performance monitoring and health check utilities
  - **Database Schema:** Supabase logs table with comprehensive indexes and runtime column
  - **Comprehensive Documentation:** README with runtime-specific examples, configuration guide, and best practices
  - **Test Suite:** Unit and integration tests for all components and runtime-specific functionality

### Added
- **Documentation Interface Launch Scripts & Bundled CSS** (2025-12-01 22:00:00)
  - **Interactive Background Mode Prompt:** Launch scripts now prompt user to choose foreground or background mode (y/n)
  - **README Changelog:** Added comprehensive changelog section to module README documenting all features and changes
  - **Launch Scripts:**
    - `LAUNCH.html` - Visual HTML launcher with platform detection and copy-paste commands (easiest option)
    - `launch-docs.sh` - Unix/Mac/Linux launcher with full automation
    - `launch-docs.bat` - Windows launcher with interactive prompts
    - Automatic Node.js/npm version checking
    - Port availability checking with conflict resolution
    - Automatic dependency installation
    - Sample documentation creation
    - Git repository detection
    - Background mode support (Unix only)
    - **Configurable Port:** Supports `PORT` environment variable or `--port` argument (default: 3000)
    - **Configurable URL Path:** URL path determined by route location (default: `/docs`)
    - **package.json Configuration:** Launch scripts now read port and URL path from the module's `package.json` under `docsInterface` section
    - **Self-Contained Module:** Module is now fully self-contained and can run directly without a separate test environment. Removed `test-docs-interface` directory.
    - **Configuration Priority:** Command args → Environment vars → package.json → Defaults
    - **JSON Parsing:** Uses `jq` on Unix/Mac (if available) or PowerShell on Windows for reliable JSON parsing
    - **Auto-Browser Opening:** Launch scripts now automatically open the default browser to the interface after server starts
    - **Cross-Platform Browser Support:** Uses `open` (macOS), `xdg-open` (Linux), or `start` (Windows) to open browser
    - **Smart Timing:** Waits 3 seconds for server to initialize before opening browser
  - **Port Configuration Guide** (`PORT_CONFIGURATION.md`):
    - Complete guide for changing port and URL path
    - Environment variable examples
    - Command-line argument examples
    - Port conflict resolution
    - Custom route path examples
  - **Standalone CSS Bundle** (`styles/docs-interface.css`):
    - All Tailwind-compatible utility classes bundled
    - Component-specific styles included
    - Syntax highlighting theme (highlight.js GitHub) embedded
    - No need to install Tailwind CSS separately
    - No need to install highlight.js separately
    - Reduces external dependencies for users
  - **Comprehensive Setup Guide** (`SETUP.md`):
    - Quick start instructions for all platforms
    - Manual setup guide
    - CSS setup options (standalone vs Tailwind)
    - Troubleshooting section
    - Launch script reference
    - Integration checklist
  - **Updated README:**
    - Added Quick Start section with launch scripts
    - Added CSS setup options
    - Added launch scripts reference section
    - Added dependency reduction section
    - Documented bundled assets

- **Documentation Interface Settings Page** (2025-12-01 23:00:00)
  - **Renamed Welcome Page to Settings:** UI now displays as "Settings" for better clarity
  - **Always Accessible:** Added Settings button (⚙️) to toolbar for easy access anytime
  - **Dual Purpose:** Serves as welcome page on first visit and settings page when accessed from toolbar
  - **Smart Button Text:** Shows "Get Started" on first visit, "Back to Interface" when accessed from toolbar
  - **Toolbar Integration:** Settings button appears in top-right of toolbar
  - Updated `DocToolbar` with `onOpenSettings` prop and Settings button
  - Updated `DocsInterface` to support opening/closing settings page
  - Updated `DocsWelcome` to detect context (first visit vs settings access)

- **Documentation Interface Welcome Page** (2025-12-01 21:15:00)
  - Added `DocsWelcome` component with onboarding experience
  - **Health Checks:** Validates Next.js environment, docs directory, git repository, and API routes
  - **Feature Overview:** Visual display of all module capabilities
  - **Setup Instructions:** Quick setup guide with code examples
  - **First-Visit Detection:** Shows welcome page once using localStorage
  - **Status Indicators:** Color-coded status (checking, success, warning, error)
  - **Responsive Design:** Mobile-friendly layout with Tailwind CSS
  - Updated `DocsInterface` to show welcome page on first visit
  - Updated `README.md` with welcome page documentation and usage examples
  - Exported `DocsWelcome` from module index for standalone use

- **Cohesive Documentation System** (2025-11-25 17:32:05)
  - **Three-Layer System:** Standards → Checklists → Commands
    - Standards define requirements (`docs/process/*_standards_v*.md`)
    - Checklists provide validation (`docs/process/checklists/*_checklist_v*.md`)
    - Commands automate execution (`.cursor/commands/*.md`)
  - **New Commands:**
    - `pre_flight_check` - Environment validation before coding
    - `pr_review_check` - Pre-PR validation (code quality, security, docs)
    - `project_audit` - Project structure and standards validation
    - `rls_policy_review` - Deep RLS policy analysis
    - `full_project_health_check` - Meta-command running all audits together
  - **Reorganized Structure:**
    - Moved all checklists to `docs/process/checklists/`
    - Created `docs/process/security_audit_standards_v1_0.md` (comprehensive security standard)
    - All checklists now include Type declarations and cross-references
  - **Enhanced AGENTS.md:**
    - Added Standard Developer Lifecycle (Section 6)
    - Enhanced Agent Rules of Engagement with command references (Section 7)
    - Added Related Checklists & Commands reference (Section 8)
    - Added Quick Reference table (Section 9)
    - Now serves as the master brain for all development workflows
  - **Updated Documentation Standards:**
    - Added checklist format specification
    - Added Type declaration requirements
    - Added file type location guidelines
    - Added cross-reference requirements
    - Documented three-layer system relationship

### Changed
- **Documentation Cleanup & Clarity** (2025-11-25 17:40:00)
  - **Removed Duplication:**
    - Deleted duplicate checklists from root `checklists/` directory (moved to `docs/process/checklists/`)
    - Updated all references in `INTEGRATION_GUIDE.md`, `QUICK_INTEGRATION.md`, `README.md`, and `standards/git-flow.md` to point to canonical location
  - **Clarified Module Docs vs Standards:**
    - Added Section 9 to `standards/documentation.md` explaining distinction
    - Module docs (`modules/*/README.md`) = How to USE a module
    - Standards (`standards/module-structure.md`) = How to CREATE/STRUCTURE modules
    - Created `docs/process/DOCUMENTATION_STRUCTURE.md` guide for AI agents
  - **No Duplication Policy:**
    - Established clear rule: each document exists in exactly one canonical location
    - All references updated to point to canonical locations

- **Documentation Standards Compliance** (2025-11-25)
  - Updated all checklist files with proper metadata blocks and versioned titles per Documentation Management Rule
  - Updated all standards documentation files to include complete metadata blocks (Created, Last Updated, Version, Description) and proper underscore-separated versioned titles
  - Updated integration guides (`INTEGRATION_GUIDE.md`, `QUICK_INTEGRATION.md`) with metadata blocks and versioned titles
  - Updated roadmap files in `/docs/roadmap/` to use proper title format
  - All documentation files now comply with `standards/documentation.md` requirements
  - **Checklist Format:** All checklists now use simplified format with Type declarations, timestamps, and command references
  - **Security Audit:** Unified `security-audit` command with comprehensive `security_audit_standards_v1_0.md` standard

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
- **Supabase Core Python Module (`modules/supabase-core-python/`)**
  - Complete Python backend support for Django, FastAPI, and Flask
  - Client factories with environment detection (local vs production)
  - Query builder with fluent API
  - Pagination helpers
  - Storage utilities (upload, download, image processing)
  - Real-time subscription management
  - Error handling and retry logic
  - Caching utilities
  - Framework-specific integrations:
    - FastAPI dependencies (`get_authenticated_supabase`)
    - Django middleware helpers (`get_supabase_client`)
    - Flask helpers (`get_supabase_client`)
  - Comprehensive README and integration guide
  - Type generation support (`supabase gen types python`)
- **AI Agent Guide Updates**
  - Added Python backend decision tree
  - Added framework selection guide (FastAPI, Django, Flask)
  - Added Python-specific integration patterns
  - Updated module decision matrix with language indicators
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

