# Settings Management Module

A reusable settings and environment variables management module with encryption support, environment separation, and MCP server association.

## Contents

- `settings-manager.ts` - Main manager classes (SettingsManager, EnvironmentVariablesManager)
- `encryption.ts` - Encryption utilities (AES-256-GCM)
- `migrate-settings.ts` - Migration script for upgrading from old schema
- `schema-example.ts` - Example database schema definitions
- `README.md` - This file

## Quick Start

1. Copy files to your project
2. Add schema tables to your database schema
3. Set ENCRYPTION_KEY in .env
4. Update imports in settings-manager.ts
5. Use SettingsManager and EnvironmentVariablesManager classes

## Documentation

See the integration guide in the docs folder for complete instructions.

## Features

- ✅ Environment support (default/dev/prod)
- ✅ Encryption for secrets
- ✅ MCP server association
- ✅ Automatic masking for UI
- ✅ Migration support
