# Supabase_Local_Installation_Setup_Guide_v1.0

## Metadata
- **Created:** 2025-01-27
- **Last Updated:** 2025-01-27
- **Version:** 1.0
- **Description:** Comprehensive guide for setting up Supabase locally for development, including container isolation rules for multi-project environments.

---

## 1. Purpose of This Document

This document provides step-by-step instructions for:
1. Installing and configuring Supabase CLI for local development
2. Initializing a Supabase project locally
3. Managing project-specific containers in multi-project environments
4. Configuring environment variables and database connections
5. Setting up Edge Functions, Storage, and migrations locally

**Version:** v1.0

---

## 2. Prerequisites

Before setting up Supabase locally, ensure you have:

- **Docker Desktop** installed and running (required for local Supabase stack)
- **Node.js** (v18 or later) or package manager (npm, pnpm, yarn)
- **Git** for version control
- **Terminal/Command Line** access

### 2.1 Verify Docker Installation

```bash
docker --version
docker ps  # Should run without errors
```

If Docker is not running, start Docker Desktop before proceeding.

---

## 3. Supabase CLI Installation

### 3.1 macOS Installation

```bash
brew install supabase/tap/supabase
```

### 3.2 Other Platforms (npm/pnpm)

```bash
# Using npm
npm install -g supabase

# Using pnpm
pnpm add -g supabase
```

### 3.3 Verify Installation

```bash
supabase --version
```

Expected output: `supabase version X.X.X` or similar.

---

## 4. Project Initialization

### 4.1 Initialize Supabase in Your Project

Navigate to your project root directory and run:

```bash
supabase init
```

This command creates:
- `supabase/` directory with project configuration
- `supabase/config.toml` - Main configuration file
- `supabase/migrations/` - Directory for database migrations
- `supabase/seed.sql` - Optional seed data file

### 4.2 Project-Specific Container Naming

When you run `supabase init`, Supabase automatically creates a project reference that identifies your containers. This ensures containers are isolated per project.

**Important:** The project reference is stored in `supabase/.temp/project-ref` and is used to name Docker containers with a unique identifier.

---

## 5. Local Stack Startup

### 5.1 Start Local Supabase Stack

```bash
supabase start
```

This command starts the following services:
- **API Gateway:** `http://localhost:54321`
- **Postgres Database:** `localhost:54322`
- **Auth Service:** Integrated in API Gateway
- **Storage Service:** Integrated in API Gateway
- **Edge Functions Runtime:** Integrated in API Gateway
- **Studio Dashboard:** `http://localhost:54323`

### 5.2 Verify Services Are Running

```bash
supabase status
```

This displays:
- Service URLs and ports
- API keys (anon and service_role)
- Database connection string
- Project reference ID

### 5.3 Container Isolation

**CRITICAL RULE:** Supabase CLI automatically manages project-specific containers. When you run `supabase start` in a project directory, it only affects containers for that specific project.

**Container Identification:**
- Containers are named with the project reference: `supabase_<project-ref>_<service>`
- Use `supabase status` to see your project's specific container names
- Never use broad Docker commands like `docker stop $(docker ps -q)` which would affect all containers

**Safe Container Management:**
```bash
# ✅ CORRECT: Stop only current project's containers
supabase stop

# ✅ CORRECT: View only current project's containers
supabase status

# ❌ NEVER: Stop all Docker containers
# docker stop $(docker ps -q)

# ✅ CORRECT: If you need to use Docker directly, filter by project
# First, get your project reference from supabase status
supabase status | grep "Project ID"
# Then filter containers by that reference
docker ps --filter "name=supabase_<project-ref>"
```

---

## 6. Environment Configuration

### 6.1 Retrieve Local Credentials

After starting Supabase, retrieve your local credentials:

```bash
supabase status
```

This outputs something like:
```
         API URL: http://localhost:54321
     GraphQL URL: http://localhost:54321/graphql/v1
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 6.2 Configure Environment Variables

Create or update `.env.local` (or `.env` for non-Next.js projects) with:

```bash
# Supabase Local Development Configuration
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=<your-anon-key-from-status>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key-from-status>
SUPABASE_DB_URL=postgresql://postgres:postgres@localhost:54322/postgres
SUPABASE_STORAGE_URL=http://localhost:54321/storage/v1
```

**Note:** Replace the placeholder values with actual keys from `supabase status`.

### 6.3 Switching Between Local and Remote

To switch between local and production Supabase:

1. **Local Development:** Use `.env.local` with local values
2. **Production:** Use production environment variables (set in hosting platform)
3. **Environment Detection:** Your application code should read from `process.env.SUPABASE_URL` which will automatically use the correct values based on the environment file loaded

---

## 7. Database Setup

### 7.1 Running Migrations

**Apply all pending migrations:**
```bash
supabase migration up
```

**Reset database and apply all migrations (destructive):**
```bash
supabase db reset
```

**Create a new migration:**
```bash
supabase migration new <migration-name>
```

This creates a new file in `supabase/migrations/` with a timestamp prefix.

### 7.2 Seeding Data

If you have seed data in `supabase/seed.sql`:

```bash
supabase db reset  # This also runs seed.sql
```

Or manually:
```bash
psql postgresql://postgres:postgres@localhost:54322/postgres -f supabase/seed.sql
```

### 7.3 Accessing Local Postgres Directly

**Using psql:**
```bash
psql postgresql://postgres:postgres@localhost:54322/postgres
```

**Using Database GUI:**
- Connect to: `localhost:54322`
- Database: `postgres`
- Username: `postgres`
- Password: `postgres`

**Using Supabase Studio:**
Navigate to `http://localhost:54323` and use the SQL Editor.

---

## 8. Edge Functions Development

### 8.1 Local Function Development

**Create a new Edge Function:**
```bash
supabase functions new <function-name>
```

This creates `supabase/functions/<function-name>/index.ts`.

**Serve functions locally:**
```bash
supabase functions serve
```

Functions will be available at `http://localhost:54321/functions/v1/<function-name>`

**Invoke a function:**
```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/<function-name>' \
  --header 'Authorization: Bearer <anon-key>' \
  --header 'Content-Type: application/json' \
  --data '{"name":"Functions"}'
```

### 8.2 Testing Functions Locally

1. Start Supabase: `supabase start`
2. Serve functions: `supabase functions serve` (in a separate terminal)
3. Test using curl, Postman, or your application code

### 8.3 Deploying to Local Instance

Functions are automatically available when you run `supabase start`. No separate deployment step is needed for local development.

---

## 9. Storage Configuration

### 9.1 Creating Buckets Locally

**Using Supabase Studio:**
1. Navigate to `http://localhost:54323`
2. Go to Storage section
3. Create a new bucket

**Using SQL (in migrations):**
```sql
-- Create a public bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('public-assets', 'public-assets', true);

-- Create a private bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('private-uploads', 'private-uploads', false);
```

### 9.2 Setting Up Storage Policies

Storage policies are managed via RLS (Row Level Security). Add policies in your migrations:

```sql
-- Allow public read access to public-assets bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'public-assets');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'private-uploads');
```

### 9.3 Testing File Uploads

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

// Upload a file
const { data, error } = await supabase.storage
  .from('public-assets')
  .upload('test-file.jpg', file)
```

---

## 10. Multi-Project Container Management (CRITICAL)

### 10.1 Container Isolation Rules

**When multiple projects use Supabase locally, each project must only affect its own containers.**

**✅ CORRECT Practices:**

1. **Always use Supabase CLI commands:**
   ```bash
   supabase start   # Starts only current project's containers
   supabase stop    # Stops only current project's containers
   supabase status  # Shows only current project's status
   ```

2. **If you must use Docker directly, filter by project:**
   ```bash
   # Get project reference first
   PROJECT_REF=$(cat supabase/.temp/project-ref 2>/dev/null || supabase status | grep "Project ID" | awk '{print $3}')
   
   # Filter containers by project
   docker ps --filter "name=supabase_${PROJECT_REF}"
   
   # Stop only project-specific containers
   docker stop $(docker ps --filter "name=supabase_${PROJECT_REF}" -q)
   ```

3. **Verify container ownership:**
   ```bash
   # Check which containers belong to your project
   supabase status
   # Compare container names with docker ps output
   docker ps --format "table {{.Names}}\t{{.Status}}"
   ```

**❌ NEVER Do These:**

1. **Never stop all Docker containers:**
   ```bash
   # ❌ WRONG - This affects ALL projects
   docker stop $(docker ps -q)
   docker-compose down  # If used globally
   ```

2. **Never kill processes by port without checking ownership:**
   ```bash
   # ❌ WRONG - Might kill another project's Supabase
   lsof -ti:54321 | xargs kill -9
   ```

3. **Never remove all Supabase-related containers:**
   ```bash
   # ❌ WRONG - Affects all projects
   docker rm $(docker ps -a --filter "name=supabase" -q)
   ```

### 10.2 Project Identification

**How to identify your project's containers:**

1. **From Supabase CLI:**
   ```bash
   supabase status
   # Look for "Project ID" or container names in output
   ```

2. **From Docker:**
   ```bash
   # List all Supabase containers
   docker ps --filter "name=supabase" --format "table {{.Names}}\t{{.Status}}"
   
   # Your project's containers will have names like:
   # supabase_<project-ref>_db
   # supabase_<project-ref>_api
   # supabase_<project-ref>_studio
   ```

3. **From project directory:**
   ```bash
   # Project reference is stored here
   cat supabase/.temp/project-ref
   ```

### 10.3 Error Recovery with Container Isolation

**If port conflicts occur:**

1. **Identify the conflicting container:**
   ```bash
   # Check what's using the port
   lsof -i :54321
   # Or
   docker ps --filter "publish=54321"
   ```

2. **Verify it's your project's container:**
   ```bash
   # Compare with your project reference
   supabase status
   PROJECT_REF=$(cat supabase/.temp/project-ref)
   docker ps --filter "name=supabase_${PROJECT_REF}"
   ```

3. **Stop only if it's your project's container:**
   ```bash
   # If it's your project, use Supabase CLI
   supabase stop
   
   # If it's another project, change your port in config.toml
   # Or ask the user which project should use the port
   ```

**If containers are in a bad state:**

1. **Stop your project's containers:**
   ```bash
   supabase stop
   ```

2. **If needed, remove only your project's containers:**
   ```bash
   PROJECT_REF=$(cat supabase/.temp/project-ref)
   docker rm -f $(docker ps -a --filter "name=supabase_${PROJECT_REF}" -q)
   ```

3. **Restart:**
   ```bash
   supabase start
   ```

### 10.4 AI Agent Rules for Container Management

**When an AI agent needs to manage Docker/Supabase containers:**

1. **Always check project context first:**
   - Verify you're in the correct project directory
   - Check `supabase/.temp/project-ref` exists
   - Use `supabase status` to confirm project identity

2. **Prefer Supabase CLI over Docker commands:**
   - Use `supabase start/stop/status` instead of direct Docker commands
   - Only use Docker directly when Supabase CLI doesn't support the operation

3. **When using Docker directly:**
   - Always filter by project reference or container name pattern
   - Never use commands that affect all containers
   - Verify container ownership before stopping/removing

4. **Error handling:**
   - If port conflicts occur, identify which project owns the conflicting container
   - Only stop containers that belong to the current project
   - If unsure, ask the user which project should use the port

---

## 11. Troubleshooting Common Issues

### 11.1 Port Already in Use

**Symptom:** `Error: port 54321 is already in use`

**Solution:**
1. Check if another Supabase instance is running: `supabase status`
2. If it's your project, stop it: `supabase stop`
3. If it's another project, either:
   - Stop the other project's containers (if you have access)
   - Change your project's ports in `supabase/config.toml`

### 11.2 Docker Not Running

**Symptom:** `Error: Cannot connect to the Docker daemon`

**Solution:**
1. Start Docker Desktop
2. Verify Docker is running: `docker ps`
3. Retry: `supabase start`

### 11.3 Migration Errors

**Symptom:** Migration fails with syntax errors or constraint violations

**Solution:**
1. Check migration file syntax
2. Review error message for specific issue
3. Fix migration file
4. Reset database: `supabase db reset` (if safe to do so)
5. Re-apply migrations: `supabase migration up`

### 11.4 Container Won't Start

**Symptom:** `supabase start` hangs or fails

**Solution:**
1. Check Docker resources (memory, CPU)
2. View Docker logs: `docker logs <container-name>`
3. Stop and restart: `supabase stop && supabase start`
4. If persistent, remove and recreate: See Section 10.3

### 11.5 Environment Variables Not Loading

**Symptom:** Application can't connect to local Supabase

**Solution:**
1. Verify `.env.local` exists and has correct values
2. Run `supabase status` to get current credentials
3. Ensure environment file is loaded (Next.js uses `.env.local` automatically)
4. Restart your application after updating env vars

---

## 12. Integration with Project Standards

### 12.1 Related Documentation

- **Edge Functions:** See `standards/architecture/supabase-edge-functions.md` for when and how to use Edge Functions
- **Database Schema:** See `standards/database/schema.md` for database conventions and naming
- **Configuration:** See `standards/configuration.md` for environment variable standards
- **Launch Commands:** See `.cursor/commands/launch.mdc` for application launch workflow

### 12.2 Environment Variable Standards

Follow the naming conventions in `standards/configuration.md`:
- Use `SUPABASE_URL` (not `NEXT_PUBLIC_SUPABASE_URL` for server-side)
- Use `SUPABASE_ANON_KEY` for client-side operations
- Use `SUPABASE_SERVICE_ROLE_KEY` only in server-side/Edge Functions contexts
- Never commit `.env.local` to version control

---

## 13. Summary for AI Agents

When setting up or managing Supabase locally:

1. **Always use project-specific commands:** `supabase start/stop/status`
2. **Never affect other projects:** Filter Docker commands by project reference
3. **Verify container ownership:** Use `supabase status` to identify your containers
4. **Handle errors safely:** Only stop/restart containers belonging to the current project
5. **Follow configuration standards:** Use environment variables from `templates/general/env.example`

---

*Last Updated: 2025-01-27*

