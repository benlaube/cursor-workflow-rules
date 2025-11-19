# Blog & CMS Architecture Standard v1.0

## Metadata
- **Created:** 2025-11-19
- **Version:** 1.0
- **Scope:** Marketing sites, Documentation hubs, Knowledge bases

## 1. Overview
This standard defines the database schema, content workflow, and API patterns for a robust content management system (CMS) built on Supabase and Next.js.

### Core Goals
1.  **SEO-First**: Metadata, sitemaps, and structured data are first-class citizens.
2.  **Performance**: Static generation (SSG/ISR) compatibility.
3.  **Relational**: Rich taxonomy (categories, tags) and authorship.
4.  **Workflow**: Clear separation between `draft` and `published` states.

## 2. Database Schema

### 2.1 Core Tables

#### `posts`
The central content table.
- `id` (uuid, PK)
- `slug` (text, unique): URL-friendly identifier (e.g., `my-first-post`).
- `title` (text): H1 title.
- `excerpt` (text): Short summary for cards/previews.
- `content` (jsonb): The body content (MDX or ProseMirror JSON).
- `featured_image` (text): URL to Supabase Storage.
- `status` (enum): `'draft' | 'published' | 'archived'`.
- `published_at` (timestamptz): Date visible to public.
- `author_id` (uuid, FK): Link to `authors`.
- `seo_metadata_id` (uuid, FK): Link to `seo_metadata` (see `seo-automation.md`).

#### `authors`
Content creators and contributors.
- `id` (uuid, PK)
- `name` (text)
- `slug` (text, unique)
- `bio` (text)
- `avatar_url` (text)
- `social_links` (jsonb): `{ twitter: "...", linkedin: "..." }`.

#### `categories` & `tags` (Taxonomy)
- `categories`: Hierarchical (optional `parent_id`). Used for URL structure (e.g., `/blog/engineering/react`).
- `tags`: Flat. Used for cross-linking (e.g., `#performance`, `#database`).

### 2.2 Relationships
- **One-to-Many**: Author -> Posts.
- **Many-to-Many**: Posts <-> Tags (via `post_tags` junction table).
- **Many-to-Many**: Posts <-> Categories (via `post_categories` junction table).

## 3. Content Workflow

### 3.1 Editorial Lifecycle
1.  **Draft**: Only visible to admins/editors. `published_at` is null or future.
2.  **Scheduled**: `status = 'published'` but `published_at` is in the future.
3.  **Published**: `status = 'published'` AND `published_at <= NOW()`.
4.  **Archived**: `status = 'archived'`. Visible but hidden from lists/sitemaps.

### 3.2 Revalidation (Next.js ISR)
To ensure high performance, use On-Demand Revalidation.
- **Trigger**: Database Webhook on `posts` table (UPDATE/INSERT).
- **Action**: Call Next.js API route `/api/revalidate?secret=...&path=/blog/[slug]`.

## 4. API & Service Layer

### 4.1 Data Fetching
Don't write raw SQL in components. Use a Service class.

```typescript
// Get single post with relations
const post = await blogService.getPostBySlug('my-slug', {
  withAuthor: true,
  withTags: true,
  withSeo: true // Joins seo_metadata table
});

// List for index page
const posts = await blogService.listPosts({
  status: 'published',
  limit: 10,
  page: 1
});
```

### 4.2 SEO Integration
The `posts` table MUST integrate with the `seo-automation.md` standard.
- When a post is created, trigger the SEO generation job.
- The `seo_metadata` table stores the AI-generated Meta Title/Description.
- The Blog UI component must fetch and render this metadata into the `<head>`.

## 5. Migration Guide
When implementing this module:
1.  Run the `modules/blog-engine/schema.sql` migration.
2.  Copy the `BlogService` class to your `services/` folder.
3.  Set up the Revalidation Webhook in Supabase Dashboard.

