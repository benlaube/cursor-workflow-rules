import { SupabaseClient } from '@supabase/supabase-js';
import { BlogPost, PostListOptions } from './types';

export class BlogService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Fetch a single post by slug with all relations.
   */
  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    const { data, error } = await this.supabase
      .from('posts')
      .select(`
        *,
        author:authors(*),
        tags:post_tags(tags(*)),
        categories:post_categories(categories(*))
      `)
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    // Flatten many-to-many response if needed by your UI
    const formatted = {
      ...data,
      tags: data.tags.map((t: any) => t.tags),
      categories: data.categories.map((c: any) => c.categories)
    };

    return formatted as BlogPost;
  }

  /**
   * List posts with pagination and filters.
   */
  async listPosts(options: PostListOptions = {}) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = this.supabase
      .from('posts')
      .select(`
        id, slug, title, excerpt, published_at, featured_image,
        author:authors(name, avatar_url),
        categories:post_categories(categories(name, slug))
      `, { count: 'exact' })
      .order('published_at', { ascending: false })
      .range(from, to);

    if (options.status) {
      query = query.eq('status', options.status);
    }

    // NOTE: For deeper filtering by tag/category (junction tables), 
    // Supabase requires specific syntax like !inner or .eq on the joined resource.
    // This simple example assumes basic filtering.

    const { data, count, error } = await query;

    if (error) throw error;

    return {
      data: data?.map((p: any) => ({
        ...p,
        categories: p.categories.map((c: any) => c.categories)
      })),
      meta: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      }
    };
  }
}




