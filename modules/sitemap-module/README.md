# Sitemap Module

A standardized module for generating and uploading `sitemap.xml` files to Supabase Storage, with automatic regeneration triggered by content changes.

## Features

- ✅ **Automatic Generation** - Database triggers detect content changes and queue sitemap regeneration
- ✅ **Edge Function Integration** - Supabase Edge Function processes jobs and generates sitemap
- ✅ **Storage Upload** - Automatically uploads to Supabase Storage for fast serving
- ✅ **Standard XML Format** - Generates valid sitemap.xml with `lastmod`, `changefreq`, and `priority` tags
- ✅ **Next.js Integration** - Examples for serving sitemap in Next.js applications

## Quick Start

### Basic Usage

```typescript
import { SitemapGenerator } from './modules/sitemap-module';

const generator = new SitemapGenerator({
  siteUrl: 'https://example.com',
  bucketName: 'public-assets' // default
});

// 1. Fetch your data (from DB, CMS, etc)
const pages = await db.query('SELECT slug, updated_at FROM pages');

// 2. Map to routes
const routes = pages.map(p => ({
  loc: `https://example.com/${p.slug}`,
  lastmod: p.updated_at,
  priority: 0.8
}));

// 3. Generate and Upload
await generator.generateAndUpload(routes);
```

### Automatic Regeneration Setup

For automatic sitemap regeneration when content changes:

1. **Apply Database Migration:**
   ```sql
   -- Run migrations/sitemap-schema.sql in Supabase SQL Editor
   ```

2. **Create Database Triggers:**
   ```sql
   CREATE TRIGGER pages_sitemap_trigger
   AFTER INSERT OR UPDATE OR DELETE ON public.pages
   FOR EACH ROW
   EXECUTE FUNCTION public.content_sitemap_trigger();
   ```

3. **Deploy Edge Function:**
   ```bash
   supabase functions deploy generate-sitemap
   ```

4. **Configure Next.js Serving:**
   - See `nextjs-route-example.ts` for implementation options

## Complete Documentation

- **`INTEGRATION_GUIDE.md`** - Step-by-step setup guide
- **`migrations/sitemap-schema.sql`** - Database schema and triggers
- **`supabase/functions/generate-sitemap/index.ts`** - Edge Function implementation
- **`nextjs-route-example.ts`** - Next.js serving examples
- **`standards/sitemap.md`** - Comprehensive architecture guide

## Architecture

```
Content Change → Database Trigger → Job Queue → Edge Function → Storage → Next.js
```

1. **Content changes** in database tables (pages, posts, etc.)
2. **Database triggers** detect changes and enqueue jobs
3. **Edge Function** processes jobs and generates sitemap.xml
4. **Sitemap uploaded** to Supabase Storage
5. **Next.js serves** sitemap via proxy or static file

## Dependencies

- `@supabase/supabase-js` - Supabase client library
- Supabase Storage bucket (for storing sitemap.xml)
- Supabase Edge Functions (for automatic generation)

## Related Documentation

- `standards/sitemap.md` - Full architecture and design guide
- `standards/seo-automation.md` - SEO automation standards

