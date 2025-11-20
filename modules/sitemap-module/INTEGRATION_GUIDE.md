# Sitemap Automation Integration Guide v1.0

Description: Complete step-by-step guide for integrating automatic sitemap generation into your project.
Created: 2025-01-27
Last_Updated: 2025-01-27

---

## 1. Overview

This guide walks you through setting up automatic sitemap generation that:
- Detects content changes in your database
- Triggers sitemap regeneration automatically
- Stores sitemap.xml in Supabase Storage
- Serves it via Next.js

**Version:** v1.0

---

## 2. Prerequisites

- Supabase project set up
- Content tables (pages, posts, etc.) with public/private status
- Supabase Storage bucket created
- Next.js application (or similar)

---

## 3. Step-by-Step Setup

### Step 1: Apply Database Migration

1. Open Supabase Dashboard > SQL Editor
2. Copy contents of `modules/sitemap-module/migrations/sitemap-schema.sql`
3. Run the migration
4. Verify `sitemap_jobs` table was created

### Step 2: Create Storage Bucket

1. Go to Supabase Dashboard > Storage
2. Create bucket named `public-assets` (or your preferred name)
3. Set bucket to **Public** (so sitemap.xml is accessible)
4. Note the bucket name for Edge Function configuration

### Step 3: Configure Edge Function

1. **Deploy Edge Function:**
   ```bash
   # Copy Edge Function to your Supabase project
   cp -r modules/sitemap-module/supabase/functions/generate-sitemap supabase/functions/generate-sitemap
   
   # Deploy
   supabase functions deploy generate-sitemap
   ```

2. **Set Environment Variables:**
   - Go to Supabase Dashboard > Edge Functions > Settings
   - Add environment variables:
     - `SITE_URL` - Your site's base URL (e.g., `https://yourapp.com`)
     - `SITEMAP_BUCKET` - Storage bucket name (default: `public-assets`)
     - `SITEMAP_FILENAME` - Filename (default: `sitemap.xml`)

3. **Update Function Code:**
   - Edit `supabase/functions/generate-sitemap/index.ts`
   - Adjust `fetchRoutes()` function to match your table schema
   - Update table names, column names, and route generation logic

### Step 4: Create Database Triggers

1. **Identify Content Tables:**
   - List tables that should trigger sitemap regeneration
   - Examples: `pages`, `posts`, `articles`, `docs`

2. **Create Triggers:**
   ```sql
   -- Example for 'pages' table
   CREATE TRIGGER pages_sitemap_trigger
   AFTER INSERT OR UPDATE OR DELETE ON public.pages
   FOR EACH ROW
   EXECUTE FUNCTION public.content_sitemap_trigger();
   
   -- Example for 'posts' table
   CREATE TRIGGER posts_sitemap_trigger
   AFTER INSERT OR UPDATE OR DELETE ON public.posts
   FOR EACH ROW
   EXECUTE FUNCTION public.content_sitemap_trigger();
   ```

3. **Verify Triggers:**
   - Insert a test record in your content table
   - Check `sitemap_jobs` table for a new pending job

### Step 5: Set Up Edge Function Webhook (Optional)

**Option A: Manual Trigger**
- Call Edge Function manually when needed
- Use Supabase Dashboard > Edge Functions > Invoke

**Option B: Cron Job (Recommended)**
- Set up a cron job to call the Edge Function periodically
- Use Supabase Cron or external service (e.g., Vercel Cron)

**Option C: Database Webhook (Advanced)**
- Use Supabase Database Webhooks to call Edge Function on `sitemap_jobs` insert
- Configure webhook in Supabase Dashboard > Database > Webhooks

### Step 6: Configure Next.js Serving

Choose one approach:

**Option A: Proxy to Storage (Recommended)**
- See `modules/sitemap-module/nextjs-route-example.ts`
- Proxies `/sitemap.xml` to Supabase Storage URL

**Option B: Build-Time Fetch**
- Fetch sitemap during build
- Save to `public/sitemap.xml`
- Served as static file

---

## 4. Customization

### 4.1 Adjust Route Generation

Edit `fetchRoutes()` in Edge Function:

```typescript
// Example: Custom route format
routes.push({
  loc: `${SITE_URL}/custom/${page.custom_path}`,
  lastmod: page.updated_at,
  changefreq: "weekly",
  priority: 0.9,
})
```

### 4.2 Add Multiple Content Types

```typescript
// Fetch from multiple tables
const pages = await fetchPages()
const posts = await fetchPosts()
const products = await fetchProducts()

const routes = [...pages, ...posts, ...products]
```

### 4.3 Custom Priority Logic

```typescript
// Set priority based on content type or metadata
const priority = page.is_featured ? 1.0 : 0.8
routes.push({
  loc: `${SITE_URL}/${page.slug}`,
  priority,
})
```

---

## 5. Testing

### 5.1 Test Database Triggers

```sql
-- Insert test content
INSERT INTO pages (slug, is_public, title) 
VALUES ('test-page', true, 'Test Page');

-- Check job was created
SELECT * FROM sitemap_jobs WHERE status = 'pending';
```

### 5.2 Test Edge Function

1. Go to Supabase Dashboard > Edge Functions
2. Click "Invoke" on `generate-sitemap`
3. Check response for success
4. Verify `sitemap.xml` appears in Storage bucket

### 5.3 Test Sitemap Access

1. Get public URL from Storage bucket
2. Open in browser: `https://<project-ref>.supabase.co/storage/v1/object/public/public-assets/sitemap.xml`
3. Verify XML is valid and contains expected routes

---

## 6. Troubleshooting

### "No routes found"

**Issue:** `fetchRoutes()` returns empty array.

**Solution:**
- Check table names match your schema
- Verify column names (slug, is_public, etc.)
- Check RLS policies allow service role to read

### "Storage upload failed"

**Issue:** Edge Function can't upload to Storage.

**Solution:**
- Verify bucket exists and is public
- Check service role key has Storage permissions
- Verify bucket name in environment variables

### "Triggers not firing"

**Issue:** Content changes don't create jobs.

**Solution:**
- Verify triggers are attached to correct tables
- Check trigger function `content_sitemap_trigger()` exists
- Test trigger manually: `SELECT enqueue_sitemap_job('test')`

### "Jobs not processing"

**Issue:** Jobs stay in 'pending' status.

**Solution:**
- Verify Edge Function is being called (check logs)
- Check Edge Function environment variables
- Verify function has database access

---

## 7. Monitoring

### 7.1 Check Job Status

```sql
-- View recent jobs
SELECT * FROM sitemap_jobs 
ORDER BY triggered_at DESC 
LIMIT 10;

-- Check for failed jobs
SELECT * FROM sitemap_jobs 
WHERE status = 'failed';
```

### 7.2 Monitor Edge Function Logs

- Go to Supabase Dashboard > Edge Functions > Logs
- Check for errors or warnings
- Monitor execution time

### 7.3 Verify Sitemap Updates

- Check `sitemap.xml` last modified time in Storage
- Compare with content update times
- Verify routes match current content

---

## 8. Best Practices

1. **Debounce Rapid Changes** - Migration includes 1-minute debounce to prevent excessive regeneration
2. **Batch Processing** - Process multiple jobs at once to reduce function calls
3. **Error Handling** - Failed jobs are marked with error messages for debugging
4. **Static Serving** - Always serve static XML file, never generate on-demand
5. **Regular Monitoring** - Check job status and function logs regularly

---

## 9. Related Documentation

- `modules/sitemap-module/README.md` - Module overview
- `standards/sitemap.md` - Comprehensive sitemap architecture guide
- `modules/sitemap-module/nextjs-route-example.ts` - Next.js serving examples

---

*Last Updated: 2025-01-27*

