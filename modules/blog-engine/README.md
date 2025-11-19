# Blog Engine Module

A complete, database-backed blog system for Supabase.

## Features
- **Full CRUD**: Create, Read, Update, Delete posts.
- **Relations**: Authors, Categories, and Tags.
- **Performance**: Optimized SQL queries with joins.

## Dependencies
- `@supabase/supabase-js`
- Postgres Database (Supabase)

## Installation

1. **Copy the Module**:
   Copy this entire folder to your project's `src/modules/blog-engine`.

2. **Run Migrations**:
   Run the SQL in `migrations/schema.sql` in your Supabase SQL Editor.

3. **Install Dependencies**:
   ```bash
   npm install @supabase/supabase-js
   ```

## Usage

```typescript
import { createClient } from '@supabase/supabase-js';
import { BlogService } from './modules/blog-engine';

const supabase = createClient('URL', 'KEY');
const blogService = new BlogService(supabase);

// Get a post
const post = await blogService.getPostBySlug('my-first-post');

// List posts
const { data, meta } = await blogService.listPosts({ page: 1, limit: 5 });
```
