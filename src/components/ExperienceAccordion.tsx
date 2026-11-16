import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

export interface ExperienceItemData {
  role: string
  company: string
  duration: string
  achievements: string[]
}

interface ExperienceProps {
  items: ExperienceItemData[]
}

export function ExperienceAccordion({ items }: ExperienceProps) {
  // Mobile accordion state: first row is open (index 0)
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  function toggleIndex(idx: number) {
    setOpenIndex((prev) => (prev === idx ? null : idx))
  }

  if (!items || items.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-[var(--text-muted)] font-mono">
        No experience entries available.
      </div>
    )
  }

  return (
    <div>
      {/* Desktop View (lg and up): Bordered card list with role + company on left, duration in monospace on right, thin divider */}
      <div className="hidden lg:block divide-y divide-[var(--border-color)]">
        {items.map((item, idx) => (
          <div
            key={`${item.company}-${idx}`}
            className="py-4 first:pt-0 last:pb-0 flex items-baseline justify-between gap-6"
          >
            <div className="space-y-1 min-w-0">
              <h3 className="text-sm font-semibold tracking-tight text-[var(--text-primary)]">
                {item.role}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-medium">
                {item.company}
              </p>
              {item.achievements?.length ? (
                <ul className="mt-2 space-y-1 text-xs text-[var(--text-muted)] list-disc list-inside">
                  {item.achievements.map((ach, aIdx) => (
                    <li key={aIdx} className="leading-relaxed">
                      {ach}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <span className="font-mono text-xs text-[var(--text-muted)] shrink-0">
              {item.duration}
            </span>
          </div>
        ))}
      </div>

      {/* Mobile View (below lg): Accordion with +/- icon, only one open at a time, animated height */}
      <div className="block lg:hidden divide-y divide-[var(--border-color)]">
        {items.map((item, idx) => {
          const isOpen = openIndex === idx
          const contentId = `exp-content-${idx}`
          const headerId = `exp-header-${idx}`

          return (
            <div key={`${item.company}-${idx}`} className="py-3 first:pt-0 last:pb-0">
              <button
                type="button"
                id={headerId}
                aria-expanded={isOpen}
                aria-controls={contentId}
                onClick={() => toggleIndex(idx)}
                className="w-full min-h-[44px] flex items-center justify-between gap-3 text-left py-1 group focus-visible:outline-2 focus-visible:outline-stone-500 rounded-lg"
              >
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate group-hover:text-emerald-500 transition-colors">
                    {item.role}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-[var(--text-secondary)]">
                    <span className="font-medium truncate">{item.company}</span>
                    <span className="text-[var(--border-color)]">·</span>
                    <span className="font-mono text-[11px] text-[var(--text-muted)] shrink-0">
                      {item.duration}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 h-7 w-7 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card-subtle)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors">
                  {isOpen ? (
                    <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                </div>
              </button>

              <div
                id={contentId}
                role="region"
                aria-labelledby={headerId}
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isOpen ? 'max-h-96 opacity-100 mt-2.5' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="rounded-lg bg-[var(--bg-card-subtle)] p-3 text-xs text-[var(--text-secondary)] space-y-1.5 border border-[var(--border-color)]">
                  {item.achievements?.map((ach, aIdx) => (
                    <p key={aIdx} className="leading-relaxed">
                      {ach}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
