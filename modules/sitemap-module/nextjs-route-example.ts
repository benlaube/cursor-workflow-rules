/**
 * Next.js Sitemap Route Examples
 * 
 * Description: Example implementations for serving sitemap.xml in Next.js.
 * Choose one approach based on your needs.
 * 
 * Dependencies: next
 * Version: 1.0
 */

// ============================================================================
// OPTION 1: Proxy to Supabase Storage (Recommended)
// ============================================================================
// This approach proxies requests to the sitemap.xml stored in Supabase Storage.
// Benefits: Always serves latest version, no build-time dependency.

// File: app/sitemap.xml/route.ts
import { NextResponse } from 'next/server'

const SUPABASE_STORAGE_URL = process.env.SUPABASE_STORAGE_URL || 
  `https://${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_REF}.supabase.co/storage/v1/object/public/public-assets/sitemap.xml`

export async function GET() {
  try {
    // Fetch sitemap from Supabase Storage
    const response = await fetch(SUPABASE_STORAGE_URL, {
      next: { revalidate: 3600 }, // Revalidate every hour
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch sitemap: ${response.statusText}`)
    }

    const xml = await response.text()

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('Error fetching sitemap:', error)
    
    // Return empty sitemap on error (or redirect to Storage URL directly)
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>',
      {
        status: 200,
        headers: { 'Content-Type': 'application/xml' },
      }
    )
  }
}

// ============================================================================
// OPTION 2: Build-Time Fetch (Static Generation)
// ============================================================================
// This approach fetches the sitemap during build and serves it as a static file.
// Benefits: Fast serving, no runtime dependency on Supabase.

// File: app/sitemap.xml/route.ts
import { NextResponse } from 'next/server'

const SUPABASE_STORAGE_URL = process.env.SUPABASE_STORAGE_URL || 
  `https://${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_REF}.supabase.co/storage/v1/object/public/public-assets/sitemap.xml`

export const dynamic = 'force-static' // Force static generation

export async function GET() {
  // Fetch during build time
  const response = await fetch(SUPABASE_STORAGE_URL)
  const xml = await response.text()

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}

// ============================================================================
// OPTION 3: Direct Redirect (Simplest)
// ============================================================================
// This approach redirects to the Supabase Storage URL directly.
// Benefits: Zero code, always serves latest version.

// File: app/sitemap.xml/route.ts
import { redirect } from 'next/navigation'

const SUPABASE_STORAGE_URL = process.env.SUPABASE_STORAGE_URL || 
  `https://${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_REF}.supabase.co/storage/v1/object/public/public-assets/sitemap.xml`

export async function GET() {
  redirect(SUPABASE_STORAGE_URL)
}

// ============================================================================
// OPTION 4: Generate On-Demand (Not Recommended)
// ============================================================================
// This approach generates the sitemap on each request.
// WARNING: This is slow and not recommended. Use only for development.

// File: app/sitemap.xml/route.ts
import { NextResponse } from 'next/server'
import { SitemapGenerator } from '@/lib/sitemap-module'

export async function GET() {
  // This is slow - only use for development/testing
  const generator = new SitemapGenerator({
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com',
  })

  // Fetch routes and generate
  const routes = await fetchRoutesFromDatabase() // Your implementation
  const xml = generator.generateXml(routes)

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}

// ============================================================================
// robots.txt Configuration
// ============================================================================
// Update your robots.txt to reference the sitemap.

// File: public/robots.txt
/*
User-agent: *
Allow: /

Sitemap: https://yourapp.com/sitemap.xml
*/

// Or generate dynamically:

// File: app/robots.txt/route.ts
export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'
  
  return new NextResponse(
    `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`,
    {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    }
  )
}

// ============================================================================
// Environment Variables
// ============================================================================
// Add to .env.local:

/*
# Supabase Storage URL for sitemap
SUPABASE_STORAGE_URL=https://<project-ref>.supabase.co/storage/v1/object/public/public-assets/sitemap.xml

# Or construct from project ref
NEXT_PUBLIC_SUPABASE_PROJECT_REF=your-project-ref
*/

// ============================================================================
// Recommendations
// ============================================================================
//
// For Production:
// - Use OPTION 1 (Proxy with caching) for balance of freshness and performance
// - Set appropriate cache headers (1 hour revalidation recommended)
//
// For Development:
// - Use OPTION 3 (Direct redirect) for simplicity
//
// For Static Sites:
// - Use OPTION 2 (Build-time fetch) if sitemap doesn't change frequently
//
// Never Use:
// - OPTION 4 (On-demand generation) in production - too slow for crawlers

