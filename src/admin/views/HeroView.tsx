import { useEffect, useState, type FormEvent } from 'react'
import { Save, Loader2, CheckCircle2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { HeroSection } from '../types'
import { MediaUploader } from '../components/MediaUploader'
import { formatSupabaseError } from '../utils/error'

export function HeroView() {
  const [hero, setHero] = useState<Partial<HeroSection>>({
    name: '',
    title: '',
    description: '',
    profile_image_url: '',
    cta_primary_text: '',
    cta_primary_link: '',
    cta_secondary_text: '',
    cta_secondary_link: '',
    is_active: true,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    async function loadHero() {
      setIsLoading(true)
      setErrorMessage('')
      try {
        const { data, error } = await supabase.from('hero_section').select('*').maybeSingle()
        if (error) throw error
        if (data) {
          setHero(data)
        }
      } catch (err: unknown) {
        setErrorMessage(formatSupabaseError(err))
      } finally {
        setIsLoading(false)
      }
    }
    loadHero()
  }, [])

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const payload = {
        ...hero,
        is_singleton: true,
      }

      const { data, error } = await supabase
        .from('hero_section')
        .upsert(payload, { onConflict: 'is_singleton' })
        .select()
        .single()

      if (error) throw error
      if (data) setHero(data)

      setSuccessMessage('Hero section updated successfully!')
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
        <h1 className="text-2xl font-semibold tracking-tight text-white">Hero Section</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Edit your headline bio, main profile photo, and call-to-action links.
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

      <form onSubmit={handleSave} className="space-y-5 rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-zinc-300">Name</label>
            <input
              type="text"
              required
              value={hero.name || ''}
              onChange={(e) => setHero({ ...hero, name: e.target.value })}
              className="mt-1.5 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300">Professional Title</label>
            <input
              type="text"
              required
              value={hero.title || ''}
              onChange={(e) => setHero({ ...hero, title: e.target.value })}
              className="mt-1.5 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-300">Bio Description</label>
          <textarea
            rows={4}
            required
            value={hero.description || ''}
            onChange={(e) => setHero({ ...hero, description: e.target.value })}
            className="mt-1.5 w-full resize-none rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500 leading-relaxed"
          />
        </div>

        {/* Profile Image Uploader */}
        <MediaUploader
          folder="hero"
          currentUrl={hero.profile_image_url}
          label="Profile Photo (Stores in site-media/hero)"
          allowedTypes={['image']}
          onUploadSuccess={(url) => setHero({ ...hero, profile_image_url: url })}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-zinc-300">Primary CTA Label</label>
            <input
              type="text"
              value={hero.cta_primary_text || ''}
              onChange={(e) => setHero({ ...hero, cta_primary_text: e.target.value })}
              className="mt-1.5 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300">Primary CTA Link</label>
            <input
              type="text"
              value={hero.cta_primary_link || ''}
              onChange={(e) => setHero({ ...hero, cta_primary_link: e.target.value })}
              className="mt-1.5 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-zinc-300">Secondary CTA Label</label>
            <input
              type="text"
              value={hero.cta_secondary_text || ''}
              onChange={(e) => setHero({ ...hero, cta_secondary_text: e.target.value })}
              className="mt-1.5 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300">Secondary CTA Link</label>
            <input
              type="text"
              value={hero.cta_secondary_link || ''}
              onChange={(e) => setHero({ ...hero, cta_secondary_link: e.target.value })}
              className="mt-1.5 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="hero-active"
            checked={hero.is_active ?? true}
            onChange={(e) => setHero({ ...hero, is_active: e.target.checked })}
            className="h-4 w-4 rounded border-zinc-800 bg-zinc-950 text-violet-600 focus:ring-0"
          />
          <label htmlFor="hero-active" className="text-xs font-medium text-zinc-300 cursor-pointer">
            Section is Active on public site
          </label>
        </div>

        <div className="pt-4 border-t border-zinc-800">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-xs font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin text-zinc-950" /> : <Save className="h-4 w-4" />}
            <span>{isSaving ? 'Saving…' : 'Save Hero Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
