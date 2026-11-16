import {
  Home,
  Sparkles,
  FolderGit2,
  Layers,
  Mail,
} from 'lucide-react'

interface BottomTabBarProps {
  activeSection: string
  onNavigate: (sectionId: string) => void
}

export function BottomTabBar({ activeSection, onNavigate }: BottomTabBarProps) {
  const tabs = [
    { id: 'top', label: 'Home', icon: Home },
    { id: 'services', label: 'Services', icon: Sparkles },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'stack', label: 'Stack', icon: Layers },
    { id: 'contact', label: 'Contact', icon: Mail },
  ]

  return (
    <nav
      aria-label="Mobile navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border-color)] bg-[var(--bg-page)]/90 backdrop-blur-md pb-[env(safe-area-inset-bottom)]"
    >
      <div className="grid grid-cols-5 h-16 max-w-md mx-auto px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive =
            activeSection === tab.id || (tab.id === 'top' && (activeSection === 'top' || !activeSection))

          return (
            <a
              key={tab.id}
              href={`#${tab.id}`}
              onClick={(e) => {
                e.preventDefault()
                onNavigate(tab.id)
              }}
              aria-current={isActive ? 'page' : undefined}
              className={`min-h-[44px] flex flex-col items-center justify-center gap-1 transition-colors select-none focus-visible:outline-2 focus-visible:outline-stone-500 rounded-lg ${
                isActive
                  ? 'text-[var(--text-primary)] font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] font-normal'
              }`}
            >
              <Icon
                className={`h-4 w-4 transition-transform ${
                  isActive ? 'text-emerald-500 scale-110' : ''
                }`}
                aria-hidden="true"
              />
              <span className="text-[10px] tracking-tight">{tab.label}</span>
            </a>
          )
        })}
      </div>
    </nav>
  )
}
