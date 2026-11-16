import { type ReactNode, useState } from 'react'
import {
  LayoutDashboard,
  User,
  Settings,
  Sparkles,
  Briefcase,
  FolderGit2,
  MessageSquareQuote,
  Tags,
  BarChart2,
  Heading,
  Inbox,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import type { AdminTab } from '../types'

interface AdminLayoutProps {
  user: SupabaseUser
  activeTab: AdminTab
  onTabChange: (tab: AdminTab) => void
  onSignOut: () => void
  children: ReactNode
}

interface NavItem {
  id: AdminTab
  label: string
  icon: typeof LayoutDashboard
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'hero', label: 'Hero Section', icon: User },
  { id: 'settings', label: 'Settings & Resume', icon: Settings },
  { id: 'services', label: 'Services', icon: Sparkles },
  { id: 'experiences', label: 'Experience', icon: Briefcase },
  { id: 'projects', label: 'Projects & Work', icon: FolderGit2 },
  { id: 'testimonials', label: 'Testimonials', icon: MessageSquareQuote },
  { id: 'skills', label: 'Skill Tags', icon: Tags },
  { id: 'stats', label: 'Result Stats', icon: BarChart2 },
  { id: 'sections', label: 'Section Headings', icon: Heading },
  { id: 'messages', label: 'Contact Messages', icon: Inbox },
]

export function AdminLayout({
  user,
  activeTab,
  onTabChange,
  onSignOut,
  children,
}: AdminLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between border-b border-zinc-800 bg-zinc-900/80 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm tracking-tight text-white">sahalshad admin</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={`${
          mobileMenuOpen ? 'block' : 'hidden'
        } md:flex w-full md:w-64 flex-col border-r border-zinc-800/80 bg-zinc-900/60 p-4 shrink-0 md:min-h-screen`}
      >
        <div className="hidden md:flex items-center justify-between px-2 py-3 mb-2">
          <div>
            <h2 className="font-semibold text-sm tracking-tight text-white">sahalshad</h2>
            <p className="text-[11px] text-zinc-500">Supabase CMS Manager</p>
          </div>
          <a
            href="/"
            title="View public portfolio"
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1 flex-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onTabChange(item.id)
                  setMobileMenuOpen(false)
                }}
                className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* User details and sign out */}
        <div className="mt-6 border-t border-zinc-800/80 pt-4 px-2">
          <div className="truncate">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
              Logged in as
            </p>
            <p className="truncate text-xs font-medium text-zinc-300 mt-0.5" title={user.email}>
              {user.email}
            </p>
          </div>

          <button
            type="button"
            onClick={onSignOut}
            className="w-full mt-3 flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 py-2 px-3 text-xs font-semibold text-red-400 hover:bg-red-950/30 hover:border-red-900/40 transition"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-5xl">
        {children}
      </main>
    </div>
  )
}
