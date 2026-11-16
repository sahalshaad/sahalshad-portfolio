import { useEffect, useState, type FormEvent } from 'react'
import { Save, Loader2, CheckCircle2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { GeneralSettings, ContactSection, CvDocument } from '../types'
import { MediaUploader } from '../components/MediaUploader'
import { formatSupabaseError } from '../utils/error'

export function SettingsView() {
  const [settings, setSettings] = useState<Partial<GeneralSettings>>({
    site_name: '',
    linkedin_url: '',
    instagram_url: '',
    portfolio_url: '',
    email: '',
    phone_number: '',
    is_active: true,
  })
  const [contactSection, setContactSection] = useState<Partial<ContactSection>>({
    heading: '',
    description: '',
    is_active: true,
  })
  const [cvDoc, setCvDoc] = useState<Partial<CvDocument>>({
    title: '',
    file_url: '',
    is_active: true,
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      setErrorMessage('')
      try {
        const [settingsRes, contactRes, cvRes] = await Promise.all([
          supabase.from('general_settings').select('*').maybeSingle(),
          supabase.from('contact_section').select('*').maybeSingle(),
          supabase.from('cv_document').select('*').maybeSingle(),
        ])

        if (settingsRes.error) throw settingsRes.error
        if (contactRes.error) throw contactRes.error
        if (cvRes.error) throw cvRes.error

        if (settingsRes.data) setSettings(settingsRes.data)
        if (contactRes.data) setContactSection(contactRes.data)
        if (cvRes.data) setCvDoc(cvRes.data)
      } catch (err: unknown) {
        setErrorMessage(formatSupabaseError(err))
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const [settingsRes, contactRes, cvRes] = await Promise.all([
        supabase
          .from('general_settings')
          .upsert({ ...settings, is_singleton: true }, { onConflict: 'is_singleton' }),
        supabase
          .from('contact_section')
          .upsert({ ...contactSection, is_singleton: true }, { onConflict: 'is_singleton' }),
        supabase
          .from('cv_document')
          .upsert({ ...cvDoc, is_singleton: true }, { onConflict: 'is_singleton' }),
      ])

      if (settingsRes.error) throw settingsRes.error
      if (contactRes.error) throw contactRes.error
      if (cvRes.error) throw cvRes.error

      setSuccessMessage('Site settings & resume updated successfully!')
      setTimeout(() => setSuccessMessage(''), 4000)
    } catch (err: unknown) {
      setErrorMessage(formatSupabaseError(err))
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Settings & Resume</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Manage general website identity, social profile links, contact intro copy, and your downloadable CV.
        </p>
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

      <form onSubmit={handleSave} className="space-y-8">
        {/* General Settings */}
        <div className="space-y-4 rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h2 className="text-base font-semibold text-white">General & Social Media</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-zinc-300">Site Brand Name</label>
              <input
                type="text"
                required
                value={settings.site_name || ''}
                onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                className="mt-1.5 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300">Contact Email</label>
              <input
                type="email"
                value={settings.email || ''}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="mt-1.5 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300">LinkedIn URL</label>
              <input
                type="url"
                value={settings.linkedin_url || ''}
                onChange={(e) => setSettings({ ...settings, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/..."
                className="mt-1.5 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300">Instagram URL</label>
              <input
                type="url"
                value={settings.instagram_url || ''}
                onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
                placeholder="https://instagram.com/..."
                className="mt-1.5 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300">Secondary Portfolio Link</label>
              <input
                type="text"
                value={settings.portfolio_url || ''}
                onChange={(e) => setSettings({ ...settings, portfolio_url: e.target.value })}
                placeholder="#work"
                className="mt-1.5 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500"
              />
            </div>
          </div>
        </div>

        {/* Contact Section Copy */}
        <div className="space-y-4 rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h2 className="text-base font-semibold text-white">Contact Section Copy</h2>

          <div>
            <label className="block text-xs font-semibold text-zinc-300">Heading</label>
            <input
              type="text"
              required
              value={contactSection.heading || ''}
              onChange={(e) => setContactSection({ ...contactSection, heading: e.target.value })}
              className="mt-1.5 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300">Description</label>
            <textarea
              rows={3}
              required
              value={contactSection.description || ''}
              onChange={(e) => setContactSection({ ...contactSection, description: e.target.value })}
              className="mt-1.5 w-full resize-none rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500 leading-relaxed"
            />
          </div>
        </div>

        {/* CV Document */}
        <div className="space-y-4 rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h2 className="text-base font-semibold text-white">Curriculum Vitae (Resume)</h2>

          <div>
            <label className="block text-xs font-semibold text-zinc-300">Button / Document Title</label>
            <input
              type="text"
              value={cvDoc.title || ''}
              onChange={(e) => setCvDoc({ ...cvDoc, title: e.target.value })}
              className="mt-1.5 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500"
            />
          </div>

          <MediaUploader
            folder="cv"
            currentUrl={cvDoc.file_url}
            label="Upload PDF Resume (site-media/cv)"
            allowedTypes={['pdf']}
            onUploadSuccess={(url) => setCvDoc({ ...cvDoc, file_url: url })}
          />
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-xs font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin text-zinc-950" /> : <Save className="h-4 w-4" />}
          <span>{isSaving ? 'Saving…' : 'Save All Settings'}</span>
        </button>
      </form>
    </div>
  )
}
