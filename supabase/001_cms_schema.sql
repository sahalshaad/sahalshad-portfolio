-- ==============================================================================
-- 001_cms_schema.sql
-- Supabase CMS Schema for Portfolio & Admin Dashboard
-- Safe and idempotent: can be executed multiple times without errors.
--
-- Note: Admin email configured for sahalshaad@gmail.com
-- ==============================================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. TRIGGER FUNCTION FOR updated_at
-- ------------------------------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ------------------------------------------------------------------------------
-- 2. SINGLETON TABLES (One active record enforced via is_singleton)
-- ------------------------------------------------------------------------------

-- Hero Section
create table if not exists public.hero_section (
  id uuid primary key default gen_random_uuid(),
  is_singleton boolean not null default true unique check (is_singleton = true),
  name text not null default 'sahalshad',
  title text not null default 'Digital Marketing Specialist',
  description text not null default '',
  profile_image_url text default '',
  cta_primary_text text not null default 'View My Work',
  cta_primary_link text not null default '#work',
  cta_secondary_text text not null default 'Contact Me',
  cta_secondary_link text not null default '#contact',
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

-- General Settings
create table if not exists public.general_settings (
  id uuid primary key default gen_random_uuid(),
  is_singleton boolean not null default true unique check (is_singleton = true),
  site_name text not null default 'sahalshad',
  linkedin_url text default '',
  instagram_url text default '',
  portfolio_url text default '',
  email text default '',
  phone_number text default '',
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

-- Contact Section (Header & copy above the contact form)
create table if not exists public.contact_section (
  id uuid primary key default gen_random_uuid(),
  is_singleton boolean not null default true unique check (is_singleton = true),
  heading text not null default 'Let’s Grow Your Business',
  description text not null default '',
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

-- CV Document (Resume link/upload)
create table if not exists public.cv_document (
  id uuid primary key default gen_random_uuid(),
  is_singleton boolean not null default true unique check (is_singleton = true),
  title text not null default 'Download CV',
  file_url text default '',
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------------------------
-- 3. COLLECTION TABLES
-- ------------------------------------------------------------------------------

-- Section Content (Eyebrow, title, subtitle per section)
create table if not exists public.section_contents (
  id uuid primary key default gen_random_uuid(),
  section_key text not null unique check (section_key in ('services', 'experience', 'work', 'results', 'testimonials')),
  eyebrow text not null default '',
  title text not null default '',
  subtitle text not null default '',
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

-- Services
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  service_title text not null unique,
  description text not null default '',
  icon_class text default '',
  icon_image_url text default '',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Experiences
create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  job_role text not null,
  company_name text not null,
  duration text not null default '',
  description text not null default '',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Portfolio Projects
create table if not exists public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  project_title text not null,
  category text not null check (category in ('Meta Ads', 'SEO', 'Branding', 'Google Ads', 'Funnels', 'Ads')),
  description text not null default '',
  results text not null default '',
  image_url text default '',
  external_link text default '',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Testimonials
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  designation text default '',
  feedback text not null default '',
  image_url text default '',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Skill Tags
create table if not exists public.skill_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Result Stats
create table if not exists public.result_stats (
  id uuid primary key default gen_random_uuid(),
  label text not null unique,
  value text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Contact Messages (Ensured)
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------------------------
-- 4. ATTACH updated_at TRIGGERS
-- ------------------------------------------------------------------------------

do $$
declare
  t text;
begin
  for t in select unnest(array[
    'hero_section', 'general_settings', 'contact_section', 'cv_document',
    'section_contents', 'services', 'experiences', 'portfolio_projects', 'testimonials'
  ]) loop
    execute format('drop trigger if exists set_updated_at on public.%I;', t);
    execute format('
      create trigger set_updated_at
      before update on public.%I
      for each row
      execute function public.handle_updated_at();
    ', t);
  end loop;
end $$;

-- ------------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

do $$
declare
  t text;
begin
  -- Tables with is_active flag
  for t in select unnest(array[
    'hero_section', 'general_settings', 'contact_section', 'cv_document',
    'section_contents', 'services', 'experiences', 'portfolio_projects',
    'testimonials', 'skill_tags', 'result_stats'
  ]) loop
    execute format('alter table public.%I enable row level security;', t);

    -- Public SELECT policy (anon only sees is_active = true)
    execute format('drop policy if exists "Public read active %1$I" on public.%1$I;', t);
    execute format('
      create policy "Public read active %1$I" on public.%1$I
      for select
      to anon
      using (is_active = true);
    ', t);

    -- Admin policy (authenticated + sahalshaad@gmail.com match: full read/write, including inactive)
    execute format('drop policy if exists "Admin manage all %1$I" on public.%1$I;', t);
    execute format('
      create policy "Admin manage all %1$I" on public.%1$I
      for all
      to authenticated
      using (auth.jwt() ->> ''email'' = ''sahalshaad@gmail.com'')
      with check (auth.jwt() ->> ''email'' = ''sahalshaad@gmail.com'');
    ', t);
  end loop;
end $$;

-- Policies for existing contact_messages table
alter table public.contact_messages enable row level security;

-- Admin read policy for contact messages
drop policy if exists "Admin read contact_messages" on public.contact_messages;
create policy "Admin read contact_messages"
on public.contact_messages
for select
to authenticated
using (auth.jwt() ->> 'email' = 'sahalshaad@gmail.com');

-- Admin delete policy for contact messages
drop policy if exists "Admin delete contact_messages" on public.contact_messages;
create policy "Admin delete contact_messages"
on public.contact_messages
for delete
to authenticated
using (auth.jwt() ->> 'email' = 'sahalshaad@gmail.com');

-- ------------------------------------------------------------------------------
-- 6. STORAGE BUCKET & STORAGE RLS POLICIES (site-media)
-- ------------------------------------------------------------------------------

-- Create public storage bucket with 5MB limit and allowed image/pdf mime types
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-media',
  'site-media',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'application/pdf']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'application/pdf'];

-- Public read access to site-media objects
drop policy if exists "Public read site-media" on storage.objects;
create policy "Public read site-media"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'site-media');

-- Admin insert to site-media
drop policy if exists "Admin upload site-media" on storage.objects;
create policy "Admin upload site-media"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'site-media'
  and (auth.jwt() ->> 'email' = 'sahalshaad@gmail.com')
);

-- Admin update to site-media
drop policy if exists "Admin update site-media" on storage.objects;
create policy "Admin update site-media"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'site-media'
  and (auth.jwt() ->> 'email' = 'sahalshaad@gmail.com')
);

-- Admin delete from site-media
drop policy if exists "Admin delete site-media" on storage.objects;
create policy "Admin delete site-media"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'site-media'
  and (auth.jwt() ->> 'email' = 'sahalshaad@gmail.com')
);
