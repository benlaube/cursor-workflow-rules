# Sitemap Auto-Generation Standard v1.0

## Metadata

- **Created:** 2025-11-18
- **Last Updated:** 2025-12-04
- **Version:** 1.0
- **Description:** Standards for automated sitemap generation using Supabase triggers, Edge Functions, and static XML file storage for optimal SEO.

## 1. Purpose of This Document

This guide teaches an AI Agent _exactly_ how to:

1. Detect page structure changes in Supabase database tables.
2. Trigger a Supabase Edge Function automatically.
3. Rebuild a **real static sitemap.xml file**.
4. Store that sitemap where search engines can reliably—and instantly—access it.
5. Avoid exposing any slow, “generate-on-request” sitemap endpoints.

The goal: **Every time public-facing content changes, the XML file updates instantly without manual deployment.**

## 2. Architectural Overview – High-Level Flow

```
┌────────────────────┐
│   User/Admin CMS    │
└─────────┬──────────┘
          │ (insert/update/delete)
          ▼
┌────────────────────┐
│   Supabase Tables   │
│  pages, posts, etc. │
└─────────┬──────────┘
          │ SQL Trigger fires
          ▼
┌──────────────────────────┐
│ sitemap_jobs (queue tbl) │
└─────────┬────────────────┘
          │ webhook / cron / immediate call
          ▼
┌──────────────────────────┐
│ Edge Function: generate  │
│       sitemap.xml        │
└─────────┬────────────────┘
          │ writes file
          ▼
┌──────────────────────────┐
│ Supabase Storage Bucket  │
│  public-assets/sitemap.xml│
└──────────────────────────┘
```

This pattern guarantees:

- Zero waiting time for crawlers.
- A single source of truth.
- Fine-grained control triggered from the database.
- Easy adaptivity for the AI Agent.

---

## 3. Step-by-Step Guide for the AI Agent

### 3.1 Step 1 – Identify Public-Facing Pages

The AI Agent should inspect the Supabase schema using MCP or metadata queries and answer:

- Which tables represent public content?
  - Examples: `pages`, `posts`, `articles`, `docs`, `routes`, `navigation_items`.
- Which rows should appear in the sitemap?
  - Usually those with:
    - `is_public = true` or `status = 'published'`
    - Non-null slugs
- Which fields represent URLs or paths?
  - `slug`, `path`, `url_segment`.
- Which fields represent modification timestamps?
  - `updated_at`, `modified_at`.

> The AI Agent should **never hardcode table names**. It should infer them logically or ask the user for clarification.

---

### 3.2 Step 2 – Determine the Site Base URL

The sitemap requires **absolute URLs**.

The AI Agent must search for:

- Environment variables: `SITE_URL`, `PUBLIC_SITE_URL`, `NEXT_PUBLIC_SITE_URL`.
- Config tables: `settings`, `site_settings`, `app_config`.
- Otherwise create a table:

```sql
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  base_url text NOT NULL
);
```

If unknown, use a placeholder `"https://example.com"` _with a comment warning_.

---

## 4. Designing the Sitemap Regeneration System

Two main components:

1. **Database triggers** → enqueue sitemap regeneration jobs.
2. **Edge Function** → reads DB → generates XML → writes static file.

### 4.1 Job Queue Table (Recommended)

This avoids hammering the Edge Function if many updates occur at once.

```sql
CREATE TABLE IF NOT EXISTS sitemap_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  triggered_at timestamptz NOT NULL DEFAULT now(),
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending'
);
```

Reasons might include: `page_inserted`, `page_updated`, `page_deleted`, etc.

---

### 4.2 Trigger Function – Enqueue a Job

```sql
CREATE OR REPLACE FUNCTION enqueue_sitemap_job(reason text)
RETURNS void AS $$
BEGIN
  INSERT INTO sitemap_jobs (reason)
  VALUES (reason);
END;
$$ LANGUAGE plpgsql;
```

---

### 4.3 Table-Level Trigger – Example for `pages`

```sql
CREATE OR REPLACE FUNCTION pages_sitemap_trigger()
RETURNS trigger AS $$
BEGIN
  -- INSERT: new public content
  IF (TG_OP = 'INSERT') THEN
    IF NEW.is_public = true THEN
      PERFORM enqueue_sitemap_job('page_inserted');
    END IF;

  -- UPDATE: slug or visibility changed
  ELSIF (TG_OP = 'UPDATE') THEN
    IF (NEW.slug IS DISTINCT FROM OLD.slug)
       OR (NEW.is_public IS DISTINCT FROM OLD.is_public) THEN
      PERFORM enqueue_sitemap_job('page_updated');
    END IF;

  -- DELETE: public content removed
  ELSIF (TG_OP = 'DELETE') THEN
    IF OLD.is_public = true THEN
      PERFORM enqueue_sitemap_job('page_deleted');
    END IF;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pages_sitemap_trigger
AFTER INSERT OR UPDATE OR DELETE ON pages
FOR EACH ROW EXECUTE FUNCTION pages_sitemap_trigger();
```

The AI Agent should replicate this logic for other public-facing tables.

---

## 5. Edge Function – Full Example Implementation

### 5.1 File Layout

```
supabase/
  functions/
    generate_sitemap/
      index.ts
```

---

### 5.2 index.ts (Comment-Heavy Example)

```ts
// v1.0 – Fully Commented Sitemap Generator Edge Function
// File: supabase/functions/generate_sitemap/index.ts

import { serve } from 'https://deno.land/std/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Pull required environment variables
// The AI Agent should ensure these exist.
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SITE_URL = Deno.env.get('SITE_URL') ?? 'https://example.com'; // fallback warning
const BUCKET = Deno.env.get('SITEMAP_BUCKET') ?? 'public-assets';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// STEP 1: Fetch all public routes
async function fetchRoutes() {
  // This is where the AI Agent customizes queries.
  // Example: Using a `pages` table.
  const { data: pages, error } = await supabase
    .from('pages')
    .select('slug, updated_at, is_public')
    .eq('is_public', true);

  if (error) throw error;

  return (pages ?? []).map((p: any) => ({
    loc: `${SITE_URL}/${p.slug}`,
    lastmod: p.updated_at,
  }));
}

// STEP 2: Convert routes → XML
function buildXml(routes: { loc: string; lastmod?: string }[]) {
  const urlset = routes
    .map((r) => {
      const lastmod = r.lastmod ? `<lastmod>${new Date(r.lastmod).toISOString()}</lastmod>` : '';

      return `  <url>\n    <loc>${r.loc}</loc>\n${lastmod ? `    ${lastmod}\n` : ''}  </url>`;
    })
    .join('\n');

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${urlset}\n` +
    `</urlset>`
  );
}

// STEP 3: Save to storage
async function writeXml(xml: string) {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload('sitemap.xml', new TextEncoder().encode(xml), {
      upsert: true,
      contentType: 'application/xml',
    });

  if (error) throw error;
}

// STEP 4: Optional – mark jobs processed
async function clearJobs() {
  await supabase.from('sitemap_jobs').update({ status: 'processed' }).neq('status', 'processed');
}

// SERVER ENTRYPOINT
serve(async () => {
  try {
    const routes = await fetchRoutes();
    const xml = buildXml(routes);
    await writeXml(xml);
    await clearJobs();

    return new Response(JSON.stringify({ success: true, count: routes.length }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
    });
  }
});
```

---

## 6. How the AI Agent Should Verify Everything Works

Before finalizing the setup, the AI Agent must:

### 6.1 Validate Trigger Behavior

- Insert a public page → sitemap_jobs should get a job.
- Update slug → trigger fires.
- Delete → trigger fires.

### 6.2 Validate Edge Function Behavior

- Run the function manually from dashboard.
- Confirm sitemap.xml appears in the chosen bucket.
- Confirm the XML is valid and loads in the browser.
- Confirm jobs are marked processed.

### 6.3 Ensure Hosting Layer Serves sitemap.xml

The website should either:

- Proxy `/sitemap.xml` to the Supabase Storage URL, **or**
- Pull sitemap.xml during its build pipeline into `/public/sitemap.xml`.

### 6.4 Ensure No Endpoint Is Exposed

No slow dynamic routes like `/api/sitemap` should exist.
Only the **static XML file** should be accessible.

---

## 7. Optional Enhancements

### 7.1 Multi-Sitemap Support

For >50k pages, generate:

- `sitemap.xml` linking to…
- `sitemap-pages.xml`
- `sitemap-posts.xml`
- `sitemap-categories.xml`.

### 7.2 Priority Tagging

Use AI classification to set `<priority>` based on:

- Content type
- Update frequency
- Traffic rankings

### 7.3 Ping Search Engines (Optional)

AI Agent may add calls to:

- Google Search Console API
- Bing Webmaster Tools API

Only if credentials are provided.

---

## 8. Summary

This system:

- Auto-detects content changes.
- Uses SQL triggers to enqueue sitemap jobs.
- Uses a Supabase Edge Function to rebuild a **real static** sitemap.xml.
- Stores the sitemap in a durable location.
- Keeps search engines happy with fast access and no waiting.

This file should be updated as your website evolves and as new AI workflow patterns emerge.
