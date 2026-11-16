import { ArrowUpRight } from 'lucide-react'
import { Clock } from './Clock'

interface SocialLink {
  href: string
  label: string
}

interface FooterProps {
  name: string
  onNavigate: (sectionId: string) => void
  socialLinks: SocialLink[]
  cvUrl?: string
}

export function Footer({ name, onNavigate, socialLinks, cvUrl }: FooterProps) {
  const currentYear = new Date().getFullYear()

  const indexLinks = [
    { id: 'top', label: 'Overview' },
    { id: 'services', label: 'Services' },
    { id: 'experience', label: 'Experience' },
    { id: 'projects', label: 'Projects' },
    { id: 'stack', label: 'Stack' },
    { id: 'contact', label: 'Contact' },
  ]

  return (
    <footer className="mt-16 sm:mt-24 pt-12 pb-16 sm:pb-20 border-t border-[var(--border-color)]">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8 mb-12">
        {/* Index Links */}
        <div className="space-y-3">
          <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--text-muted)]">
            Index
          </p>
          <ul className="space-y-2 text-xs">
            {indexLinks.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    onNavigate(link.id)
                  }}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Connect Links */}
        <div className="space-y-3">
          <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--text-muted)]">
            Connect
          </p>
          <ul className="space-y-2 text-xs">
            {socialLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group"
                >
                  <span>{link.label}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors" />
                </a>
              </li>
            ))}
            {cvUrl ? (
              <li>
                <a
                  href={cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group"
                >
                  <span>Resume / CV</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors" />
                </a>
              </li>
            ) : null}
          </ul>
        </div>

        {/* Live Clock */}
        <div className="space-y-3">
          <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--text-muted)]">
            Time & Location
          </p>
          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4">
            <Clock />
          </div>
        </div>
      </div>

      {/* Bottom Copyright line */}
      <div className="pt-6 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
        <p className="font-mono text-[11px]">
          © {currentYear} {name}. All rights reserved.
        </p>
        <p className="font-mono text-[11px]">
          Built with React & Supabase
        </p>
      </div>
    </footer>
  )
}
