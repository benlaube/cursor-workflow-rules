# Sitemap_Auto_Generation_with_Supabase_Triggers_and_Edge_Functions_v1.0

Description: Comprehensive guide detailing how an AI Agent should design, implement, and maintain automatic sitemap.xml regeneration using Supabase database triggers and Edge Functions.
Created: 2025-11-18 16:25
Last_Updated: 2025-11-18 16:25

---

## 1. Purpose of This Document

This guide teaches an AI Agent *exactly* how to:

1. Detect page structure changes in Supabase database tables.
2. Trigger a Supabase Edge Function automatically.
3. Rebuild a **real static sitemap.xml file**.
4. Store that sitemap where search engines can reliably—and instantly—access it.
5. Avoid exposing any slow, “generate-on-request” sitemap endpoints.

The goal: **Every time public-facing content changes, the XML file updates instantly without manual deployment.**

---

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

If unknown, use a placeholder `"https://example.com"` *with a comment warning*.

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

import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Pull required environment variables
// The AI Agent should ensure these exist.
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SITE_URL = Deno.env.get("SITE_URL") ?? "https://example.com"; // fallback warning
const BUCKET = Deno.env.get("SITEMAP_BUCKET") ?? "public-assets";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// STEP 1: Fetch all public routes
async function fetchRoutes() {
  // This is where the AI Agent customizes queries.
  // Example: Using a `pages` table.
  const { data: pages, error } = await supabase
    .from("pages")
    .select("slug, updated_at, is_public")
    .eq("is_public", true);

  if (error) throw error;

  return (pages ?? []).map((p: any) => ({
    loc: `${SITE_URL}/${p.slug}`,
    lastmod: p.updated_at
  }));
}

// STEP 2: Convert routes → XML
function buildXml(routes: { loc: string; lastmod?: string }[]) {
  const urlset = routes
    .map((r) => {
      const lastmod = r.lastmod
        ? `<lastmod>${new Date(r.lastmod).toISOString()}</lastmod>`
        : "";

      return `  <url>\n    <loc>${r.loc}</loc>\n${lastmod ? `    ${lastmod}\n` : ""}  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${urlset}\n` +
    `</urlset>`;
}

// STEP 3: Save to storage
async function writeXml(xml: string) {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload("sitemap.xml", new TextEncoder().encode(xml), {
      upsert: true,
      contentType: "application/xml"
    });

  if (error) throw error;
}

// STEP 4: Optional – mark jobs processed
async function clearJobs() {
  await supabase
    .from("sitemap_jobs")
    .update({ status: "processed" })
    .neq("status", "processed");
}

// SERVER ENTRYPOINT
serve(async () => {
  try {
    const routes = await fetchRoutes();
    const xml = buildXml(routes);
    await writeXml(xml);
    await clearJobs();

    return new Response(
      JSON.stringify({ success: true, count: routes.length }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500
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


---

## v1.1 – Advanced Enhancements & Improvements

This section expands the v1.0 architecture into a production‑grade, Google‑bot‑optimized sitemap automation system. These improvements should be implemented by the AI Agent in any project where SEO matters or where the site’s content model becomes more complex.

### 1. Schema Discovery Protocol (New)
The AI Agent must follow a repeatable workflow to identify sitemap‑relevant tables:

1. Inspect Supabase schema (MCP or metadata).
2. Identify candidate tables by naming conventions:
   - `pages`, `posts`, `articles`, `routes`, `navigation`, `locations`, `properties`, etc.
3. Identify key fields:
   - URL fields: `slug`, `path`, `url`, `permalink`.
   - Publish flags: `is_public`, `status`, `visibility`.
   - Last modified: `updated_at`, `modified_at`.
4. Detect nested routing:
   - `parent_id` relationships.
   - Category folders.
   - Dynamic segments.

The Agent may ask for clarification if multiple competing route tables exist.

---

### 2. Robust Error Handling, Logging & Dead‑Letter Queues
To prevent silent sitemap failures:

- Log every regeneration attempt into a `system_logs` table.
- Track:
  - trigger source table
  - job ID
  - runtime duration
  - success/failure
  - error message (if any)
- Add a retry counter to `sitemap_jobs`:

```sql
ALTER TABLE sitemap_jobs ADD COLUMN retry_count int DEFAULT 0;
ALTER TABLE sitemap_jobs ADD COLUMN error_message text;
```

- If an error occurs more than 3 times:
  - Set `status = 'failed'`.
  - Notify admin or AI Agent.

---

### 3. Multi‑Sitemap Index Support
For large sites (> 50,000 URLs):

1. Split routes into logical buckets:
   - `sitemap-pages.xml`
   - `sitemap-posts.xml`
   - `sitemap-categories.xml`
   - `sitemap-properties.xml`

2. Generate a master index file:
```xml
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>https://example.com/sitemap-pages.xml</loc></sitemap>
  <sitemap><loc>https://example.com/sitemap-posts.xml</loc></sitemap>
</sitemapindex>
```

3. AI Agent must generate this index whenever any child sitemap is updated.

---

### 4. Canonical URL Logic (Dynamic, Nested, Hierarchical Routing)
The Agent must determine each page’s real URL:

- If a table has `parent_id`, recursively build the full path.
- If categories affect URL structure (e.g. `/guides/{category}/{slug}`), the agent must join tables.
- If `canonical_url` exists, always prefer it.

Example recursive model:
```ts
function buildPath(page) {
  if (!page.parent) return page.slug;
  return `${buildPath(page.parent)}/${page.slug}`;
}
```

---

### 5. Optional SEO Tags – priority, changefreq
If tables include SEO metadata:

- `<priority>` maps from numeric or heuristic values.
- `<changefreq>` maps from enums like `daily`, `weekly`, `monthly`.

If missing, omit from XML.

---

### 6. AI‑Assisted Dynamic Route Expansion
The Agent should automatically include implicit dynamic routes:

- `/blog/{slug}` for all posts
- `/category/{slug}`
- `/tag/{slug}`
- `/location/{city}` if a `cities` or `markets` table exists
- `/properties/{id}` or `{address}` for real estate

The Agent should:
- Detect patterns by inspecting Next.js/Remix route folders when possible
- Or infer them by table names

---

### 7. Sitemap Versioning and Rollback
Edge Function should:

- Write a snapshot version: `sitemap-YYYYMMDD-HHMM.xml`
- Keep the last 10 versions (configurable)
- Roll back by copying an earlier version if the latest sitemap fails validation

---

### 8. Automatic Sitemap Validation
Add an XML check:
- Validate well‑formed XML with a DOM parser
- Ensure each `<loc>` returns HTTP 200 (optional async check)
- Detect duplicates
- Detect sudden drops in URL count (SEO red flag)

If validation fails:
- Do not overwrite the production sitemap
- Mark job as `failed`
- Log error

---

### 9. Master “Force Regenerate” Command
Provide an override flag:
```
POST /generate_sitemap?force=true
```
This rebuilds everything from scratch.

---

### 10. Dependent Regeneration Logic
When certain tables affect routes indirectly:

Examples:
- Changing `category.slug` → all posts in that category must update URLs
- Renaming a parent page → all child pages must be regenerated

Agent should:
- Query the dependency graph
- Regenerate only affected URLs when possible (more efficient)
- Fall back to full regeneration when unsure

---

### 11. Debounce / Rate‑Limit Protection
Prevents triggering dozens of regeneration jobs during batch edits:

Suggested logic:
- When a job enters queue, set a `debounce_until = now() + interval '5 seconds'`
- Only process jobs after that window closes
- Group all pending jobs into a single regeneration

---

### 12. Final Recommendation for the AI Agent
Your sitemap architecture should now support:
- Multi‑table dynamic routing
- Nested URL structures
- Large‑scale sitemap indexes
- Error handling, logging, rollback
- Automated validation
- Rate‑limited trigger-driven regeneration

This ensures the sitemap remains highly reliable, SEO‑friendly, and future‑proof even as the project grows in complexity.

