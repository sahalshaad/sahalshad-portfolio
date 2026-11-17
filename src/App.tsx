import type { ComponentType, FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  FileText,
  Funnel,
  LineChart,
  Loader2,
  Mail,
  Megaphone,
  MessageCircle,
  Phone,
  Send,
} from 'lucide-react'
import { supabase } from './lib/supabase'
import { Sidebar } from './components/Sidebar'
import { MobileTopBar } from './components/MobileTopBar'
import { BottomTabBar } from './components/BottomTabBar'
import { SectionCard } from './components/SectionCard'
import { ProjectCard, parseProjectLinks, type ProjectItemData } from './components/ProjectCard'
import { ExperienceAccordion, type ExperienceItemData } from './components/ExperienceAccordion'
import { parseExperiencePoints } from './utils/experiencePoints'
import { Footer } from './components/Footer'

// Editable Availability & Location Constants
export const AVAILABILITY_CONSTANTS = {
  status: 'Available for Freelance',
  location: 'Calicut, Kerala',
}

type CmsPayload = {
  hero?: {
    name: string
    title: string
    description: string
    profile_image_url: string
    cta_primary_text: string
    cta_primary_link: string
    cta_secondary_text: string
    cta_secondary_link: string
  }
  experiences?: Array<{
    job_role: string
    company_name: string
    duration: string
    description: string
  }>
  services?: Array<{
    service_title: string
    description: string
    icon_class: string
    icon_image_url: string
  }>
  projects?: Array<{
    project_title: string
    category: string
    description: string
    results: string
    image_url: string
    external_link: string
  }>
  skills?: string[]
  stats?: Array<{
    label: string
    value: string
  }>
  section_content?: Record<
    string,
    {
      eyebrow: string
      title: string
      subtitle: string
    }
  >
  testimonials?: Array<{
    client_name: string
    designation: string
    feedback: string
    image_url: string
  }>
  contact?: {
    heading: string
    description: string
  }
  cv?: {
    title: string
    file_url: string
  }
  settings?: {
    site_name: string
    linkedin_url: string
    github_url?: string
    instagram_url: string
    portfolio_url: string
    email: string
    phone_number: string
  }
}

const DEFAULT_HERO_IMAGE = '/profile-photo.png'

export default function App() {
  const [cmsData, setCmsData] = useState<CmsPayload | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('top')

  // Overview copy email feedback
  const [copiedEmail, setCopiedEmail] = useState(false)

  // Work filter & slide pagination state
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const CARDS_PER_PAGE = 4

  // Contact form submission state
  const [contactStatus, setContactStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [contactErrorMessage, setContactErrorMessage] = useState('')

  const defaultName = 'sahalshad'
  const defaultRole = 'Digital Marketing Specialist'
  const defaultDescription =
    'I help ambitious brands grow through Performance Marketing, Meta Ads, and Lead Generation systems designed to increase qualified pipeline and revenue.'
  const defaultSkills = ['Meta Ads', 'Google Ads', 'GA4', 'SEO', 'CRO', 'Landing Pages', 'Funnels']

  const hero = cmsData?.hero
  const heroImageUrl = hero?.profile_image_url || DEFAULT_HERO_IMAGE
  const contact = cmsData?.contact
  const general = cmsData?.settings
  const cv = cmsData?.cv
  const sectionContent = cmsData?.section_content || {}

  const name = hero?.name || defaultName
  const role = hero?.title || defaultRole
  const contactEmail = general?.email || 'sahalshaad@gmail.com'
  const contactPhone = general?.phone_number || ''

  // Format WhatsApp URL from phone digits
  const whatsAppUrl = useMemo(() => {
    if (!contactPhone) return ''
    const digits = contactPhone.replace(/\D/g, '')
    if (!digits) return ''
    return `https://wa.me/${digits}?text=${encodeURIComponent('Hi Sahal, I saw your portfolio and would like to connect.')}`
  }, [contactPhone])

  // Social Links
  const socialLinks = useMemo(() => {
    return [
      { href: general?.github_url || 'https://github.com/sahalshaad', label: 'GitHub' },
      { href: general?.linkedin_url || 'https://www.linkedin.com/in/sahalshad', label: 'LinkedIn' },
      { href: general?.instagram_url || 'https://instagram.com/sahalshad', label: 'Instagram' },
      general?.portfolio_url ? { href: general.portfolio_url, label: 'Portfolio' } : null,
    ].filter((link): link is { href: string; label: string } => Boolean(link))
  }, [general])

  // Resources for Sidebar
  const resources = useMemo(
    () => ({
      cvUrl: cv?.file_url,
      cvTitle: cv?.title,
      githubUrl: general?.github_url || 'https://github.com/sahalshaad',
      linkedinUrl: general?.linkedin_url || 'https://www.linkedin.com/in/sahalshad',
      instagramUrl: general?.instagram_url || 'https://instagram.com/sahalshad',
    }),
    [cv, general]
  )

  // Supabase Data Fetching (Exact logic preserved)
  useEffect(() => {
    let mounted = true

    async function loadPortfolioContent() {
      try {
        const [
          heroRes,
          settingsRes,
          contactRes,
          cvRes,
          sectionsRes,
          servicesRes,
          experiencesRes,
          projectsRes,
          testimonialsRes,
          skillsRes,
          statsRes,
        ] = await Promise.all([
          supabase.from('hero_section').select('*').eq('is_active', true).maybeSingle(),
          supabase.from('general_settings').select('*').eq('is_active', true).maybeSingle(),
          supabase.from('contact_section').select('*').eq('is_active', true).maybeSingle(),
          supabase.from('cv_document').select('*').eq('is_active', true).maybeSingle(),
          supabase.from('section_contents').select('*').eq('is_active', true),
          supabase.from('services').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
          supabase.from('experiences').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
          supabase.from('portfolio_projects').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
          supabase.from('testimonials').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
          supabase.from('skill_tags').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
          supabase.from('result_stats').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
        ])

        if (!mounted) return

        const sectionMap: Record<string, { eyebrow: string; title: string; subtitle: string }> = {}
        if (sectionsRes.data) {
          for (const row of sectionsRes.data) {
            if (row.section_key) {
              sectionMap[row.section_key] = {
                eyebrow: row.eyebrow || '',
                title: row.title || '',
                subtitle: row.subtitle || '',
              }
            }
          }
        }

        const payload: CmsPayload = {
          hero: heroRes.data
            ? {
                name: heroRes.data.name,
                title: heroRes.data.title,
                description: heroRes.data.description,
                profile_image_url: heroRes.data.profile_image_url || '',
                cta_primary_text: heroRes.data.cta_primary_text || '',
                cta_primary_link: heroRes.data.cta_primary_link || '',
                cta_secondary_text: heroRes.data.cta_secondary_text || '',
                cta_secondary_link: heroRes.data.cta_secondary_link || '',
              }
            : undefined,
          settings: settingsRes.data
            ? {
                site_name: settingsRes.data.site_name || '',
                linkedin_url: settingsRes.data.linkedin_url || '',
                github_url: settingsRes.data.github_url || '',
                instagram_url: settingsRes.data.instagram_url || '',
                portfolio_url: settingsRes.data.portfolio_url || '',
                email: settingsRes.data.email || '',
                phone_number: settingsRes.data.phone_number || '',
              }
            : undefined,
          contact: contactRes.data
            ? {
                heading: contactRes.data.heading,
                description: contactRes.data.description,
              }
            : undefined,
          cv: cvRes.data
            ? {
                title: cvRes.data.title,
                file_url: cvRes.data.file_url || '',
              }
            : undefined,
          section_content: sectionMap,
          services: servicesRes.data && servicesRes.data.length > 0
            ? servicesRes.data.map((s) => ({
                service_title: s.service_title,
                description: s.description,
                icon_class: s.icon_class || '',
                icon_image_url: s.icon_image_url || '',
              }))
            : undefined,
          experiences: experiencesRes.data && experiencesRes.data.length > 0
            ? experiencesRes.data.map((e) => ({
                job_role: e.job_role,
                company_name: e.company_name,
                duration: e.duration,
                description: e.description,
              }))
            : undefined,
          projects: projectsRes.data && projectsRes.data.length > 0
            ? projectsRes.data.map((p) => ({
                project_title: p.project_title,
                category: p.category,
                description: p.description,
                results: p.results,
                image_url: p.image_url || '',
                external_link: p.external_link || '',
              }))
            : undefined,
          testimonials: testimonialsRes.data && testimonialsRes.data.length > 0
            ? testimonialsRes.data.map((t) => ({
                client_name: t.client_name,
                designation: t.designation || '',
                feedback: t.feedback,
                image_url: t.image_url || '',
              }))
            : undefined,
          skills: skillsRes.data && skillsRes.data.length > 0
            ? skillsRes.data.map((s) => s.name)
            : undefined,
          stats: statsRes.data && statsRes.data.length > 0
            ? statsRes.data.map((s) => ({
                label: s.label,
                value: s.value,
              }))
            : undefined,
        }

        setCmsData(payload)
      } catch (err) {
        console.error('Error fetching Supabase CMS content:', err)
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    loadPortfolioContent()

    return () => {
      mounted = false
    }
  }, [])

  // Icon mapping for services
  const iconMap: Record<string, ComponentType<{ className?: string }>> = useMemo(
    () => ({ LineChart, Megaphone, BarChart3, Funnel }),
    []
  )

  // Services with defaults
  const services = useMemo(() => {
    return (
      (cmsData?.services?.length
        ? cmsData.services.map((item) => ({
            icon: iconMap[item.icon_class] || LineChart,
            iconImageUrl: item.icon_image_url,
            title: item.service_title,
            desc: item.description,
          }))
        : null) ?? [
        {
          icon: LineChart,
          iconImageUrl: '',
          title: 'Performance Marketing',
          desc: 'Meta Ads + Google Ads with creative testing, tracking hygiene, and ROI-driven scaling.',
        },
        {
          icon: Megaphone,
          iconImageUrl: '',
          title: 'Social Media Marketing',
          desc: 'Content systems that build trust, increase reach, and support conversion-focused campaigns.',
        },
        {
          icon: BarChart3,
          iconImageUrl: '',
          title: 'SEO & Analytics',
          desc: 'Search-led growth paired with GA4 insights, dashboards, and attribution you can act on.',
        },
        {
          icon: Funnel,
          iconImageUrl: '',
          title: 'Funnel & Lead Generation',
          desc: 'Landing pages, lead magnets, and nurture flows designed to lift CVR and reduce CPL.',
        },
      ]
    )
  }, [cmsData?.services, iconMap])

  // Experiences with defaults
  const experience = useMemo<ExperienceItemData[]>(
    () =>
      (cmsData?.experiences?.length
        ? cmsData.experiences.map((item) => ({
            role: item.job_role,
            company: item.company_name,
            duration: item.duration,
            achievements: parseExperiencePoints(item.description),
          }))
        : null) ?? [
        {
          role: 'Digital Marketing Lead',
          company: 'Growth Studio',
          duration: '2024 — Present',
          achievements: [
            'Scaled paid acquisition to a consistent 4.2x blended ROAS using structured creative testing.',
            'Reduced cost-per-lead by 31% via landing page iteration + conversion-focused messaging.',
            'Built weekly reporting cadence that linked spend → pipeline → revenue.',
          ],
        },
        {
          role: 'Performance Marketer',
          company: 'D2C Brand',
          duration: '2022 — 2024',
          achievements: [
            'Managed multi-channel spend across Meta + Google, optimizing toward MER, not vanity metrics.',
            'Launched full-funnel campaigns (prospecting → retargeting) with audience + offer frameworks.',
            'Introduced GA4 event tracking and UTM governance to improve decision confidence.',
          ],
        },
        {
          role: 'Marketing Associate',
          company: 'Agency',
          duration: '2021 — 2022',
          achievements: [
            'Handled social calendars, community growth, and creative coordination across 6+ clients.',
            'Improved local SEO visibility with on-page fixes and content briefs.',
            'Supported email flows and lead forms, improving follow-up speed and lead quality.',
          ],
        },
      ],
    [cmsData?.experiences]
  )

  // Case Studies with defaults
  const caseStudies = useMemo<ProjectItemData[]>(
    () =>
      (cmsData?.projects?.length
        ? cmsData.projects.map((item) => {
            const parsed = parseProjectLinks(item.external_link)
            return {
              title: item.project_title,
              category: item.category,
              description: item.description,
              result: item.results,
              imageUrl: item.image_url,
              externalLink: item.external_link,
              githubUrl: parsed.githubUrl,
              techStack: parsed.techStack,
            }
          })
        : null) ?? [
        {
          title: 'Full-Stack Analytics & SaaS Platform',
          category: 'Funnels',
          description: 'Modern web application with Supabase auth, real-time analytics, and automated conversion tracking pipelines.',
          result: '100 Lighthouse · Sub-second LCP',
          imageUrl: '',
          externalLink: 'https://github.com/sahalshaad/sahalshad-portfolio',
          githubUrl: 'https://github.com/sahalshaad/sahalshad-portfolio',
          techStack: ['React', 'TypeScript', 'Supabase', 'Tailwind CSS'],
        },
        {
          title: 'Paid Acquisition & Server-Side CAPI Architecture',
          category: 'Ads',
          description: 'Meta Ads and Google Ads scaling paired with server-side CAPI event tracking and creative experimentation frameworks.',
          result: 'Improved ROAS from 2.1x → 3.8x',
          imageUrl: '',
          externalLink: 'https://github.com/sahalshaad',
          githubUrl: 'https://github.com/sahalshaad',
          techStack: ['Meta Ads', 'Meta CAPI', 'GA4', 'GTM Server-Side'],
        },
        {
          title: 'Interactive Funnel & Lead Scoring Web App',
          category: 'Funnels',
          description: 'Interactive qualification funnel with automated CRM webhooks, dynamic scoring, and real-time lead routing.',
          result: '500+ leads in 30 days · 34% CVR',
          imageUrl: '',
          externalLink: 'https://github.com/sahalshaad',
          githubUrl: 'https://github.com/sahalshaad',
          techStack: ['TypeScript', 'Next.js', 'PostgreSQL', 'Webhooks'],
        },
        {
          title: 'Technical SEO & Programmatic Content Platform',
          category: 'SEO',
          description: 'Targeted technical search architecture, schema validation, and programmatic page clusters for B2B search visibility.',
          result: 'Lifted organic signups by 64%',
          imageUrl: '',
          externalLink: 'https://github.com/sahalshaad',
          githubUrl: 'https://github.com/sahalshaad',
          techStack: ['Next.js', 'React', 'SEO Architecture', 'Schema.org'],
        },
      ],
    [cmsData?.projects]
  )

  // Distinct Project Categories
  const categories = useMemo(() => {
    const cats = new Set<string>()
    caseStudies.forEach((p) => {
      if (p.category) cats.add(p.category)
    })
    return ['All', ...Array.from(cats)]
  }, [caseStudies])

  // Filtered projects
  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'All') return caseStudies
    return caseStudies.filter((p) => p.category === selectedCategory)
  }, [caseStudies, selectedCategory])

  const totalPages = Math.ceil(filteredProjects.length / CARDS_PER_PAGE) || 1
  const displayedProjects = useMemo(() => {
    const start = (currentPage - 1) * CARDS_PER_PAGE
    return filteredProjects.slice(start, start + CARDS_PER_PAGE)
  }, [filteredProjects, currentPage])

  // Skill tags
  const skillsList = cmsData?.skills?.length ? cmsData.skills : defaultSkills

  // Section availability flags for Sidebar
  const hasSections = useMemo(
    () => ({
      services: services.length > 0,
      experience: experience.length > 0,
      projects: caseStudies.length > 0,
      stack: skillsList.length > 0,
    }),
    [services, experience, caseStudies, skillsList]
  )

  // Scroll navigation helper
  function navigateToSection(id: string) {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
      try {
        window.history.pushState(null, '', `#${id}`)
      } catch {
        // history unavailable
      }
      setActiveSection(id)
    }
  }

  // Copy email to clipboard
  function handleCopyEmail() {
    if (!contactEmail) return
    navigator.clipboard
      .writeText(contactEmail)
      .then(() => {
        setCopiedEmail(true)
        setTimeout(() => setCopiedEmail(false), 2000)
      })
      .catch(() => {})
  }

  // Precision Scroll-Spy: Accurately highlights the active section in the sidebar as the user scrolls
  useEffect(() => {
    const sectionIds = ['top', 'services', 'experience', 'projects', 'stack', 'contact']
    let ticking = false

    function updateActiveSection() {
      // Near top of page -> Overview
      if (window.scrollY < 120) {
        setActiveSection('top')
        ticking = false
        return
      }

      // Near bottom of page -> Contact
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 80) {
        setActiveSection('contact')
        ticking = false
        return
      }

      // Read eye-line (220px below viewport top)
      const eyeLine = window.scrollY + 220
      let active = sectionIds[0]

      for (const id of sectionIds) {
        const el = document.getElementById(id)
        if (el) {
          const top = el.offsetTop
          if (eyeLine >= top) {
            active = id
          }
        }
      }

      setActiveSection(active)
      ticking = false
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(updateActiveSection)
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    updateActiveSection()

    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Keyboard navigation shortcuts: 1-5 and C
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const target = e.target as HTMLElement
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return
      }

      const keyMap: Record<string, string> = {
        '1': 'top',
        '2': 'services',
        '3': 'experience',
        '4': 'projects',
        '5': 'stack',
        c: 'contact',
        C: 'contact',
      }

      const targetId = keyMap[e.key]
      if (targetId) {
        e.preventDefault()
        navigateToSection(targetId)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Contact form submission (Preserved exactly as required)
  async function onContactSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setContactStatus('loading')
    setContactErrorMessage('')

    const formElement = e.currentTarget
    const form = new FormData(formElement)
    const fullName = String(form.get('name') ?? '').trim()
    const email = String(form.get('email') ?? '').trim()
    const projectType = String(form.get('projectType') ?? '').trim()
    const rawMessage = String(form.get('message') ?? '').trim()

    // Validation
    if (!fullName || fullName.length < 2 || fullName.length > 100) {
      setContactErrorMessage('Please enter a valid name (2-100 characters).')
      setContactStatus('error')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email) || email.length > 255) {
      setContactErrorMessage('Please enter a valid email address.')
      setContactStatus('error')
      return
    }

    if (!rawMessage || rawMessage.length < 5 || rawMessage.length > 5000) {
      setContactErrorMessage('Please enter a message (at least 5 characters).')
      setContactStatus('error')
      return
    }

    const message = projectType ? `[${projectType}] ${rawMessage}` : rawMessage

    try {
      const { error } = await supabase.from('contact_messages').insert([
        {
          name: fullName,
          email,
          message,
        },
      ])

      if (error) {
        throw error
      }

      setContactStatus('success')
      formElement.reset()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to send message. Please try again.'
      setContactErrorMessage(msg)
      setContactStatus('error')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-[var(--bg-page)] text-[var(--text-muted)] font-mono text-xs">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-stone-400 border-t-transparent" />
          <p>Loading portfolio content…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)]">
      {/* Desktop (lg and up): Fixed Left Sidebar */}
      <Sidebar
        name={name}
        role={role}
        avatarUrl={heroImageUrl}
        activeSection={activeSection}
        onNavigate={navigateToSection}
        hasSections={hasSections}
        resources={resources}
        availabilityText={AVAILABILITY_CONSTANTS.status}
      />

      {/* Mobile (below lg): Sticky Top Bar */}
      <MobileTopBar name={name} role={role} avatarUrl={heroImageUrl} />

      {/* Main Content Area (offset on desktop by sidebar width: 240px) */}
      <div className="lg:ml-[240px] flex justify-center px-4 sm:px-8 py-8 sm:py-16 pb-28 lg:pb-16">
        <main className="w-full max-w-3xl space-y-12 sm:space-y-16">
          {/* =============================================================== */}
          {/* 1. OVERVIEW (id: top) */}
          {/* =============================================================== */}
          <section id="top" className="space-y-8 scroll-mt-20">
            {/* Availability Pill / CTA */}
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault()
                navigateToSection('contact')
              }}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] px-3.5 py-1.5 font-mono text-[11px] text-[var(--text-secondary)] shadow-xs hover:border-emerald-500/40 hover:text-[var(--text-primary)] transition-all cursor-pointer"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-medium text-[var(--text-primary)]">
                {AVAILABILITY_CONSTANTS.status}
              </span>
              <span className="text-[var(--text-muted)]">·</span>
              <span className="text-[var(--text-muted)]">{AVAILABILITY_CONSTANTS.location}</span>
            </a>

            {/* Two-Line Headline */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">
                <span className="block text-[var(--text-primary)]">
                  Hello, I’m {name}
                </span>
                <span className="block font-medium mt-1 text-2xl sm:text-4xl">
                  <span className="role-shimmer">{role}</span>
                </span>
              </h1>
              <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-2xl pt-2">
                {hero?.description || defaultDescription}
              </p>
            </div>

            {/* Desktop Action Buttons Row */}
            <div className="hidden lg:flex flex-wrap items-center gap-3">
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault()
                  navigateToSection('contact')
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-stone-900 text-stone-50 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white px-4 py-2.5 text-xs font-semibold shadow-xs transition-colors"
              >
                <span>Contact Me</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>

              {contactEmail ? (
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-[var(--text-muted)] px-4 py-2.5 text-xs font-semibold transition-colors"
                >
                  {copiedEmail ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                      <span>Copy Email</span>
                    </>
                  )}
                </button>
              ) : null}

              {cv?.file_url ? (
                <a
                  href={cv.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-[var(--text-muted)] px-4 py-2.5 text-xs font-semibold transition-colors"
                >
                  <FileText className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                  <span>{cv.title || 'Download CV'}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                </a>
              ) : null}

              {contactPhone ? (
                <a
                  href={`tel:${contactPhone}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-[var(--text-muted)] px-4 py-2.5 text-xs font-semibold transition-colors"
                >
                  <Phone className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                  <span>Call</span>
                </a>
              ) : null}
            </div>

            {/* Mobile Hero Actions: full-width WhatsApp + 3 secondary buttons */}
            <div className="lg:hidden space-y-2.5">
              {whatsAppUrl ? (
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-xs transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Message on WhatsApp</span>
                </a>
              ) : null}

              <div className="grid grid-cols-3 gap-2 w-full">
                {contactPhone ? (
                  <a
                    href={`tel:${contactPhone}`}
                    className="min-h-[44px] flex items-center justify-center gap-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                    <span>Call</span>
                  </a>
                ) : null}

                {contactEmail ? (
                  <a
                    href={`mailto:${contactEmail}`}
                    className="min-h-[44px] flex items-center justify-center gap-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                    <span>Email</span>
                  </a>
                ) : null}

                {cv?.file_url ? (
                  <a
                    href={cv.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] flex items-center justify-center gap-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors"
                  >
                    <FileText className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                    <span>Résumé</span>
                  </a>
                ) : null}
              </div>
            </div>
          </section>

          {/* =============================================================== */}
          {/* 2. SERVICES (id: services) */}
          {/* =============================================================== */}
          <SectionCard
            id="services"
            eyebrow={sectionContent.services?.eyebrow || 'WHAT I DO'}
            title={sectionContent.services?.title || 'Growth services designed for performance'}
            subtitle={sectionContent.services?.subtitle || 'Specialized acquisition, conversion optimization, and analytics architecture.'}
            badge={`${services.length} Specializations`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              {services.map((item, idx) => {
                const IconComponent = item.icon
                return (
                  <div
                    key={`${item.title}-${idx}`}
                    className="group rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 sm:p-5 hover:border-[var(--text-muted)] transition-all"
                  >
                    <div className="h-9 w-9 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card-subtle)] flex items-center justify-center text-[var(--text-primary)] mb-3 group-hover:scale-105 transition-transform">
                      {item.iconImageUrl ? (
                        <img
                          src={item.iconImageUrl}
                          alt={item.title}
                          className="h-5 w-5 object-contain"
                        />
                      ) : (
                        <IconComponent className="h-4 w-4" />
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-1">
                      {item.desc}
                    </p>
                  </div>
                )
              })}
            </div>
          </SectionCard>

          {/* =============================================================== */}
          {/* 3. EXPERIENCE (id: experience) */}
          {/* =============================================================== */}
          <SectionCard
            id="experience"
            eyebrow={sectionContent.experience?.eyebrow || 'CAREER'}
            title={sectionContent.experience?.title || 'Experience & Track Record'}
            subtitle={sectionContent.experience?.subtitle || 'Roles, achievements, and impact across digital growth teams.'}
          >
            <ExperienceAccordion items={experience} />
          </SectionCard>

          {/* =============================================================== */}
          {/* 4. OWN PROJECTS & CASE STUDIES (id: projects) */}
          {/* =============================================================== */}
          <SectionCard
            id="projects"
            eyebrow={sectionContent.work?.eyebrow || 'PROJECTS & CASE STUDIES'}
            title={sectionContent.work?.title || 'Selected Projects & Own Work'}
            subtitle={
              sectionContent.work?.subtitle ||
              'Showcase of client campaigns, digital products, creative video assets, and performance systems.'
            }
            badge={`${caseStudies.length} Projects`}
          >
            <div className="space-y-6">
              {/* Category Filter Pills & Top Right Slide Navigation */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                  {categories.map((cat) => {
                    const isSelected = selectedCategory === cat
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat)
                          setCurrentPage(1)
                        }}
                        className={`min-h-[36px] whitespace-nowrap rounded-xl px-3.5 py-1.5 font-mono text-xs transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-stone-500 ${
                          isSelected
                            ? 'border border-[var(--border-color)] bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 font-semibold shadow-xs'
                            : 'border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)]'
                        }`}
                      >
                        {cat}
                      </button>
                    )
                  })}
                </div>

                {/* Top Right Slide Controls (Shown when > 4 cards) */}
                {totalPages > 1 && (
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                    <span className="font-mono text-xs text-[var(--text-muted)] mr-1">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      title="Previous slide"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)] transition-colors disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      title="Next slide"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)] transition-colors disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Projects Grid: Exactly 4 cards rendered with smooth slide transition */}
              <div
                key={`slide-${currentPage}-${selectedCategory}`}
                className="animate-slide-in space-y-4"
              >
                {/* Desktop Projects Grid (2x2) */}
                <div className="hidden lg:grid grid-cols-2 gap-4">
                  {displayedProjects.map((proj, idx) => (
                    <ProjectCard key={`${proj.title}-${idx}`} project={proj} variant="card" />
                  ))}
                </div>

                {/* Mobile Projects: First is large card, remainder are compact rows */}
                <div className="lg:hidden space-y-3">
                  {displayedProjects.map((proj, idx) => (
                    <ProjectCard
                      key={`${proj.title}-${idx}`}
                      project={proj}
                      variant={idx === 0 ? 'card' : 'compact'}
                    />
                  ))}
                </div>
              </div>

              {/* Bottom Pagination / Slide Number (Shown when > 4 cards) */}
              {totalPages > 1 && (
                <div className="pt-4 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="font-mono text-xs text-[var(--text-muted)]">
                    Showing {(currentPage - 1) * CARDS_PER_PAGE + 1}–
                    {Math.min(currentPage * CARDS_PER_PAGE, filteredProjects.length)} of{' '}
                    {filteredProjects.length} projects
                  </p>

                  <div className="flex items-center gap-1.5">
                    {/* Previous Button */}
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="flex h-8 px-2.5 items-center gap-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)] transition-colors disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Prev</span>
                    </button>

                    {/* Numeric Slide Page Buttons */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                      const isActive = pageNum === currentPage
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setCurrentPage(pageNum)}
                          aria-current={isActive ? 'page' : undefined}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg font-mono text-xs transition-colors ${
                            isActive
                              ? 'border border-[var(--border-color)] bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 font-bold shadow-xs'
                              : 'border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)]'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}

                    {/* Next Button */}
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="flex h-8 px-2.5 items-center gap-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)] transition-colors disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </SectionCard>

          {/* =============================================================== */}
          {/* 5. STACK (id: stack) */}
          {/* =============================================================== */}
          <SectionCard
            id="stack"
            eyebrow="TECH & GROWTH STACK"
            title="Platforms, Tools & Technologies"
            subtitle="Core operational stack across paid channels, tracking infrastructure, automations, and web frameworks."
            badge={`${skillsList.length} Competencies`}
          >
            <div className="space-y-6">
              {/* Stack Category Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 sm:p-5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold">
                      Paid Media & Acquisition
                    </span>
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">Scale</span>
                  </div>
                  <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                    Performance Ad Platforms
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Meta Ads Manager, Google Ads (Search, Performance Max, Display, YouTube), TikTok Ads Manager, LinkedIn Campaign Manager.
                  </p>
                </div>

                <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 sm:p-5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold">
                      Analytics & Tracking
                    </span>
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">Attribution</span>
                  </div>
                  <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                    Measurement & Event Governance
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Google Analytics 4, Google Tag Manager (Web & Server-side CAPI), Looker Studio, Microsoft Clarity, Search Console.
                  </p>
                </div>

                <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 sm:p-5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold">
                      CRO & Lead Funnels
                    </span>
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">Conversion</span>
                  </div>
                  <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                    Funnel & Landing Page Architecture
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Landing page frameworks, high-converting offer hooks, A/B split-testing, checkout flow optimization, and CRM lead routers.
                  </p>
                </div>

                <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 sm:p-5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold">
                      Modern Web & Automation
                    </span>
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">Build</span>
                  </div>
                  <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                    Web Technologies & Tools
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    React, TypeScript, Tailwind CSS, Vite, Supabase, PostgreSQL, Webflow, Shopify, WordPress, Zapier, and n8n.
                  </p>
                </div>
              </div>

              {/* Dynamic Skills & Tools Chips from CMS / Supabase */}
              <div className="pt-2 border-t border-[var(--border-color)] space-y-2.5">
                <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
                  All Tags & Tools
                </p>
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                  {skillsList.map((skill) => (
                    <div
                      key={skill}
                      className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card-subtle)] px-3 py-2 text-center sm:text-left text-xs font-mono text-[var(--text-primary)] hover:border-emerald-500/40 hover:bg-[var(--bg-card-hover)] transition-all"
                    >
                      <span className="truncate">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* =============================================================== */}
          {/* 8. CONTACT (id: contact) */}
          {/* =============================================================== */}
          <SectionCard
            id="contact"
            eyebrow="INQUIRIES"
            title={contact?.heading || 'Let’s Grow Your Business'}
            subtitle={
              contact?.description ||
              'Share your goals and I’ll reply with a clear, business-driven strategy to scale pipeline and revenue.'
            }
          >
            <div className="space-y-6">
              {/* Direct Contact Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {contactEmail ? (
                  <a
                    href={`mailto:${contactEmail}`}
                    className="min-h-[44px] flex items-center justify-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card-subtle)] p-3 text-xs font-medium text-[var(--text-primary)] hover:border-[var(--text-muted)] hover:bg-[var(--bg-card-hover)] transition-colors"
                  >
                    <Mail className="h-4 w-4 text-[var(--text-muted)]" />
                    <span className="truncate">{contactEmail}</span>
                  </a>
                ) : null}

                {contactPhone ? (
                  <a
                    href={`tel:${contactPhone}`}
                    className="min-h-[44px] flex items-center justify-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card-subtle)] p-3 text-xs font-medium text-[var(--text-primary)] hover:border-[var(--text-muted)] hover:bg-[var(--bg-card-hover)] transition-colors"
                  >
                    <Phone className="h-4 w-4 text-[var(--text-muted)]" />
                    <span className="truncate">{contactPhone}</span>
                  </a>
                ) : null}

                {whatsAppUrl ? (
                  <a
                    href={whatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] flex items-center justify-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card-subtle)] p-3 text-xs font-medium text-[var(--text-primary)] hover:border-emerald-500/50 hover:bg-[var(--bg-card-hover)] transition-colors"
                  >
                    <MessageCircle className="h-4 w-4 text-emerald-500" />
                    <span>WhatsApp</span>
                  </a>
                ) : null}
              </div>

              {/* Form Status Messages */}
              {contactStatus === 'success' ? (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  Thank you! Your message has been received. I’ll get back to you within 24 hours.
                </div>
              ) : null}

              {contactStatus === 'error' ? (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs font-medium text-red-600 dark:text-red-400">
                  {contactErrorMessage || 'Unable to send message. Please try again.'}
                </div>
              ) : null}

              {/* Existing Contact Form */}
              <form onSubmit={onContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="form-name"
                      className="block text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] mb-1.5"
                    >
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="form-name"
                      type="text"
                      name="name"
                      required
                      placeholder="Jane Doe"
                      className="w-full min-h-[44px] rounded-xl border border-[var(--border-color)] bg-[var(--bg-card-subtle)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus-visible:outline-2 focus-visible:outline-stone-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="form-email"
                      className="block text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] mb-1.5"
                    >
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="form-email"
                      type="email"
                      name="email"
                      required
                      placeholder="jane@example.com"
                      className="w-full min-h-[44px] rounded-xl border border-[var(--border-color)] bg-[var(--bg-card-subtle)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus-visible:outline-2 focus-visible:outline-stone-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="form-projectType"
                    className="block text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] mb-1.5"
                  >
                    Area of Interest
                  </label>
                  <select
                    id="form-projectType"
                    name="projectType"
                    defaultValue="Meta & Paid Ads"
                    className="w-full min-h-[44px] rounded-xl border border-[var(--border-color)] bg-[var(--bg-card-subtle)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-stone-500 transition-colors"
                  >
                    <option value="Meta & Paid Ads">Meta & Paid Acquisition</option>
                    <option value="Google Ads & Search">Google Ads & Search</option>
                    <option value="Funnel Optimization & CRO">Funnel Optimization & CRO</option>
                    <option value="SEO & Organic Growth">SEO & Organic Growth</option>
                    <option value="General Consultation">General Growth Consultation</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="form-message"
                    className="block text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] mb-1.5"
                  >
                    Project Details <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="form-message"
                    name="message"
                    required
                    rows={4}
                    placeholder="Tell me about your business goals, current bottlenecks, and target timeline..."
                    className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-card-subtle)] p-3.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus-visible:outline-2 focus-visible:outline-stone-500 transition-colors"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={contactStatus === 'loading'}
                    className="inline-flex items-center justify-center gap-2 w-full sm:w-auto min-h-[44px] rounded-xl bg-stone-900 text-stone-50 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white px-6 py-3 text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
                  >
                    {contactStatus === 'loading' ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Sending message…</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        <span>Send Inquiry</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </SectionCard>

          {/* =============================================================== */}
          {/* FOOTER */}
          {/* =============================================================== */}
          <Footer
            name={name}
            onNavigate={navigateToSection}
            socialLinks={socialLinks}
            cvUrl={cv?.file_url}
          />
        </main>
      </div>

      {/* Mobile (below lg): Fixed Bottom Tab Bar */}
      <BottomTabBar activeSection={activeSection} onNavigate={navigateToSection} />
    </div>
  )
}
