# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

