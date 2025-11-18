# Sitemap Module

A standardized module for generating and uploading `sitemap.xml` files to Supabase Storage.

## Usage

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

## Features
- Generates standard XML sitemap format
- Uploads directly to Supabase Storage
- Supports `lastmod`, `changefreq`, and `priority` tags

