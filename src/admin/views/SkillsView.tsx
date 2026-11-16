import { useEffect, useState, type FormEvent } from 'react'
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Loader2,
  Tags,
  CheckCircle2,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { SkillTagItem } from '../types'
import { DeleteDialog } from '../components/DeleteDialog'
import { formatSupabaseError } from '../utils/error'

export function SkillsView() {
  const [skills, setSkills] = useState<SkillTagItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Edit / Add state
  const [isEditing, setIsEditing] = useState(false)
  const [activeItem, setActiveItem] = useState<Partial<SkillTagItem> | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<SkillTagItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  async function loadSkills() {
    setIsLoading(true)
    setErrorMessage('')
    try {
      const { data, error } = await supabase
        .from('skill_tags')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) throw error
      setSkills((data as SkillTagItem[]) || [])
    } catch (err: unknown) {
      setErrorMessage(formatSupabaseError(err))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSkills()
  }, [])

  function openCreate() {
    const nextOrder = skills.length > 0 ? Math.max(...skills.map((s) => s.sort_order)) + 1 : 1
    setActiveItem({
      name: '',
      sort_order: nextOrder,
      is_active: true,
    })
    setIsEditing(true)
  }

  function openEdit(item: SkillTagItem) {
    setActiveItem(item)
    setIsEditing(true)
  }

  async function handleSaveItem(e: FormEvent) {
    e.preventDefault()
    if (!activeItem?.name) return

    setIsSaving(true)
    setErrorMessage('')

    try {
      if (activeItem.id) {
        const { error } = await supabase
          .from('skill_tags')
          .update({
            name: activeItem.name.trim(),
            sort_order: activeItem.sort_order ?? 0,
            is_active: activeItem.is_active ?? true,
          })
          .eq('id', activeItem.id)

        if (error) throw error
        setSuccessMessage('Skill tag updated!')
      } else {
        const { error } = await supabase.from('skill_tags').insert([
          {
            name: activeItem.name.trim(),
            sort_order: activeItem.sort_order ?? 0,
            is_active: activeItem.is_active ?? true,
          },
        ])

        if (error) throw error
        setSuccessMessage('Skill tag added!')
      }

      setIsEditing(false)
      setActiveItem(null)
      loadSkills()
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err: unknown) {
      setErrorMessage(formatSupabaseError(err))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleToggleActive(item: SkillTagItem) {
    try {
      const { error } = await supabase
        .from('skill_tags')
        .update({ is_active: !item.is_active })
        .eq('id', item.id)

      if (error) throw error
      setSkills((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, is_active: !s.is_active } : s))
      )
    } catch (err: unknown) {
      setErrorMessage(formatSupabaseError(err))
    }
  }

  async function handleMoveOrder(item: SkillTagItem, direction: 'up' | 'down') {
    const currentIndex = skills.findIndex((s) => s.id === item.id)
    if (currentIndex < 0) return

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= skills.length) return

    const targetItem = skills[targetIndex]

    try {
      const [res1, res2] = await Promise.all([
        supabase.from('skill_tags').update({ sort_order: targetItem.sort_order }).eq('id', item.id),
        supabase.from('skill_tags').update({ sort_order: item.sort_order }).eq('id', targetItem.id),
      ])

      if (res1.error) throw res1.error
      if (res2.error) throw res2.error

      loadSkills()
    } catch (err: unknown) {
      setErrorMessage(formatSupabaseError(err))
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)

    try {
      const { error } = await supabase.from('skill_tags').delete().eq('id', deleteTarget.id)
      if (error) throw error
      setSkills((prev) => prev.filter((s) => s.id !== deleteTarget.id))
      setDeleteTarget(null)
      setSuccessMessage('Skill tag deleted.')
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
          <h1 className="text-2xl font-semibold tracking-tight text-white">Skill Tags</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Pills rendered below the hero bio (Meta Ads, GA4, CRO, etc.).
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-semibold text-zinc-950 transition hover:bg-zinc-200"
        >
          <Plus className="h-4 w-4" />
          <span>Add Skill</span>
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
      ) : skills.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-zinc-800 p-12 text-center">
          <Tags className="mx-auto h-8 w-8 text-zinc-600" />
          <p className="mt-3 text-sm text-zinc-400">No skill tags added yet.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((item, index) => (
            <div
              key={item.id}
              className={`flex items-center justify-between gap-3 rounded-2xl border p-3.5 transition ${
                item.is_active
                  ? 'border-zinc-800 bg-zinc-900/60'
                  : 'border-zinc-800/40 bg-zinc-900/20 opacity-70'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMoveOrder(item, 'up')}
                    className="text-zinc-500 hover:text-zinc-200 disabled:opacity-20"
                    title="Move Up"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    disabled={index === skills.length - 1}
                    onClick={() => handleMoveOrder(item, 'down')}
                    className="text-zinc-500 hover:text-zinc-200 disabled:opacity-20"
                    title="Move Down"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </button>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white truncate">{item.name}</span>
                    {!item.is_active ? (
                      <span className="rounded-full border border-zinc-700 bg-zinc-800 px-1.5 py-0.2 text-[9px] font-medium text-zinc-400">
                        Inactive
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggleActive(item)}
                  className="rounded-lg p-1.5 text-xs text-zinc-400 hover:text-white"
                  title={item.is_active ? 'Set Inactive' : 'Set Active'}
                >
                  <span className="text-[10px] underline">{item.is_active ? 'On' : 'Off'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(item)}
                  className="p-1.5 text-zinc-400 hover:text-white"
                  title="Edit"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(item)}
                  className="p-1.5 text-red-400 hover:text-red-300"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Add Modal */}
      {isEditing && activeItem ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-white">
              {activeItem.id ? 'Edit Skill Tag' : 'Add Skill Tag'}
            </h3>

            <form onSubmit={handleSaveItem} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300">Skill Name</label>
                <input
                  type="text"
                  required
                  value={activeItem.name || ''}
                  onChange={(e) => setActiveItem({ ...activeItem, name: e.target.value })}
                  placeholder="e.g. Google Ads"
                  className="mt-1.5 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500"
                />
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

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="skill-active"
                  checked={activeItem.is_active ?? true}
                  onChange={(e) => setActiveItem({ ...activeItem, is_active: e.target.checked })}
                  className="h-4 w-4 rounded border-zinc-800 bg-zinc-950 text-violet-600 focus:ring-0"
                />
                <label htmlFor="skill-active" className="text-xs text-zinc-300 cursor-pointer">
                  Active (visible on website)
                </label>
              </div>

              <div className="mt-5 flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
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
                  <span>{isSaving ? 'Saving…' : 'Save Skill'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <DeleteDialog
        isOpen={Boolean(deleteTarget)}
        title={`Delete "${deleteTarget?.name}"?`}
        description="Are you sure you want to delete this skill tag?"
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
