import { useState } from 'react'
import { Loader2, Save, RotateCcw } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getBaseUrl, getDefaultBaseUrl, setBaseUrl } from '@/lib/config'
import { useAuth } from '@/hooks/useAuth'
import { signOut } from '@/lib/auth'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export default function Settings() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [base, setBase] = useState(getBaseUrl())
  const [busy, setBusy] = useState(false)

  const save = async () => {
    setBusy(true)
    try { setBaseUrl(base.trim()); toast.success('Settings saved') }
    finally { setBusy(false) }
  }

  const reset = () => {
    const d = getDefaultBaseUrl()
    setBase(d)
    setBaseUrl('')
    toast.success('Reset to default')
  }

  return (
    <>
      <PageHeader title="Settings" description="API endpoint and account preferences." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="surface-card p-6 lg:col-span-2">
          <h2 className="mb-1 text-sm font-semibold">API endpoint</h2>
          <p className="mb-4 text-xs text-muted-foreground">All admin requests are sent to this base URL.</p>
          <div className="space-y-1.5">
            <Label htmlFor="base">Base URL</Label>
            <Input id="base" value={base} onChange={(e) => setBase(e.target.value)} className="font-mono text-xs" />
            <p className="text-[11px] text-muted-foreground">
              Default: <span className="font-mono">{getDefaultBaseUrl()}</span>
            </p>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={save} disabled={busy}>
              {busy ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
              Save
            </Button>
            <Button variant="outline" onClick={reset}>
              <RotateCcw className="mr-1.5 h-4 w-4" /> Reset
            </Button>
          </div>
        </div>

        <div className="surface-card p-6">
          <h2 className="mb-3 text-sm font-semibold">Account</h2>
          <div className="space-y-2 text-xs">
            <div>
              <div className="text-muted-foreground">Email</div>
              <div className="font-medium">{user?.email}</div>
            </div>
            <div>
              <div className="text-muted-foreground">User ID</div>
              <div className="break-all font-mono">{user?.id}</div>
            </div>
          </div>
          <Button
            variant="outline" className="mt-4 w-full"
            onClick={() => { signOut(); navigate('/login', { replace: true }) }}
          >
            Sign out
          </Button>
        </div>
      </div>
    </>
  )
}
