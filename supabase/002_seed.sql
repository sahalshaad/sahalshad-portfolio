-- ==============================================================================
-- 002_seed.sql
-- Starter content for Supabase Portfolio CMS
-- Matches fallback defaults in src/App.tsx.
-- Safe and idempotent: Uses INSERT ... ON CONFLICT DO NOTHING.
-- ==============================================================================

-- 1. HERO SECTION (Singleton)
insert into public.hero_section (
  is_singleton,
  name,
  title,
  description,
  profile_image_url,
  cta_primary_text,
  cta_primary_link,
  cta_secondary_text,
  cta_secondary_link,
  is_active
) values (
  true,
  'sahalshad',
  'Digital Marketing Specialist',
  'I help ambitious brands grow through Performance Marketing, Meta Ads, and Lead Generation systems designed to increase qualified pipeline and revenue.',
  '',
  'View My Work',
  '#work',
  'Contact Me',
  '#contact',
  true
)
on conflict (is_singleton) do nothing;

-- 2. GENERAL SETTINGS (Singleton)
insert into public.general_settings (
  is_singleton,
  site_name,
  linkedin_url,
  instagram_url,
  portfolio_url,
  email,
  phone_number,
  is_active
) values (
  true,
  'sahalshad',
  '',
  '',
  '',
  '',
  '',
  true
)
on conflict (is_singleton) do nothing;

-- 3. CONTACT SECTION (Singleton)
insert into public.contact_section (
  is_singleton,
  heading,
  description,
  is_active
) values (
  true,
  'Let’s Grow Your Business',
  'Share your goals and I’ll reply with a simple plan: what to test first, what to measure, and how we’ll move from clicks to customers.',
  true
)
on conflict (is_singleton) do nothing;

-- 4. CV DOCUMENT (Singleton)
insert into public.cv_document (
  is_singleton,
  title,
  file_url,
  is_active
) values (
  true,
  'Download CV',
  '',
  true
)
on conflict (is_singleton) do nothing;

-- 5. SECTION CONTENT HEADINGS
insert into public.section_contents (section_key, eyebrow, title, subtitle, is_active)
values
  ('services', 'What I do', 'Growth services designed for performance', 'Clean strategy, crisp execution, and reporting that connects marketing to revenue.', true),
  ('experience', 'Experience', 'Hands-on, results-driven marketing', 'From campaign architecture to creative iteration and funnel performance.', true),
  ('work', 'Case studies', 'Work that speaks in numbers', 'A selection of projects across ads, branding, SEO, and funnels.', true),
  ('results', 'Results', 'Metrics that matter to business', 'Clear wins across spend efficiency, lead volume, and campaign reliability.', true),
  ('testimonials', 'Testimonials', 'Trusted partnerships', 'Short, honest feedback from clients and teams I’ve worked with.', true)
on conflict (section_key) do nothing;

-- 6. SERVICES (4 items from App.tsx fallback)
insert into public.services (service_title, description, icon_class, icon_image_url, sort_order, is_active)
values
  ('Performance Marketing', 'Meta Ads + Google Ads with creative testing, tracking hygiene, and ROI-driven scaling.', 'LineChart', '', 1, true),
  ('Social Media Marketing', 'Content systems that build trust, increase reach, and support conversion-focused campaigns.', 'Megaphone', '', 2, true),
  ('SEO & Analytics', 'Search-led growth paired with GA4 insights, dashboards, and attribution you can act on.', 'BarChart3', '', 3, true),
  ('Funnel & Lead Generation', 'Landing pages, lead magnets, and nurture flows designed to lift CVR and reduce CPL.', 'Funnel', '', 4, true)
on conflict (service_title) do nothing;

-- 7. SKILL TAGS (7 items from App.tsx fallback)
insert into public.skill_tags (name, sort_order, is_active)
values
  ('Meta Ads', 1, true),
  ('Google Ads', 2, true),
  ('GA4', 3, true),
  ('SEO', 4, true),
  ('CRO', 5, true),
  ('Landing Pages', 6, true),
  ('Funnels', 7, true)
on conflict (name) do nothing;

-- 8. RESULT STATS (4 items from App.tsx fallback)
insert into public.result_stats (label, value, sort_order, is_active)
values
  ('Total Ad Spend Managed', '$250k+', 1, true),
  ('Leads Generated', '3,500+', 2, true),
  ('Clients Worked With', '18+', 3, true),
  ('Campaign Success Rate', '92%', 4, true)
on conflict (label) do nothing;

-- Note:
-- experiences, portfolio_projects, and testimonials are left empty
-- so you can populate your own records directly from the /admin interface.
