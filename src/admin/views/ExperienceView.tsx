import { useEffect, useState, type FormEvent, type KeyboardEvent } from 'react'
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Loader2,
  Briefcase,
  CheckCircle2,
  ListPlus,
  AlignLeft,
  X,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { ExperienceItem } from '../types'
import { DeleteDialog } from '../components/DeleteDialog'
import { formatSupabaseError } from '../utils/error'
import {
  parseExperiencePoints,
  serializeExperiencePoints,
} from '../../utils/experiencePoints'

export function ExperienceView() {
  const [experiences, setExperiences] = useState<ExperienceItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Edit / Create state
  const [isEditing, setIsEditing] = useState(false)
  const [activeItem, setActiveItem] = useState<Partial<ExperienceItem> | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Points / Achievements state inside modal
  const [points, setPoints] = useState<string[]>([])
  const [newPointInput, setNewPointInput] = useState('')
  const [isBulkMode, setIsBulkMode] = useState(false)
  const [bulkTextInput, setBulkTextInput] = useState('')

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadExperiences()
  }, [])

  function openCreate() {
    const nextOrder =
      experiences.length > 0
        ? Math.max(...experiences.map((e) => e.sort_order)) + 1
        : 1

    setActiveItem({
      job_role: '',
      company_name: '',
      duration: '',
      description: '',
      sort_order: nextOrder,
      is_active: true,
    })
    setPoints([])
    setNewPointInput('')
    setIsBulkMode(false)
    setBulkTextInput('')
    setIsEditing(true)
  }

  function openEdit(item: ExperienceItem) {
    setActiveItem(item)
    const parsedPoints = parseExperiencePoints(item.description)
    setPoints(parsedPoints)
    setNewPointInput('')
    setIsBulkMode(false)
    setBulkTextInput('')
    setIsEditing(true)
  }

  // --- Points Management Helpers ---
  function handleAddPoint() {
    const trimmed = newPointInput.trim()
    if (!trimmed) return
    setPoints((prev) => [...prev, trimmed])
    setNewPointInput('')
  }

  function handlePointKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddPoint()
    }
  }

  function handleUpdatePoint(index: number, val: string) {
    setPoints((prev) => {
      const copy = [...prev]
      copy[index] = val
      return copy
    })
  }

  function handleDeletePoint(index: number) {
    setPoints((prev) => prev.filter((_, i) => i !== index))
  }

  function handleMovePoint(index: number, direction: 'up' | 'down') {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= points.length) return
    setPoints((prev) => {
      const copy = [...prev]
      const temp = copy[index]
      copy[index] = copy[targetIndex]
      copy[targetIndex] = temp
      return copy
    })
  }

  function handleToggleBulkMode() {
    if (!isBulkMode) {
      // Switching to bulk mode: convert current points into bulleted/multiline text
      setBulkTextInput(points.map((p) => `• ${p}`).join('\n'))
      setIsBulkMode(true)
    } else {
      // Switching back to list mode: parse whatever text is there
      const parsed = parseExperiencePoints(bulkTextInput)
      setPoints(parsed)
      setIsBulkMode(false)
    }
  }

  function handleApplyBulkText() {
    const parsed = parseExperiencePoints(bulkTextInput)
    setPoints(parsed)
    setIsBulkMode(false)
  }

  async function handleSaveItem(e: FormEvent) {
    e.preventDefault()
    if (!activeItem?.job_role || !activeItem?.company_name) return

    // Finalize points: if bulk mode is active, parse bulk text; otherwise check if there's an unadded point in input
    let finalPoints = [...points]
    if (isBulkMode) {
      finalPoints = parseExperiencePoints(bulkTextInput)
    } else if (newPointInput.trim()) {
      finalPoints.push(newPointInput.trim())
    }

    const serializedDescription = serializeExperiencePoints(finalPoints)

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
            description: serializedDescription,
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
            description: serializedDescription,
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
            Work history, roles, and key achievements shown in the career timeline.
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
          {experiences.map((item, index) => {
            const itemPoints = parseExperiencePoints(item.description)

            return (
              <div
                key={item.id}
                className={`flex flex-col sm:flex-row sm:items-start justify-between gap-4 rounded-2xl border p-4 transition ${
                  item.is_active
                    ? 'border-zinc-800 bg-zinc-900/60'
                    : 'border-zinc-800/40 bg-zinc-900/20 opacity-70'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="flex items-center gap-1 pt-0.5">
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

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-white">{item.job_role}</span>
                      <span className="text-xs text-zinc-400">• {item.company_name}</span>
                      <span className="rounded-md border border-zinc-700 bg-zinc-800/80 px-2 py-0.5 text-[10px] font-mono text-zinc-300">
                        {itemPoints.length} {itemPoints.length === 1 ? 'point' : 'points'}
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

                    <p className="mt-1 font-mono text-xs text-zinc-400">{item.duration}</p>

                    {/* Points preview */}
                    {itemPoints.length > 0 ? (
                      <ul className="mt-2.5 space-y-1.5 text-xs text-zinc-300">
                        {itemPoints.slice(0, 2).map((pt, pIdx) => (
                          <li key={pIdx} className="flex items-start gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                            <span className="line-clamp-1">{pt}</span>
                          </li>
                        ))}
                        {itemPoints.length > 2 ? (
                          <li className="text-[11px] text-zinc-500 pl-3.5">
                            +{itemPoints.length - 2} more achievement points
                          </li>
                        ) : null}
                      </ul>
                    ) : (
                      <p className="mt-1 text-xs text-zinc-500 italic">No achievements added yet.</p>
                    )}
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
            )
          })}
        </div>
      )}

      {/* Edit / Add Modal */}
      {isEditing && activeItem ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl my-8">
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
                    onChange={(e) =>
                      setActiveItem({ ...activeItem, sort_order: parseInt(e.target.value) || 0 })
                    }
                    className="mt-1.5 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              {/* Structured Points / Achievements Section */}
              <div className="space-y-2.5 pt-2 border-t border-zinc-800/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="block text-xs font-semibold text-zinc-300">
                      Key Achievements & Points
                    </label>
                    <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-zinc-400">
                      {points.length} {points.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggleBulkMode}
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium text-violet-400 hover:text-violet-300 transition"
                  >
                    {isBulkMode ? (
                      <>
                        <ListPlus className="h-3 w-3" />
                        <span>Switch to Point-by-Point List</span>
                      </>
                    ) : (
                      <>
                        <AlignLeft className="h-3 w-3" />
                        <span>Quick Paste / Bulk Mode</span>
                      </>
                    )}
                  </button>
                </div>

                {isBulkMode ? (
                  <div className="space-y-2">
                    <textarea
                      rows={5}
                      value={bulkTextInput}
                      onChange={(e) => setBulkTextInput(e.target.value)}
                      placeholder="Paste multi-line text from resume, LinkedIn, or notes...&#10;• Scaled acquisition to 4.2x ROAS&#10;• Reduced cost-per-lead by 31%&#10;• Built executive reporting cadence"
                      className="w-full resize-none rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-xs text-white outline-none focus:border-violet-500 font-mono leading-relaxed"
                    />
                    <div className="flex items-center justify-between text-[11px] text-zinc-500">
                      <span>Each line will become a separate bullet point.</span>
                      <button
                        type="button"
                        onClick={handleApplyBulkText}
                        className="rounded-lg bg-zinc-800 hover:bg-zinc-700 px-3 py-1 font-medium text-zinc-200 transition"
                      >
                        Convert to List
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* List of existing points */}
                    {points.length > 0 ? (
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {points.map((pt, pIdx) => (
                          <div
                            key={pIdx}
                            className="flex items-center gap-2 rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-2 group hover:border-zinc-700 transition"
                          >
                            <span className="font-mono text-[10px] text-zinc-500 w-5 shrink-0 text-center">
                              {String(pIdx + 1).padStart(2, '0')}
                            </span>

                            <input
                              type="text"
                              value={pt}
                              onChange={(e) => handleUpdatePoint(pIdx, e.target.value)}
                              className="flex-1 bg-transparent text-xs text-white outline-none focus:text-violet-300"
                              placeholder="Achievement point description..."
                            />

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                disabled={pIdx === 0}
                                onClick={() => handleMovePoint(pIdx, 'up')}
                                className="p-1 text-zinc-500 hover:text-zinc-200 disabled:opacity-20"
                                title="Move Point Up"
                              >
                                <ArrowUp className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                disabled={pIdx === points.length - 1}
                                onClick={() => handleMovePoint(pIdx, 'down')}
                                className="p-1 text-zinc-500 hover:text-zinc-200 disabled:opacity-20"
                                title="Move Point Down"
                              >
                                <ArrowDown className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeletePoint(pIdx)}
                                className="p-1 text-zinc-500 hover:text-red-400 transition"
                                title="Delete Point"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-500 italic py-1">
                        No points added yet. Use the field below to add achievements.
                      </p>
                    )}

                    {/* Add new point input bar */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={newPointInput}
                        onChange={(e) => setNewPointInput(e.target.value)}
                        onKeyDown={handlePointKeyDown}
                        placeholder="Add an achievement point (Press Enter to add)..."
                        className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-white outline-none focus:border-violet-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddPoint}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-700 hover:text-white transition shrink-0"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Point</span>
                      </button>
                    </div>
                  </div>
                )}
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
