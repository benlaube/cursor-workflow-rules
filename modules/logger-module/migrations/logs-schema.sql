-- Logs table schema for Supabase
-- Supports universal runtime logging with session, request, and trace IDs

-- Create logs table
CREATE TABLE IF NOT EXISTS logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  level VARCHAR(20) NOT NULL,
  logger_name VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  source VARCHAR(50),
  action VARCHAR(100),
  component VARCHAR(100),
  request_id UUID,
  trace_id UUID,
  session_id VARCHAR(50) NOT NULL,
  runtime VARCHAR(20) NOT NULL CHECK (runtime IN ('node', 'browser', 'edge')),
  raw_log TEXT,
  meta JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level);
CREATE INDEX IF NOT EXISTS idx_logs_source ON logs(source);
CREATE INDEX IF NOT EXISTS idx_logs_action ON logs(action);
CREATE INDEX IF NOT EXISTS idx_logs_component ON logs(component);
CREATE INDEX IF NOT EXISTS idx_logs_session_id ON logs(session_id);
CREATE INDEX IF NOT EXISTS idx_logs_request_id ON logs(request_id);
CREATE INDEX IF NOT EXISTS idx_logs_trace_id ON logs(trace_id);
CREATE INDEX IF NOT EXISTS idx_logs_runtime ON logs(runtime);
CREATE INDEX IF NOT EXISTS idx_logs_logger_name ON logs(logger_name);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_logs_session_timestamp ON logs(session_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_logs_request_timestamp ON logs(request_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_logs_trace_timestamp ON logs(trace_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_logs_source_action ON logs(source, action);
CREATE INDEX IF NOT EXISTS idx_logs_level_timestamp ON logs(level, timestamp DESC);

-- GIN index for JSONB metadata queries
CREATE INDEX IF NOT EXISTS idx_logs_meta_gin ON logs USING GIN (meta);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_logs_updated_at
  BEFORE UPDATE ON logs
  FOR EACH ROW
  EXECUTE FUNCTION update_logs_updated_at();

-- RLS policies (optional - uncomment if needed)
-- Enable RLS
-- ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own logs (if user_id is added to meta)
-- CREATE POLICY "Users can view their own logs"
--   ON logs FOR SELECT
--   USING (
--     (meta->>'user_id')::uuid = auth.uid()
--   );

-- Policy: Service role can insert logs
-- CREATE POLICY "Service role can insert logs"
--   ON logs FOR INSERT
--   WITH CHECK (auth.role() = 'service_role');

-- Comments for documentation
COMMENT ON TABLE logs IS 'Application logs with multi-dimensional categorization and distributed tracing support';
COMMENT ON COLUMN logs.timestamp IS 'Log entry timestamp';
COMMENT ON COLUMN logs.level IS 'Log level (trace, debug, info, warn, error, fatal, user_action, notice, success, failure)';
COMMENT ON COLUMN logs.logger_name IS 'Name of the logger instance (typically module/service name)';
COMMENT ON COLUMN logs.message IS 'Log message text';
COMMENT ON COLUMN logs.source IS 'Source category (user, bot, system, api)';
COMMENT ON COLUMN logs.action IS 'Action category (order_placed, sync_orders, api_request, etc.)';
COMMENT ON COLUMN logs.component IS 'Component category (frontend, backend, api, database, etc.)';
COMMENT ON COLUMN logs.request_id IS 'Request ID for distributed tracing';
COMMENT ON COLUMN logs.trace_id IS 'OpenTelemetry trace ID for distributed tracing';
COMMENT ON COLUMN logs.session_id IS 'Session ID (format: YYYYMMDD_HHMMSS)';
COMMENT ON COLUMN logs.runtime IS 'Runtime environment (node, browser, edge)';
COMMENT ON COLUMN logs.raw_log IS 'Full original log line';
COMMENT ON COLUMN logs.meta IS 'Additional metadata as JSONB';

