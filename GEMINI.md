# Sahal Shad Portfolio — Workspace Memory & Guidelines

## 1. Identity & Role
- **Name:** Sahal Shad (also referenced as Muhammad Shahalshad)
- **Role:** Full-Stack Developer & Growth Specialist
- **Location:** Calicut, Kerala, India
- **Availability / Primary Status CTA:** "Available for Freelance" (linked to `#contact`)
- **Primary Domain:** `https://sahalshad.com/`

---

## 2. Technical Stack & Architecture
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion, Lucide React.
- **Database & CMS:** Supabase (PostgreSQL with RLS). Client queries located in `src/lib/supabase.ts`.
- **Legacy Directories:** Do NOT modify `backend/` or `cms/` (legacy Django backend). All active client CMS functions use Supabase directly.
- **Theme & Design System:**
  - Neutral stone palette with CSS variables (`--bg-page`, `--bg-card`, `--bg-card-hover`, `--border-color`, `--text-primary`, `--text-secondary`, `--text-muted`).
  - Zero-flash inline theme loader script in `index.html`.

---

## 3. Public Sections & UI Conventions
- **Active Sections:** Overview (`#top`), Services (`#services`), Experience (`#experience`), Projects (`#projects`), Stack (`#stack`), and Contact (`#contact`).
- **Removed Sections:** Testimonials and Result Stats have been permanently removed from both the public site and admin panel.
- **Projects Showcase:**
  - Displays **4 cards per slide/page** (`CARDS_PER_PAGE = 4`).
  - Top-right slide navigation (`< 1 / N >`) when projects exceed 4.
  - Bottom numeric pagination buttons (`1`, `2`, `3`...) when projects exceed 4.
  - Supports Live Demo link, GitHub Code link (GitHub icon), and Tech Stack pills via smart link parsing.
- **Admin Panel (`/admin`):**
  - Section Headings, Hero, Services, Experience, Projects, Stack & Skills, Settings, Messages.
  - Projects category dropdown features inline `+` (add) and `-` (remove) buttons with localStorage persistence.
  - Modal viewports use `items-start justify-center p-4 sm:p-6 py-10 sm:py-14` to prevent top-clipping.

---

## 4. Technical SEO & AEO (Answer Engine Optimization)
- **Build Pipeline:** `npm run build` executes `node scripts/generate-seo.js && tsc -b && vite build`.
- **Dynamic SEO Generator (`scripts/generate-seo.js`):**
  - `public/robots.txt`: Whitelists search engines and AI crawlers (`GPTBot`, `ChatGPT-User`, `PerplexityBot`, `ClaudeBot`, `Google-Extended`, etc.) while protecting `/admin`.
  - `public/sitemap.xml`: XML sitemap with dynamic lastmod timestamps and image extensions.
  - `public/llms.txt`: Standardized AI briefing document detailing profile, skills, projects, and contact channels.
  - `public/site.webmanifest`: Progressive web application manifest.
- **On-Page SEO & Structured Data:**
  - Structured Data in `index.html`: JSON-LD `@graph` containing `WebSite`, `ProfilePage`, `Person`, and `FAQPage` (optimized for Google AI Overviews and Perplexity citations).
  - Admin Isolation: `src/main.tsx` dynamically sets `noindex, nofollow, noarchive` and changes window title on `/admin`.

---

## 5. Development & Git Workflow
- Always verify clean build via `npm run build` before pushing.
- Only commit and push to remote when explicitly requested by the user.
