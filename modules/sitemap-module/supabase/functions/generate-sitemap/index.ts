/**
 * Sitemap Generation Edge Function
 * 
 * Description: Generates sitemap.xml from database content and uploads to Supabase Storage.
 * Triggered by database changes via sitemap_jobs table or can be called manually.
 * 
 * Dependencies: @supabase/supabase-js, modules/sitemap-module
 * Version: 1.0
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { SitemapGenerator, type SitemapRoute } from "../../../../index.ts"

// Environment variables (set in Supabase Dashboard > Edge Functions > Settings)
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
const SITE_URL = Deno.env.get("SITE_URL") ?? Deno.env.get("NEXT_PUBLIC_SITE_URL") ?? "https://example.com"
const BUCKET = Deno.env.get("SITEMAP_BUCKET") ?? "public-assets"
const FILENAME = Deno.env.get("SITEMAP_FILENAME") ?? "sitemap.xml"

// Initialize Supabase client with service role key (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

// Initialize SitemapGenerator
const sitemapGenerator = new SitemapGenerator({
  siteUrl: SITE_URL,
  bucketName: BUCKET,
  supabaseUrl: SUPABASE_URL,
  supabaseServiceKey: SERVICE_KEY,
})

/**
 * Fetch all public routes from database.
 * 
 * This function queries all content tables that should appear in the sitemap.
 * Adjust table names and column names to match your schema.
 * 
 * @returns Array of sitemap routes
 */
async function fetchRoutes(): Promise<SitemapRoute[]> {
  const routes: SitemapRoute[] = []

  try {
    // Example 1: Fetch from 'pages' table
    // Adjust table name and columns to match your schema
    const { data: pages, error: pagesError } = await supabase
      .from("pages")
      .select("slug, updated_at, is_public, status")
      .or("is_public.eq.true,status.eq.published")

    if (pagesError) {
      console.error("Error fetching pages:", pagesError)
    } else if (pages) {
      pages.forEach((page: any) => {
        if (page.slug) {
          routes.push({
            loc: `${SITE_URL}/${page.slug}`,
            lastmod: page.updated_at,
            changefreq: "weekly",
            priority: 0.8,
          })
        }
      })
    }

    // Example 2: Fetch from 'posts' table
    // Uncomment and adjust to match your schema
    /*
    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select("slug, updated_at, published_at, status")
      .eq("status", "published")

    if (postsError) {
      console.error("Error fetching posts:", postsError)
    } else if (posts) {
      posts.forEach((post: any) => {
        if (post.slug) {
          routes.push({
            loc: `${SITE_URL}/blog/${post.slug}`,
            lastmod: post.updated_at || post.published_at,
            changefreq: "monthly",
            priority: 0.7,
          })
        }
      })
    }
    */

    // Example 3: Add static routes
    // Add any static routes that should always be in the sitemap
    routes.push(
      {
        loc: `${SITE_URL}/`,
        changefreq: "daily",
        priority: 1.0,
      },
      {
        loc: `${SITE_URL}/about`,
        changefreq: "monthly",
        priority: 0.8,
      },
      {
        loc: `${SITE_URL}/contact`,
        changefreq: "monthly",
        priority: 0.7,
      }
    )

    return routes
  } catch (error) {
    console.error("Error in fetchRoutes:", error)
    throw error
  }
}

/**
 * Process pending sitemap jobs.
 * 
 * Marks jobs as processed after successful generation.
 */
async function processJobs(): Promise<void> {
  try {
    // Get pending jobs
    const { data: jobs, error } = await supabase
      .from("sitemap_jobs")
      .select("id")
      .eq("status", "pending")
      .order("triggered_at", { ascending: true })
      .limit(10)

    if (error) {
      console.error("Error fetching jobs:", error)
      return
    }

    if (!jobs || jobs.length === 0) {
      return
    }

    // Mark all as processed (or failed if generation failed)
    const jobIds = jobs.map((j) => j.id)
    await supabase
      .from("sitemap_jobs")
      .update({ 
        status: "processed",
        processed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .in("id", jobIds)
  } catch (error) {
    console.error("Error processing jobs:", error)
  }
}

/**
 * Main handler function.
 */
serve(async (req) => {
  try {
    // Fetch all routes from database
    const routes = await fetchRoutes()

    if (routes.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "No routes found to generate sitemap" 
        }),
        { 
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    // Generate XML using SitemapGenerator
    const xml = sitemapGenerator.generateXml(routes)

    // Upload to Supabase Storage
    await sitemapGenerator.uploadSitemap(xml, FILENAME)

    // Mark pending jobs as processed
    await processJobs()

    return new Response(
      JSON.stringify({ 
        success: true, 
        count: routes.length,
        filename: FILENAME,
        bucket: BUCKET,
      }),
      { 
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    )
  } catch (error) {
    console.error("Sitemap generation error:", error)

    // Mark jobs as failed
    try {
      const { data: jobs } = await supabase
        .from("sitemap_jobs")
        .select("id")
        .eq("status", "pending")
        .limit(10)

      if (jobs && jobs.length > 0) {
        await supabase
          .from("sitemap_jobs")
          .update({ 
            status: "failed",
            error_message: String(error),
            processed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .in("id", jobs.map((j) => j.id))
      }
    } catch (updateError) {
      console.error("Error updating job status:", updateError)
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: String(error) 
      }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
})

