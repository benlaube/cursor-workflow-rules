/**
 * Example database schema for settings and environment_variables tables
 * Add these to your schema file (e.g., lib/db/schema.ts)
 * 
 * Adjust imports and table definitions based on your ORM (Drizzle, Prisma, TypeORM, etc.)
 */

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

// Enhanced settings table with environment support
export const settings = sqliteTable('settings', {
  id: text('id').primaryKey(),
  key: text('key').notNull(),
  value: text('value'),
  environment: text('environment').notNull().default('default'),
  category: text('category'),
  description: text('description'),
  dataType: text('data_type').default('string'),
  isSecret: integer('is_secret', { mode: 'boolean' }).notNull().default(false),
  isEncrypted: integer('is_encrypted', { mode: 'boolean' }).notNull().default(false),
  validationRules: text('validation_rules'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
}, (table) => ({
  keyEnvUnique: sql`UNIQUE(${table.key}, ${table.environment})`,
}));

// Environment variables table for MCP servers
export const environmentVariables = sqliteTable('environment_variables', {
  id: text('id').primaryKey(),
  key: text('key').notNull(),
  value: text('value'),
  environment: text('environment').notNull().default('default'),
  description: text('description'),
  isSecret: integer('is_secret', { mode: 'boolean' }).notNull().default(true),
  isEncrypted: integer('is_encrypted', { mode: 'boolean' }).notNull().default(false),
  mcpServerId: text('mcp_server_id'), // Adjust FK based on your schema
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
}, (table) => ({
  keyEnvServerUnique: sql`UNIQUE(${table.key}, ${table.environment}, ${table.mcpServerId})`,
}));

// Indexes (add to your database initialization)
/*
CREATE INDEX idx_settings_key ON settings(key);
CREATE INDEX idx_settings_environment ON settings(environment);
CREATE INDEX idx_settings_category ON settings(category);
CREATE INDEX idx_settings_key_env ON settings(key, environment);
CREATE INDEX idx_env_vars_key ON environment_variables(key);
CREATE INDEX idx_env_vars_environment ON environment_variables(environment);
CREATE INDEX idx_env_vars_mcp_server ON environment_variables(mcp_server_id);
CREATE INDEX idx_env_vars_key_env ON environment_variables(key, environment);
*/
