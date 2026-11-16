import { useEffect, useState, type FormEvent } from 'react'
import {
  Edit2,
  Loader2,
  CheckCircle2,
  Layers,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { SectionContent, SectionKey } from '../types'
import { formatSupabaseError } from '../utils/error'

interface SectionMeta {
  key: SectionKey
  label: string
  description: string
}

const CANONICAL_SECTIONS: SectionMeta[] = [
  {
    key: 'services',
    label: 'Services Section',
    description: 'Header text for the services and core competencies section.',
  },
  {
    key: 'experience',
    label: 'Experience Section',
    description: 'Header text for the career history and experience timeline.',
  },
  {
    key: 'work',
    label: 'Featured Work / Projects',
    description: 'Header text for the selected case studies and campaign portfolio.',
  },
  {
    key: 'results',
    label: 'Results & Impact',
    description: 'Header text for key statistics, ROI benchmarks, and achievements.',
  },
  {
    key: 'testimonials',
    label: 'Client Testimonials',
    description: 'Header text for client recommendations and reviews.',
  },
]

export function SectionHeadingsView() {
  const [sections, setSections] = useState<Record<SectionKey, SectionContent | null>>({
    services: null,
    experience: null,
    work: null,
    results: null,
    testimonials: null,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Edit modal
  const [editingKey, setEditingKey] = useState<SectionKey | null>(null)
  const [formData, setFormData] = useState<{
    eyebrow: string
    title: string
    subtitle: string
    is_active: boolean
  }>({
    eyebrow: '',
    title: '',
    subtitle: '',
    is_active: true,
  })
  const [isSaving, setIsSaving] = useState(false)

  async function loadSections() {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const { data, error } = await supabase.from('section_contents').select('*')
      if (error) throw error

      const map: Record<SectionKey, SectionContent | null> = {
        services: null,
        experience: null,
        work: null,
        results: null,
        testimonials: null,
      }

      if (data) {
        for (const row of data as SectionContent[]) {
          if (row.section_key && row.section_key in map) {
            map[row.section_key] = row
          }
        }
      }

      setSections(map)
    } catch (err: unknown) {
      setErrorMessage(formatSupabaseError(err))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSections()
  }, [])

  function openEdit(key: SectionKey) {
    const existing = sections[key]
    setEditingKey(key)
    setFormData({
      eyebrow: existing?.eyebrow || '',
      title: existing?.title || '',
      subtitle: existing?.subtitle || '',
      is_active: existing?.is_active ?? true,
    })
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    if (!editingKey) return

    setIsSaving(true)
    setErrorMessage('')

    try {
      const { error } = await supabase.from('section_contents').upsert(
        {
          section_key: editingKey,
          eyebrow: formData.eyebrow.trim(),
          title: formData.title.trim(),
          subtitle: formData.subtitle.trim(),
          is_active: formData.is_active,
        },
        { onConflict: 'section_key' }
      )

      if (error) throw error

      setSuccessMessage(`Section "${editingKey}" updated successfully!`)
      setEditingKey(null)
      loadSections()
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err: unknown) {
      setErrorMessage(formatSupabaseError(err))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleToggleActive(key: SectionKey) {
    const existing = sections[key]
    if (!existing) return

    try {
      const { error } = await supabase
        .from('section_contents')
        .update({ is_active: !existing.is_active })
        .eq('section_key', key)

      if (error) throw error

      setSections((prev) => ({
        ...prev,
        [key]: {
          ...existing,
          is_active: !existing.is_active,
        },
      }))
    } catch (err: unknown) {
      setErrorMessage(formatSupabaseError(err))
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Section Headings</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Customize the eyebrow tag, title, and descriptive subtitle shown at the top of each main portfolio section.
        </p>
      </div>

      {errorMessage ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-950/40 p-4 text-xs text-red-400">
          {errorMessage}
        </div>
      ) : null}

      {successMessage ? (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-950/40 p-4 text-xs text-emerald-400">
          <CheckCircle2 className="h-4 w-4" />
          <span>{successMessage}</span>
        </div>
      ) : null}

      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/80">
            {CANONICAL_SECTIONS.map((item) => {
              const current = sections[item.key]
              return (
                <div
                  key={item.key}
                  className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:bg-zinc-800/20 transition"
                >
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white">{item.label}</span>
                      <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-zinc-400">
                        {item.key}
                      </span>
                      {current && !current.is_active ? (
                        <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/20">
                          Hidden
                        </span>
                      ) : null}
                    </div>

                    {current?.eyebrow ? (
                      <p className="text-[11px] font-bold uppercase tracking-wider text-violet-400">
                        {current.eyebrow}
                      </p>
                    ) : null}

                    <p className="text-sm font-medium text-zinc-200">
                      {current?.title || <span className="italic text-zinc-500">No title set</span>}
                    </p>

                    {current?.subtitle ? (
                      <p className="text-xs text-zinc-400 leading-relaxed">{current.subtitle}</p>
                    ) : null}

                    <p className="text-[11px] text-zinc-500">{item.description}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                    {current ? (
                      <button
                        type="button"
                        onClick={() => handleToggleActive(item.key)}
                        className={`rounded-xl px-2.5 py-1.5 text-xs font-medium border transition ${
                          current.is_active
                            ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-950/40'
                            : 'border-zinc-700 bg-zinc-800/40 text-zinc-400 hover:bg-zinc-800'
                        }`}
                      >
                        {current.is_active ? 'Active' : 'Hidden'}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => openEdit(item.key)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800 hover:text-white transition"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingKey ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-violet-400" />
              <h2 className="text-lg font-semibold text-white">
                Edit {CANONICAL_SECTIONS.find((s) => s.key === editingKey)?.label}
              </h2>
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              Update the heading text displayed above this section's content.
            </p>

            <form onSubmit={handleSave} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300">
                  Eyebrow (Small Tag)
                </label>
                <input
                  type="text"
                  placeholder="e.g. WHAT I DO or PORTFOLIO"
                  value={formData.eyebrow}
                  onChange={(e) => setFormData({ ...formData, eyebrow: e.target.value })}
                  className="mt-1 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-violet-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300">
                  Main Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Specialized Performance & Growth Marketing"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-violet-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300">
                  Subtitle / Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Supporting sentence under the heading..."
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="mt-1 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-violet-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="section_is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4 rounded border-zinc-800 bg-zinc-950 text-violet-600 focus:ring-0"
                />
                <label htmlFor="section_is_active" className="text-xs text-zinc-300 cursor-pointer">
                  Active (show heading on public site)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingKey(null)}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-xs font-semibold text-zinc-950 hover:bg-zinc-200 transition disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                  <span>Save Heading</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
