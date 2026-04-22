import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Search, ShoppingCart } from 'lucide-react'
import { api } from '@/lib/api'
import { PageHeader } from '@/components/layout/PageHeader'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatusPill } from '@/components/StatusPill'
import { Pager } from '@/components/Pager'
import { EmptyState } from '@/components/EmptyState'
import { formatDateTime, formatMoney, shortId } from '@/lib/format'
import { Skeleton } from '@/components/ui/skeleton'

const PAGE_SIZE = 20
const ALL = '__all__'
const STATUSES = ['pending', 'paid', 'failed', 'cancelled']

export default function Orders() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [userId, setUserId] = useState('')
  const [debouncedUser, setDebouncedUser] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebouncedUser(userId), 300)
    return () => clearTimeout(t)
  }, [userId])

  useEffect(() => setPage(1), [status, debouncedUser])

  const orders = useQuery({
    queryKey: ['admin-orders', { page, status, debouncedUser }],
    queryFn: () => api('/admin/orders', {
      query: { page, page_size: PAGE_SIZE, status: status || undefined, user_id: debouncedUser || undefined },
    }),
  })

  const items = orders.data?.items ?? []

  return (
    <>
      <PageHeader title="Orders" description="Track every order across all customers." />

      <div className="surface-card mb-4 flex flex-col gap-3 p-3 md:flex-row md:items-center">
        <Select value={status || ALL} onValueChange={(v) => setStatus(v === ALL ? '' : v)}>
          <SelectTrigger className="md:w-44"><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All statuses</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="Filter by user ID…" className="pl-9" />
        </div>
      </div>

      <div className="surface-card overflow-hidden">
        <div className="grid grid-cols-12 gap-2 border-b bg-muted/30 px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <div className="col-span-3">Order</div>
          <div className="col-span-3">Customer</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1 text-right">Items</div>
          <div className="col-span-2 text-right">Total</div>
          <div className="col-span-1 text-right">Date</div>
        </div>

        {orders.isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 border-b px-4 py-3">
              <Skeleton className="col-span-3 h-5" /><Skeleton className="col-span-3 h-4" />
              <Skeleton className="col-span-2 h-5" /><Skeleton className="col-span-1 h-4" />
              <Skeleton className="col-span-2 h-4" /><Skeleton className="col-span-1 h-4" />
            </div>
          ))
        ) : items.length === 0 ? (
          <EmptyState icon={ShoppingCart} title="No orders found" description="Try adjusting filters." />
        ) : (
          items.map((o) => (
            <div
              key={o.id}
              className="grid cursor-pointer grid-cols-12 items-center gap-2 border-b px-4 py-3 text-sm transition-colors hover:bg-muted/30"
              onClick={() => navigate(`/orders/${o.id}`)}
            >
              <div className="col-span-3 truncate font-mono text-xs">{shortId(o.id, 12)}</div>
              <div className="col-span-3 truncate text-xs text-muted-foreground">{shortId(o.user_id, 14)}</div>
              <div className="col-span-2"><StatusPill status={o.status} /></div>
              <div className="col-span-1 text-right tabular-nums">{o.items?.length ?? 0}</div>
              <div className="col-span-2 text-right font-medium tabular-nums">{formatMoney(o.total_amount)}</div>
              <div className="col-span-1 text-right text-xs text-muted-foreground">{formatDateTime(o.created_at).split(',')[0]}</div>
            </div>
          ))
        )}

        {!orders.isLoading && items.length > 0 && (
          <Pager page={page} pageSize={PAGE_SIZE} total={orders.data?.total} hasMore={items.length === PAGE_SIZE} onChange={setPage} />
        )}
      </div>
    </>
  )
}
