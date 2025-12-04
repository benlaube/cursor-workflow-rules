# Full_SEO_Automation_System_v1.0

## Metadata

- **Created:** 2025-11-18
- **Last Updated:** 2025-11-18
- **Version:** 1.0
- **Description:** System design and implementation guide for an AI-driven SEO automation layer integrated with Supabase, Edge Functions, and the Content Engine.

---

## 1. Purpose & Scope

This document defines a **Full SEO Automation System** that:

1. A. Continuously improves on-page SEO using AI and database events.
1. B. Integrates with Supabase, Edge Functions, and the Content Engine.
1. C. Automates metadata (titles, descriptions, canonical URLs, OpenGraph, etc.).
1. D. Automates supporting assets (alt text, structured data snippets, internal link suggestions).
1. E. Connects to the sitemap auto-generation system for a closed-loop SEO flow.

The system is designed for multi-brand, multi-site content platforms but can be scaled down for smaller projects.

---

## 2. High-Level Architecture

1. A. **Core Data Layer (Supabase)**
   1. A.1. Tables for `pages`, `posts`, `media_assets`, `seo_metadata`, `site_settings`.
   1. A.2. Triggers to detect content changes that impact SEO.

1. B. **AI Processing Layer (Edge Functions + Backend)**
   1. B.1. Edge Functions for short, DB-centric SEO tasks (classifications, enrichment).
   1. B.2. Main backend / Content Engine orchestrator for complex or multi-step tasks.

1. C. **Automation Jobs & Queues**
   1. C.1. `seo_jobs` table for queued tasks.
   1. C.2. Optional `seo_logs` / `system_logs` tables for observability.

1. D. **Presentation Layer**
   1. D.1. Next.js (or similar) using `seo_metadata` as a source of truth.
   1. D.2. Static assets (sitemap.xml, RSS, OpenGraph images) synchronized with SEO metadata.

---

## 3. Data Model – Core Tables

### 3.1 `seo_metadata` Table

This table stores SEO details per content item.

```sql
CREATE TABLE IF NOT EXISTS seo_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL,                -- e.g. 'page', 'post', 'property'
  content_id uuid NOT NULL,                  -- FK to pages/posts/etc.
  meta_title text,
  meta_description text,
  canonical_url text,
  og_title text,
  og_description text,
  og_image_url text,
  twitter_title text,
  twitter_description text,
  twitter_image_url text,
  schema_json jsonb,                         -- structured data (schema.org)
  keywords text[],
  last_generated_at timestamptz,
  last_reviewed_at timestamptz,
  status text NOT NULL DEFAULT 'auto',       -- 'auto', 'manual_override', 'needs_review'
  UNIQUE (content_type, content_id)
);
```

### 3.2 `seo_jobs` Table

```sql
CREATE TABLE IF NOT EXISTS seo_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL,
  content_id uuid NOT NULL,
  job_type text NOT NULL,         -- 'generate_meta', 'generate_schema', 'update_alt_text', etc.
  priority int NOT NULL DEFAULT 5,
  status text NOT NULL DEFAULT 'pending',
  attempts int NOT NULL DEFAULT 0,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  finished_at timestamptz
);
```

### 3.3 Optional `seo_logs` Table

```sql
CREATE TABLE IF NOT EXISTS seo_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL,
  content_id uuid NOT NULL,
  action text NOT NULL,           -- 'meta_generated', 'schema_updated', 'alt_text_created'
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

---

## 4. Triggers – When to Enqueue SEO Jobs

1. A. **Page/Post Creation**
   1. A.1. AFTER INSERT on `pages`, `posts`, or similar tables.
   1. A.2. Condition: `is_public = true` or `status = 'published'`.
   1. A.3. Action: enqueue `generate_meta`, `generate_schema`, and `scan_internal_links` jobs.

1. B. **Significant Content Updates**
   1. B.1. AFTER UPDATE when `title`, `body`, `slug`, or `status` changes.
   1. B.2. If content changes significantly (e.g., title/body diff is large), enqueue jobs with higher priority.

1. C. **Media Uploads**
   1. C.1. AFTER INSERT on `media_assets` table.
   1. C.2. Condition: missing alt text.
   1. C.3. Action: enqueue `generate_alt_text` job.

### 4.1 Example Trigger Function for `pages`

```sql
CREATE OR REPLACE FUNCTION pages_seo_trigger()
RETURNS trigger AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    IF NEW.is_public = true THEN
      INSERT INTO seo_jobs (content_type, content_id, job_type, priority)
      VALUES ('page', NEW.id, 'generate_meta', 5),
             ('page', NEW.id, 'generate_schema', 5),
             ('page', NEW.id, 'scan_internal_links', 7);
    END IF;

  ELSIF (TG_OP = 'UPDATE') THEN
    IF (NEW.is_public = true) THEN
      IF (NEW.title IS DISTINCT FROM OLD.title
          OR NEW.body IS DISTINCT FROM OLD.body
          OR NEW.slug IS DISTINCT FROM OLD.slug) THEN
        INSERT INTO seo_jobs (content_type, content_id, job_type, priority)
        VALUES ('page', NEW.id, 'generate_meta', 4),
               ('page', NEW.id, 'generate_schema', 4);
      END IF;
    END IF;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pages_seo_trigger
AFTER INSERT OR UPDATE ON pages
FOR EACH ROW EXECUTE FUNCTION pages_seo_trigger();
```

---

## 5. AI Job Types & Responsibilities

### 5.1 Job Type: `generate_meta`

1. A. Inputs
   1. A.1. `title`, `body`, `slug`, `existing_seo_metadata`.

1. B. Outputs
   1. B.1. `meta_title` – concise, keyword-aware, within 50–60 chars.
   1. B.2. `meta_description` – 140–160 chars, benefit-driven.
   1. B.3. `canonical_url` – built from base URL + slug, unless overridden.
   1. B.4. `og_title`, `og_description` – tuned for social.
   1. B.5. `twitter_*` equivalents (can mirror OG).
   1. B.6. `keywords` – short list of target phrases.

1. C. Behavior
   1. C.1. If `status = 'manual_override'`, the system must **not overwrite** human-edited metadata.
   1. C.2. If `status = 'auto'`, the system may freely regenerate.
   1. C.3. If AI is unsure (low confidence), set `status = 'needs_review'`.

### 5.2 Job Type: `generate_schema`

1. A. Inputs
   1. A.1. Content type, fields, and context (e.g., blog post vs product vs property).

1. B. Outputs
   1. B.1. `schema_json` (JSON-LD) with appropriate `@type`, such as:
      - `Article`, `BlogPosting`, `WebPage`, `Product`, `RealEstateListing`, etc.

1. C. Behavior
   1. C.1. Ensure JSON is valid and minimal.
   1. C.2. Use canonical URL and existing titles/descriptions.

### 5.3 Job Type: `generate_alt_text`

1. A. Inputs
   1. A.1. Media filename, associated page/post, optional caption.

1. B. Outputs
   1. B.1. Short, descriptive `alt_text` stored back on `media_assets`.

1. C. Behavior
   1. C.1. Avoid keyword stuffing.
   1. C.2. Focus on human-readable, accessible descriptions.

### 5.4 Job Type: `scan_internal_links`

1. A. Inputs
   1. A.1. Page/post body.

1. B. Outputs
   1. B.1. Suggested internal links to other pages in the site.

1. C. Behavior
   1. C.1. Write suggestions to a `internal_link_suggestions` table.
   1. C.2. Do not auto-insert; let editors approve.

---

## 6. Edge Functions vs Backend Responsibilities

1. A. **Edge Functions**
   1. A.1. Ideal for small, one-shot tasks:
      - Generating meta for a single page.
      - Writing alt text for one media object.
      - Updating schema.org JSON for a record.
   1. A.2. Triggered via Supabase webhooks, or on-demand by the backend.

1. B. **Main Backend / Content Engine Orchestrator**
   1. B.1. Orchestrates bulk operations.
   1. B.2. Handles multi-step flows (e.g., content analysis → keyword clustering → metadata → content suggestions).
   1. B.3. Integrates with logging, alerting, and review UI.

---

## 7. Integrating with Sitemap & Other Static Assets

1. A. After successful `generate_meta` / `generate_schema` jobs, the system should:
   1. A.1. Ensure canonical URLs align with sitemap entries.
   1. A.2. Trigger sitemap regeneration jobs when URLs or visibility change.

1. B. Optionally, the same signals can:
   1. B.1. Trigger RSS feed updates.
   1. B.2. Trigger OpenGraph image regeneration (if using AI to render OG images).

---

## 8. Admin & Editor Controls

1. A. In the CMS or admin UI, provide controls per content item:
   1. A.1. `SEO Mode`:
      - `auto` – AI controls metadata entirely.
      - `manual_override` – human edits freeze AI changes.
      - `needs_review` – AI suggestions exist, human must approve.

1. B. Provide change history:
   1. B.1. Show previous meta vs newly generated meta.
   1. B.2. Allow reverting to a prior version.

---

## 9. Observability & Quality Checks

1. A. KPIs
   1. A.1. Percentage of public pages with:
      - Non-empty titles
      - Non-empty descriptions
      - Valid canonical URLs
      - Generated schema
   1. A.2. Percentage of images with alt text.

1. B. Periodic AI Quality Audits
   1. B.1. Randomly sample pages.
   1. B.2. Have AI self-check for:
      - Overly generic descriptions
      - Keyword stuffing
      - Mismatched canonical URLs.

---

## 10. v1.1 – Future Enhancements (Placeholder)

This section is reserved for future improvements such as:

1. A. Multi-language SEO support.
1. B. Integration with external SEO APIs (Search Console, Analytics).
1. C. Keyword research feedback loops into the Content Engine.
1. D. Topic clustering and content gap analysis.

Last_Updated will be bumped when v1.1 is formally defined.
