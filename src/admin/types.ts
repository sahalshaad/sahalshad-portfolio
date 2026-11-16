export interface HeroSection {
  id: string
  is_singleton: boolean
  name: string
  title: string
  description: string
  profile_image_url: string
  cta_primary_text: string
  cta_primary_link: string
  cta_secondary_text: string
  cta_secondary_link: string
  is_active: boolean
  updated_at: string
}

export interface GeneralSettings {
  id: string
  is_singleton: boolean
  site_name: string
  linkedin_url: string
  github_url?: string
  instagram_url: string
  portfolio_url: string
  email: string
  phone_number: string
  is_active: boolean
  updated_at: string
}

export interface ContactSection {
  id: string
  is_singleton: boolean
  heading: string
  description: string
  is_active: boolean
  updated_at: string
}

export interface CvDocument {
  id: string
  is_singleton: boolean
  title: string
  file_url: string
  is_active: boolean
  updated_at: string
}

export type SectionKey = 'services' | 'experience' | 'work' | 'results' | 'testimonials' | string

export interface SectionContent {
  id: string
  section_key: SectionKey
  eyebrow: string
  title: string
  subtitle: string
  is_active: boolean
  updated_at: string
}

export interface ServiceItem {
  id: string
  service_title: string
  description: string
  icon_class: string
  icon_image_url: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ExperienceItem {
  id: string
  job_role: string
  company_name: string
  duration: string
  description: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type ProjectCategory =
  | 'Meta Ads'
  | 'SEO'
  | 'Branding'
  | 'Google Ads'
  | 'Funnels'
  | 'Ads'
  | 'Web App'
  | 'Full-Stack'
  | 'Frontend'
  | string

export interface PortfolioProjectItem {
  id: string
  project_title: string
  category: ProjectCategory
  description: string
  results: string
  image_url: string
  external_link: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TestimonialItem {
  id: string
  client_name: string
  designation: string
  feedback: string
  image_url: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SkillTagItem {
  id: string
  name: string
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface ResultStatItem {
  id: string
  label: string
  value: string
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface ContactMessageItem {
  id: string
  name: string
  email: string
  message: string
  created_at: string
}

export type AdminTab =
  | 'dashboard'
  | 'hero'
  | 'settings'
  | 'services'
  | 'experiences'
  | 'projects'
  | 'skills'
  | 'sections'
  | 'messages'
