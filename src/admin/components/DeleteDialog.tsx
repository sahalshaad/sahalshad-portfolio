import { AlertTriangle, Loader2 } from 'lucide-react'

interface DeleteDialogProps {
  isOpen: boolean
  title: string
  description?: string
  isDeleting?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteDialog({
  isOpen,
  title,
  description = 'Are you sure you want to delete this record? This action cannot be undone.',
  isDeleting = false,
  onConfirm,
  onCancel,
}: DeleteDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
        <div className="flex items-center gap-3 text-red-400">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-950/50">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold text-zinc-100">{title}</h3>
        </div>

        <p className="mt-3 text-sm text-zinc-400 leading-relaxed">{description}</p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-700 hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-red-500 disabled:opacity-50"
          >
            {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            <span>{isDeleting ? 'Deleting…' : 'Delete Record'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
