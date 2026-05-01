import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config'

const SESSION_KEY = 'vendora.session'

export function getSession() {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

export function setSession(s) {
  if (!s) localStorage.removeItem(SESSION_KEY)
  else localStorage.setItem(SESSION_KEY, JSON.stringify(s))
  window.dispatchEvent(new Event('vendora:auth'))
}

export function getAccessToken() {
  return getSession()?.access_token ?? null
}

export async function signInWithPassword(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) {
    const errorMsg = data?.error_description || data?.msg || data?.error || 'Invalid credentials'
    console.error('Supabase auth error:', { status: res.status, error: errorMsg, data })
    throw new Error(errorMsg)
  }
  
  const session = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at,
    user: {
      id: data.user?.id ?? '',
      email: data.user?.email ?? email,
      role: data.user?.user_metadata?.role || data.user?.app_metadata?.role,
    },
  }
  
  console.log('✓ Authenticated user:', { email: session.user.email, role: session.user.role })
  setSession(session)
  return session
}

export function signOut() { setSession(null) }
