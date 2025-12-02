# Blog Engine Module

## Metadata
- **Module:** blog-engine
- **Version:** 1.0.0
- **Created:** 2025-01-27
- **Last Updated:** 2025-01-27
- **Description:** A complete, database-backed blog system for Supabase with full CRUD operations, relations, and optimized queries

## What It Does

This module provides a production-ready blog engine built on Supabase that handles:

- **Content Management** - Create, read, update, and delete blog posts
- **Author Management** - Associate posts with authors and manage author profiles
- **Taxonomy** - Organize content with categories (hierarchical) and tags (flat)
- **Status Workflow** - Draft, published, and archived post states
- **Optimized Queries** - Efficient database queries with joins and pagination

The module is designed to work seamlessly with the `backend-api` module for Next.js API routes and integrates with Supabase's Row Level Security (RLS) for access control.

## Features

- ✅ **Full CRUD Operations** - Create, Read, Update, Delete posts
- ✅ **Author Relations** - Link posts to authors with profile information
- ✅ **Category System** - Hierarchical categories for content organization
- ✅ **Tag System** - Flat tag structure for cross-linking content
- ✅ **Status Workflow** - Draft, published, and archived states
- ✅ **Pagination** - Efficient pagination for post listings
- ✅ **Optimized Queries** - Database queries with joins for performance
- ✅ **Type Safety** - Full TypeScript support with type definitions
- ✅ **RLS Support** - Works with Supabase Row Level Security policies

## Installation

### 1. Copy the Module

Copy this entire folder to your project:

```bash
cp -r modules/blog-engine /path/to/your/project/src/modules/blog-engine
```

### 2. Run Database Migrations

Run the SQL migration in your Supabase SQL Editor:

```sql
-- Copy and run the contents of migrations/schema.sql
-- This creates:
-- - authors table
-- - categories table (hierarchical)
-- - tags table (flat)
-- - posts table
-- - junction tables (post_tags, post_categories)
-- - RLS policies
-- - Triggers for updated_at
```

**Important:** Customize the RLS policies in `migrations/schema.sql` to match your access control requirements.

### 3. Install Dependencies

```bash
npm install @supabase/supabase-js
```

**Note:** This module uses `supabase-core-typescript` for client creation. Ensure you have it available or use the standard Supabase client.

## Quick Start

### 1. Create Supabase Client

```typescript
import { createClient } from '@supabase/supabase-js';
// Or use supabase-core-typescript
import { createClient } from '@/lib/supabase-core-typescript';
```

### 2. Initialize Blog Service

```typescript
import { BlogService } from '@/modules/blog-engine';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const blogService = new BlogService(supabase);
```

### 3. Use the Service

```typescript
// Get a post by slug
const post = await blogService.getPostBySlug('my-first-post');

// List posts with pagination
const { data, meta } = await blogService.listPosts({ 
  page: 1, 
  limit: 10,
  status: 'published'
});
```

## Usage

### Get Post by Slug

Fetch a single post with all relations (author, categories, tags):

```typescript
const post = await blogService.getPostBySlug('my-first-post');

if (post) {
  console.log(post.title);
  console.log(post.author?.name);
  console.log(post.categories);
  console.log(post.tags);
} else {
  console.log('Post not found');
}
```

### List Posts

List posts with pagination and filtering:

```typescript
// Basic listing
const { data, meta } = await blogService.listPosts({
  page: 1,
  limit: 10
});

// Filter by status
const { data: drafts } = await blogService.listPosts({
  status: 'draft',
  page: 1,
  limit: 20
});

// Access pagination metadata
console.log(`Page ${meta.page} of ${meta.totalPages}`);
console.log(`Total posts: ${meta.total}`);
console.log(`Has next page: ${meta.hasNext}`);
```

### Create Post (Direct Database)

The module currently provides read operations. For create/update/delete, you can use Supabase directly:

```typescript
// Create a post
const { data, error } = await supabase
  .from('posts')
  .insert({
    slug: 'my-new-post',
    title: 'My New Post',
    content: { blocks: [] }, // JSON content
    status: 'draft',
    author_id: authorId
  })
  .select()
  .single();

// Add tags
await supabase
  .from('post_tags')
  .insert([
    { post_id: data.id, tag_id: tagId1 },
    { post_id: data.id, tag_id: tagId2 }
  ]);
```

### Integration with Backend API

Use with the `backend-api` module for Next.js API routes:

```typescript
// app/api/posts/route.ts
import { createApiHandler } from '@/lib/backend-api';
import { BlogService } from '@/modules/blog-engine';

export const GET = createApiHandler({
  querySchema: z.object({
    page: z.coerce.number().default(1),
    limit: z.coerce.number().default(10),
    status: z.enum(['draft', 'published', 'archived']).optional()
  }),
  requireAuth: false, // Public endpoint
  handler: async ({ input, ctx }) => {
    const blogService = new BlogService(ctx.auth?.supabase || supabase);
    return await blogService.listPosts(input);
  }
});

// app/api/posts/[slug]/route.ts
export const GET = createApiHandler({
  requireAuth: false,
  handler: async ({ ctx, params }) => {
    const blogService = new BlogService(ctx.auth?.supabase || supabase);
    const post = await blogService.getPostBySlug(params.slug);
    
    if (!post) {
      throw new AppError('Post not found', 'NOT_FOUND', 404);
    }
    
    return post;
  }
});
```

## API Reference

### BlogService Class

#### `getPostBySlug(slug: string): Promise<BlogPost | null>`

Fetches a single post by slug with all relations.

**Parameters:**
- `slug` - Post slug (unique identifier)

**Returns:**
- `BlogPost | null` - Post with author, categories, and tags, or null if not found

**Example:**
```typescript
const post = await blogService.getPostBySlug('my-post');
```

#### `listPosts(options?: PostListOptions): Promise<{ data: BlogPost[], meta: PaginationMeta }>`

Lists posts with pagination and filtering.

**Parameters:**
- `options` - Optional configuration:
  - `status?: 'draft' | 'published' | 'archived'` - Filter by status
  - `page?: number` - Page number (default: 1)
  - `limit?: number` - Items per page (default: 10)

**Returns:**
- `{ data: BlogPost[], meta: PaginationMeta }` - Posts and pagination metadata

**Example:**
```typescript
const { data, meta } = await blogService.listPosts({
  page: 1,
  limit: 10,
  status: 'published'
});
```

### Type Definitions

#### `BlogPost`

```typescript
interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  content?: any; // JSON or string
  featured_image?: string;
  status: 'draft' | 'published' | 'archived';
  published_at?: string;
  author_id?: string;
  created_at: string;
  updated_at: string;
  
  // Relations (populated by getPostBySlug)
  author?: Author;
  tags?: Tag[];
  categories?: Category[];
}
```

#### `PostListOptions`

```typescript
interface PostListOptions {
  status?: 'draft' | 'published' | 'archived';
  tag?: string; // tag slug
  category?: string; // category slug
  author?: string; // author slug
  page?: number;
  limit?: number;
}
```

## Database Schema

The module uses the following database schema (see `migrations/schema.sql`):

### Tables

- **authors** - Author profiles with bio, avatar, social links
- **categories** - Hierarchical categories (supports parent_id)
- **tags** - Flat tag structure
- **posts** - Main content table with status workflow
- **post_tags** - Junction table for post-tag relationships
- **post_categories** - Junction table for post-category relationships

### Enums

- **content_status** - `'draft' | 'published' | 'archived'`

### RLS Policies

The schema includes example RLS policies:
- Public can view published posts
- Admins can do everything (customize based on your role system)

**Important:** Customize RLS policies to match your access control requirements.

## Integration

### With Supabase Core TypeScript

Use with `supabase-core-typescript` for enhanced features:

```typescript
import { createServerClient } from '@/lib/supabase-core-typescript';
import { BlogService } from '@/modules/blog-engine';

const supabase = await createServerClient();
const blogService = new BlogService(supabase);
```

### With Backend API Module

Create API routes using the `backend-api` module:

```typescript
// See "Integration with Backend API" section above
```

### With Sitemap Module

Generate sitemaps for published posts:

```typescript
import { SitemapGenerator } from '@/modules/sitemap-module';
import { BlogService } from '@/modules/blog-engine';

const blogService = new BlogService(supabase);
const { data: posts } = await blogService.listPosts({ status: 'published' });

const routes = posts.map(post => ({
  loc: `https://example.com/blog/${post.slug}`,
  lastmod: post.updated_at,
  priority: 0.8
}));

const generator = new SitemapGenerator({ siteUrl: 'https://example.com' });
await generator.generateAndUpload(routes);
```

## Related Documentation

- `modules/backend-api/` - API handler module for Next.js routes
- `modules/supabase-core-typescript/` - Supabase utilities
- `modules/sitemap-module/` - Sitemap generation
- `standards/database/schema.md` - Database schema standards
- `standards/security/access-control.md` - RLS and security standards

## Possible Enhancements

### Short-term Improvements

- **Create/Update/Delete Methods** - Add `createPost()`, `updatePost()`, `deletePost()` methods to BlogService
- **Search Functionality** - Full-text search with PostgreSQL GIN indexes
- **Filter by Tag/Category** - Implement filtering in `listPosts()` method
- **Author Filtering** - Filter posts by author slug
- **Featured Posts** - Add `featured` flag and filtering
- **View Counts** - Track and display post view counts

### Medium-term Enhancements

- **Draft Revisions** - Save and restore post revisions/history
- **Scheduled Publishing** - Support `publish_at` timestamp for scheduled posts
- **SEO Metadata** - Add meta_title, meta_description, og_image fields
- **Reading Time** - Calculate and store reading time
- **Related Posts** - Algorithm to suggest related posts
- **Content Blocks** - Rich content editor with block-based content
- **Image Management** - Integration with Supabase Storage for featured images

### Long-term Enhancements

- **Multi-language Support** - Internationalization with language variants
- **Content Versioning** - Full version control for posts
- **Content Scheduling** - Advanced scheduling with timezone support
- **Analytics Integration** - View counts, engagement metrics, popular posts
- **Comment System** - Built-in commenting with moderation
- **Content Import/Export** - Import from WordPress, Medium, etc.
- **API Rate Limiting** - Built-in rate limiting for API endpoints
- **Caching Layer** - Redis-based caching for popular posts
- **CDN Integration** - Automatic CDN invalidation on content updates
