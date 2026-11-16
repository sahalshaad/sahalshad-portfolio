import { useEffect, useState, type FormEvent } from 'react'
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Loader2,
  Briefcase,
  CheckCircle2,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { ExperienceItem } from '../types'
import { DeleteDialog } from '../components/DeleteDialog'
import { formatSupabaseError } from '../utils/error'

export function ExperienceView() {
  const [experiences, setExperiences] = useState<ExperienceItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Edit / Create state
  const [isEditing, setIsEditing] = useState(false)
  const [activeItem, setActiveItem] = useState<Partial<ExperienceItem> | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<ExperienceItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  async function loadExperiences() {
    setIsLoading(true)
    setErrorMessage('')
    try {
      const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) throw error
      setExperiences((data as ExperienceItem[]) || [])
    } catch (err: unknown) {
      setErrorMessage(formatSupabaseError(err))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadExperiences()
  }, [])

  function openCreate() {
    const nextOrder = experiences.length > 0 ? Math.max(...experiences.map((e) => e.sort_order)) + 1 : 1
    setActiveItem({
      job_role: '',
      company_name: '',
      duration: '',
      description: '',
      sort_order: nextOrder,
      is_active: true,
    })
    setIsEditing(true)
  }

  function openEdit(item: ExperienceItem) {
    setActiveItem(item)
    setIsEditing(true)
  }

  async function handleSaveItem(e: FormEvent) {
    e.preventDefault()
    if (!activeItem?.job_role || !activeItem?.company_name) return

    setIsSaving(true)
    setErrorMessage('')

    try {
      if (activeItem.id) {
        const { error } = await supabase
          .from('experiences')
          .update({
            job_role: activeItem.job_role,
            company_name: activeItem.company_name,
            duration: activeItem.duration || '',
            description: activeItem.description || '',
            sort_order: activeItem.sort_order ?? 0,
            is_active: activeItem.is_active ?? true,
          })
          .eq('id', activeItem.id)

        if (error) throw error
        setSuccessMessage('Experience record updated!')
      } else {
        const { error } = await supabase.from('experiences').insert([
          {
            job_role: activeItem.job_role,
            company_name: activeItem.company_name,
            duration: activeItem.duration || '',
            description: activeItem.description || '',
            sort_order: activeItem.sort_order ?? 0,
            is_active: activeItem.is_active ?? true,
          },
        ])

        if (error) throw error
        setSuccessMessage('Experience record added!')
      }

      setIsEditing(false)
      setActiveItem(null)
      loadExperiences()
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err: unknown) {
      setErrorMessage(formatSupabaseError(err))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleToggleActive(item: ExperienceItem) {
    try {
      const { error } = await supabase
        .from('experiences')
        .update({ is_active: !item.is_active })
        .eq('id', item.id)

      if (error) throw error
      setExperiences((prev) =>
        prev.map((e) => (e.id === item.id ? { ...e, is_active: !e.is_active } : e))
      )
    } catch (err: unknown) {
      setErrorMessage(formatSupabaseError(err))
    }
  }

  async function handleMoveOrder(item: ExperienceItem, direction: 'up' | 'down') {
    const currentIndex = experiences.findIndex((e) => e.id === item.id)
    if (currentIndex < 0) return

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= experiences.length) return

    const targetItem = experiences[targetIndex]

    try {
      const [res1, res2] = await Promise.all([
        supabase
          .from('experiences')
          .update({ sort_order: targetItem.sort_order })
          .eq('id', item.id),
        supabase
          .from('experiences')
          .update({ sort_order: item.sort_order })
          .eq('id', targetItem.id),
      ])

      if (res1.error) throw res1.error
      if (res2.error) throw res2.error

      loadExperiences()
    } catch (err: unknown) {
      setErrorMessage(formatSupabaseError(err))
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)

    try {
      const { error } = await supabase.from('experiences').delete().eq('id', deleteTarget.id)
      if (error) throw error
      setExperiences((prev) => prev.filter((e) => e.id !== deleteTarget.id))
      setDeleteTarget(null)
      setSuccessMessage('Experience deleted.')
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
          <h1 className="text-2xl font-semibold tracking-tight text-white">Experience</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Work history, agency roles, and achievements shown in the career timeline.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-semibold text-zinc-950 transition hover:bg-zinc-200"
        >
          <Plus className="h-4 w-4" />
          <span>Add Experience</span>
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
      ) : experiences.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-zinc-800 p-12 text-center">
          <Briefcase className="mx-auto h-8 w-8 text-zinc-600" />
          <p className="mt-3 text-sm text-zinc-400">No experience records added yet.</p>
          <button
            type="button"
            onClick={openCreate}
            className="mt-4 inline-flex items-center gap-1.5 text-xs text-violet-400 hover:underline"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add your first job role</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {experiences.map((item, index) => (
            <div
              key={item.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-4 transition ${
                item.is_active
                  ? 'border-zinc-800 bg-zinc-900/60'
                  : 'border-zinc-800/40 bg-zinc-900/20 opacity-70'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
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
                    disabled={index === experiences.length - 1}
                    onClick={() => handleMoveOrder(item, 'down')}
                    className="p-1 text-zinc-500 hover:text-zinc-200 disabled:opacity-20"
                    title="Move Down"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white">{item.job_role}</span>
                    <span className="text-xs text-zinc-400">• {item.company_name}</span>
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
                  <p className="mt-0.5 text-xs text-zinc-500">{item.duration}</p>
                  <p className="mt-1 text-xs text-zinc-400 line-clamp-2">{item.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white">
              {activeItem.id ? 'Edit Experience' : 'Add New Experience'}
            </h3>

            <form onSubmit={handleSaveItem} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300">Job Role</label>
                  <input
                    type="text"
                    required
                    value={activeItem.job_role || ''}
                    onChange={(e) => setActiveItem({ ...activeItem, job_role: e.target.value })}
                    placeholder="e.g. Digital Marketing Lead"
                    className="mt-1.5 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300">Company Name</label>
                  <input
                    type="text"
                    required
                    value={activeItem.company_name || ''}
                    onChange={(e) => setActiveItem({ ...activeItem, company_name: e.target.value })}
                    placeholder="e.g. Growth Studio"
                    className="mt-1.5 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300">Duration</label>
                  <input
                    type="text"
                    required
                    value={activeItem.duration || ''}
                    onChange={(e) => setActiveItem({ ...activeItem, duration: e.target.value })}
                    placeholder="e.g. 2024 — Present"
                    className="mt-1.5 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300">Sort Order</label>
                  <input
                    type="number"
                    value={activeItem.sort_order ?? 0}
                    onChange={(e) => setActiveItem({ ...activeItem, sort_order: parseInt(e.target.value) || 0 })}
                    className="mt-1.5 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300">Key Achievements / Description</label>
                <textarea
                  rows={4}
                  required
                  value={activeItem.description || ''}
                  onChange={(e) => setActiveItem({ ...activeItem, description: e.target.value })}
                  placeholder="Key metrics, initiatives, or responsibilities delivered in this role."
                  className="mt-1.5 w-full resize-none rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="exp-active"
                  checked={activeItem.is_active ?? true}
                  onChange={(e) => setActiveItem({ ...activeItem, is_active: e.target.checked })}
                  className="h-4 w-4 rounded border-zinc-800 bg-zinc-950 text-violet-600 focus:ring-0"
                />
                <label htmlFor="exp-active" className="text-xs text-zinc-300 cursor-pointer">
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
                  <span>{isSaving ? 'Saving…' : 'Save Experience'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <DeleteDialog
        isOpen={Boolean(deleteTarget)}
        title={`Delete role at "${deleteTarget?.company_name}"?`}
        description="Are you sure you want to remove this position from your timeline?"
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
