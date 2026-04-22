import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Users as UsersIcon } from 'lucide-react'
import { api } from '@/lib/api'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusPill } from '@/components/StatusPill'
import { Pager } from '@/components/Pager'
import { EmptyState } from '@/components/EmptyState'
import { formatDate, shortId } from '@/lib/format'
import { Skeleton } from '@/components/ui/skeleton'

const PAGE_SIZE = 20

export default function Users() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)

  const users = useQuery({
    queryKey: ['admin-users', page],
    queryFn: () => api('/admin/users', { query: { page, page_size: PAGE_SIZE } }),
  })

  const items = users.data?.items ?? []

  return (
    <>
      <PageHeader title="Users" description="All registered customers and admins." />

      <div className="surface-card overflow-hidden">
        <div className="grid grid-cols-12 gap-2 border-b bg-muted/30 px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <div className="col-span-5">Email</div>
          <div className="col-span-3">User ID</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-2 text-right">Joined</div>
        </div>
        {users.isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 border-b px-4 py-3">
              <Skeleton className="col-span-5 h-5" /><Skeleton className="col-span-3 h-4" />
              <Skeleton className="col-span-2 h-5" /><Skeleton className="col-span-2 h-4" />
            </div>
          ))
        ) : items.length === 0 ? (
          <EmptyState icon={UsersIcon} title="No users found" />
        ) : (
          items.map((u) => (
            <div
              key={u.id}
              className="grid cursor-pointer grid-cols-12 items-center gap-2 border-b px-4 py-3 text-sm transition-colors hover:bg-muted/30"
              onClick={() => navigate(`/users/${u.id}`)}
            >
              <div className="col-span-5 min-w-0">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[10px] font-semibold">
                    {(u.email || '?').slice(0, 2).toUpperCase()}
                  </div>
                  <span className="truncate font-medium">{u.email}</span>
                </div>
              </div>
              <div className="col-span-3 font-mono text-xs text-muted-foreground">{shortId(u.id, 14)}</div>
              <div className="col-span-2"><StatusPill status={u.role} /></div>
              <div className="col-span-2 text-right text-xs text-muted-foreground">{formatDate(u.created_at)}</div>
            </div>
          ))
        )}

        {!users.isLoading && items.length > 0 && (
          <Pager page={page} pageSize={PAGE_SIZE} total={users.data?.total} hasMore={items.length === PAGE_SIZE} onChange={setPage} />
        )}
      </div>
    </>
  )
}
