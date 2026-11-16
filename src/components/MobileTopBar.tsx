import { ThemeToggle } from './ThemeToggle'

interface MobileTopBarProps {
  name: string
  role: string
  avatarUrl?: string
}

export function MobileTopBar({ name, role, avatarUrl }: MobileTopBarProps) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join('') || 'S'

  return (
    <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-page)]/85 px-4 py-2.5 backdrop-blur-md">
      <a href="#top" className="flex items-center gap-2.5 min-w-0 group py-1">
        <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-[var(--border-color)] bg-[var(--bg-card-subtle)] flex items-center justify-center">
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
          <span className="block text-xs font-semibold text-[var(--text-primary)] truncate group-hover:text-emerald-500 transition-colors">
            {name}
          </span>
          <span className="block text-[10px] text-[var(--text-muted)] truncate">
            {role}
          </span>
        </div>
      </a>

      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  )
}
