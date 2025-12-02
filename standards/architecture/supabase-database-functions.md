# Supabase_Database_Functions_Guide_v1.0

## Metadata
- **Created:** 2025-01-27
- **Last Updated:** 2025-01-27
- **Version:** 1.0
- **Description:** Guide for when and how to use PostgreSQL database functions vs Supabase Edge Functions

---

## 1. Overview

Supabase provides two ways to execute server-side logic:
1. **PostgreSQL Database Functions** - SQL/PL/pgSQL functions that run in the database
2. **Supabase Edge Functions** - Deno-based serverless functions

This guide helps you decide which to use and how to implement database functions.

---

## 2. Decision Tree: Database Functions vs Edge Functions

```
Need server-side logic?
├─ Yes
│  ├─ Simple data transformation/validation?
│  │  ├─ Yes → Use Database Function
│  │  └─ No → Continue
│  ├─ Needs external API calls?
│  │  ├─ Yes → Use Edge Function
│  │  └─ No → Continue
│  ├─ Needs complex business logic?
│  │  ├─ Yes → Use Edge Function
│  │  └─ No → Continue
│  ├─ Needs to run on every row (trigger)?
│  │  ├─ Yes → Use Database Function
│  │  └─ No → Continue
│  ├─ Needs to be called from SQL/triggers?
│  │  ├─ Yes → Use Database Function
│  │  └─ No → Continue
│  └─ Needs TypeScript/JavaScript libraries?
│     ├─ Yes → Use Edge Function
│     └─ No → Use Database Function
```

### 2.1 Quick Reference

| Use Case | Solution | Why |
|----------|----------|-----|
| Data validation on insert | Database Function | Runs automatically via trigger |
| Calculate derived values | Database Function | Fast, runs in database |
| Send email notification | Edge Function | Needs external API |
| Transform data format | Database Function | Simple, efficient |
| Call OpenAI API | Edge Function | External API, needs HTTP |
| Audit logging | Database Function | Trigger-based, automatic |
| Complex multi-step workflow | Edge Function | Better error handling, logging |
| Full-text search | Database Function | PostgreSQL built-in |
| Image processing | Edge Function | Needs external libraries |
| RLS helper functions | Database Function | Used in policies, must be SQL |

---

## 3. When to Use Database Functions

### 3.1 ✅ Ideal Use Cases

1. **Trigger Functions** - Logic that runs automatically on data changes
   - Profile sync on user creation
   - Audit logging
   - Calculated fields
   - Data validation

2. **RLS Helper Functions** - Functions used in RLS policies
   - `current_tenant_id()` - Get tenant from JWT
   - `is_admin()` - Check user role
   - `user_has_permission()` - Permission checks

3. **Data Transformation** - Simple data manipulation
   - Format phone numbers
   - Normalize email addresses
   - Calculate aggregates

4. **Performance-Critical Operations** - Operations that benefit from running in database
   - Complex queries with joins
   - Aggregations
   - Full-text search

5. **Database-Only Operations** - Operations that don't need external services
   - Data validation
   - Computed columns
   - Cascading updates

### 3.2 Example: Trigger Function

```sql
-- Function to sync profile on user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 4. When to Use Edge Functions

### 4.1 ✅ Ideal Use Cases

1. **External API Calls** - Need to call third-party services
   - Send emails (SendGrid, Resend)
   - Call OpenAI API
   - Webhook integrations
   - Payment processing (Stripe)

2. **Complex Business Logic** - Multi-step workflows
   - Multi-agent AI workflows
   - Complex data enrichment
   - Multi-service orchestration

3. **TypeScript/JavaScript Libraries** - Need npm packages
   - Image processing libraries
   - PDF generation
   - Data parsing libraries

4. **Long-Running Operations** - Operations that might timeout
   - Large file processing
   - Batch operations
   - Data imports

5. **Custom HTTP Endpoints** - Need custom API endpoints
   - Webhook receivers
   - Custom API routes
   - Integration endpoints

### 4.2 Example: Edge Function

```typescript
// supabase/functions/enrich-contact/index.ts
import { serve } from "https://deno.land/std/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const { contact_id } = await req.json()
  
  // Call external API
  const enrichment = await fetch('https://api.enrichment-service.com', {
    method: 'POST',
    body: JSON.stringify({ contact_id }),
  })
  
  // Update database
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  await supabase
    .from('contacts')
    .update({ enriched_data: await enrichment.json() })
    .eq('id', contact_id)
  
  return new Response(JSON.stringify({ success: true }))
})
```

---

## 5. Database Function Patterns

### 5.1 Security: SECURITY DEFINER vs SECURITY INVOKER

**SECURITY DEFINER:** Function runs with privileges of the function owner (usually postgres).

```sql
-- Use when function needs elevated privileges
CREATE OR REPLACE FUNCTION public.set_user_role(user_id uuid, new_role text)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET role = new_role
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; -- Runs as postgres user
```

**SECURITY INVOKER (default):** Function runs with privileges of the caller.

```sql
-- Use for normal operations (respects RLS)
CREATE OR REPLACE FUNCTION public.get_user_posts(user_id uuid)
RETURNS TABLE(id uuid, title text) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.title
  FROM public.posts p
  WHERE p.user_id = get_user_posts.user_id;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER; -- Runs as current user
```

**Best Practice:** Use `SECURITY DEFINER` only when necessary (e.g., bypassing RLS for admin operations). Always validate inputs.

### 5.2 RLS Helper Functions

Functions used in RLS policies must be `IMMUTABLE` or `STABLE`:

```sql
-- Get current tenant from JWT (used in RLS policies)
CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS uuid AS $$
BEGIN
  RETURN (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid;
END;
$$ LANGUAGE plpgsql IMMUTABLE; -- Result doesn't change within a query

-- Check if user is admin (used in RLS policies)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin';
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

**Important:** Functions used in RLS policies must be marked `IMMUTABLE` or `STABLE` for performance.

### 5.3 Trigger Functions

Functions that run automatically on data changes:

```sql
-- Audit log trigger function
CREATE OR REPLACE FUNCTION public.log_activity()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.activity_log (
    table_name,
    record_id,
    action,
    old_data,
    new_data,
    actor_id
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP, -- 'INSERT', 'UPDATE', 'DELETE'
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
    auth.uid()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply to all tables (example for posts)
CREATE TRIGGER posts_activity_log
  AFTER INSERT OR UPDATE OR DELETE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.log_activity();
```

### 5.4 Data Validation Functions

Functions that validate data before insert/update:

```sql
-- Validate email format
CREATE OR REPLACE FUNCTION public.validate_email(email text)
RETURNS boolean AS $$
BEGIN
  RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Use in check constraint
ALTER TABLE public.profiles
ADD CONSTRAINT valid_email CHECK (public.validate_email(email));
```

### 5.5 Computed/Calculated Fields

Functions that calculate derived values:

```sql
-- Calculate post reading time
CREATE OR REPLACE FUNCTION public.calculate_reading_time(content text)
RETURNS integer AS $$
BEGIN
  -- Assume 200 words per minute
  RETURN GREATEST(1, (length(content) / 5) / 200);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Use in generated column
ALTER TABLE public.posts
ADD COLUMN reading_time integer
GENERATED ALWAYS AS (public.calculate_reading_time(content)) STORED;
```

---

## 6. Calling Database Functions

### 6.1 From JavaScript Client

```typescript
import { createClient } from '@/modules/supabase-core'

const supabase = createClient()

// Call function that returns data
const { data, error } = await supabase.rpc('get_user_stats', {
  user_id: userId,
})

// Call function that performs action
const { error } = await supabase.rpc('set_user_role', {
  user_id: userId,
  new_role: 'admin',
})
```

### 6.2 From SQL/Triggers

```sql
-- Call from trigger
CREATE TRIGGER update_timestamp
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Call from another function
CREATE OR REPLACE FUNCTION public.process_order(order_id uuid)
RETURNS void AS $$
BEGIN
  -- Call helper function
  PERFORM public.validate_order(order_id);
  PERFORM public.calculate_total(order_id);
  PERFORM public.update_inventory(order_id);
END;
$$ LANGUAGE plpgsql;
```

### 6.3 From Edge Functions

```typescript
// supabase/functions/process-order/index.ts
const { data, error } = await supabase.rpc('process_order', {
  order_id: orderId,
})
```

---

## 7. Function Security Best Practices

### 7.1 Input Validation

Always validate inputs in functions:

```sql
CREATE OR REPLACE FUNCTION public.set_user_role(user_id uuid, new_role text)
RETURNS void AS $$
BEGIN
  -- Validate inputs
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'user_id cannot be null';
  END IF;
  
  IF new_role NOT IN ('admin', 'member', 'viewer') THEN
    RAISE EXCEPTION 'Invalid role: %', new_role;
  END IF;
  
  -- Perform operation
  UPDATE public.profiles
  SET role = new_role
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 7.2 Permission Checks

Even with `SECURITY DEFINER`, check permissions:

```sql
CREATE OR REPLACE FUNCTION public.delete_tenant(tenant_id uuid)
RETURNS void AS $$
DECLARE
  current_user_role text;
BEGIN
  -- Get current user's role
  current_user_role := auth.jwt() -> 'app_metadata' ->> 'role';
  
  -- Check permission
  IF current_user_role != 'super_admin' THEN
    RAISE EXCEPTION 'Only super admins can delete tenants';
  END IF;
  
  -- Perform deletion
  DELETE FROM public.tenants WHERE id = delete_tenant.tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 7.3 SQL Injection Prevention

Use parameterized queries (PostgreSQL does this automatically):

```sql
-- ✅ Good: Parameters are automatically escaped
CREATE OR REPLACE FUNCTION public.get_user_by_email(email_param text)
RETURNS TABLE(id uuid, email text) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email
  FROM auth.users u
  WHERE u.email = email_param; -- Safe: parameterized
END;
$$ LANGUAGE plpgsql;

-- ❌ Bad: String concatenation (don't do this)
-- WHERE u.email = ' || email_param || '; -- Vulnerable to SQL injection
```

---

## 8. Testing Database Functions

### 8.1 Unit Testing in SQL

```sql
-- Test function
DO $$
DECLARE
  result boolean;
BEGIN
  -- Test case 1: Valid email
  result := public.validate_email('test@example.com');
  IF result != true THEN
    RAISE EXCEPTION 'Test failed: valid email should return true';
  END IF;
  
  -- Test case 2: Invalid email
  result := public.validate_email('invalid-email');
  IF result != false THEN
    RAISE EXCEPTION 'Test failed: invalid email should return false';
  END IF;
  
  RAISE NOTICE 'All tests passed!';
END;
$$;
```

### 8.2 Integration Testing

```typescript
// tests/database-functions.test.ts
import { createServiceRoleClient } from '@/modules/supabase-core'

describe('Database Functions', () => {
  it('should validate email correctly', async () => {
    const supabase = createServiceRoleClient()
    
    const { data, error } = await supabase.rpc('validate_email', {
      email: 'test@example.com',
    })
    
    expect(error).toBeNull()
    expect(data).toBe(true)
  })
})
```

---

## 9. Common Patterns

### 9.1 Pattern: Auto-Update Timestamps

```sql
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
```

### 9.2 Pattern: Soft Delete

```sql
CREATE OR REPLACE FUNCTION public.soft_delete_record()
RETURNS trigger AS $$
BEGIN
  -- Instead of deleting, set deleted_at
  UPDATE public.posts
  SET deleted_at = now()
  WHERE id = OLD.id;
  
  RETURN NULL; -- Prevent actual deletion
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER soft_delete_posts
  BEFORE DELETE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.soft_delete_record();
```

### 9.3 Pattern: Enqueue Job

```sql
CREATE OR REPLACE FUNCTION public.enqueue_job(job_type text, payload jsonb)
RETURNS uuid AS $$
DECLARE
  job_id uuid;
BEGIN
  INSERT INTO public.jobs (type, payload, status)
  VALUES (job_type, payload, 'pending')
  RETURNING id INTO job_id;
  
  RETURN job_id;
END;
$$ LANGUAGE plpgsql;

-- Use in trigger
CREATE TRIGGER enqueue_sitemap_job
  AFTER INSERT OR UPDATE ON public.pages
  FOR EACH ROW
  EXECUTE FUNCTION public.pages_sitemap_trigger();
```

---

## 10. AI Agent Instructions

### 10.1 When to Create Database Functions

Create a database function when:
- ✅ Logic needs to run automatically (triggers)
- ✅ Logic is used in RLS policies
- ✅ Simple data transformation/validation
- ✅ Performance-critical operations
- ✅ Logic is database-only (no external APIs)

### 10.2 When to Create Edge Functions

Create an Edge Function when:
- ✅ Needs external API calls
- ✅ Needs TypeScript/JavaScript libraries
- ✅ Complex multi-step workflows
- ✅ Custom HTTP endpoints needed
- ✅ Long-running operations

### 10.3 Function Creation Checklist

When creating a database function:
- [ ] Determine if it should be `SECURITY DEFINER` or `SECURITY INVOKER`
- [ ] Add input validation
- [ ] Add permission checks (if `SECURITY DEFINER`)
- [ ] Mark as `IMMUTABLE` or `STABLE` if used in RLS
- [ ] Add comments explaining purpose
- [ ] Test with various inputs
- [ ] Document parameters and return type

### 10.4 Function Template

```sql
-- Function: <function_name>
-- Description: <what it does>
-- Parameters: <list parameters>
-- Returns: <return type>
-- Security: <SECURITY DEFINER/INVOKER>
-- Dependencies: <list dependencies>

CREATE OR REPLACE FUNCTION public.<function_name>(<parameters>)
RETURNS <return_type> AS $$
DECLARE
  -- Variable declarations
BEGIN
  -- Input validation
  IF <condition> THEN
    RAISE EXCEPTION '<error message>';
  END IF;
  
  -- Function logic
  <logic>
  
  -- Return result
  RETURN <result>;
END;
$$ LANGUAGE plpgsql <SECURITY DEFINER|INVOKER> <IMMUTABLE|STABLE|VOLATILE>;

COMMENT ON FUNCTION public.<function_name> IS '<description>';
```

---

## 11. Related Documentation

- `standards/architecture/supabase-edge-functions.md` - Edge Functions guide
- `standards/database/schema.md` - Database schema standards
- `modules/auth-profile-sync/profile-sync.sql` - Example trigger function
- `modules/sitemap-module/migrations/sitemap-schema.sql` - Example job queue function

---

*Last Updated: 2025-01-27*

