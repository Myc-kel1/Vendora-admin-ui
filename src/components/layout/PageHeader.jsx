import { cn } from '@/lib/utils'

export function PageHeader({ title, description, children, actions, className }) {
  return (
    <div className={cn('mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between', className)}>
      <div className="space-y-1.5">
        {title && <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>}
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
        {children}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
