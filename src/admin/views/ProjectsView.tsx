import { useEffect, useState, type FormEvent } from 'react'
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Loader2,
  FolderGit2,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { PortfolioProjectItem, ProjectCategory } from '../types'
import { MediaUploader } from '../components/MediaUploader'
import { DeleteDialog } from '../components/DeleteDialog'
import { formatSupabaseError } from '../utils/error'

const CATEGORIES: ProjectCategory[] = [
  'Meta Ads',
  'SEO',
  'Branding',
  'Google Ads',
  'Funnels',
  'Ads',
]

export function ProjectsView() {
  const [projects, setProjects] = useState<PortfolioProjectItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Edit / Add state
  const [isEditing, setIsEditing] = useState(false)
  const [activeItem, setActiveItem] = useState<Partial<PortfolioProjectItem> | null>(null)
  const [isSaving, setIsSaving] = useState(false)

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
      setProjects((data as PortfolioProjectItem[]) || [])
    } catch (err: unknown) {
      setErrorMessage(formatSupabaseError(err))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  function openCreate() {
    const nextOrder = projects.length > 0 ? Math.max(...projects.map((p) => p.sort_order)) + 1 : 1
    setActiveItem({
      project_title: '',
      category: 'Meta Ads',
      description: '',
      results: '',
      image_url: '',
      external_link: '',
      sort_order: nextOrder,
      is_active: true,
    })
    setIsEditing(true)
  }

  function openEdit(item: PortfolioProjectItem) {
    setActiveItem(item)
    setIsEditing(true)
  }

  async function handleSaveItem(e: FormEvent) {
    e.preventDefault()
    if (!activeItem?.project_title || !activeItem?.category) return

    setIsSaving(true)
    setErrorMessage('')

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
            external_link: activeItem.external_link || '',
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
            external_link: activeItem.external_link || '',
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
                  <img
                    src={item.image_url}
                    alt={item.project_title}
                    className="h-14 w-20 rounded-xl border border-zinc-800 object-cover shrink-0"
                  />
                ) : (
                  <div className="h-14 w-20 rounded-xl border border-zinc-800 bg-zinc-950 flex items-center justify-center shrink-0 text-zinc-600">
                    <FolderGit2 className="h-6 w-6" />
                  </div>
                )}

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
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                {item.external_link ? (
                  <a
                    href={item.external_link}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-zinc-400 hover:text-white"
                    title="Open external link"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                ) : null}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl my-8">
            <h3 className="text-lg font-semibold text-white">
              {activeItem.id ? 'Edit Case Study' : 'Add New Case Study'}
            </h3>

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
                  <label className="block text-xs font-semibold text-zinc-300">Category</label>
                  <select
                    value={activeItem.category || 'Meta Ads'}
                    onChange={(e) =>
                      setActiveItem({ ...activeItem, category: e.target.value as ProjectCategory })
                    }
                    className="mt-1.5 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
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

              <div>
                <label className="block text-xs font-semibold text-zinc-300">External Case Study URL (Optional)</label>
                <input
                  type="url"
                  value={activeItem.external_link || ''}
                  onChange={(e) => setActiveItem({ ...activeItem, external_link: e.target.value })}
                  placeholder="https://..."
                  className="mt-1.5 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500"
                />
              </div>

              <MediaUploader
                folder="projects"
                currentUrl={activeItem.image_url}
                label="Project Cover Image (site-media/projects)"
                allowedTypes={['image']}
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
