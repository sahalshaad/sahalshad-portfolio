import { useState, type FormEvent } from 'react'
import { Lock, Mail, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatSupabaseError } from '../utils/error'

interface LoginPageProps {
  onLoginSuccess?: () => void
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        throw error
      }

      if (data.user) {
        onLoginSuccess?.()
      }
    } catch (err: unknown) {
      setErrorMessage(formatSupabaseError(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 text-zinc-100">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-600/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm rounded-3xl border border-zinc-800 bg-zinc-900/90 p-8 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-800 text-violet-400 shadow-inner">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-xl font-semibold tracking-tight text-white">Portfolio Admin</h1>
          <p className="mt-1 text-xs text-zinc-400">
            Sign in with your verified Supabase administrator account
          </p>
        </div>

        {errorMessage ? (
          <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-950/40 p-3 text-xs text-red-400">
            {errorMessage}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300">Admin Email</label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sahalshaad@gmail.com"
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300">Password</label>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-white py-2.5 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 active:scale-[0.99] disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin text-zinc-950" /> : null}
            <span>{isLoading ? 'Signing in…' : 'Sign in to Dashboard'}</span>
          </button>
        </form>

        <div className="mt-6 text-center border-t border-zinc-800/80 pt-4">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Public Portfolio</span>
          </a>
        </div>
      </div>
    </div>
  )
}
