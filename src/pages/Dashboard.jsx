import { useQuery } from '@tanstack/react-query'
import {
  ArrowUpRight, CircleDollarSign, Clock, ShoppingBag,
  TrendingUp, XCircle, CheckCircle2, Package,
} from 'lucide-react'
import { getAnalytics } from '@/lib/api'
import { PageHeader } from '@/components/layout/PageHeader'
import { formatMoney, formatNumber } from '@/lib/format'
import { Skeleton } from '@/components/ui/skeleton'
import { Link } from 'react-router-dom'

function Kpi({ label, value, sub, icon: Icon, tone = 'default' }) {
  const toneCls = {
    default: 'bg-muted text-foreground',
    success: 'bg-success-soft text-success',
    warning: 'bg-warning-soft text-warning',
    destructive: 'bg-destructive-soft text-destructive',
    brand: 'bg-brand-soft text-brand',
  }[tone]

  return (
    <div className="surface-card p-5">
      <div className="flex items-center justify-between">
        <div className={`flex h-8 w-8 items-center justify-center rounded-md ${toneCls}`}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <div className="mt-4 text-2xl font-semibold tracking-tight">{value}</div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </div>
  )
}

export default function Dashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => getAnalytics({ top_products_limit: 10 }),
  })

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="A live snapshot of revenue, orders and best-sellers."
      />

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive-soft px-4 py-3 text-sm text-destructive">
          {error.message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[120px] rounded-xl" />)
        ) : (
          <>
            <Kpi
              label="Revenue (total)"
              value={formatMoney(data?.orders?.total_revenue)}
              sub={`Today ${formatMoney(data?.orders?.revenue_today)}`}
              icon={CircleDollarSign}
              tone="brand"
            />
            <Kpi
              label="This month"
              value={formatMoney(data?.orders?.revenue_this_month)}
              sub="Revenue this month"
              icon={TrendingUp}
              tone="success"
            />
            <Kpi
              label="Total orders"
              value={formatNumber(data?.orders?.total_orders ?? 0)}
              sub={`${formatNumber(data?.orders?.paid_orders ?? 0)} paid`}
              icon={ShoppingBag}
            />
            <Kpi
              label="Pending"
              value={formatNumber(data?.orders?.pending_orders ?? 0)}
              sub={`${formatNumber(data?.orders?.failed_orders ?? 0)} failed · ${formatNumber(data?.orders?.cancelled_orders ?? 0)} cancelled`}
              icon={Clock}
              tone="warning"
            />
          </>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Top products */}
        <div className="surface-card lg:col-span-2">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold">Top products</h2>
              <p className="text-xs text-muted-foreground">Best-selling products by units sold.</p>
            </div>
            <Link to="/products" className="inline-flex items-center gap-1 text-xs font-medium text-foreground hover:underline">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))
            ) : data?.top_products?.length ? (
              data.top_products.map((p, i) => (
                <Link
                  key={p.product_id}
                  to={`/products/${p.product_id}`}
                  className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/40"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-xs font-mono text-muted-foreground">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{p.product_name || 'Untitled'}</div>
                    <div className="text-xs text-muted-foreground">{formatNumber(p.total_sold)} sold</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold tabular-nums">{formatMoney(p.total_revenue)}</div>
                    <div className="text-[10px] text-muted-foreground">revenue</div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="px-5 py-12 text-center text-sm text-muted-foreground">No data yet.</div>
            )}
          </div>
        </div>

        {/* Order breakdown */}
        <div className="surface-card">
          <div className="border-b px-5 py-4">
            <h2 className="text-sm font-semibold">Order breakdown</h2>
            <p className="text-xs text-muted-foreground">Status of all orders.</p>
          </div>
          <div className="divide-y">
            {[
              { k: 'Paid',      v: data?.orders?.paid_orders,      icon: CheckCircle2, tone: 'text-success' },
              { k: 'Pending',   v: data?.orders?.pending_orders,   icon: Clock,        tone: 'text-warning' },
              { k: 'Failed',    v: data?.orders?.failed_orders,    icon: XCircle,      tone: 'text-destructive' },
              { k: 'Cancelled', v: data?.orders?.cancelled_orders, icon: Package,      tone: 'text-muted-foreground' },
            ].map((row) => (
              <div key={row.k} className="flex items-center gap-3 px-5 py-3">
                <row.icon className={`h-4 w-4 ${row.tone}`} />
                <span className="flex-1 text-sm">{row.k}</span>
                <span className="text-sm font-semibold tabular-nums">
                  {isLoading ? '—' : formatNumber(row.v ?? 0)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
