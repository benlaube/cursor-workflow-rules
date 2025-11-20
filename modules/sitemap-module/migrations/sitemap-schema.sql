-- Sitemap Automation Schema
--
-- Description: Database schema for automatic sitemap generation triggered by content changes.
-- This includes a job queue table, trigger functions, and helper functions.
--
-- Usage: Apply this migration to your Supabase project.
-- Version: 1.0

-- 1. Create sitemap_jobs table (job queue)
CREATE TABLE IF NOT EXISTS public.sitemap_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  triggered_at timestamptz NOT NULL DEFAULT now(),
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  processed_at timestamptz,
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_sitemap_jobs_status 
ON public.sitemap_jobs(status);

CREATE INDEX IF NOT EXISTS idx_sitemap_jobs_triggered_at 
ON public.sitemap_jobs(triggered_at);

-- Add comments
COMMENT ON TABLE public.sitemap_jobs IS 'Queue table for sitemap regeneration jobs triggered by content changes';
COMMENT ON COLUMN public.sitemap_jobs.reason IS 'Reason for job (e.g., page_inserted, page_updated, page_deleted)';
COMMENT ON COLUMN public.sitemap_jobs.status IS 'Job status: pending, processing, processed, failed';
COMMENT ON COLUMN public.sitemap_jobs.processed_at IS 'Timestamp when job was processed';
COMMENT ON COLUMN public.sitemap_jobs.error_message IS 'Error message if job failed';

-- 2. Create function to enqueue sitemap job
CREATE OR REPLACE FUNCTION public.enqueue_sitemap_job(reason text)
RETURNS void AS $$
BEGIN
  -- Only enqueue if no pending job exists (debounce)
  -- This prevents hammering the Edge Function if many updates occur at once
  IF NOT EXISTS (
    SELECT 1 FROM public.sitemap_jobs 
    WHERE status = 'pending' 
    AND triggered_at > now() - interval '1 minute'
  ) THEN
    INSERT INTO public.sitemap_jobs (reason, status)
    VALUES (reason, 'pending');
  END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.enqueue_sitemap_job IS 'Enqueues a sitemap regeneration job. Debounces multiple rapid changes to prevent excessive regeneration.';

-- 3. Generic trigger function for content tables
-- This function can be reused for any table that needs to trigger sitemap regeneration
CREATE OR REPLACE FUNCTION public.content_sitemap_trigger()
RETURNS trigger AS $$
DECLARE
  table_name text;
  should_trigger boolean := false;
BEGIN
  table_name := TG_TABLE_NAME;
  
  -- INSERT: new public content
  IF (TG_OP = 'INSERT') THEN
    -- Check if content is public (adjust column names as needed)
    -- This assumes tables have is_public or status columns
    IF (
      (NEW.is_public = true) OR
      (NEW.status = 'published') OR
      (NEW.published = true)
    ) THEN
      should_trigger := true;
    END IF;

  -- UPDATE: slug, visibility, or status changed
  ELSIF (TG_OP = 'UPDATE') THEN
    -- Trigger if visibility/status changed, or slug changed
    IF (
      (NEW.is_public IS DISTINCT FROM OLD.is_public) OR
      (NEW.status IS DISTINCT FROM OLD.status) OR
      (NEW.published IS DISTINCT FROM OLD.published) OR
      (NEW.slug IS DISTINCT FROM OLD.slug) OR
      (NEW.path IS DISTINCT FROM OLD.path) OR
      (NEW.url_segment IS DISTINCT FROM OLD.url_segment)
    ) THEN
      should_trigger := true;
    END IF;

  -- DELETE: public content removed
  ELSIF (TG_OP = 'DELETE') THEN
    -- Trigger if deleted content was public
    IF (
      (OLD.is_public = true) OR
      (OLD.status = 'published') OR
      (OLD.published = true)
    ) THEN
      should_trigger := true;
    END IF;
  END IF;

  -- Enqueue job if trigger conditions met
  IF should_trigger THEN
    PERFORM public.enqueue_sitemap_job(table_name || '_' || lower(TG_OP));
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.content_sitemap_trigger IS 'Generic trigger function for content tables. Detects INSERT/UPDATE/DELETE on public content and enqueues sitemap regeneration.';

-- 4. Example: Create trigger for a 'pages' table
-- Uncomment and adjust table/column names to match your schema
/*
CREATE TRIGGER pages_sitemap_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.pages
FOR EACH ROW
EXECUTE FUNCTION public.content_sitemap_trigger();
*/

-- 5. Example: Create trigger for a 'posts' table
-- Uncomment and adjust table/column names to match your schema
/*
CREATE TRIGGER posts_sitemap_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.content_sitemap_trigger();
*/

-- 6. Helper function to manually trigger sitemap regeneration
CREATE OR REPLACE FUNCTION public.trigger_sitemap_regeneration()
RETURNS void AS $$
BEGIN
  PERFORM public.enqueue_sitemap_job('manual_trigger');
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.trigger_sitemap_regeneration IS 'Manually trigger sitemap regeneration. Useful for initial setup or manual refreshes.';

-- 7. Function to mark jobs as processed
CREATE OR REPLACE FUNCTION public.mark_sitemap_job_processed(job_id uuid, error_msg text DEFAULT NULL)
RETURNS void AS $$
BEGIN
  UPDATE public.sitemap_jobs
  SET 
    status = CASE WHEN error_msg IS NULL THEN 'processed' ELSE 'failed' END,
    processed_at = now(),
    error_message = error_msg,
    updated_at = now()
  WHERE id = job_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.mark_sitemap_job_processed IS 'Mark a sitemap job as processed or failed. Called by Edge Function after processing.';

-- 8. Function to get pending jobs
CREATE OR REPLACE FUNCTION public.get_pending_sitemap_jobs()
RETURNS TABLE (
  id uuid,
  triggered_at timestamptz,
  reason text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sj.id,
    sj.triggered_at,
    sj.reason
  FROM public.sitemap_jobs sj
  WHERE sj.status = 'pending'
  ORDER BY sj.triggered_at ASC
  LIMIT 10; -- Process up to 10 jobs at a time
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.get_pending_sitemap_jobs IS 'Get pending sitemap jobs for processing. Returns up to 10 jobs ordered by trigger time.';

