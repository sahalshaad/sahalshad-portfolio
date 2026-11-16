import { useState, useRef, type ChangeEvent } from 'react'
import { Upload, X, FileText, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatSupabaseError } from '../utils/error'

interface MediaUploaderProps {
  folder: 'hero' | 'projects' | 'testimonials' | 'services' | 'cv'
  currentUrl?: string
  onUploadSuccess: (publicUrl: string) => void
  label?: string
  allowedTypes?: ('image' | 'pdf')[]
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

const VALID_MIME_TYPES: Record<string, string[]> = {
  image: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'],
  pdf: ['application/pdf'],
}

export function MediaUploader({
  folder,
  currentUrl,
  onUploadSuccess,
  label = 'Upload Media',
  allowedTypes = ['image', 'pdf'],
}: MediaUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [previewUrl, setPreviewUrl] = useState(currentUrl || '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isPdf = previewUrl.endsWith('.pdf') || previewUrl.includes('/cv/')

  async function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setErrorMessage('')

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage('File size exceeds the 5 MB limit.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    // Validate mime type
    const validMimes = allowedTypes.flatMap((type) => VALID_MIME_TYPES[type])
    if (!validMimes.includes(file.type)) {
      setErrorMessage(`Invalid file type (${file.type}). Allowed: PNG, JPEG, WebP, SVG, PDF.`)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setIsUploading(true)

    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
      const baseName = file.name
        .substring(0, file.name.lastIndexOf('.'))
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .substring(0, 40)
      const uniqueFileName = `${folder}/${Date.now()}_${baseName}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('site-media')
        .upload(uniqueFileName, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (uploadError) {
        throw uploadError
      }

      const { data: publicUrlData } = supabase.storage
        .from('site-media')
        .getPublicUrl(uniqueFileName)

      const finalUrl = publicUrlData.publicUrl
      setPreviewUrl(finalUrl)
      onUploadSuccess(finalUrl)
    } catch (err: unknown) {
      setErrorMessage(formatSupabaseError(err))
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function handleClear() {
    setPreviewUrl('')
    setErrorMessage('')
    onUploadSuccess('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="space-y-2">
      {label ? <label className="block text-xs font-semibold text-zinc-300">{label}</label> : null}

      {previewUrl ? (
        <div className="relative flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3">
          {isPdf ? (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-950/40 text-red-400">
              <FileText className="h-6 w-6" />
            </div>
          ) : (
            <img
              src={previewUrl}
              alt="Preview"
              className="h-12 w-12 rounded-xl border border-zinc-800 object-cover"
            />
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-mono text-zinc-300">{previewUrl}</p>
            <p className="text-[11px] text-zinc-500">{isPdf ? 'PDF Document' : 'Image File'}</p>
          </div>

          <button
            type="button"
            onClick={handleClear}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
            title="Remove media"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <div className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept={allowedTypes
            .flatMap((type) => VALID_MIME_TYPES[type])
            .join(',')}
          onChange={handleFileSelect}
          disabled={isUploading}
          className="hidden"
          id={`uploader-${folder}`}
        />

        <label
          htmlFor={`uploader-${folder}`}
          className={`inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-3.5 py-2 text-xs font-medium text-zinc-200 transition hover:bg-zinc-700 hover:text-white cursor-pointer ${
            isUploading ? 'opacity-60 pointer-events-none' : ''
          }`}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
              <span>Uploading to site-media…</span>
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 text-zinc-400" />
              <span>{previewUrl ? 'Change File' : 'Choose File'}</span>
            </>
          )}
        </label>

        <span className="text-[11px] text-zinc-500">Max 5 MB • PNG, JPG, WebP, SVG, PDF</span>
      </div>

      {errorMessage ? (
        <div className="rounded-xl border border-red-500/20 bg-red-950/30 p-2.5 text-xs text-red-400">
          {errorMessage}
        </div>
      ) : null}
    </div>
  )
}
