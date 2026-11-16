import type { ReactNode } from 'react'

interface SectionCardProps {
  id?: string
  className?: string
  eyebrow?: string
  title?: string
  subtitle?: string
  badge?: string
  children?: ReactNode
}

export function SectionCard({
  id,
  className = '',
  eyebrow,
  title,
  subtitle,
  badge,
  children,
}: SectionCardProps) {
  return (
    <section
      id={id}
      className={`rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 sm:p-8 transition-colors ${className}`}
    >
      {(eyebrow || title || subtitle || badge) ? (
        <div className="mb-6 space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            {eyebrow ? (
              <span className="text-[11px] font-mono uppercase tracking-widest text-[var(--text-muted)]">
                {eyebrow}
              </span>
            ) : null}
            {badge ? (
              <span className="rounded-full border border-[var(--border-color)] bg-[var(--bg-card-subtle)] px-2.5 py-0.5 font-mono text-[10px] text-[var(--text-muted)]">
                {badge}
              </span>
            ) : null}
          </div>

          {title ? (
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
              {title}
            </h2>
          ) : null}

          {subtitle ? (
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-2xl">
              {subtitle}
            </p>
          ) : null}
        </div>
      ) : null}

      {children}
    </section>
  )
}
