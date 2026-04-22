import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
export function Pager({ page, pageSize, total, hasMore, onChange }) {
  const totalPages = total ? Math.max(1, Math.ceil(total / pageSize)) : undefined
  const canPrev = page > 1
  const canNext = totalPages ? page < totalPages : !!hasMore
  return (
    <div className="flex items-center justify-between gap-3 border-t px-4 py-3 text-sm">
      <div className="text-xs text-muted-foreground">
        {total !== undefined ? (
          <>Page <span className="font-medium text-foreground">{page}</span>{totalPages && <> of <span className="font-medium text-foreground">{totalPages}</span></>} · <span className="font-medium text-foreground">{total.toLocaleString()}</span> total</>
        ) : (
          <>Page <span className="font-medium text-foreground">{page}</span></>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" disabled={!canPrev} onClick={() => onChange(page - 1)}>
          <ChevronLeft className="h-3.5 w-3.5" /> Previous
        </Button>
        <Button variant="outline" size="sm" disabled={!canNext} onClick={() => onChange(page + 1)}>
          Next <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
