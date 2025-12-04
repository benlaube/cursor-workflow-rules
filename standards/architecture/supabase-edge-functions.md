# When_to_use_Supabase_Edge_Functions_v1.0

## Metadata

- **Created:** 2025-11-18
- **Last Updated:** 2025-11-18
- **Version:** 1.0
- **Description:** Guide for when to use Supabase Edge Functions, and how an AI Agent should implement sitemap.xml regeneration using Supabase triggers.

---

## 1. Purpose of This Document

This document explains:

1. **When Supabase Edge Functions are a good fit** versus when they are not.
2. **How an AI Agent should architect and implement** Supabase Edge Functions and database triggers that regenerate a **real `sitemap.xml` file** whenever public site structure or relevant page data changes.

Version: **v1.0**

---

## 2. Conceptual Overview: What Are Supabase Edge Functions Good At?

Supabase Edge Functions are **serverless functions** that run close to your Supabase database. They excel when you need:

- Logic that runs **close to the database** (low latency, RLS-aware, using service-role keys securely).
- A **small, well-defined HTTP API** without building a full backend service.
- **Secure, secret-holding operations** (OpenAI calls, external APIs) where the frontend should not see API keys.
- **Webhooks and event bridges** (Stripe → Edge → DB, etc.).
- **Short-lived jobs** that don’t require long-running streaming conversations.

They are **not** ideal for:

- Complex multi-step conversational AI flows.
- Very long-running or heavy jobs.
- Fancy streaming UX (typing effects, multi-agent loops) that belong in a dedicated backend with richer logging and control.

---

## 3. When to Use Supabase Edge Functions (v1.0)

### 3.1 Recommended Use Cases

A1. **AI-CRM & Data Enrichment**

- Normalize contact data, addresses, and company names.
- Enrich CRM records with additional attributes.
- Classify and validate data (e.g., personal vs work email, lead type, tags).
- Batch-process rows in a segment (e.g., run enrichment on all new contacts in the last 24 hours).

Why Edge Functions are good here:

- They run **close to Supabase**, can use **service-role keys**, and respect **RLS**.
- Jobs can be **triggered by database events** (insert/update) or scheduled.
- They don’t require live, user-facing streaming.

---

A2. **Webhooks & Event Bridges**

- Consume events from external systems (Stripe, Notion, your AI tools, etc.).
- Validate and transform payloads.
- Write results into Supabase tables.

Here, Edge Functions act as a **glue layer** between external systems and the database.

---

A3. **One-off Backend Utilities**

- Verify signatures.
- Run server-side validation.
- Transform or aggregate data.

This keeps your main backend slimmer and pushes tight, DB-centric logic closer to Supabase.

---

A4. **Lightweight AI Tasks (No Fancy UX)**

- Single-shot classification, summarization, or scoring.
- No need for real-time streaming to the user.

Example: Label all new blog posts with 2–3 SEO categories or content types.

### 3.2 When Not to Use Edge Functions

B1. **Interactive AI Chat with Streaming UX**

- Multi-step conversations.
- Multi-agent orchestration loops.
- Live "typing" effect for users.

These belong in the **main backend** (e.g., Next/Node) where you have better control, logging, and error handling. Edge Functions can support these flows (e.g., for enrichment) but should not be the primary orchestration brain.

---

B2. **Long-Running or Complex Workflows**

- Multi-stage content pipelines (draft → review → variants → final → publish).
- Multi-agent workflows with retries and backoff.
- Processes that might exceed edge timeouts.

Use:

- Your primary backend as the orchestrator, plus
- Supabase tables (job queues, statuses), and
- Optional Edge Functions as worker-like helpers.

---

B3. **Heavy File Processing**

- Large PDFs, complex media transformations.
- CPU- or memory-heavy AI tasks.

These are often better handled by dedicated workers (containers, background queues) to avoid running into resource/timeout issues on the edge.

---

## 4. High-Level Patterns for AI Interactions

### 4.1 Backend-Centric Pattern (Default for Complex Apps)

C1. Frontend → Main Backend API → OpenAI (streaming allowed here).
C2. Backend reads/writes Supabase directly (client SDK or MCP).
C3. Edge Functions are used **only where they add value**, not as the main orchestrator.

---

### 4.2 Database-Triggered Content Engine Pattern

C4. Insert or update a job row in a `jobs` or `content_tasks` table.
C5. Supabase **trigger or webhook** calls an Edge Function when a suitable change is detected.
C6. Edge Function performs work (AI enrichment, transformation) and writes results back.
C7. A follow-up process (another trigger, scheduled task, or orchestrator) advances the job status.

This is a great fit for **Content Engine** flows and CRM enrichment.

---

## 5. Sitemap Regeneration with Supabase Triggers & Edge Functions

### 5.1 Goals & Constraints

- Generate a **real, static `sitemap.xml` file**, not a slow on-demand endpoint.
- Regenerate this file **whenever public-facing page structure changes**, e.g.:
  - New page published.
  - Existing page's slug or visibility changes.
  - Relevant SEO fields change (last modified, priority, etc.).
- Avoid making search engines wait for the sitemap to be built.
- Let an **AI Agent implement this automatically** by inspecting the database schema and generating:
  - A Supabase Edge Function that creates the `sitemap.xml` content.
  - Supabase triggers or webhook logic that call this function when necessary.

### 5.2 AI Agent – Discovery & Design Checklist

When the AI Agent sets this up, it should follow this logical sequence:

D1. **Identify the Core Page Tables**

- Look for tables that represent public pages, e.g.:
  - `pages`, `posts`, `articles`, `docs`, `routes`, `navigation`, etc.
- If there are multiple, the agent should:
  - Determine which are **public-facing** (e.g., have `is_published`, `is_public`, `status = 'published'`).
  - Determine which fields define:
    - URL/slug (e.g., `slug`, `path`, `url_segment`).
    - Last modified timestamp (`updated_at`, `modified_at`, etc.).
    - Optional SEO-related data (e.g., `changefreq`, `priority`, `canonical_url`).

> **Comment:** The AI Agent should **not hardcode table names if avoidable**. It can infer from naming conventions and, if available, project docs or a `public_pages`/`routes` meta table.

D2. **Determine the Public Base URL**

- The sitemap must use **absolute URLs**.
- The AI Agent should look for environment variables or config like:
  - `SITE_URL`, `NEXT_PUBLIC_SITE_URL`, `PUBLIC_BASE_URL`, or a `settings`/`config` table.
- If a base URL is not found, the agent should:
  - Add logic to **read it from a `settings` table** it creates (e.g., `site_settings` with a `base_url` column), or
  - Fallback to a **placeholder** and leave a comment explaining that it must be updated.

> **Comment:** Never ship a sitemap with `localhost` or blank base URLs in production. If uncertain, the AI Agent should default to a safe placeholder and mark clearly in comments.

D3. **Choose the Storage Location for `sitemap.xml`**

- Preferred pattern: Store `sitemap.xml` in **Supabase Storage** in a bucket dedicated to public assets, e.g. `public-assets`.
- The website hosting layer (Next.js, etc.) can:
  - Either serve `/sitemap.xml` by proxying to the storage URL, or
  - Pull the file during build/deploy and place it in the actual public folder.

> **Comment:** Direct filesystem writes from an Edge Function will usually **not** end up in your app’s public folder. Storage bucket or a deploy hook pattern is more reliable.

D4. **Define the Regeneration Trigger Conditions**

For each relevant table (`pages`, `posts`, etc.), the AI Agent should:

- Create **AFTER INSERT**, **AFTER UPDATE**, and optionally **AFTER DELETE** triggers when:
  - A row becomes `published` / `is_public = true`.
  - A row’s URL/slug changes.
  - A row is unpublished or deleted (should be removed from the sitemap).
- The trigger should:
  - Insert a row into a small `sitemap_jobs` table **OR**
  - Directly call an HTTP request (e.g., via a webhook) to the Edge Function’s endpoint.

**Recommended pattern (more flexible):**

- Use a `sitemap_jobs` table to decouple DB events from function calls, e.g.:

```sql
CREATE TABLE IF NOT EXISTS sitemap_jobs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  triggered_at timestamptz NOT NULL DEFAULT now(),
  reason      text NOT NULL,
  status      text NOT NULL DEFAULT 'pending'
);
```

- Triggers simply insert a `pending` job row with a reason like `page_created`, `page_updated`, or `page_deleted`.
- The Edge Function can either:
  - Be invoked via an external scheduler (cron) that checks for `pending` jobs, or
  - Be called immediately via a webhook/HTTP request on each trigger (if traffic is low).

> **Comment:** The job-table pattern prevents over-triggering and makes it easy to batch changes when many pages are updated at once.

### 5.3 Edge Function – Sitemap Generation Logic (Heavily Commented)

Below is **pseudocode-style TypeScript** for the AI Agent to follow. It should adapt names to the actual project schema.

```ts
// File: supabase/functions/generate_sitemap/index.ts
// v1.0 – Example Edge Function to generate sitemap.xml

import { serve } from 'https://deno.land/std/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// NOTE: The AI Agent should ensure these environment variables
// are set in the Supabase project configuration.
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SITE_BASE_URL = Deno.env.get('SITE_URL') ?? 'https://example.com'; // <-- AI should try to discover or document this
const SITEMAP_BUCKET = Deno.env.get('SITEMAP_BUCKET') ?? 'public-assets'; // bucket where sitemap.xml will be stored

// Create a service-role client so we can read everything needed
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Helper to fetch all public pages/posts from relevant tables
async function fetchPublicRoutes() {
  // COMMENT: This is a placeholder query. The AI Agent must adapt this
  // to match the real table names and columns. For example, if the project
  // has `pages` and `posts` tables, it should:
  //  - Query both tables separately
  //  - Map them into a unified array of routes

  // Example for a single `pages` table:
  const { data, error } = await supabase
    .from('pages')
    .select('slug, updated_at, is_public')
    .eq('is_public', true);

  if (error) {
    console.error('Error fetching pages for sitemap', error);
    throw error;
  }

  return (data ?? []).map((row: any) => ({
    loc: `${SITE_BASE_URL}/${row.slug}`,
    lastmod: row.updated_at,
  }));
}

function buildSitemapXml(routes: { loc: string; lastmod?: string }[]): string {
  // COMMENT: sitemap.xml must be valid XML and use absolute URLs.
  // lastmod is optional but recommended.

  const urlset = routes
    .map((route) => {
      const lastmodTag = route.lastmod
        ? `<lastmod>${new Date(route.lastmod).toISOString()}</lastmod>`
        : '';

      return `  <url>\n    <loc>${route.loc}</loc>\n${lastmodTag ? `    ${lastmodTag}\n` : ''}  </url>`;
    })
    .join('\n');

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${urlset}\n` +
    `</urlset>`
  );
}

async function writeSitemapToStorage(xml: string) {
  // COMMENT: This writes the sitemap.xml file into a Supabase Storage bucket.
  // The AI Agent must ensure the bucket exists and is publicly accessible
  // (or exposed via some proxy/route in the hosting layer).

  const { data, error } = await supabase.storage
    .from(SITEMAP_BUCKET)
    .upload('sitemap.xml', new TextEncoder().encode(xml), {
      upsert: true, // overwrite existing sitemap.xml
      contentType: 'application/xml',
    });

  if (error) {
    console.error('Error writing sitemap.xml to storage', error);
    throw error;
  }

  return data;
}

serve(async (req) => {
  try {
    // COMMENT: Optionally, you can restrict which callers can invoke this function
    // (e.g., require a secret header, or only allow a specific internal client).

    const routes = await fetchPublicRoutes();
    const xml = buildSitemapXml(routes);
    await writeSitemapToStorage(xml);

    // Optionally, update sitemap_jobs table to mark jobs as completed
    // if you are using the job-queue pattern.

    return new Response(JSON.stringify({ success: true, routesCount: routes.length }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Failed to generate sitemap.xml', err);
    return new Response(JSON.stringify({ success: false, error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
```

> **AI Agent Comment:** When implementing this for a real project, **do not** leave placeholder table names. The agent must:
>
> - Inspect the database schema (via Supabase tools/MCP).
> - Identify the correct "public page" tables and columns.
> - Update the `fetchPublicRoutes` logic accordingly.

### 5.4 Example Trigger Logic (SQL, Heavily Commented)

Below is a pattern using a `sitemap_jobs` table.

```sql
-- v1.0 – Example SQL for sitemap job table and trigger

-- 1) Job table to record that we need a sitemap refresh
CREATE TABLE IF NOT EXISTS sitemap_jobs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  triggered_at timestamptz NOT NULL DEFAULT now(),
  reason       text NOT NULL,
  status       text NOT NULL DEFAULT 'pending'
);


-- 2) Function to enqueue a sitemap job when a page changes
CREATE OR REPLACE FUNCTION enqueue_sitemap_job(reason text)
RETURNS void AS $$
BEGIN
  INSERT INTO sitemap_jobs (reason) VALUES (reason);
END;
$$ LANGUAGE plpgsql;


-- 3) Trigger function specifically for the `pages` table
CREATE OR REPLACE FUNCTION pages_sitemap_trigger()
RETURNS trigger AS $$
BEGIN
  -- COMMENT: Decide when to queue a sitemap job.
  -- We care about:
  --   - Inserts where the new row is public.
  --   - Updates where visibility or slug changes.
  --   - Deletes of public rows.

  IF (TG_OP = 'INSERT') THEN
    IF NEW.is_public = true THEN
      PERFORM enqueue_sitemap_job('page_inserted');
    END IF;

  ELSIF (TG_OP = 'UPDATE') THEN
    -- visibility changed OR slug changed
    IF (NEW.is_public IS DISTINCT FROM OLD.is_public)
       OR (NEW.slug IS DISTINCT FROM OLD.slug) THEN
      PERFORM enqueue_sitemap_job('page_updated');
    END IF;

  ELSIF (TG_OP = 'DELETE') THEN
    IF OLD.is_public = true THEN
      PERFORM enqueue_sitemap_job('page_deleted');
    END IF;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;


-- 4) Attach trigger to the pages table
CREATE TRIGGER pages_sitemap_trigger
AFTER INSERT OR UPDATE OR DELETE ON pages
FOR EACH ROW
EXECUTE FUNCTION pages_sitemap_trigger();
```

> **AI Agent Comment:**
>
> - For other tables that contribute to public URLs (e.g., `posts`, `categories` that are part of the path), the AI Agent should create similar triggers.
> - If the site uses a more complex route system, consider a central `routes` or `public_routes` table and attach triggers there instead.

### 5.5 Invoking the Edge Function from Jobs

The AI Agent can choose one of these patterns:

E1. **External Scheduler / Cron**

- A scheduled job calls the `generate_sitemap` Edge Function if there are `pending` jobs in `sitemap_jobs`.
- After a successful run, all `pending` jobs can be marked as `processed`.

E2. **Immediate Invocation on Each Job**

- Another Edge Function or backend process listens for job inserts (via webhook or polling) and calls `generate_sitemap` immediately.
- Suitable for low to moderate traffic when you want fast sitemap updates.

> **Comment:** The AI Agent should consider **rate-limiting** sitemap regenerations if the content management UI can cause many changes in a short time.

## 6. Summary for the AI Agent

F1. Use **Supabase Edge Functions** primarily for:

- AI-CRM enrichment and validation.
- DB-centric, short-lived AI jobs.
- Webhooks and event bridges.
- Sitemap and similar generated-file workflows that are triggered by DB changes.

F2. Keep **multi-agent orchestration and streaming** in the main backend.

F3. For `sitemap.xml` regeneration:

- Detect relevant public page tables and columns.
- Use triggers to enqueue sitemap jobs on insert/update/delete.
- Implement a dedicated Edge Function to:
  - Read all public routes.
  - Build valid XML with absolute URLs.
  - Write `sitemap.xml` to a predictable location (Supabase Storage or deploy pipeline).

F4. Comment the generated code heavily so future developers (and future AI Agents) understand:

- What tables and columns are used.
- How the sitemap is built.
- How triggers decide when to regenerate.
- How the hosting layer serves the final `sitemap.xml` file to crawlers.
