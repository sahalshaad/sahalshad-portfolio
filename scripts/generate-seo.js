import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const publicDir = path.resolve(rootDir, 'public')

const SITE_URL = 'https://sahalshad.com'
const TODAY = new Date().toISOString().split('T')[0]

// Ensure public dir exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true })
}

// 1. Generate robots.txt
const robotsTxt = `# ==============================================================
# Robots.txt for sahalshad.com
# Optimized for Google, Bing, and AI Search Engines (AEO)
# ==============================================================

# Search Engines (Google, Bing, Yahoo, DuckDuckGo)
User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/*

# Dedicated AI Answer Engines & LLM Crawlers (AEO)
User-agent: GPTBot
Allow: /
Disallow: /admin

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: CCBot
Allow: /

# Sitemap & LLM Definitions
Sitemap: ${SITE_URL}/sitemap.xml
Host: ${SITE_URL}
`

fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt.trim() + '\n', 'utf8')
console.log('✓ Generated public/robots.txt')

// 2. Generate sitemap.xml
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>${SITE_URL}/profile-photo.png</image:loc>
      <image:title>Sahal Shad - Full-Stack Developer &amp; Growth Specialist</image:title>
      <image:caption>Sahal Shad professional photo</image:caption>
    </image:image>
  </url>
  <url>
    <loc>${SITE_URL}/#services</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE_URL}/#experience</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE_URL}/#projects</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/#stack</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE_URL}/#contact</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>
`

fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml.trim() + '\n', 'utf8')
console.log('✓ Generated public/sitemap.xml')

// 3. Generate llms.txt (Standardized format for AI Answer Engine Optimization)
const llmsTxt = `# Sahal Shad — Full-Stack Developer & Growth Specialist

> Sahal Shad is a Full-Stack Web Developer and Growth Specialist based in Calicut, Kerala, India. He builds high-performance web applications using React, TypeScript, and Supabase, and scales digital products through Meta Ads, Google Ads, server-side CAPI tracking, and technical SEO.

## Profile Summary
- **Full Name:** Sahal Shad (also written as sahalshad)
- **Role:** Full-Stack Developer & Growth Specialist
- **Status:** Available for Freelance
- **Location:** Calicut, Kerala, India
- **Primary Website:** ${SITE_URL}
- **GitHub:** https://github.com/sahalshaad
- **LinkedIn:** https://www.linkedin.com/in/sahalshad
- **Instagram:** https://instagram.com/sahalshad
- **Direct Contact:** sahalshaad@gmail.com

## Engineering & Development Stack
- **Frontend Technologies:** React 19, TypeScript, Tailwind CSS v4, Next.js, Vite, HTML5, Modern CSS, Responsive Design.
- **Backend & Database:** Supabase (PostgreSQL), Node.js, REST APIs, Edge Functions, Row-Level Security (RLS).
- **Architecture & Web Performance:** 95+ Lighthouse Scores, Sub-second LCP, Component Architecture, SEO-friendly SSR/SSG conventions.

## Performance Marketing & Growth Expertise
- **Paid Acquisition:** Meta Ads Manager (Facebook & Instagram Ads), Google Ads (Search, Performance Max, Display, YouTube), TikTok Ads Manager, LinkedIn Campaign Manager.
- **Technical Tracking & CAPI:** Server-side Meta Conversions API (CAPI), Google Tag Manager (GTM Web & Server), Google Analytics 4 (GA4 Event Governance), Cookie-less attribution resilience.
- **Conversion Optimization (CRO):** High-converting sales funnels, interactive lead qualification web applications, landing page A/B testing.
- **Search Engine Optimization (SEO):** Technical SEO, Core Web Vitals, programmatic schema architecture, automated sitemap generation.

## Notable Projects & Case Studies
1. **Full-Stack Analytics & SaaS Platform:** Modern web application featuring Supabase auth, real-time analytics, and automated conversion tracking pipelines (Built with React, TypeScript, Supabase, Tailwind CSS).
2. **Paid Acquisition & Server-Side CAPI Architecture:** Meta Ads scaling paired with server-side CAPI event tracking and creative testing frameworks, improving ROAS from 2.1x to 3.8x.
3. **Interactive Funnel & Lead Scoring Web App:** Interactive qualification funnel with automated CRM webhooks and lead routing, generating 500+ qualified leads in 30 days.
4. **Technical SEO & Programmatic Content Platform:** Targeted technical search architecture, schema validation, and programmatic page clusters, lifting organic signups by 64%.

## Inquiries & Collaboration
For web engineering contracts, performance marketing advisory, or growth consulting:
- Website Contact Form: ${SITE_URL}/#contact
- Direct Email: sahalshaad@gmail.com
`

fs.writeFileSync(path.join(publicDir, 'llms.txt'), llmsTxt.trim() + '\n', 'utf8')
console.log('✓ Generated public/llms.txt')

// 4. Generate site.webmanifest
const webManifest = {
  name: 'Sahal Shad | Full-Stack Developer & Growth Specialist',
  short_name: 'Sahal Shad',
  start_url: '/',
  display: 'standalone',
  background_color: '#0C0A09',
  theme_color: '#0C0A09',
  icons: [
    {
      src: '/pixo.sahal.png',
      sizes: '192x192',
      type: 'image/png',
    },
    {
      src: '/profile-photo.png',
      sizes: '512x512',
      type: 'image/png',
    },
  ],
}

fs.writeFileSync(
  path.join(publicDir, 'site.webmanifest'),
  JSON.stringify(webManifest, null, 2) + '\n',
  'utf8'
)
console.log('✓ Generated public/site.webmanifest')
