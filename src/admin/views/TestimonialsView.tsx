import { useEffect, useState, type FormEvent } from 'react'
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Loader2,
  MessageSquareQuote,
  CheckCircle2,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { TestimonialItem } from '../types'
import { MediaUploader } from '../components/MediaUploader'
import { DeleteDialog } from '../components/DeleteDialog'
import { formatSupabaseError } from '../utils/error'

export function TestimonialsView() {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Edit / Add state
  const [isEditing, setIsEditing] = useState(false)
  const [activeItem, setActiveItem] = useState<Partial<TestimonialItem> | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<TestimonialItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  async function loadTestimonials() {
    setIsLoading(true)
    setErrorMessage('')
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) throw error
      setTestimonials((data as TestimonialItem[]) || [])
    } catch (err: unknown) {
      setErrorMessage(formatSupabaseError(err))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTestimonials()
  }, [])

  function openCreate() {
    const nextOrder =
      testimonials.length > 0 ? Math.max(...testimonials.map((t) => t.sort_order)) + 1 : 1
    setActiveItem({
      client_name: '',
      designation: '',
      feedback: '',
      image_url: '',
      sort_order: nextOrder,
      is_active: true,
    })
    setIsEditing(true)
  }

  function openEdit(item: TestimonialItem) {
    setActiveItem(item)
    setIsEditing(true)
  }

  async function handleSaveItem(e: FormEvent) {
    e.preventDefault()
    if (!activeItem?.client_name || !activeItem?.feedback) return

    setIsSaving(true)
    setErrorMessage('')

    try {
      if (activeItem.id) {
        const { error } = await supabase
          .from('testimonials')
          .update({
            client_name: activeItem.client_name,
            designation: activeItem.designation || '',
            feedback: activeItem.feedback,
            image_url: activeItem.image_url || '',
            sort_order: activeItem.sort_order ?? 0,
            is_active: activeItem.is_active ?? true,
          })
          .eq('id', activeItem.id)

        if (error) throw error
        setSuccessMessage('Testimonial updated successfully!')
      } else {
        const { error } = await supabase.from('testimonials').insert([
          {
            client_name: activeItem.client_name,
            designation: activeItem.designation || '',
            feedback: activeItem.feedback,
            image_url: activeItem.image_url || '',
            sort_order: activeItem.sort_order ?? 0,
            is_active: activeItem.is_active ?? true,
          },
        ])

        if (error) throw error
        setSuccessMessage('Testimonial added successfully!')
      }

      setIsEditing(false)
      setActiveItem(null)
      loadTestimonials()
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err: unknown) {
      setErrorMessage(formatSupabaseError(err))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleToggleActive(item: TestimonialItem) {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ is_active: !item.is_active })
        .eq('id', item.id)

      if (error) throw error
      setTestimonials((prev) =>
        prev.map((t) => (t.id === item.id ? { ...t, is_active: !t.is_active } : t))
      )
    } catch (err: unknown) {
      setErrorMessage(formatSupabaseError(err))
    }
  }

  async function handleMoveOrder(item: TestimonialItem, direction: 'up' | 'down') {
    const currentIndex = testimonials.findIndex((t) => t.id === item.id)
    if (currentIndex < 0) return

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= testimonials.length) return

    const targetItem = testimonials[targetIndex]

    try {
      const [res1, res2] = await Promise.all([
        supabase
          .from('testimonials')
          .update({ sort_order: targetItem.sort_order })
          .eq('id', item.id),
        supabase
          .from('testimonials')
          .update({ sort_order: item.sort_order })
          .eq('id', targetItem.id),
      ])

      if (res1.error) throw res1.error
      if (res2.error) throw res2.error

      loadTestimonials()
    } catch (err: unknown) {
      setErrorMessage(formatSupabaseError(err))
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)

    try {
      const { error } = await supabase.from('testimonials').delete().eq('id', deleteTarget.id)
      if (error) throw error
      setTestimonials((prev) => prev.filter((t) => t.id !== deleteTarget.id))
      setDeleteTarget(null)
      setSuccessMessage('Testimonial removed.')
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
          <h1 className="text-2xl font-semibold tracking-tight text-white">Testimonials</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Client feedback, reviews, and stakeholder endorsements.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-semibold text-zinc-950 transition hover:bg-zinc-200"
        >
          <Plus className="h-4 w-4" />
          <span>Add Testimonial</span>
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
      ) : testimonials.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-zinc-800 p-12 text-center">
          <MessageSquareQuote className="mx-auto h-8 w-8 text-zinc-600" />
          <p className="mt-3 text-sm text-zinc-400">No testimonials added yet.</p>
          <button
            type="button"
            onClick={openCreate}
            className="mt-4 inline-flex items-center gap-1.5 text-xs text-violet-400 hover:underline"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add client feedback</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {testimonials.map((item, index) => (
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
                    disabled={index === testimonials.length - 1}
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
                    alt={item.client_name}
                    className="h-11 w-11 rounded-full border border-zinc-800 object-cover shrink-0"
                  />
                ) : (
                  <div className="h-11 w-11 rounded-full border border-zinc-800 bg-zinc-950 flex items-center justify-center shrink-0 text-xs font-semibold text-zinc-400">
                    {item.client_name.substring(0, 2).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white">{item.client_name}</span>
                    <span className="text-xs text-zinc-400">• {item.designation}</span>
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
                  <p className="mt-1 text-xs text-zinc-300 line-clamp-2 italic">
                    "{item.feedback}"
                  </p>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl my-8">
            <h3 className="text-lg font-semibold text-white">
              {activeItem.id ? 'Edit Testimonial' : 'Add New Testimonial'}
            </h3>

            <form onSubmit={handleSaveItem} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300">Client Name</label>
                  <input
                    type="text"
                    required
                    value={activeItem.client_name || ''}
                    onChange={(e) => setActiveItem({ ...activeItem, client_name: e.target.value })}
                    placeholder="e.g. Ananya Kapoor"
                    className="mt-1.5 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300">Designation / Company</label>
                  <input
                    type="text"
                    value={activeItem.designation || ''}
                    onChange={(e) => setActiveItem({ ...activeItem, designation: e.target.value })}
                    placeholder="e.g. Founder, Coaching Brand"
                    className="mt-1.5 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500"
                  />
                </div>
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

              <div>
                <label className="block text-xs font-semibold text-zinc-300">Client Feedback / Quote</label>
                <textarea
                  rows={4}
                  required
                  value={activeItem.feedback || ''}
                  onChange={(e) => setActiveItem({ ...activeItem, feedback: e.target.value })}
                  placeholder="What the client said about your work, ROI, and collaboration."
                  className="mt-1.5 w-full resize-none rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500"
                />
              </div>

              <MediaUploader
                folder="testimonials"
                currentUrl={activeItem.image_url}
                label="Client Photo (Optional, site-media/testimonials)"
                allowedTypes={['image']}
                onUploadSuccess={(url) => setActiveItem({ ...activeItem, image_url: url })}
              />

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="testimonial-active"
                  checked={activeItem.is_active ?? true}
                  onChange={(e) => setActiveItem({ ...activeItem, is_active: e.target.checked })}
                  className="h-4 w-4 rounded border-zinc-800 bg-zinc-950 text-violet-600 focus:ring-0"
                />
                <label htmlFor="testimonial-active" className="text-xs text-zinc-300 cursor-pointer">
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
                  <span>{isSaving ? 'Saving…' : 'Save Testimonial'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <DeleteDialog
        isOpen={Boolean(deleteTarget)}
        title={`Delete review from "${deleteTarget?.client_name}"?`}
        description="Are you sure you want to delete this testimonial? It will be removed immediately from your public site."
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
