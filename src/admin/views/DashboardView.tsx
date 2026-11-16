import { useEffect, useState } from 'react'
import {
  Inbox,
  FolderGit2,
  Sparkles,
  Briefcase,
  MessageSquareQuote,
  Loader2,
  ArrowRight,
  Clock,
  Mail,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { ContactMessageItem, AdminTab } from '../types'
import { formatSupabaseError } from '../utils/error'

interface DashboardViewProps {
  onNavigate: (tab: AdminTab) => void
}

export function DashboardView({ onNavigate }: DashboardViewProps) {
  const [counts, setCounts] = useState<{
    projects: number
    services: number
    experiences: number
    testimonials: number
    messages: number
  }>({
    projects: 0,
    services: 0,
    experiences: 0,
    testimonials: 0,
    messages: 0,
  })
  const [recentMessages, setRecentMessages] = useState<ContactMessageItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function loadStats() {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const [projectsRes, servicesRes, expRes, testRes, msgCountRes, latestMsgRes] =
          await Promise.all([
            supabase.from('portfolio_projects').select('id', { count: 'exact', head: true }),
            supabase.from('services').select('id', { count: 'exact', head: true }),
            supabase.from('experiences').select('id', { count: 'exact', head: true }),
            supabase.from('testimonials').select('id', { count: 'exact', head: true }),
            supabase.from('contact_messages').select('id', { count: 'exact', head: true }),
            supabase
              .from('contact_messages')
              .select('*')
              .order('created_at', { ascending: false })
              .limit(5),
          ])

        if (latestMsgRes.error) {
          throw latestMsgRes.error
        }

        setCounts({
          projects: projectsRes.count || 0,
          services: servicesRes.count || 0,
          experiences: expRes.count || 0,
          testimonials: testRes.count || 0,
          messages: msgCountRes.count || 0,
        })

        setRecentMessages((latestMsgRes.data as ContactMessageItem[]) || [])
      } catch (err: unknown) {
        setErrorMessage(formatSupabaseError(err))
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [])

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Welcome to your portfolio CMS. Manage projects, content, and review inbound client inquiries.
        </p>
      </div>

      {errorMessage ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-950/40 p-4 text-xs text-red-400">
          {errorMessage}
        </div>
      ) : null}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <button
          type="button"
          onClick={() => onNavigate('messages')}
          className="text-left rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 transition hover:border-violet-500/40 hover:bg-zinc-900"
        >
          <div className="flex items-center justify-between text-violet-400">
            <Inbox className="h-5 w-5" />
            <span className="text-xs font-semibold text-zinc-500">Inbox</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-white">{counts.messages}</p>
          <p className="text-xs text-zinc-400 mt-1">Inquiries</p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('projects')}
          className="text-left rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 transition hover:border-cyan-500/40 hover:bg-zinc-900"
        >
          <div className="flex items-center justify-between text-cyan-400">
            <FolderGit2 className="h-5 w-5" />
            <span className="text-xs font-semibold text-zinc-500">Case Studies</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-white">{counts.projects}</p>
          <p className="text-xs text-zinc-400 mt-1">Projects</p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('services')}
          className="text-left rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 transition hover:border-amber-500/40 hover:bg-zinc-900"
        >
          <div className="flex items-center justify-between text-amber-400">
            <Sparkles className="h-5 w-5" />
            <span className="text-xs font-semibold text-zinc-500">Offerings</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-white">{counts.services}</p>
          <p className="text-xs text-zinc-400 mt-1">Services</p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('experiences')}
          className="text-left rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 transition hover:border-emerald-500/40 hover:bg-zinc-900"
        >
          <div className="flex items-center justify-between text-emerald-400">
            <Briefcase className="h-5 w-5" />
            <span className="text-xs font-semibold text-zinc-500">Career</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-white">{counts.experiences}</p>
          <p className="text-xs text-zinc-400 mt-1">Roles</p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('testimonials')}
          className="text-left rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 transition hover:border-rose-500/40 hover:bg-zinc-900"
        >
          <div className="flex items-center justify-between text-rose-400">
            <MessageSquareQuote className="h-5 w-5" />
            <span className="text-xs font-semibold text-zinc-500">Reviews</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-white">{counts.testimonials}</p>
          <p className="text-xs text-zinc-400 mt-1">Testimonials</p>
        </button>
      </div>

      {/* Latest Messages Section */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-white font-semibold text-base">
            <Inbox className="h-5 w-5 text-violet-400" />
            <h2>5 Latest Inquiries</h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('messages')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-400 hover:text-violet-300 transition"
          >
            <span>View All Messages</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {recentMessages.length === 0 ? (
          <p className="text-xs text-zinc-500 py-6 text-center">No contact inquiries received yet.</p>
        ) : (
          <div className="divide-y divide-zinc-800/80">
            {recentMessages.map((msg) => (
              <div key={msg.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-zinc-200">{msg.name}</span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-[11px] text-zinc-400">
                      <Mail className="h-3 w-3" />
                      {msg.email}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-400 line-clamp-1">{msg.message}</p>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 shrink-0">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(msg.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
