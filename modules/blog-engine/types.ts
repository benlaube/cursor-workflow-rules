export type ContentStatus = 'draft' | 'published' | 'archived';

export interface Author {
  id: string;
  name: string;
  slug: string;
  bio?: string;
  avatar_url?: string;
  social_links?: Record<string, string>;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id?: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  content?: any; // JSON or string depending on usage
  featured_image?: string;
  status: ContentStatus;
  published_at?: string;
  author_id?: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  author?: Author;
  tags?: Tag[];
  categories?: Category[];
  seo?: any; // Placeholder for joined SEO metadata
}

export interface PostListOptions {
  status?: ContentStatus;
  tag?: string; // slug
  category?: string; // slug
  author?: string; // slug
  page?: number;
  limit?: number;
}




