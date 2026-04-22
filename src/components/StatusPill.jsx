import { cn } from '@/lib/utils'
const styles = {
  pending: 'bg-warning-soft text-warning border-warning/20',
  paid: 'bg-success-soft text-success border-success/20',
  delivered: 'bg-success-soft text-success border-success/20',
  shipped: 'bg-brand-soft text-brand border-brand/20',
  failed: 'bg-destructive-soft text-destructive border-destructive/20',
  cancelled: 'bg-muted text-muted-foreground border-border',
  active: 'bg-success-soft text-success border-success/20',
  inactive: 'bg-muted text-muted-foreground border-border',
  admin: 'bg-brand-soft text-brand border-brand/20',
  user: 'bg-muted text-muted-foreground border-border',
}
export function StatusPill({ status, className }) {
  const key = status?.toLowerCase?.() ?? ''
  const cls = styles[key] || 'bg-muted text-muted-foreground border-border'
  return <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize', cls, className)}>{status || '—'}</span>
}
