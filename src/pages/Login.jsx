import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signInWithPassword } from '@/lib/auth'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

export default function Login() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) return <Navigate to={from} replace />

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await signInWithPassword(email, password)
      toast.success('Welcome back')
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Sign-in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full">
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">Vendora</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Admin Panel</div>
            </div>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Use your admin credentials to access the dashboard.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email" type="email" autoComplete="email" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@vendora.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password" type="password" autoComplete="current-password" required
                value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <p className="mt-6 text-xs text-muted-foreground">
            Only accounts marked as <span className="font-mono text-foreground">admin</span> can access this panel.
          </p>
        </div>
      </div>

      <div className="relative hidden lg:flex lg:w-1/2 lg:items-center lg:justify-center lg:bg-secondary">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(var(--brand)/0.12),_transparent_60%)]" />
        <div className="relative max-w-md px-8">
          <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border bg-background/60 px-2.5 py-1 text-xs backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            All systems operational
          </div>
          <h2 className="text-3xl font-semibold tracking-tight">
            Run your store with clarity.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Inventory, orders, customers and revenue — all from one quiet, focused workspace.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-3">
            {[{ k: 'Orders', v: '—' }, { k: 'Revenue', v: '—' }, { k: 'Products', v: '—' }].map((s) => (
              <div key={s.k} className="surface-card p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.k}</div>
                <div className="mt-1 text-lg font-semibold tracking-tight">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
