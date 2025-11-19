-- Blog Engine Schema
-- Version: 1.0.0

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Enums
CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived');

-- 2. Authors Table
CREATE TABLE authors (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  bio text,
  avatar_url text,
  social_links jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE authors IS 'Content creators and contributors.';

-- 3. Categories (Hierarchical)
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  parent_id uuid REFERENCES categories(id),
  created_at timestamptz DEFAULT now()
);

COMMENT ON TABLE categories IS 'Hierarchical taxonomy for URL structures.';

-- 4. Tags (Flat)
CREATE TABLE tags (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

COMMENT ON TABLE tags IS 'Flat taxonomy for cross-linking content.';

-- 5. Posts Table
CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text,
  content jsonb, -- Supports rich text / blocks
  featured_image text,
  status content_status DEFAULT 'draft',
  published_at timestamptz,
  author_id uuid REFERENCES authors(id) ON DELETE SET NULL,
  seo_metadata_id uuid, -- Link to seo_metadata table (if exists)
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE posts IS 'Core content table for blog posts and articles.';
COMMENT ON COLUMN posts.status IS 'Workflow state: draft, published, or archived.';

-- 6. Junction Tables
CREATE TABLE post_tags (
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

CREATE TABLE post_categories (
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);

-- 7. RLS Policies (Example: Public Read, Admin Write)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published posts" 
ON posts FOR SELECT 
USING (status = 'published' AND published_at <= now());

CREATE POLICY "Admins can do everything" 
ON posts FOR ALL 
USING (auth.role() = 'service_role'); -- Customize based on your app's role system

-- 8. Triggers
-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();




