import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FolderTree, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { listCategories, createCategory, updateCategory, deleteCategory } from '@/lib/api'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { EmptyState } from '@/components/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate, shortId } from '@/lib/format'
import { toast } from 'sonner'

export default function Categories() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)

  const cats = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => listCategories(),
  })

  const del = useMutation({
    mutationFn: (id) => deleteCategory(id),
    onSuccess: () => { toast.success('Category deleted'); qc.invalidateQueries({ queryKey: ['admin-categories'] }) },
    onError: (e) => toast.error(e.message),
  })

  return (
    <>
      <PageHeader
        title="Categories"
        description="Organize your catalog into categories."
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> New category
          </Button>
        }
      />

      <div className="surface-card overflow-hidden">
        <div className="grid grid-cols-12 gap-2 border-b bg-muted/30 px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <div className="col-span-6">Name</div>
          <div className="col-span-2">ID</div>
          <div className="col-span-3">Created</div>
          <div className="col-span-1" />
        </div>
        {cats.isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 border-b px-4 py-3">
              <Skeleton className="col-span-6 h-5" /><Skeleton className="col-span-2 h-4" />
              <Skeleton className="col-span-3 h-4" /><Skeleton className="col-span-1 h-4" />
            </div>
          ))
        ) : cats.data?.length ? (
          cats.data.map((c) => (
            <div key={c.id} className="grid grid-cols-12 items-center gap-2 border-b px-4 py-3 text-sm">
              <div className="col-span-6 font-medium">{c.name}</div>
              <div className="col-span-2 font-mono text-xs text-muted-foreground">{shortId(c.id)}</div>
              <div className="col-span-3 text-xs text-muted-foreground">{formatDate(c.created_at)}</div>
              <div className="col-span-1 flex justify-end gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditing(c)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => { if (confirm(`Delete "${c.name}"?`)) del.mutate(c.id) }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            icon={FolderTree}
            title="No categories yet"
            description="Create your first category to start organizing products."
            action={<Button size="sm" onClick={() => setCreating(true)}><Plus className="mr-1.5 h-4 w-4" /> New category</Button>}
          />
        )}
      </div>

      <CategoryDialog
        open={creating}
        onOpenChange={setCreating}
        title="New category"
        onSubmit={async (name) => {
          await createCategory({ name })
          toast.success('Category created')
          qc.invalidateQueries({ queryKey: ['admin-categories'] })
        }}
      />
      <CategoryDialog
        open={!!editing}
        onOpenChange={(v) => !v && setEditing(null)}
        initialName={editing?.name}
        title="Edit category"
        onSubmit={async (name) => {
          if (!editing) return
          await updateCategory(editing.id, { name })
          toast.success('Category updated')
          qc.invalidateQueries({ queryKey: ['admin-categories'] })
        }}
      />
    </>
  )
}

function CategoryDialog({ open, onOpenChange, onSubmit, title, initialName = '' }) {
  const [name, setName] = useState(initialName)
  const [busy, setBusy] = useState(false)

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (v) setName(initialName) }}>
      <DialogContent>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            if (!name.trim()) return
            setBusy(true)
            try { await onSubmit(name.trim()); onOpenChange(false) }
            catch (err) { toast.error(err instanceof Error ? err.message : 'Failed') }
            finally { setBusy(false) }
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="cat-name">Name</Label>
            <Input id="cat-name" autoFocus value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={busy}>
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
