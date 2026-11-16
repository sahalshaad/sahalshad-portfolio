import { useEffect, useState } from 'react'
import {
  Inbox,
  Mail,
  Clock,
  Trash2,
  Loader2,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { ContactMessageItem } from '../types'
import { DeleteDialog } from '../components/DeleteDialog'
import { formatSupabaseError } from '../utils/error'

export function MessagesView() {
  const [messages, setMessages] = useState<ContactMessageItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // View modal state
  const [selectedMessage, setSelectedMessage] = useState<ContactMessageItem | null>(null)

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<ContactMessageItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  async function loadMessages() {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setMessages((data as ContactMessageItem[]) || [])
    } catch (err: unknown) {
      setErrorMessage(formatSupabaseError(err))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadMessages()
  }, [])

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)

    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', deleteTarget.id)

      if (error) throw error

      setMessages((prev) => prev.filter((m) => m.id !== deleteTarget.id))
      if (selectedMessage?.id === deleteTarget.id) {
        setSelectedMessage(null)
      }
      setDeleteTarget(null)
      setSuccessMessage('Message deleted.')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err: unknown) {
      setErrorMessage(formatSupabaseError(err))
    } finally {
      setIsDeleting(false)
    }
  }

  function formatDate(iso: string) {
    try {
      const date = new Date(iso)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return iso
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Contact Messages</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Inquiries submitted via your portfolio's public contact form.
          </p>
        </div>
        <button
          type="button"
          onClick={loadMessages}
          className="inline-flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
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

      {/* Messages List */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="py-20 text-center">
            <Inbox className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-zinc-400">Your inbox is clear</p>
            <p className="text-xs text-zinc-600 mt-1">
              New submissions from the contact form will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/80">
            {messages.map((item) => (
              <div
                key={item.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-800/20 transition cursor-pointer"
                onClick={() => setSelectedMessage(item)}
              >
                <div className="space-y-1.5 flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-sm text-white truncate">{item.name}</span>
                    <span className="flex items-center gap-1 text-[11px] text-zinc-500 shrink-0">
                      <Clock className="h-3 w-3" />
                      {formatDate(item.created_at)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-violet-400">
                    <Mail className="h-3 w-3 shrink-0" />
                    <span className="truncate">{item.email}</span>
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {item.message}
                  </p>
                </div>

                <div
                  className="flex items-center gap-2 shrink-0 self-end sm:self-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <a
                    href={`mailto:${item.email}?subject=Re:%20Portfolio%20Inquiry`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
                    title="Reply via email"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>Reply</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setSelectedMessage(item)}
                    className="rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
                    title="View details"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
                    className="rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-red-400 hover:bg-red-950/40 hover:border-red-900/50 transition"
                    title="Delete message"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View Details Modal */}
      {selectedMessage ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">{selectedMessage.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    className="inline-flex items-center gap-1 text-xs text-violet-400 hover:underline"
                  >
                    <Mail className="h-3 w-3" />
                    <span>{selectedMessage.email}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
              <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                <Clock className="h-3 w-3" />
                {formatDate(selectedMessage.created_at)}
              </span>
            </div>

            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-4">
              <p className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-2">
                Message Content
              </p>
              <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
                {selectedMessage.message}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteTarget(selectedMessage)
                }}
                className="inline-flex items-center gap-1.5 rounded-2xl border border-red-900/40 bg-red-950/20 px-4 py-2 text-xs font-semibold text-red-400 hover:bg-red-950/40 transition"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMessage(null)}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 transition"
                >
                  Close
                </button>
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re:%20Portfolio%20Inquiry`}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-white px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-zinc-200 transition"
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span>Reply via Email</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        isOpen={deleteTarget !== null}
        title="Delete Contact Message"
        description={`Are you sure you want to delete message from "${deleteTarget?.name}" (${deleteTarget?.email})?`}
        isDeleting={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
