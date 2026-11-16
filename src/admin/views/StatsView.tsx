import { useEffect, useState, type FormEvent } from 'react'
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Loader2,
  BarChart2,
  CheckCircle2,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { ResultStatItem } from '../types'
import { DeleteDialog } from '../components/DeleteDialog'
import { formatSupabaseError } from '../utils/error'

export function StatsView() {
  const [stats, setStats] = useState<ResultStatItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Edit / Add state
  const [isEditing, setIsEditing] = useState(false)
  const [activeItem, setActiveItem] = useState<Partial<ResultStatItem> | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<ResultStatItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  async function loadStats() {
    setIsLoading(true)
    setErrorMessage('')
    try {
      const { data, error } = await supabase
        .from('result_stats')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) throw error
      setStats((data as ResultStatItem[]) || [])
    } catch (err: unknown) {
      setErrorMessage(formatSupabaseError(err))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  function openCreate() {
    const nextOrder = stats.length > 0 ? Math.max(...stats.map((s) => s.sort_order)) + 1 : 1
    setActiveItem({
      label: '',
      value: '',
      sort_order: nextOrder,
      is_active: true,
    })
    setIsEditing(true)
  }

  function openEdit(item: ResultStatItem) {
    setActiveItem(item)
    setIsEditing(true)
  }

  async function handleSaveItem(e: FormEvent) {
    e.preventDefault()
    if (!activeItem?.label || !activeItem?.value) return

    setIsSaving(true)
    setErrorMessage('')

    try {
      if (activeItem.id) {
        const { error } = await supabase
          .from('result_stats')
          .update({
            label: activeItem.label.trim(),
            value: activeItem.value.trim(),
            sort_order: activeItem.sort_order ?? 0,
            is_active: activeItem.is_active ?? true,
          })
          .eq('id', activeItem.id)

        if (error) throw error
        setSuccessMessage('Result stat updated!')
      } else {
        const { error } = await supabase.from('result_stats').insert([
          {
            label: activeItem.label.trim(),
            value: activeItem.value.trim(),
            sort_order: activeItem.sort_order ?? 0,
            is_active: activeItem.is_active ?? true,
          },
        ])

        if (error) throw error
        setSuccessMessage('Result stat added!')
      }

      setIsEditing(false)
      setActiveItem(null)
      loadStats()
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err: unknown) {
      setErrorMessage(formatSupabaseError(err))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleToggleActive(item: ResultStatItem) {
    try {
      const { error } = await supabase
        .from('result_stats')
        .update({ is_active: !item.is_active })
        .eq('id', item.id)

      if (error) throw error
      setStats((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, is_active: !s.is_active } : s))
      )
    } catch (err: unknown) {
      setErrorMessage(formatSupabaseError(err))
    }
  }

  async function handleMoveOrder(item: ResultStatItem, direction: 'up' | 'down') {
    const currentIndex = stats.findIndex((s) => s.id === item.id)
    if (currentIndex < 0) return

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= stats.length) return

    const targetItem = stats[targetIndex]

    try {
      const [res1, res2] = await Promise.all([
        supabase.from('result_stats').update({ sort_order: targetItem.sort_order }).eq('id', item.id),
        supabase.from('result_stats').update({ sort_order: item.sort_order }).eq('id', targetItem.id),
      ])

      if (res1.error) throw res1.error
      if (res2.error) throw res2.error

      loadStats()
    } catch (err: unknown) {
      setErrorMessage(formatSupabaseError(err))
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)

    try {
      const { error } = await supabase.from('result_stats').delete().eq('id', deleteTarget.id)
      if (error) throw error
      setStats((prev) => prev.filter((s) => s.id !== deleteTarget.id))
      setDeleteTarget(null)
      setSuccessMessage('Result stat deleted.')
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
          <h1 className="text-2xl font-semibold tracking-tight text-white">Result Stats</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Key metrics and numbers highlighted in the results section (e.g. 5x ROAS, $500K+ Ad Spend).
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-semibold text-zinc-950 transition hover:bg-zinc-200"
        >
          <Plus className="h-4 w-4" />
          <span>Add Stat</span>
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
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
          </div>
        ) : stats.length === 0 ? (
          <div className="py-16 text-center">
            <BarChart2 className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-zinc-400">No result stats added yet</p>
            <p className="text-xs text-zinc-600 mt-1">
              Add your first key achievement or performance metric.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/80">
            {stats.map((item, index) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 gap-4 hover:bg-zinc-800/20 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveOrder(item, 'up')}
                      className="rounded p-1 text-zinc-500 hover:text-white disabled:opacity-20 disabled:hover:text-zinc-500 transition"
                      title="Move up"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === stats.length - 1}
                      onClick={() => handleMoveOrder(item, 'down')}
                      className="rounded p-1 text-zinc-500 hover:text-white disabled:opacity-20 disabled:hover:text-zinc-500 transition"
                      title="Move down"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold tracking-tight text-white">{item.value}</span>
                      {!item.is_active ? (
                        <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/20">
                          Inactive
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">{item.label}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(item)}
                    className={`rounded-xl px-2.5 py-1.5 text-xs font-medium border transition ${
                      item.is_active
                        ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-950/40'
                        : 'border-zinc-700 bg-zinc-800/40 text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    {item.is_active ? 'Active' : 'Hidden'}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    className="rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
                    title="Edit"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
                    className="rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-red-400 hover:bg-red-950/40 hover:border-red-900/50 transition"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit / Add Modal */}
      {isEditing && activeItem ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-white">
              {activeItem.id ? 'Edit Result Stat' : 'Add New Result Stat'}
            </h2>
            <p className="mt-1 text-xs text-zinc-400">
              Provide the metric number/percentage and its descriptive label.
            </p>

            <form onSubmit={handleSaveItem} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300">
                  Value <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5x or $500K+"
                  value={activeItem.value || ''}
                  onChange={(e) => setActiveItem({ ...activeItem, value: e.target.value })}
                  className="mt-1 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-violet-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300">
                  Label <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Average ROAS or Managed Ad Spend"
                  value={activeItem.label || ''}
                  onChange={(e) => setActiveItem({ ...activeItem, label: e.target.value })}
                  className="mt-1 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-violet-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300">Sort Order</label>
                <input
                  type="number"
                  value={activeItem.sort_order ?? 0}
                  onChange={(e) =>
                    setActiveItem({ ...activeItem, sort_order: parseInt(e.target.value, 10) || 0 })
                  }
                  className="mt-1 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-violet-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="stat_is_active"
                  checked={activeItem.is_active ?? true}
                  onChange={(e) => setActiveItem({ ...activeItem, is_active: e.target.checked })}
                  className="h-4 w-4 rounded border-zinc-800 bg-zinc-950 text-violet-600 focus:ring-0"
                />
                <label htmlFor="stat_is_active" className="text-xs text-zinc-300 cursor-pointer">
                  Active (visible on public site)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false)
                    setActiveItem(null)
                  }}
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
                  <span>Save</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Delete confirmation dialog */}
      <DeleteDialog
        isOpen={deleteTarget !== null}
        title="Delete Result Stat"
        description={`Are you sure you want to delete "${deleteTarget?.value} - ${deleteTarget?.label}"? This action cannot be undone.`}
        isDeleting={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
