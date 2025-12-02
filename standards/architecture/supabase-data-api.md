# Supabase_Data_API_PostgREST_Guide_v1.0

## Metadata
- **Created:** 2025-01-27
- **Last Updated:** 2025-01-27
- **Version:** 1.0
- **Description:** Comprehensive guide to Supabase's auto-generated REST API endpoints via PostgREST

---

## 1. Overview

**Key Insight:** Supabase automatically generates REST API endpoints for every table in your database schema. You don't need to write custom API routes for basic CRUD operations.

### 1.1 What is PostgREST?

PostgREST is a web server that turns your PostgreSQL database directly into a RESTful API. Supabase uses PostgREST under the hood to provide auto-generated endpoints.

### 1.2 Auto-Generated Endpoints

When you create a table in Supabase, REST endpoints are automatically available:

```
Table: posts
↓
Auto-generated endpoints:
- GET    /rest/v1/posts          # List all posts
- GET    /rest/v1/posts?id=eq.1  # Get single post
- POST   /rest/v1/posts          # Create post
- PATCH  /rest/v1/posts?id=eq.1  # Update post
- DELETE /rest/v1/posts?id=eq.1  # Delete post
```

**No code required!** The endpoints exist as soon as the table is created.

---

## 2. Workflow for AI Agents

### 2.1 Standard Workflow

```
1. Create Database Schema (migrations)
   ↓
2. Supabase Auto-Generates REST Endpoints
   ↓
3. Use Endpoints Directly or via JavaScript Client
   ↓
4. No Need to Write Custom API Routes for Basic CRUD
```

### 2.2 When to Use Data API vs Custom API Routes

**Use Data API (PostgREST) for:**
- ✅ Simple CRUD operations
- ✅ Filtering, sorting, pagination
- ✅ Relationship queries (joins)
- ✅ Any operation that maps directly to database queries

**Use Custom API Routes for:**
- ❌ Complex business logic
- ❌ Multi-step operations
- ❌ External API integrations
- ❌ Custom validation beyond database constraints
- ❌ Operations requiring multiple database calls with transactions

---

## 3. Endpoint Structure

### 3.1 Base URL

```
Production: https://<project-ref>.supabase.co/rest/v1/
Local:      http://localhost:54321/rest/v1/
```

### 3.2 Standard Endpoints

For a table named `posts`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/rest/v1/posts` | List all posts (respects RLS) |
| `GET` | `/rest/v1/posts?id=eq.1` | Get post with id=1 |
| `POST` | `/rest/v1/posts` | Create new post |
| `PATCH` | `/rest/v1/posts?id=eq.1` | Update post with id=1 |
| `DELETE` | `/rest/v1/posts?id=eq.1` | Delete post with id=1 |

### 3.3 Authentication

All endpoints require authentication headers:

```bash
# Using anon key (client-side, respects RLS)
Authorization: Bearer <SUPABASE_ANON_KEY>
apikey: <SUPABASE_ANON_KEY>

# Using user JWT (authenticated requests)
Authorization: Bearer <USER_JWT_TOKEN>
apikey: <SUPABASE_ANON_KEY>
```

**Important:** RLS policies automatically apply based on the JWT token.

---

## 4. Query Parameters

### 4.1 Select (Column Selection)

Choose which columns to return:

```bash
# Select specific columns
GET /rest/v1/posts?select=id,title,content

# Select all columns (default)
GET /rest/v1/posts?select=*

# Select with nested relationships
GET /rest/v1/posts?select=*,author:users(*)
```

### 4.2 Filtering

Filter rows using operators:

```bash
# Equality
?id=eq.1                    # id equals 1
?status=eq.published         # status equals 'published'

# Comparison
?created_at=gt.2024-01-01    # created_at greater than
?views=gte.100              # views greater than or equal
?price=lt.50                # price less than
?age=lte.65                 # age less than or equal

# Pattern matching
?title=like.*hello*         # title contains 'hello'
?email=ilike.*@gmail.com    # email case-insensitive like

# Array operators
?tags=cs.{javascript,react} # tags contains any of these
?tags=cd.{javascript,react} # tags contains all of these

# Null checks
?deleted_at=is.null         # deleted_at is null
?deleted_at=not.is.null     # deleted_at is not null

# Multiple filters (AND)
?id=eq.1&status=eq.published
```

**Operators:**
- `eq` - equals
- `neq` - not equals
- `gt` - greater than
- `gte` - greater than or equal
- `lt` - less than
- `lte` - less than or equal
- `like` - pattern match (case-sensitive)
- `ilike` - pattern match (case-insensitive)
- `is` - null check
- `in` - value in array
- `cs` - contains (for arrays/JSONB)
- `cd` - contained by (for arrays/JSONB)

### 4.3 Ordering

Sort results:

```bash
# Single column
?order=created_at.desc      # Descending
?order=created_at.asc       # Ascending (default)

# Multiple columns
?order=status.asc,created_at.desc

# Nulls handling
?order=updated_at.desc.nullsfirst
?order=updated_at.desc.nullslast
```

### 4.4 Pagination

Limit and offset:

```bash
# Limit results
?limit=10

# Offset (skip records)
?offset=20

# Combined (page 3, 10 per page)
?limit=10&offset=20
```

**Note:** For better performance, use `range` header instead of `offset` for large datasets.

### 4.5 Counting

Get total count:

```bash
# Get count only
?select=*&limit=0           # Returns count in Content-Range header

# Get data + count
Prefer: count=exact
```

---

## 5. Relationship Queries (Joins)

### 5.1 Foreign Key Relationships

Query related tables:

```bash
# Get posts with author information
GET /rest/v1/posts?select=*,author:users(*)

# Get users with their posts
GET /rest/v1/users?select=*,posts:posts(*)

# Nested relationships
GET /rest/v1/posts?select=*,author:users(*,profile:profiles(*))
```

### 5.2 Many-to-Many Relationships

```bash
# Posts with tags (through junction table)
GET /rest/v1/posts?select=*,post_tags:post_tags(*,tag:tags(*))
```

---

## 6. Using the Data API

### 6.1 Direct REST (Any HTTP Client)

```bash
# Using curl
curl -X GET 'https://project.supabase.co/rest/v1/posts?select=*' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

```javascript
// Using fetch
const response = await fetch('https://project.supabase.co/rest/v1/posts?select=*', {
  headers: {
    'apikey': 'YOUR_ANON_KEY',
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'Content-Type': 'application/json',
  },
})
const data = await response.json()
```

### 6.2 JavaScript Client (Recommended)

The `@supabase/supabase-js` client uses PostgREST endpoints under the hood:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// This uses: GET /rest/v1/posts?select=*
const { data } = await supabase.from('posts').select('*')

// This uses: GET /rest/v1/posts?id=eq.1&select=*
const { data: post } = await supabase
  .from('posts')
  .select('*')
  .eq('id', 1)
  .single()

// This uses: POST /rest/v1/posts
const { data: newPost } = await supabase
  .from('posts')
  .insert({ title: 'New Post', content: '...' })
```

**Both approaches use the same endpoints!** The JavaScript client is a convenience wrapper.

---

## 7. RLS Integration

### 7.1 Automatic RLS Enforcement

RLS policies automatically apply to all Data API requests:

```sql
-- RLS policy
CREATE POLICY "Users can only see their own posts"
ON posts FOR SELECT
USING (user_id = auth.uid());
```

```bash
# This request automatically filters by user_id
GET /rest/v1/posts
# Only returns posts where user_id = current_user_id
```

### 7.2 Service Role Key (Bypasses RLS)

**⚠️ WARNING:** Using `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS. Only use server-side!

```bash
# Bypasses RLS (use with caution!)
Authorization: Bearer <SERVICE_ROLE_KEY>
```

---

## 8. Examples

### 8.1 Complete CRUD Example

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// CREATE
const { data: newPost } = await supabase
  .from('posts')
  .insert({
    title: 'My First Post',
    content: 'Hello world!',
    user_id: userId,
  })
  .select()
  .single()

// READ (List)
const { data: posts } = await supabase
  .from('posts')
  .select('*,author:users(*)')
  .eq('status', 'published')
  .order('created_at', { ascending: false })
  .limit(10)

// READ (Single)
const { data: post } = await supabase
  .from('posts')
  .select('*,author:users(*)')
  .eq('id', postId)
  .single()

// UPDATE
const { data: updatedPost } = await supabase
  .from('posts')
  .update({ title: 'Updated Title' })
  .eq('id', postId)
  .select()
  .single()

// DELETE
const { error } = await supabase
  .from('posts')
  .delete()
  .eq('id', postId)
```

### 8.2 Advanced Filtering

```typescript
// Complex filters
const { data } = await supabase
  .from('posts')
  .select('*')
  .eq('status', 'published')
  .gte('created_at', '2024-01-01')
  .or('tags.cs.{javascript},tags.cs.{react}')
  .order('views', { ascending: false })
  .limit(20)
  .offset(0)
```

### 8.3 Relationship Queries

```typescript
// Get post with author and comments
const { data } = await supabase
  .from('posts')
  .select(`
    *,
    author:users(*),
    comments:comments(*,author:users(*))
  `)
  .eq('id', postId)
  .single()
```

---

## 9. Error Handling

### 9.1 Standard Error Format

```json
{
  "message": "Error message",
  "code": "PGRST116",
  "details": "Additional details",
  "hint": "Helpful hint"
}
```

### 9.2 Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| `PGRST116` | Not found | Check if record exists |
| `PGRST204` | No rows returned | Check filters |
| `PGRST301` | Invalid filter | Check query syntax |
| `42501` | RLS policy violation | Check RLS policies |

---

## 10. Performance Tips

### 10.1 Use Select Wisely

```typescript
// ❌ Bad: Selects all columns
.select('*')

// ✅ Good: Select only needed columns
.select('id,title,created_at')
```

### 10.2 Use Indexes

Ensure filtered columns have indexes:

```sql
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_user_id ON posts(user_id);
```

### 10.3 Limit Results

Always use `.limit()` for list queries:

```typescript
// ✅ Good
.select('*').limit(20)

// ❌ Bad: Could return thousands of rows
.select('*')
```

### 10.4 Use Range Header for Pagination

For large datasets, use `range` header instead of `offset`:

```typescript
// Better for large datasets
.range(0, 19)  // First 20 records
```

---

## 11. AI Agent Instructions

### 11.1 When Creating Database Schema

**Remember:** Every table automatically gets REST endpoints. No need to create custom API routes for basic CRUD.

**Workflow:**
1. Create table via migration
2. Set up RLS policies
3. Endpoints are immediately available at `/rest/v1/table_name`
4. Use JavaScript client or direct REST calls

### 11.2 When to Use Data API vs Custom Routes

**Use Data API when:**
- Simple CRUD operations
- Standard filtering/sorting/pagination
- Relationship queries
- Operations that map 1:1 to database queries

**Create Custom API Routes when:**
- Complex business logic
- Multi-step operations
- External API calls
- Custom validation beyond DB constraints
- Operations requiring transactions across multiple tables

### 11.3 Example: Blog Post System

```typescript
// ✅ Use Data API for:
// - Listing posts
// - Getting single post
// - Creating post
// - Updating post
// - Deleting post

// ❌ Create Custom Route for:
// - Publishing post (updates multiple tables, sends notifications)
// - Bulk operations
// - Complex search with ranking
```

---

## 12. Related Documentation

- `standards/architecture/supabase-ai-agent-guide.md` - General Supabase guide
- `standards/architecture/supabase-ssr-api-routes.md` - SSR integration
- `modules/backend-api/` - Custom API route handler (for complex operations)
- `standards/database/schema.md` - Database schema standards

---

*Last Updated: 2025-01-27*

