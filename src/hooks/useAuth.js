import { useEffect, useState } from 'react'
import { getSession } from '@/lib/auth'

export function useAuth() {
  const [session, setSessionState] = useState(() => getSession())

  useEffect(() => {
    const sync = () => setSessionState(getSession())
    window.addEventListener('vendora:auth', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('vendora:auth', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  return { session, user: session?.user ?? null, isAuthenticated: !!session }
}
