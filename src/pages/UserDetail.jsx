import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Mail, Shield } from 'lucide-react'
import { api } from '@/lib/api'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusPill } from '@/components/StatusPill'
import { formatDateTime, shortId } from '@/lib/format'
import { Skeleton } from '@/components/ui/skeleton'

export default function UserDetail() {
  const { id = '' } = useParams()

  const user = useQuery({
    queryKey: ['admin-user', id],
    queryFn: () => api(`/admin/users/${id}`),
    enabled: !!id,
  })

  if (user.isLoading) return <Skeleton className="h-64" />
  if (!user.data) return <p className="text-sm text-muted-foreground">User not found.</p>

  const u = user.data
  const initials = (u.email || '?').slice(0, 2).toUpperCase()

  return (
    <>
      <Link to="/users" className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to users
      </Link>

      <PageHeader
        title={u.email}
        description={`User · ${shortId(u.id, 18)}`}
        actions={<StatusPill status={u.role} />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="surface-card flex items-center gap-4 p-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-base font-semibold text-primary-foreground">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="truncate text-base font-semibold">{u.email}</div>
            <div className="text-xs text-muted-foreground">Member since {formatDateTime(u.created_at)}</div>
          </div>
        </div>

        <div className="surface-card p-6 lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold">Account</h2>
          <dl className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
            <div className="rounded-md border bg-muted/30 p-3">
              <dt className="flex items-center gap-1.5 text-muted-foreground">
                <Mail className="h-3 w-3" /> Email
              </dt>
              <dd className="mt-1 truncate font-medium">{u.email}</dd>
            </div>
            <div className="rounded-md border bg-muted/30 p-3">
              <dt className="flex items-center gap-1.5 text-muted-foreground">
                <Shield className="h-3 w-3" /> Role
              </dt>
              <dd className="mt-1 capitalize"><StatusPill status={u.role} /></dd>
            </div>
            <div className="rounded-md border bg-muted/30 p-3 sm:col-span-2">
              <dt className="text-muted-foreground">User ID</dt>
              <dd className="mt-1 break-all font-mono">{u.id}</dd>
            </div>
          </dl>
        </div>
      </div>
    </>
  )
}
