-- Auth to Profile Sync Trigger
--
-- Description: Automatically creates a public profile record whenever a new user
-- signs up via Supabase Auth. Handles basic metadata copy.
--
-- Usage: Apply this migration to your Supabase project.

-- 1. Ensure the profiles table exists
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Enable RLS (Security Best Practice)
alter table public.profiles enable row level security;

-- 3. Create policies (Users can see all profiles, but only edit their own)
create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on public.profiles for update
  using ( auth.uid() = id );

-- 4. Create the Trigger Function
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- 5. Attach the Trigger to auth.users
-- Note: We drop it first to allow idempotent re-runs
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();

