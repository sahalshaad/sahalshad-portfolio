import {
  Home,
  Sparkles,
  Briefcase,
  FolderGit2,
  Layers,
  Mail,
  FileText,
  ArrowUpRight,
} from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'

function GithubIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  )
}

function LinkedinIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.8v8.37h-2.8V10.9M7.86 6.78a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28z" />
    </svg>
  )
}

function InstagramIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

interface NavItemConfig {
  id: string
  label: string
  icon: typeof Home
  badge: string
  enabled: boolean
}

interface SidebarProps {
  name: string
  role: string
  avatarUrl?: string
  activeSection: string
  onNavigate: (id: string) => void
  hasSections: {
    services: boolean
    experience: boolean
    projects: boolean
    stack: boolean
  }
  resources: {
    cvUrl?: string
    cvTitle?: string
    githubUrl?: string
    linkedinUrl?: string
    instagramUrl?: string
  }
  availabilityText?: string
}

export function Sidebar({
  name,
  role,
  avatarUrl,
  activeSection,
  onNavigate,
  hasSections,
  resources,
  availabilityText = 'Available for Freelance',
}: SidebarProps) {
  const initials =
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0].toUpperCase())
      .join('') || 'S'

  const primaryNavItems: NavItemConfig[] = [
    { id: 'top', label: 'Overview', icon: Home, badge: '1', enabled: true },
    { id: 'services', label: 'Services', icon: Sparkles, badge: '2', enabled: hasSections.services },
    { id: 'experience', label: 'Experience', icon: Briefcase, badge: '3', enabled: hasSections.experience },
    { id: 'projects', label: 'Projects', icon: FolderGit2, badge: '4', enabled: hasSections.projects },
    { id: 'stack', label: 'Stack', icon: Layers, badge: '5', enabled: hasSections.stack },
  ]

  const enabledNavItems = primaryNavItems.filter((item) => item.enabled)
  const resumeUrl = resources.cvUrl || ''
  const githubUrl = resources.githubUrl || 'https://github.com/sahalshaad'
  const linkedinUrl = resources.linkedinUrl || 'https://www.linkedin.com/in/sahalshad'
  const instagramUrl = resources.instagramUrl || 'https://instagram.com/sahalshad'

  return (
    <aside className="hidden lg:flex fixed top-0 bottom-0 left-0 w-[240px] flex-col justify-between border-r border-[var(--border-color)] bg-[var(--bg-page)]/90 backdrop-blur-md z-40 p-4 overflow-y-auto no-scrollbar select-none">
      <div className="space-y-6">
        {/* Header: circular avatar, name, title, theme toggle on the right */}
        <div className="flex items-center justify-between gap-2.5 pb-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-[var(--border-color)] bg-[var(--bg-card-subtle)] flex items-center justify-center">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name}
                  className="h-full w-full object-cover object-center"
                />
              ) : (
                <span className="font-mono text-xs font-semibold text-[var(--text-secondary)]">
                  {initials}
                </span>
              )}
            </div>

            <div className="min-w-0">
              <h1 className="text-xs font-semibold text-[var(--text-primary)] truncate">
                {name}
              </h1>
              <p className="text-[11px] text-[var(--text-muted)] truncate">{role}</p>
            </div>
          </div>

          <ThemeToggle />
        </div>

        {/* Primary Navigation with Enhanced Highlight */}
        <div className="space-y-1">
          <p className="px-2 pb-1.5 text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]">
            Navigation
          </p>
          <nav aria-label="Primary" className="space-y-0.5">
            {enabledNavItems.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.id

              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    onNavigate(item.id)
                  }}
                  aria-current={isActive ? 'location' : undefined}
                  className={`group relative flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'border border-emerald-500/40 bg-emerald-500/[0.08] text-[var(--text-primary)] shadow-xs'
                      : 'border border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 truncate">
                    {isActive && (
                      <span className="absolute left-1 h-3.5 w-1 rounded-full bg-emerald-500" />
                    )}
                    <Icon
                      className={`h-3.5 w-3.5 shrink-0 transition-colors ${
                        isActive
                          ? 'text-emerald-500 scale-105'
                          : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]'
                      }`}
                    />
                    <span className={`truncate ${isActive ? 'font-semibold text-[var(--text-primary)]' : ''}`}>
                      {item.label}
                    </span>
                  </div>

                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                      isActive
                        ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold'
                        : 'border-transparent text-[var(--text-muted)] group-hover:border-[var(--border-color)] group-hover:text-[var(--text-secondary)]'
                    }`}
                  >
                    {item.badge}
                  </span>
                </a>
              )
            })}
          </nav>
        </div>

        {/* Group label: RESOURCES (Resume & GitHub) */}
        <div className="space-y-1">
          <p className="px-2 pb-1.5 text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]">
            Resources
          </p>
          <div className="space-y-0.5">
            {/* Resume / CV */}
            <a
              href={resumeUrl || '#contact'}
              target={resumeUrl ? '_blank' : undefined}
              rel={resumeUrl ? 'noopener noreferrer' : undefined}
              onClick={!resumeUrl ? (e) => {
                e.preventDefault()
                onNavigate('contact')
              } : undefined}
              className="group flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-medium border border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)] transition-colors"
            >
              <div className="flex items-center gap-2.5 truncate">
                <FileText className="h-3.5 w-3.5 text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] shrink-0" />
                <span className="truncate">{resources.cvTitle || 'Resume / CV'}</span>
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 text-[var(--text-muted)] shrink-0" />
            </a>

            {/* GitHub */}
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-medium border border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)] transition-colors"
            >
              <div className="flex items-center gap-2.5 truncate">
                <GithubIcon className="h-3.5 w-3.5 text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] shrink-0" />
                <span className="truncate">GitHub</span>
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 text-[var(--text-muted)] shrink-0" />
            </a>
          </div>
        </div>

        {/* Group label: CONNECT (Contact, LinkedIn, Instagram) */}
        <div className="space-y-1">
          <p className="px-2 pb-1.5 text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]">
            Connect
          </p>
          <div className="space-y-0.5">
            {/* Contact with Enhanced Highlight */}
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault()
                onNavigate('contact')
              }}
              aria-current={activeSection === 'contact' ? 'location' : undefined}
              className={`group relative flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                activeSection === 'contact'
                  ? 'border border-emerald-500/40 bg-emerald-500/[0.08] text-[var(--text-primary)] shadow-xs'
                  : 'border border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)]'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                {activeSection === 'contact' && (
                  <span className="absolute left-1 h-3.5 w-1 rounded-full bg-emerald-500" />
                )}
                <Mail
                  className={`h-3.5 w-3.5 shrink-0 transition-colors ${
                    activeSection === 'contact'
                      ? 'text-emerald-500 scale-105'
                      : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]'
                  }`}
                />
                <span className={`truncate ${activeSection === 'contact' ? 'font-semibold text-[var(--text-primary)]' : ''}`}>
                  Contact
                </span>
              </div>
              <span
                className={`font-mono text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                  activeSection === 'contact'
                    ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold'
                    : 'border-transparent text-[var(--text-muted)] group-hover:border-[var(--border-color)] group-hover:text-[var(--text-secondary)]'
                }`}
              >
                C
              </span>
            </a>

            {/* LinkedIn */}
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-medium border border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)] transition-colors"
            >
              <div className="flex items-center gap-2.5 truncate">
                <LinkedinIcon className="h-3.5 w-3.5 text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] shrink-0" />
                <span className="truncate">LinkedIn</span>
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 text-[var(--text-muted)] shrink-0" />
            </a>

            {/* Instagram with proper SVG Icon */}
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-medium border border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)] transition-colors"
            >
              <div className="flex items-center gap-2.5 truncate">
                <InstagramIcon className="h-3.5 w-3.5 text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] shrink-0" />
                <span className="truncate">Instagram</span>
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 text-[var(--text-muted)] shrink-0" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom: bordered pill with green pulsing dot and "Available for Freelance" */}
      <div className="pt-4 border-t border-[var(--border-color)]">
        <a
          href="#contact"
          onClick={(e) => {
            e.preventDefault()
            onNavigate('contact')
          }}
          className="group flex items-center gap-2.5 px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:border-emerald-500/40 hover:bg-[var(--bg-card-hover)] transition-all"
        >
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[11px] font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] truncate transition-colors">
            {availabilityText}
          </span>
        </a>
      </div>
    </aside>
  )
}
