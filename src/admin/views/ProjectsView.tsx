import { useEffect, useState, type FormEvent } from 'react'
import {
  Plus,
  Minus,
  X,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Loader2,
  FolderGit2,
  CheckCircle2,
  ExternalLink,
  Video,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { PortfolioProjectItem } from '../types'
import { MediaUploader } from '../components/MediaUploader'
import { DeleteDialog } from '../components/DeleteDialog'
import { formatSupabaseError } from '../utils/error'
import { isVideoMedia, parseProjectLinks } from '../../components/ProjectCard'

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

const DEFAULT_CATEGORIES: string[] = [
  'Meta Ads',
  'SEO',
  'Branding',
  'Google Ads',
  'Funnels',
  'Ads',
  'Web App',
  'Full-Stack',
  'Frontend',
]

const CATEGORY_STORAGE_KEY = 'sahalshad_portfolio_categories'

function getInitialCategories(): string[] {
  try {
    const saved = localStorage.getItem(CATEGORY_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch {
    // Ignore error
  }
  return DEFAULT_CATEGORIES
}

export function ProjectsView() {
  const [projects, setProjects] = useState<PortfolioProjectItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Edit / Add state
  const [isEditing, setIsEditing] = useState(false)
  const [activeItem, setActiveItem] = useState<Partial<PortfolioProjectItem> | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Dev & Link fields (Live URL, GitHub URL, Tech Stack)
  const [liveUrl, setLiveUrl] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [techStackInput, setTechStackInput] = useState('')

  // Dynamic Categories state
  const [categoriesList, setCategoriesList] = useState<string[]>(getInitialCategories)
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newCategoryInput, setNewCategoryInput] = useState('')

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<PortfolioProjectItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  async function loadProjects() {
    setIsLoading(true)
    setErrorMessage('')
    try {
      const { data, error } = await supabase
        .from('portfolio_projects')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) throw error
      const list = (data as PortfolioProjectItem[]) || []
      setProjects(list)

      // Merge any category present in projects
      const projectCats = list.map((p) => p.category).filter(Boolean)
      setCategoriesList((prev) => {
        const merged = Array.from(new Set([...prev, ...projectCats]))
        try {
          localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(merged))
        } catch {}
        return merged
      })
    } catch (err: unknown) {
      setErrorMessage(formatSupabaseError(err))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  function handleAddCategory() {
    const trimmed = newCategoryInput.trim()
    if (!trimmed) return

    let updated = categoriesList
    if (!categoriesList.includes(trimmed)) {
      updated = [...categoriesList, trimmed]
      setCategoriesList(updated)
      try {
        localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(updated))
      } catch {}
    }

    if (activeItem) {
      setActiveItem({ ...activeItem, category: trimmed })
    }
    setNewCategoryInput('')
    setIsAddingCategory(false)
  }

  function handleRemoveCategory() {
    const current = activeItem?.category || categoriesList[0]
    if (!current || categoriesList.length <= 1) return

    const updated = categoriesList.filter((cat) => cat !== current)
    setCategoriesList(updated)
    try {
      localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(updated))
    } catch {}

    if (activeItem) {
      setActiveItem({ ...activeItem, category: updated[0] || 'Meta Ads' })
    }
  }

  function openCreate() {
    const nextOrder = projects.length > 0 ? Math.max(...projects.map((p) => p.sort_order)) + 1 : 1
    setActiveItem({
      project_title: '',
      category: categoriesList[0] || 'Meta Ads',
      description: '',
      results: '',
      image_url: '',
      external_link: '',
      sort_order: nextOrder,
      is_active: true,
    })
    setLiveUrl('')
    setGithubUrl('')
    setTechStackInput('')
    setIsAddingCategory(false)
    setNewCategoryInput('')
    setIsEditing(true)
  }

  function openEdit(item: PortfolioProjectItem) {
    setActiveItem(item)
    const parsed = parseProjectLinks(item.external_link)
    setLiveUrl(parsed.liveUrl || '')
    setGithubUrl(parsed.githubUrl || '')
    setTechStackInput(parsed.techStack.join(', '))
    setIsEditing(true)
  }

  async function handleSaveItem(e: FormEvent) {
    e.preventDefault()
    if (!activeItem?.project_title || !activeItem?.category) return

    setIsSaving(true)
    setErrorMessage('')

    // Encode liveUrl, githubUrl, and techStack into external_link cleanly
    const linkParts: string[] = []
    if (liveUrl.trim()) linkParts.push(liveUrl.trim())
    if (githubUrl.trim()) linkParts.push(githubUrl.trim())
    if (techStackInput.trim()) linkParts.push(techStackInput.trim())
    const combinedExternalLink = linkParts.join(' | ')

    try {
      if (activeItem.id) {
        const { error } = await supabase
          .from('portfolio_projects')
          .update({
            project_title: activeItem.project_title,
            category: activeItem.category,
            description: activeItem.description || '',
            results: activeItem.results || '',
            image_url: activeItem.image_url || '',
            external_link: combinedExternalLink,
            sort_order: activeItem.sort_order ?? 0,
            is_active: activeItem.is_active ?? true,
          })
          .eq('id', activeItem.id)

        if (error) throw error
        setSuccessMessage('Case study updated successfully!')
      } else {
        const { error } = await supabase.from('portfolio_projects').insert([
          {
            project_title: activeItem.project_title,
            category: activeItem.category,
            description: activeItem.description || '',
            results: activeItem.results || '',
            image_url: activeItem.image_url || '',
            external_link: combinedExternalLink,
            sort_order: activeItem.sort_order ?? 0,
            is_active: activeItem.is_active ?? true,
          },
        ])

        if (error) throw error
        setSuccessMessage('Case study created successfully!')
      }

      setIsEditing(false)
      setActiveItem(null)
      loadProjects()
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err: unknown) {
      setErrorMessage(formatSupabaseError(err))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleToggleActive(item: PortfolioProjectItem) {
    try {
      const { error } = await supabase
        .from('portfolio_projects')
        .update({ is_active: !item.is_active })
        .eq('id', item.id)

      if (error) throw error
      setProjects((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, is_active: !p.is_active } : p))
      )
    } catch (err: unknown) {
      setErrorMessage(formatSupabaseError(err))
    }
  }

  async function handleMoveOrder(item: PortfolioProjectItem, direction: 'up' | 'down') {
    const currentIndex = projects.findIndex((p) => p.id === item.id)
    if (currentIndex < 0) return

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= projects.length) return

    const targetItem = projects[targetIndex]

    try {
      const [res1, res2] = await Promise.all([
        supabase
          .from('portfolio_projects')
          .update({ sort_order: targetItem.sort_order })
          .eq('id', item.id),
        supabase
          .from('portfolio_projects')
          .update({ sort_order: item.sort_order })
          .eq('id', targetItem.id),
      ])

      if (res1.error) throw res1.error
      if (res2.error) throw res2.error

      loadProjects()
    } catch (err: unknown) {
      setErrorMessage(formatSupabaseError(err))
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)

    try {
      const { error } = await supabase.from('portfolio_projects').delete().eq('id', deleteTarget.id)
      if (error) throw error
      setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id))
      setDeleteTarget(null)
      setSuccessMessage('Case study deleted.')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err: unknown) {
      setErrorMessage(formatSupabaseError(err))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Portfolio Projects</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Case studies, ad campaigns, and SEO wins displayed in your featured work section.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-semibold text-zinc-950 transition hover:bg-zinc-200"
        >
          <Plus className="h-4 w-4" />
          <span>Add Project</span>
        </button>
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

      {/* List */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-zinc-800 p-12 text-center">
          <FolderGit2 className="mx-auto h-8 w-8 text-zinc-600" />
          <p className="mt-3 text-sm text-zinc-400">No projects added yet.</p>
          <button
            type="button"
            onClick={openCreate}
            className="mt-4 inline-flex items-center gap-1.5 text-xs text-violet-400 hover:underline"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create your first case study</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((item, index) => (
            <div
              key={item.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-4 transition ${
                item.is_active
                  ? 'border-zinc-800 bg-zinc-900/60'
                  : 'border-zinc-800/40 bg-zinc-900/20 opacity-70'
              }`}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMoveOrder(item, 'up')}
                    className="p-1 text-zinc-500 hover:text-zinc-200 disabled:opacity-20"
                    title="Move Up"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={index === projects.length - 1}
                    onClick={() => handleMoveOrder(item, 'down')}
                    className="p-1 text-zinc-500 hover:text-zinc-200 disabled:opacity-20"
                    title="Move Down"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>

                {item.image_url ? (
                  isVideoMedia(item.image_url) ? (
                    <div className="relative h-14 w-20 rounded-xl border border-zinc-800 bg-black overflow-hidden flex items-center justify-center shrink-0">
                      <video
                        src={item.image_url}
                        className="h-full w-full object-cover"
                        muted
                        playsInline
                      />
                      <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-0.5 text-[9px] font-mono text-emerald-400 flex items-center gap-0.5">
                        <Video className="h-2.5 w-2.5" />
                        <span>VIDEO</span>
                      </span>
                    </div>
                  ) : (
                    <img
                      src={item.image_url}
                      alt={item.project_title}
                      className="h-14 w-20 rounded-xl border border-zinc-800 object-cover shrink-0"
                    />
                  )
                ) : (
                  <div className="h-14 w-20 rounded-xl border border-zinc-800 bg-zinc-950 flex items-center justify-center shrink-0 text-zinc-600">
                    <FolderGit2 className="h-6 w-6" />
                  </div>
                )}

                {(() => {
                  const parsed = parseProjectLinks(item.external_link)
                  return (
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white">{item.project_title}</span>
                        <span className="rounded-full border border-violet-500/20 bg-violet-950/40 px-2 py-0.5 text-[10px] font-medium text-violet-300">
                          {item.category}
                        </span>
                        {!item.is_active ? (
                          <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                            Inactive
                          </span>
                        ) : (
                          <span className="rounded-full border border-emerald-500/20 bg-emerald-950/40 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-zinc-300 font-medium">{item.results}</p>
                      <p className="mt-0.5 text-xs text-zinc-500 line-clamp-1">{item.description}</p>
                      {parsed.techStack.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {parsed.techStack.map((tech) => (
                            <span
                              key={tech}
                              className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 border border-zinc-700/50"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                {(() => {
                  const parsed = parseProjectLinks(item.external_link)
                  return (
                    <>
                      {parsed.githubUrl ? (
                        <a
                          href={parsed.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 text-zinc-400 hover:text-white"
                          title="Open GitHub repository"
                        >
                          <GithubIcon className="h-4 w-4" />
                        </a>
                      ) : null}
                      {parsed.liveUrl ? (
                        <a
                          href={parsed.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 text-zinc-400 hover:text-white"
                          title="Open Live Preview"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      ) : null}
                    </>
                  )
                })()}
                <button
                  type="button"
                  onClick={() => handleToggleActive(item)}
                  className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800"
                >
                  {item.is_active ? 'Set Inactive' : 'Set Active'}
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(item)}
                  className="p-2 text-zinc-400 hover:text-white"
                  title="Edit"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(item)}
                  className="p-2 text-red-400 hover:text-red-300"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Add Modal */}
      {isEditing && activeItem ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 py-10 sm:py-14 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-7 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h3 className="text-lg font-semibold text-white">
                {activeItem.id ? 'Edit Project / Case Study' : 'Add New Project'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300">Project Title</label>
                <input
                  type="text"
                  required
                  value={activeItem.project_title || ''}
                  onChange={(e) => setActiveItem({ ...activeItem, project_title: e.target.value })}
                  placeholder="e.g. Paid Scaling for D2C Skincare"
                  className="mt-1.5 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-zinc-300">Category</label>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {categoriesList.length} options
                    </span>
                  </div>

                  <div className="mt-1.5 flex items-center gap-1.5">
                    <select
                      value={activeItem.category || categoriesList[0] || 'Meta Ads'}
                      onChange={(e) =>
                        setActiveItem({ ...activeItem, category: e.target.value })
                      }
                      className="flex-1 rounded-2xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs text-white outline-none focus:border-violet-500 min-w-0"
                    >
                      {categoriesList.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>

                    {/* Minus (-) button to remove currently selected category */}
                    <button
                      type="button"
                      onClick={handleRemoveCategory}
                      disabled={categoriesList.length <= 1}
                      title={`Remove "${activeItem.category || categoriesList[0]}" from categories`}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-red-900/60 hover:bg-red-950/30 hover:text-red-400 transition disabled:opacity-30 disabled:pointer-events-none shrink-0"
                    >
                      <Minus className="h-4 w-4" />
                    </button>

                    {/* Plus (+) button to add new category */}
                    <button
                      type="button"
                      onClick={() => setIsAddingCategory(!isAddingCategory)}
                      title="Add custom category"
                      className={`flex h-10 w-10 items-center justify-center rounded-xl border transition shrink-0 ${
                        isAddingCategory
                          ? 'border-violet-500 bg-violet-600 text-white'
                          : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-violet-500/50 hover:bg-violet-950/30 hover:text-violet-300'
                      }`}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Inline Add Category Input */}
                  {isAddingCategory && (
                    <div className="mt-2 p-2 rounded-xl border border-violet-500/30 bg-violet-950/20 space-y-2">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={newCategoryInput}
                          onChange={(e) => setNewCategoryInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleAddCategory()
                            }
                          }}
                          placeholder="e.g. Web App, SaaS, Branding..."
                          className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-violet-400 min-w-0"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={handleAddCategory}
                          className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-500 transition shrink-0"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingCategory(false)
                            setNewCategoryInput('')
                          }}
                          className="rounded-lg border border-zinc-700 bg-zinc-800 p-1.5 text-xs text-zinc-400 hover:text-white shrink-0"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300">Sort Order</label>
                  <input
                    type="number"
                    value={activeItem.sort_order ?? 0}
                    onChange={(e) =>
                      setActiveItem({ ...activeItem, sort_order: parseInt(e.target.value) || 0 })
                    }
                    className="mt-1.5 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300">Highlight Results</label>
                <input
                  type="text"
                  required
                  value={activeItem.results || ''}
                  onChange={(e) => setActiveItem({ ...activeItem, results: e.target.value })}
                  placeholder="e.g. Improved ROAS from 2.1x → 3.8x by refreshing creatives"
                  className="mt-1.5 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300">Full Description</label>
                <textarea
                  rows={3}
                  value={activeItem.description || ''}
                  onChange={(e) => setActiveItem({ ...activeItem, description: e.target.value })}
                  placeholder="Campaign strategy, execution, and outcomes."
                  className="mt-1.5 w-full resize-none rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300">Live Website / Demo URL (Optional)</label>
                  <input
                    type="url"
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                    placeholder="https://..."
                    className="mt-1.5 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs text-white outline-none focus:border-violet-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300">GitHub Repository URL (Optional)</label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className="mt-1.5 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs text-white outline-none focus:border-violet-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300">
                  Tech Stack (Optional, comma-separated)
                </label>
                <input
                  type="text"
                  value={techStackInput}
                  onChange={(e) => setTechStackInput(e.target.value)}
                  placeholder="e.g. React, TypeScript, Supabase, Tailwind CSS"
                  className="mt-1.5 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs text-white outline-none focus:border-violet-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300">
                  Project Media URL (Photo or Video URL / Embed)
                </label>
                <input
                  type="text"
                  value={activeItem.image_url || ''}
                  onChange={(e) => setActiveItem({ ...activeItem, image_url: e.target.value })}
                  placeholder="Paste direct image/video URL, YouTube, Vimeo, Loom or upload below..."
                  className="mt-1.5 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500 font-mono text-xs"
                />
              </div>

              <MediaUploader
                folder="projects"
                currentUrl={activeItem.image_url}
                label="Or Upload Project Media (Photo or Video up to 15 MB)"
                allowedTypes={['image', 'video']}
                onUploadSuccess={(url) => setActiveItem({ ...activeItem, image_url: url })}
              />

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="project-active"
                  checked={activeItem.is_active ?? true}
                  onChange={(e) => setActiveItem({ ...activeItem, is_active: e.target.checked })}
                  className="h-4 w-4 rounded border-zinc-800 bg-zinc-950 text-violet-600 focus:ring-0"
                />
                <label htmlFor="project-active" className="text-xs text-zinc-300 cursor-pointer">
                  Active (visible on website)
                </label>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                  <span>{isSaving ? 'Saving…' : 'Save Project'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <DeleteDialog
        isOpen={Boolean(deleteTarget)}
        title={`Delete "${deleteTarget?.project_title}"?`}
        description="Are you sure you want to delete this case study? It will be removed immediately from your public portfolio."
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
