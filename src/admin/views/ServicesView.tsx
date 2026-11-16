import { useEffect, useState, type FormEvent } from 'react'
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Loader2,
  Sparkles,
  CheckCircle2,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { ServiceItem } from '../types'
import { MediaUploader } from '../components/MediaUploader'
import { DeleteDialog } from '../components/DeleteDialog'
import { formatSupabaseError } from '../utils/error'

export function ServicesView() {
  const [services, setServices] = useState<ServiceItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Modal / Form state
  const [isEditing, setIsEditing] = useState(false)
  const [activeItem, setActiveItem] = useState<Partial<ServiceItem> | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<ServiceItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  async function loadServices() {
    setIsLoading(true)
    setErrorMessage('')
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) throw error
      setServices((data as ServiceItem[]) || [])
    } catch (err: unknown) {
      setErrorMessage(formatSupabaseError(err))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadServices()
  }, [])

  function openCreate() {
    const nextOrder = services.length > 0 ? Math.max(...services.map((s) => s.sort_order)) + 1 : 1
    setActiveItem({
      service_title: '',
      description: '',
      icon_class: 'LineChart',
      icon_image_url: '',
      sort_order: nextOrder,
      is_active: true,
    })
    setIsEditing(true)
  }

  function openEdit(item: ServiceItem) {
    setActiveItem(item)
    setIsEditing(true)
  }

  async function handleSaveItem(e: FormEvent) {
    e.preventDefault()
    if (!activeItem?.service_title) return

    setIsSaving(true)
    setErrorMessage('')

    try {
      if (activeItem.id) {
        const { error } = await supabase
          .from('services')
          .update({
            service_title: activeItem.service_title,
            description: activeItem.description || '',
            icon_class: activeItem.icon_class || '',
            icon_image_url: activeItem.icon_image_url || '',
            sort_order: activeItem.sort_order ?? 0,
            is_active: activeItem.is_active ?? true,
          })
          .eq('id', activeItem.id)

        if (error) throw error
        setSuccessMessage('Service updated successfully!')
      } else {
        const { error } = await supabase.from('services').insert([
          {
            service_title: activeItem.service_title,
            description: activeItem.description || '',
            icon_class: activeItem.icon_class || '',
            icon_image_url: activeItem.icon_image_url || '',
            sort_order: activeItem.sort_order ?? 0,
            is_active: activeItem.is_active ?? true,
          },
        ])

        if (error) throw error
        setSuccessMessage('Service added successfully!')
      }

      setIsEditing(false)
      setActiveItem(null)
      loadServices()
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err: unknown) {
      setErrorMessage(formatSupabaseError(err))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleToggleActive(item: ServiceItem) {
    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: !item.is_active })
        .eq('id', item.id)

      if (error) throw error
      setServices((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, is_active: !s.is_active } : s))
      )
    } catch (err: unknown) {
      setErrorMessage(formatSupabaseError(err))
    }
  }

  async function handleMoveOrder(item: ServiceItem, direction: 'up' | 'down') {
    const currentIndex = services.findIndex((s) => s.id === item.id)
    if (currentIndex < 0) return

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= services.length) return

    const targetItem = services[targetIndex]

    try {
      const [res1, res2] = await Promise.all([
        supabase
          .from('services')
          .update({ sort_order: targetItem.sort_order })
          .eq('id', item.id),
        supabase
          .from('services')
          .update({ sort_order: item.sort_order })
          .eq('id', targetItem.id),
      ])

      if (res1.error) throw res1.error
      if (res2.error) throw res2.error

      loadServices()
    } catch (err: unknown) {
      setErrorMessage(formatSupabaseError(err))
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)

    try {
      const { error } = await supabase.from('services').delete().eq('id', deleteTarget.id)
      if (error) throw error
      setServices((prev) => prev.filter((s) => s.id !== deleteTarget.id))
      setDeleteTarget(null)
      setSuccessMessage('Service deleted.')
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
          <h1 className="text-2xl font-semibold tracking-tight text-white">Services</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Offerings displayed on your homepage (Performance Marketing, SEO, etc.).
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-semibold text-zinc-950 transition hover:bg-zinc-200"
        >
          <Plus className="h-4 w-4" />
          <span>Add Service</span>
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
      ) : services.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-zinc-800 p-12 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-zinc-600" />
          <p className="mt-3 text-sm text-zinc-400">No services added yet.</p>
          <button
            type="button"
            onClick={openCreate}
            className="mt-4 inline-flex items-center gap-1.5 text-xs text-violet-400 hover:underline"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create your first service</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((item, index) => (
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
                    disabled={index === services.length - 1}
                    onClick={() => handleMoveOrder(item, 'down')}
                    className="p-1 text-zinc-500 hover:text-zinc-200 disabled:opacity-20"
                    title="Move Down"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white">{item.service_title}</span>
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
                  <p className="mt-0.5 text-xs text-zinc-400 line-clamp-1">{item.description}</p>
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
              {activeItem.id ? 'Edit Service' : 'Add New Service'}
            </h3>

            <form onSubmit={handleSaveItem} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300">Service Title</label>
                <input
                  type="text"
                  required
                  value={activeItem.service_title || ''}
                  onChange={(e) => setActiveItem({ ...activeItem, service_title: e.target.value })}
                  placeholder="e.g. Performance Marketing"
                  className="mt-1.5 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300">Description</label>
                <textarea
                  rows={3}
                  required
                  value={activeItem.description || ''}
                  onChange={(e) => setActiveItem({ ...activeItem, description: e.target.value })}
                  placeholder="Short description of this service"
                  className="mt-1.5 w-full resize-none rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300">Icon Class</label>
                  <select
                    value={activeItem.icon_class || 'LineChart'}
                    onChange={(e) => setActiveItem({ ...activeItem, icon_class: e.target.value })}
                    className="mt-1.5 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500"
                  >
                    <option value="LineChart">LineChart</option>
                    <option value="Megaphone">Megaphone</option>
                    <option value="BarChart3">BarChart3</option>
                    <option value="Funnel">Funnel</option>
                  </select>
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

              <MediaUploader
                folder="services"
                currentUrl={activeItem.icon_image_url}
                label="Custom Icon Image (Optional)"
                allowedTypes={['image']}
                onUploadSuccess={(url) => setActiveItem({ ...activeItem, icon_image_url: url })}
              />

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="service-active"
                  checked={activeItem.is_active ?? true}
                  onChange={(e) => setActiveItem({ ...activeItem, is_active: e.target.checked })}
                  className="h-4 w-4 rounded border-zinc-800 bg-zinc-950 text-violet-600 focus:ring-0"
                />
                <label htmlFor="service-active" className="text-xs text-zinc-300 cursor-pointer">
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
                  <span>{isSaving ? 'Saving…' : 'Save Service'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Delete Dialog */}
      <DeleteDialog
        isOpen={Boolean(deleteTarget)}
        title={`Delete "${deleteTarget?.service_title}"?`}
        description="Are you sure you want to delete this service? It will be removed immediately from your public site."
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
