import { useEffect, useState, type ReactNode } from 'react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import { LoginPage } from './LoginPage'
import { Loader2 } from 'lucide-react'

interface AuthGateProps {
  children: (user: SupabaseUser, signOut: () => Promise<void>) => ReactNode
}

export function AuthGate({ children }: AuthGateProps) {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Check active session on load
    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        if (!mounted) return
        if (error) {
          console.error('Session retrieval error:', error)
        }
        setUser(session?.user ?? null)
        setIsLoading(false)
      })
      .catch((err) => {
        if (!mounted) return
        console.error('Unexpected auth check error:', err)
        setIsLoading(false)
      })

    // Listen to ongoing auth changes (sign in, sign out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    setUser(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-zinc-950 text-zinc-100">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
          <p className="text-xs text-zinc-400">Verifying administrator session…</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage onLoginSuccess={() => {}} />
  }

  return <>{children(user, handleSignOut)}</>
}
