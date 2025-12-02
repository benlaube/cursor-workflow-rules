-- Logs table schema v2 - Enhanced tracking
-- Adds user_id, tenant_id, request/response sizes, error categorization, performance metrics, and business entity tracking
-- Run this migration after the initial logs-schema.sql migration

-- Add new columns for Phase 1 enhancements
ALTER TABLE logs 
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS ip_address INET,
  ADD COLUMN IF NOT EXISTS request_size INTEGER,
  ADD COLUMN IF NOT EXISTS response_size INTEGER,
  ADD COLUMN IF NOT EXISTS error_category VARCHAR(50),
  ADD COLUMN IF NOT EXISTS error_fingerprint VARCHAR(64),
  ADD COLUMN IF NOT EXISTS business_entity_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS business_entity_type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS feature_flags JSONB,
  ADD COLUMN IF NOT EXISTS performance_metrics JSONB,
  ADD COLUMN IF NOT EXISTS correlation_id UUID;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_logs_user_id ON logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_logs_tenant_id ON logs(tenant_id) WHERE tenant_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_logs_ip_address ON logs(ip_address) WHERE ip_address IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_logs_error_category ON logs(error_category) WHERE error_category IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_logs_error_fingerprint ON logs(error_fingerprint) WHERE error_fingerprint IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_logs_business_entity ON logs(business_entity_type, business_entity_id) WHERE business_entity_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_logs_correlation_id ON logs(correlation_id) WHERE correlation_id IS NOT NULL;

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_logs_user_timestamp ON logs(user_id, timestamp DESC) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_logs_tenant_timestamp ON logs(tenant_id, timestamp DESC) WHERE tenant_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_logs_error_category_timestamp ON logs(error_category, timestamp DESC) WHERE error_category IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_logs_business_entity_timestamp ON logs(business_entity_type, business_entity_id, timestamp DESC) WHERE business_entity_id IS NOT NULL;

-- GIN index for feature flags JSONB queries
CREATE INDEX IF NOT EXISTS idx_logs_feature_flags_gin ON logs USING GIN (feature_flags) WHERE feature_flags IS NOT NULL;

-- GIN index for performance metrics JSONB queries
CREATE INDEX IF NOT EXISTS idx_logs_performance_metrics_gin ON logs USING GIN (performance_metrics) WHERE performance_metrics IS NOT NULL;

-- Comments for new columns
COMMENT ON COLUMN logs.user_id IS 'User ID associated with the log entry (indexed for user-specific queries)';
COMMENT ON COLUMN logs.tenant_id IS 'Tenant ID for multi-tenant applications (indexed for tenant-specific queries)';
COMMENT ON COLUMN logs.ip_address IS 'Client IP address (INET type for efficient storage and queries)';
COMMENT ON COLUMN logs.request_size IS 'Request body size in bytes';
COMMENT ON COLUMN logs.response_size IS 'Response payload size in bytes';
COMMENT ON COLUMN logs.error_category IS 'Error classification (validation, network, database, business_logic, etc.)';
COMMENT ON COLUMN logs.error_fingerprint IS 'Hash of error characteristics for grouping similar errors';
COMMENT ON COLUMN logs.business_entity_id IS 'Generic business entity ID (order_id, customer_id, transaction_id, etc.)';
COMMENT ON COLUMN logs.business_entity_type IS 'Type of business entity (order, customer, transaction, etc.)';
COMMENT ON COLUMN logs.feature_flags IS 'Active feature flags for the request/operation (JSONB)';
COMMENT ON COLUMN logs.performance_metrics IS 'Structured performance data (duration, memory, CPU, etc.) as JSONB';
COMMENT ON COLUMN logs.correlation_id IS 'Correlation ID for linking related logs across services';

