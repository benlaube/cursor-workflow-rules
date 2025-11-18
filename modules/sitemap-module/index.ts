import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SitemapRoute {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export interface SitemapConfig {
  siteUrl: string;
  bucketName?: string;
  supabaseUrl?: string;
  supabaseServiceKey?: string;
}

export class SitemapGenerator {
  private supabase: SupabaseClient;
  private config: SitemapConfig;

  constructor(config: SitemapConfig) {
    this.config = {
      bucketName: 'public-assets',
      ...config
    };

    const url = config.supabaseUrl || process.env.SUPABASE_URL;
    const key = config.supabaseServiceKey || process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      throw new Error('Supabase credentials required for SitemapGenerator');
    }

    this.supabase = createClient(url, key);
  }

  generateXml(routes: SitemapRoute[]): string {
    const urlset = routes
      .map((r) => {
        const lastmod = r.lastmod
          ? `    <lastmod>${new Date(r.lastmod).toISOString()}</lastmod>\n`
          : '';
        const changefreq = r.changefreq
          ? `    <changefreq>${r.changefreq}</changefreq>\n`
          : '';
        const priority = r.priority
          ? `    <priority>${r.priority.toFixed(1)}</priority>\n`
          : '';

        return `  <url>
    <loc>${r.loc}</loc>
${lastmod}${changefreq}${priority}  </url>`;
      })
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlset}
</urlset>`;
  }

  async uploadSitemap(xml: string, filename: string = 'sitemap.xml'): Promise<void> {
    const { error } = await this.supabase.storage
      .from(this.config.bucketName!)
      .upload(filename, new TextEncoder().encode(xml), {
        upsert: true,
        contentType: 'application/xml'
      });

    if (error) throw error;
  }

  async generateAndUpload(routes: SitemapRoute[], filename: string = 'sitemap.xml') {
    const xml = this.generateXml(routes);
    await this.uploadSitemap(xml, filename);
    return xml;
  }
}

