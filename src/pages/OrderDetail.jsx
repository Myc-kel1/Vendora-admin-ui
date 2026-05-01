import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { getOrder, updateOrderStatus } from '@/lib/api'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatusPill } from '@/components/StatusPill'
import { formatDateTime, formatMoney, formatNumber, shortId } from '@/lib/format'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

const STATUSES = ['pending', 'paid', 'failed', 'cancelled']

export default function OrderDetail() {
  const { id = '' } = useParams()
  const qc = useQueryClient()
  const [nextStatus, setNextStatus] = useState('')

  const order = useQuery({
    queryKey: ['admin-order', id],
    queryFn: () => getOrder(id),
    enabled: !!id,
  })

  useEffect(() => {
    if (order.data) setNextStatus(order.data.status)
  }, [order.data])

  const update = useMutation({
    mutationFn: (status) => updateOrderStatus(id, status),
    onSuccess: () => {
      toast.success('Status updated')
      qc.invalidateQueries({ queryKey: ['admin-order', id] })
      qc.invalidateQueries({ queryKey: ['admin-orders'] })
    },
    onError: (e) => toast.error(e.message),
  })

  if (order.isLoading) return <Skeleton className="h-96" />
  if (!order.data) return <p className="text-sm text-muted-foreground">Order not found.</p>

  const o = order.data

  return (
    <>
      <Link to="/orders" className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to orders
      </Link>

      <PageHeader
        title={`Order ${shortId(o.id, 12)}`}
        description={`Placed ${formatDateTime(o.created_at)}`}
        actions={
          <>
            <StatusPill status={o.status} />
            <Select value={nextStatus} onValueChange={setNextStatus}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button
              onClick={() => update.mutate(nextStatus)}
              disabled={update.isPending || nextStatus === o.status}
            >
              {update.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Update
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="surface-card lg:col-span-2">
          <div className="border-b px-5 py-4">
            <h2 className="text-sm font-semibold">Line items</h2>
            <p className="text-xs text-muted-foreground">{o.items?.length ?? 0} item(s) in this order.</p>
          </div>
          <div className="grid grid-cols-12 gap-2 border-b bg-muted/30 px-5 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <div className="col-span-6">Product</div>
            <div className="col-span-2 text-right">Qty</div>
            <div className="col-span-2 text-right">Price</div>
            <div className="col-span-2 text-right">Subtotal</div>
          </div>
          {o.items?.map((it) => (
            <div key={it.id} className="grid grid-cols-12 items-center gap-2 border-b px-5 py-3 text-sm">
              <div className="col-span-6 min-w-0">
                <div className="truncate font-medium">{it.product_name || 'Untitled'}</div>
                <Link to={`/products/${it.product_id}`} className="font-mono text-[10px] text-muted-foreground hover:underline">
                  {shortId(it.product_id)}
                </Link>
              </div>
              <div className="col-span-2 text-right tabular-nums">{formatNumber(it.quantity)}</div>
              <div className="col-span-2 text-right tabular-nums">{formatMoney(it.price)}</div>
              <div className="col-span-2 text-right font-medium tabular-nums">{formatMoney(it.subtotal)}</div>
            </div>
          ))}
          <div className="flex items-center justify-end gap-6 px-5 py-4">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Total</span>
            <span className="text-lg font-semibold tabular-nums">{formatMoney(o.total_amount)}</span>
          </div>
        </div>

        <div className="surface-card p-6">
          <h2 className="mb-3 text-sm font-semibold">Customer</h2>
          <dl className="space-y-2 text-xs">
            <div className="flex justify-between gap-4"><dt className="text-muted-foreground">User ID</dt><dd className="font-mono">{shortId(o.user_id, 18)}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Order ID</dt><dd className="font-mono">{shortId(o.id, 18)}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Placed</dt><dd>{formatDateTime(o.created_at)}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Status</dt><dd><StatusPill status={o.status} /></dd></div>
          </dl>
          <Link to={`/users/${o.user_id}`}>
            <Button variant="outline" size="sm" className="mt-4 w-full">View customer</Button>
          </Link>
        </div>
      </div>
    </>
  )
}
