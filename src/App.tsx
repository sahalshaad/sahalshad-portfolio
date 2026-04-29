import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowRight,
  BarChart3,
  Funnel,
  LineChart,
  Link2,
  Megaphone,
  Menu,
  Sparkles,
  X,
} from 'lucide-react'
import type { ComponentType, FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'

type Experience = {
  role: string
  company: string
  duration: string
  achievements: string[]
}

type CaseStudy = {
  title: string
  category: string
  result: string
  description?: string
  imageUrl?: string
  externalLink?: string
}

type Testimonial = {
  quote: string
  name: string
  title: string
  initials: string
  imageUrl?: string
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
    instagram_url: string
    portfolio_url: string
    email: string
    phone_number: string
  }
}

const DEFAULT_LOCAL_API_ORIGIN = 'http://127.0.0.1:8000'
const DEFAULT_HERO_IMAGE = '/media/hero/IMG_1448.JPG'

function getApiBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '')
  if (configuredBaseUrl) {
    return configuredBaseUrl
  }

  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return window.location.port === '8000' ? '/api' : `${DEFAULT_LOCAL_API_ORIGIN}/api`
  }

  return '/api'
}

function apiUrl(path: string) {
  return `${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`
}

function App() {
  const prefersReducedMotion = useReducedMotion()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [cmsData, setCmsData] = useState<CmsPayload | null>(null)
  const [contactStatus, setContactStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const defaultName = 'sahalshad'
  const defaultRole = 'Digital Marketing Specialist'
  const defaultDescription =
    'I help ambitious brands grow through Performance Marketing, Meta Ads, and Lead Generation systems designed to increase qualified pipeline and revenue.'
  const defaultSkills = ['Meta Ads', 'Google Ads', 'GA4', 'SEO', 'CRO', 'Landing Pages', 'Funnels']

  const hero = cmsData?.hero
  const heroImageUrl = hero?.profile_image_url || (cmsData ? '' : DEFAULT_HERO_IMAGE)
  const contact = cmsData?.contact
  const general = cmsData?.settings
  const cv = cmsData?.cv
  const sectionContent = cmsData?.section_content || {}

  const name = hero?.name || defaultName
  const websiteName = general?.site_name || 'sahalshad'
  const role = hero?.title || defaultRole
  const socialLinks = [
    general?.linkedin_url ? { href: general.linkedin_url, label: 'LinkedIn' } : null,
    general?.instagram_url ? { href: general.instagram_url, label: 'Instagram' } : null,
    general?.portfolio_url ? { href: general.portfolio_url, label: 'Portfolio' } : null,
  ].filter((link): link is { href: string; label: string } => Boolean(link))

  useEffect(() => {
    let mounted = true
    fetch(apiUrl('/portfolio-content/'), { credentials: 'include' })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to load CMS content')
        }
        return res.json()
      })
      .then((data: CmsPayload) => {
        if (mounted) {
          setCmsData(data)
        }
      })
      .catch(() => {
        // Keep static fallback content when Django API isn't available.
      })
    return () => {
      mounted = false
    }
  }, [])

  const nav = useMemo(
    () => [
      { label: 'Services', href: '#services' },
      { label: 'Experience', href: '#experience' },
      { label: 'Work', href: '#work' },
      { label: 'Results', href: '#results' },
      { label: 'Testimonials', href: '#testimonials' },
      { label: 'Contact', href: '#contact' },
    ],
    [],
  )

  const iconMap: Record<string, ComponentType<{ className?: string }>> = useMemo(
    () => ({ LineChart, Megaphone, BarChart3, Funnel }),
    [],
  )

  const services = useMemo(() => {
    if (cmsData?.services?.length) {
      return cmsData.services.map((item) => ({
        icon: iconMap[item.icon_class] || LineChart,
        iconImageUrl: item.icon_image_url,
        title: item.service_title,
        desc: item.description,
      }))
    }
    return [
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
  }, [cmsData?.services, iconMap])

  const experience = useMemo<Experience[]>(
    () =>
      cmsData?.experiences?.length
        ? cmsData.experiences.map((item) => ({
            role: item.job_role,
            company: item.company_name,
            duration: item.duration,
            achievements: [item.description],
          }))
        : [
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
    [cmsData?.experiences],
  )

  const caseStudies = useMemo<CaseStudy[]>(
    () =>
      cmsData?.projects?.length
        ? cmsData.projects.map((item) => ({
            title: item.project_title,
            category: item.category,
            description: item.description,
            result: item.results,
            imageUrl: item.image_url,
            externalLink: item.external_link,
          }))
        : [
            {
              title: 'Lead Engine for a Coaching Program',
              category: 'Funnels',
              result: 'Generated 500+ leads in 30 days with a webinar funnel + retargeting loop.',
            },
            {
              title: 'Paid Scaling for D2C Skincare',
              category: 'Ads',
              result: 'Improved ROAS from 2.1x → 3.8x by refreshing creatives + tightening tracking.',
            },
            {
              title: 'Brand Refresh for a Local Service',
              category: 'Branding',
              result: 'Increased inbound enquiries by 42% after positioning update + social content system.',
            },
            {
              title: 'SEO Growth for a B2B Website',
              category: 'SEO',
              result: 'Lifted organic signups by 64% via topic clusters, technical fixes, and CRO tweaks.',
            },
          ],
    [cmsData?.projects],
  )

  const stats = useMemo(
    () =>
      cmsData?.stats?.length
        ? cmsData.stats
        : [
            { label: 'Total Ad Spend Managed', value: '$250k+' },
            { label: 'Leads Generated', value: '3,500+' },
            { label: 'Clients Worked With', value: '18+' },
            { label: 'Campaign Success Rate', value: '92%' },
          ],
    [cmsData?.stats],
  )

  const testimonials = useMemo<Testimonial[]>(
    () =>
      cmsData?.testimonials?.length
        ? cmsData.testimonials.map((item) => ({
            quote: item.feedback,
            name: item.client_name,
            title: item.designation || 'Client',
            initials: item.client_name
              .split(' ')
              .slice(0, 2)
              .map((s) => s[0])
              .join('')
              .toUpperCase(),
            imageUrl: item.image_url,
          }))
        : [
            {
              quote:
                'Clear strategy, fast execution, and the reporting was refreshingly business-focused. Our leads improved within weeks.',
              name: 'Ananya Kapoor',
              title: 'Founder, Coaching Brand',
              initials: 'AK',
            },
            {
              quote:
                'Every change was backed by data. Creatives, audiences, landing page—everything moved in the right direction.',
              name: 'Rahul Mehta',
              title: 'Marketing Manager, D2C',
              initials: 'RM',
            },
            {
              quote:
                'The funnel work was the difference. Better quality leads and fewer wasted calls—solid ROI.',
              name: 'Sarah Thomas',
              title: 'Owner, Local Services',
              initials: 'ST',
            },
          ],
    [cmsData?.testimonials],
  )

  const reveal = useMemo(() => {
    if (prefersReducedMotion) return undefined
    return {
      hidden: { opacity: 0, y: 14 },
      show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.55, ease: [0.2, 0.8, 0.2, 1] as [number, number, number, number] },
      },
    }
  }, [prefersReducedMotion])

  function closeMobileNav() {
    setMobileNavOpen(false)
  }

  async function onContactSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setContactStatus('idle')
    const formElement = e.currentTarget
    const form = new FormData(formElement)
    const fullName = String(form.get('name') ?? '')
    const email = String(form.get('email') ?? '')
    const projectType = String(form.get('projectType') ?? '')
    const message = String(form.get('message') ?? '')

    try {
      const res = await fetch(apiUrl('/contact-submit/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: fullName,
          email,
          projectType,
          message,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Unable to send message')
      }

      setContactStatus('success')
      formElement.reset()
    } catch {
      setContactStatus('error')
    }
  }

  return (
    <div className="relative min-h-screen bg-white text-zinc-950">
      {/* background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="noise absolute inset-0 opacity-[0.35]" />
        <div className="absolute -top-48 left-1/2 h-[520px] w-[760px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.18),rgba(255,255,255,0)_60%)] blur-2xl" />
        <div className="absolute top-[35%] -left-40 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.12),rgba(255,255,255,0)_60%)] blur-2xl" />
        <div className="absolute top-[65%] -right-48 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.12),rgba(255,255,255,0)_60%)] blur-2xl" />
      </div>

      {/* nav */}
      <header className="sticky top-0 z-50 border-b border-zinc-200/60 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/55">
        <div className="container-premium flex h-16 items-center justify-between gap-4">
          <a href="#top" className="group flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
              <img src="/pixo.sahal.png" alt="sahalshad logo" className="h-full w-full object-cover" />
            </span>
            <span className="text-sm font-semibold tracking-tight">
              {websiteName}
              <span className="text-zinc-400">.</span>
            </span>
          </a>

          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950"
              >
                {item.label}
              </a>
            ))}
            <a
              href="#contact"
              className="ml-2 inline-flex items-center gap-2 rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
            >
              Let’s Talk
              <ArrowRight className="h-4 w-4" />
            </a>
          </nav>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white p-2 shadow-sm transition hover:bg-zinc-50 md:hidden"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {mobileNavOpen ? (
          <div className="md:hidden">
            <div className="container-premium py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Menu</div>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white p-2 shadow-sm transition hover:bg-zinc-50"
                  onClick={() => setMobileNavOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-3 grid gap-1">
                {nav.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileNav}
                    className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    {item.label}
                  </a>
                ))}
                <a
                  href="#contact"
                  onClick={closeMobileNav}
                  className="rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  Let’s Grow Your Business
                </a>
              </div>
            </div>
          </div>
        ) : null}
      </header>

      <main id="top" className="relative">
        {/* hero */}
        <section className="container-premium relative grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-2 lg:gap-20 lg:py-24">
          <motion.div
            initial={reveal?.hidden}
            animate={reveal?.show}
            className="relative"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              Available for projects
            </div>

            <h1 className="mt-5 text-balance font-semibold tracking-tight text-zinc-950">
              <span className="block text-[40px] leading-[1.05] sm:text-[56px]">
                Hello, I’m{' '}
                <span className="relative">
                  <span className="relative z-10">{name}</span>
                  <span className="absolute -bottom-1 left-0 right-0 z-0 h-3 rounded-full bg-[linear-gradient(90deg,rgba(124,58,237,0.25),rgba(6,182,212,0.18),rgba(244,63,94,0.18))]" />
                </span>
              </span>
              <span className="mt-3 block text-lg font-medium text-zinc-600 sm:text-xl">
                {role}
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-zinc-600 sm:text-lg">
              {hero?.description || defaultDescription}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href={hero?.cta_primary_link || '#work'}
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
              >
                {hero?.cta_primary_text || 'View My Work'}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </a>
              <a
                href={hero?.cta_secondary_link || '#contact'}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-zinc-50 hover:shadow-md active:translate-y-0"
              >
                {hero?.cta_secondary_text || 'Contact Me'}
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-2 text-xs text-zinc-600">
              {(cmsData?.skills?.length ? cmsData.skills : defaultSkills).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-zinc-200 bg-white px-3 py-1 shadow-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0, transition: { duration: 0.55 } }}
            className="relative w-full lg:justify-self-end"
          >
            <div className="relative mx-auto w-full max-w-[560px]">
              <div className="absolute right-4 top-1 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.22),rgba(255,255,255,0)_70%)] blur-2xl" />
              <div className="absolute left-8 bottom-8 h-44 w-44 rounded-full bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.16),rgba(255,255,255,0)_72%)] blur-2xl" />

              <div className="relative rounded-[34px] border border-zinc-200 bg-zinc-50/80 p-5 shadow-sm backdrop-blur-sm sm:p-7">
                {heroImageUrl ? (
                  <div className="mx-auto aspect-square w-full max-w-[430px] overflow-hidden rounded-full border border-zinc-200 bg-white shadow-[0_16px_45px_rgba(0,0,0,0.14)]">
                    <img
                      src={heroImageUrl}
                      alt={`${name} portrait`}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                ) : null}
                <div className="absolute bottom-6 left-6 rounded-xl border border-white/70 bg-white/85 px-3 py-2 text-xs font-semibold text-zinc-900 backdrop-blur">
                  Digital Marketing Specialist
                </div>
              </div>

              {/* floating UI elements */}
              {prefersReducedMotion ? null : (
                <>
                  <motion.div
                    className="absolute -left-3 top-14 hidden sm:block"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <MiniChip icon={Megaphone} label="Meta Ads" />
                  </motion.div>
                  <motion.div
                    className="absolute -right-4 bottom-16 hidden sm:block"
                    animate={{ y: [0, 12, 0] }}
                    transition={{ duration: 6.2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <MiniChip icon={BarChart3} label="Growth Analytics" />
                  </motion.div>
                  <motion.div
                    className="absolute left-10 -bottom-3 hidden sm:block"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <MiniChip icon={LineChart} label="ROI Focus" />
                  </motion.div>
                </>
              )}
            </div>
          </motion.div>
        </section>

        {/* services */}
        <section id="services" className="container-premium py-16 sm:py-20">
          <SectionHeading
            eyebrow={sectionContent.services?.eyebrow || 'What I do'}
            title={sectionContent.services?.title || 'Growth services designed for performance'}
            subtitle={
              sectionContent.services?.subtitle ||
              'Clean strategy, crisp execution, and reporting that connects marketing to revenue.'
            }
          />

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {services.map((s) => (
              <motion.div
                key={s.title}
                initial={reveal?.hidden}
                whileInView={reveal?.show}
                viewport={{ once: true, margin: '-80px' }}
                className="group relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.18),rgba(255,255,255,0)_60%)] blur-xl transition group-hover:opacity-80" />
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50">
                    {s.iconImageUrl ? (
                      <img src={s.iconImageUrl} alt={s.title} className="h-5 w-5 object-contain" />
                    ) : (
                      <s.icon className="h-5 w-5" />
                    )}
                  </span>
                  <h3 className="text-sm font-semibold tracking-tight">{s.title}</h3>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-zinc-600">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* experience */}
        <section id="experience" className="container-premium py-16 sm:py-20">
          <SectionHeading
            eyebrow={sectionContent.experience?.eyebrow || 'Experience'}
            title={sectionContent.experience?.title || 'Hands-on, results-driven marketing'}
            subtitle={
              sectionContent.experience?.subtitle ||
              'From campaign architecture to creative iteration and funnel performance.'
            }
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-[1fr,1fr]">
            <div className="relative hidden lg:block">
              <div className="sticky top-24 rounded-3xl border border-zinc-200 bg-white p-7 shadow-sm">
                <div className="text-sm font-semibold">How I work</div>
                <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                  I build growth like a system: measurement first, then structured testing—so scaling feels predictable,
                  not chaotic.
                </p>
                <ul className="mt-6 grid gap-3 text-sm text-zinc-700">
                  {[
                    'Funnel mapping + offer clarity',
                    'Creative testing with tight feedback loops',
                    'Tracking + attribution hygiene (GA4/UTMs/events)',
                    'Weekly reporting tied to pipeline and revenue',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-1.5 inline-flex h-2 w-2 rounded-full bg-zinc-950" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="relative grid gap-4">
              <div className="pointer-events-none absolute left-4 top-1 bottom-1 hidden w-px bg-zinc-200 sm:block" />
              {experience.map((job, idx) => (
                <motion.article
                  key={`${job.company}-${job.role}`}
                  initial={reveal?.hidden}
                  whileInView={reveal?.show}
                  viewport={{ once: true, margin: '-80px' }}
                  className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md sm:pl-10"
                >
                  <div className="absolute left-4 top-9 hidden h-3 w-3 -translate-x-1/2 rounded-full border-2 border-white bg-zinc-950 shadow-sm sm:block" />
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold tracking-tight">{job.role}</div>
                      <div className="mt-1 text-sm text-zinc-600">{job.company}</div>
                    </div>
                    <div className="text-xs font-medium text-zinc-500">{job.duration}</div>
                  </div>
                  <ul className="mt-4 grid gap-2 text-sm leading-relaxed text-zinc-700">
                    {job.achievements.map((a) => (
                      <li key={a} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-zinc-300" />
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="absolute -right-20 -bottom-24 h-52 w-52 rounded-full bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.16),rgba(255,255,255,0)_60%)] blur-2xl" />
                  {idx === 0 ? (
                    <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700">
                      <Sparkles className="h-3.5 w-3.5" />
                      Current role
                    </div>
                  ) : null}
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* work */}
        <section id="work" className="container-premium py-16 sm:py-20">
          <SectionHeading
            eyebrow={sectionContent.work?.eyebrow || 'Case studies'}
            title={sectionContent.work?.title || 'Work that speaks in numbers'}
            subtitle={sectionContent.work?.subtitle || 'A selection of projects across ads, branding, SEO, and funnels.'}
          />

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {caseStudies.map((p) => (
              <motion.div
                key={p.title}
                initial={reveal?.hidden}
                whileInView={reveal?.show}
                viewport={{ once: true, margin: '-80px' }}
                className="group relative overflow-hidden rounded-[32px] border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100">
                  <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.18),rgba(255,255,255,0)_60%)] blur-2xl" />
                  <div className="absolute -right-24 -bottom-24 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.14),rgba(255,255,255,0)_60%)] blur-2xl" />
                </div>

                <div className="relative">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-700">
                      {p.category}
                    </span>
                    <span className="text-xs text-zinc-500">Featured</span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight">{p.title}</h3>
                  {p.description ? <p className="mt-2 text-sm leading-relaxed text-zinc-600">{p.description}</p> : null}
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600">{p.result}</p>

                  <div className="mt-6 flex items-center justify-between gap-3">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="h-12 w-[120px] rounded-2xl border border-zinc-200 object-cover"
                      />
                    ) : (
                      <div className="h-12 w-[120px] rounded-2xl border border-zinc-200 bg-[linear-gradient(135deg,rgba(0,0,0,0.04),rgba(0,0,0,0.00))]" />
                    )}
                    <a
                      href={p.externalLink || '#'}
                      target={p.externalLink ? '_blank' : undefined}
                      rel={p.externalLink ? 'noreferrer' : undefined}
                      className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-zinc-50"
                    >
                      View Details
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* results */}
        <section id="results" className="container-premium py-16 sm:py-20">
          <SectionHeading
            eyebrow={sectionContent.results?.eyebrow || 'Results'}
            title={sectionContent.results?.title || 'Metrics that matter to business'}
            subtitle={sectionContent.results?.subtitle || 'Clear wins across spend efficiency, lead volume, and campaign reliability.'}
          />

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <motion.div
                key={s.label}
                initial={reveal?.hidden}
                whileInView={reveal?.show}
                viewport={{ once: true, margin: '-80px' }}
                className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm"
              >
                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.16),rgba(255,255,255,0)_60%)] blur-2xl" />
                <div className="relative text-3xl font-semibold tracking-tight sm:text-4xl">{s.value}</div>
                <div className="relative mt-2 text-sm text-zinc-600">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* testimonials */}
        <section id="testimonials" className="container-premium py-16 sm:py-20">
          <SectionHeading
            eyebrow={sectionContent.testimonials?.eyebrow || 'Testimonials'}
            title={sectionContent.testimonials?.title || 'Trusted partnerships'}
            subtitle={sectionContent.testimonials?.subtitle || 'Short, honest feedback from clients and teams I’ve worked with.'}
          />

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {testimonials.map((t) => (
              <motion.figure
                key={t.name}
                initial={reveal?.hidden}
                whileInView={reveal?.show}
                viewport={{ once: true, margin: '-80px' }}
                className="relative overflow-hidden rounded-[32px] border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <blockquote className="text-sm leading-relaxed text-zinc-700">“{t.quote}”</blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  {t.imageUrl ? (
                    <img src={t.imageUrl} alt={t.name} className="h-10 w-10 rounded-2xl object-cover" />
                  ) : (
                    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-zinc-950 text-xs font-semibold text-white">
                      {t.initials}
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-zinc-500">{t.title}</div>
                  </div>
                </figcaption>
                <div className="absolute -bottom-24 -left-24 h-52 w-52 rounded-full bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.14),rgba(255,255,255,0)_60%)] blur-2xl" />
              </motion.figure>
            ))}
          </div>
        </section>

        {/* contact */}
        <section id="contact" className="container-premium py-16 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.9fr,1.1fr] lg:items-start">
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm">
                Let’s build your next growth win
              </div>
              <h2 className="mt-5 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                {contact?.heading || 'Let’s Grow Your Business'}
              </h2>
              <p className="mt-4 max-w-xl text-pretty text-sm leading-relaxed text-zinc-600 sm:text-base">
                {contact?.description ||
                  'Share your goals and I’ll reply with a simple plan: what to test first, what to measure, and how we’ll move from clicks to customers.'}
              </p>
              <div className="mt-6 text-sm text-zinc-600">
                <span className="font-medium text-zinc-900">Note:</span> I’ll get back within 24 hours.
              </div>

              <div className="mt-8 grid gap-3">
                {general?.linkedin_url ? (
                  <a
                    className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold shadow-sm transition hover:bg-zinc-50"
                    href={general.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Link2 className="h-4 w-4" />
                    LinkedIn
                  </a>
                ) : null}
                {cv?.file_url ? (
                  <a
                    className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold shadow-sm transition hover:bg-zinc-50"
                    href={cv.file_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ArrowRight className="h-4 w-4" />
                    {cv.title || 'Download CV'}
                  </a>
                ) : null}
              </div>
            </div>

            <motion.form
              initial={reveal?.hidden}
              whileInView={reveal?.show}
              viewport={{ once: true, margin: '-80px' }}
              onSubmit={onContactSubmit}
              className="relative overflow-hidden rounded-[32px] border border-zinc-200 bg-white p-6 shadow-sm sm:p-7"
            >
              <div className="absolute -right-32 -top-36 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.16),rgba(255,255,255,0)_60%)] blur-2xl" />

              <div className="relative grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Name" name="name" placeholder="Your full name" />
                  <Field label="Email" name="email" type="email" placeholder="you@company.com" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700">Project Type</label>
                  <select
                    name="projectType"
                    className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-300 focus:ring-4 focus:ring-zinc-950/5"
                    defaultValue=""
                    required
                  >
                    <option value="" disabled>
                      Select one
                    </option>
                    <option value="Performance Marketing">Performance Marketing</option>
                    <option value="Social Media Marketing">Social Media Marketing</option>
                    <option value="SEO & Analytics">SEO & Analytics</option>
                    <option value="Funnel & Lead Generation">Funnel & Lead Generation</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700">Message</label>
                  <textarea
                    name="message"
                    rows={5}
                    placeholder="Tell me what you’re trying to achieve (goals, budget, timeline)."
                    className="mt-2 w-full resize-none rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-300 focus:ring-4 focus:ring-zinc-950/5"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
                >
                  Send Message
                  <ArrowRight className="h-4 w-4" />
                </button>

                {contactStatus === 'success' ? (
                  <div className="text-xs text-emerald-600">Message sent successfully</div>
                ) : null}
                {contactStatus === 'error' ? (
                  <div className="text-xs text-red-600">Unable to send message. Please try again.</div>
                ) : null}
              </div>
            </motion.form>
          </div>
        </section>

        {/* footer */}
        <footer className="border-t border-zinc-200/70">
          <div className="container-premium flex flex-col gap-4 py-10 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-zinc-600">
              <span className="font-semibold text-zinc-950">{websiteName}</span> — Digital Marketing • ROI • Growth
            </div>
            {socialLinks.length ? (
              <div className="flex flex-wrap items-center gap-2">
                {socialLinks.map((link) => (
                  <FooterLink key={link.label} href={link.href} label={link.label} />
                ))}
              </div>
            ) : null}
          </div>
        </footer>
      </main>
    </div>
  )
}

function SectionHeading(props: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <div className="max-w-2xl">
      <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-700 shadow-sm">
        {props.eyebrow}
      </div>
      <h2 className="mt-5 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{props.title}</h2>
      <p className="mt-3 text-pretty text-sm leading-relaxed text-zinc-600 sm:text-base">{props.subtitle}</p>
    </div>
  )
}

function Field(props: { label: string; name: string; placeholder: string; type?: string }) {
  return (
    <div>
      <label className="text-xs font-semibold text-zinc-700">{props.label}</label>
      <input
        name={props.name}
        type={props.type ?? 'text'}
        placeholder={props.placeholder}
        required
        className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-300 focus:ring-4 focus:ring-zinc-950/5"
      />
    </div>
  )
}

function MiniChip(props: { icon: ComponentType<{ className?: string }>; label: string }) {
  const Icon = props.icon
  return (
    <div className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 shadow-sm">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-950 text-white">
        <Icon className="h-4 w-4" />
      </span>
      {props.label}
    </div>
  )
}

function FooterLink(props: { href: string; label: string }) {
  return (
    <a
      href={props.href}
      className="rounded-full border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-zinc-50 hover:text-zinc-950 hover:shadow-md active:translate-y-0"
      target={props.href.startsWith('http') ? '_blank' : undefined}
      rel={props.href.startsWith('http') ? 'noreferrer' : undefined}
    >
      {props.label}
    </a>
  )
}

export default App
