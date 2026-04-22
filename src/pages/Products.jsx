import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Loader2, Plus, Search, MoreHorizontal, Pencil, Trash2, Package } from 'lucide-react'
import { api } from '@/lib/api'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { StatusPill } from '@/components/StatusPill'
import { Pager } from '@/components/Pager'
import { EmptyState } from '@/components/EmptyState'
import { formatMoney, formatNumber, shortId } from '@/lib/format'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

const PAGE_SIZE = 20
const ALL = '__all__'

export default function Products() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [includeInactive, setIncludeInactive] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => setPage(1), [debounced, categoryId, inStockOnly, includeInactive])

  const cats = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => api('/admin/categories'),
  })

  const products = useQuery({
    queryKey: ['admin-products', { page, debounced, categoryId, inStockOnly, includeInactive }],
    queryFn: () => api('/admin/products', {
      query: {
        page, page_size: PAGE_SIZE,
        search: debounced || undefined,
        category_id: categoryId || undefined,
        in_stock_only: inStockOnly,
        include_inactive: includeInactive,
      },
    }),
  })

  const deactivate = useMutation({
    mutationFn: (id) => api(`/admin/products/${id}`, { method: 'DELETE' }),
    onSuccess: () => { toast.success('Product deactivated'); qc.invalidateQueries({ queryKey: ['admin-products'] }) },
    onError: (e) => toast.error(e.message),
  })

  const items = products.data?.items ?? []
  const catName = (id) => id ? cats.data?.find((c) => c.id === id)?.name || '—' : '—'

  return (
    <>
      <PageHeader
        title="Products"
        description="Browse, edit, and manage your full catalog."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> New product
          </Button>
        }
      />

      <div className="surface-card mb-4 flex flex-col gap-3 p-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products by name…" className="pl-9" />
        </div>
        <Select value={categoryId || ALL} onValueChange={(v) => setCategoryId(v === ALL ? '' : v)}>
          <SelectTrigger className="md:w-52"><SelectValue placeholder="All categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All categories</SelectItem>
            {cats.data?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2 px-1 text-xs">
          <Switch checked={inStockOnly} onCheckedChange={setInStockOnly} id="in-stock" />
          <Label htmlFor="in-stock" className="cursor-pointer">In stock</Label>
        </div>
        <div className="flex items-center gap-2 px-1 text-xs">
          <Switch checked={includeInactive} onCheckedChange={setIncludeInactive} id="incl-inactive" />
          <Label htmlFor="incl-inactive" className="cursor-pointer">Include inactive</Label>
        </div>
      </div>

      <div className="surface-card overflow-hidden">
        <div className="grid grid-cols-12 gap-2 border-b bg-muted/30 px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <div className="col-span-5">Product</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-2 text-right">Price</div>
          <div className="col-span-1 text-right">Stock</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1" />
        </div>

        {products.isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="grid grid-cols-12 items-center gap-2 border-b px-4 py-3">
              <Skeleton className="col-span-5 h-5" /><Skeleton className="col-span-2 h-4" />
              <Skeleton className="col-span-2 h-4" /><Skeleton className="col-span-1 h-4" />
              <Skeleton className="col-span-1 h-5" /><Skeleton className="col-span-1 h-4" />
            </div>
          ))
        ) : items.length === 0 ? (
          <EmptyState title="No products found" description="Try adjusting your filters or create a new product." icon={Package}
            action={<Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="mr-1.5 h-4 w-4" /> New product</Button>}
          />
        ) : (
          items.map((p) => (
            <div
              key={p.id}
              className="grid cursor-pointer grid-cols-12 items-center gap-2 border-b px-4 py-3 text-sm transition-colors hover:bg-muted/30"
              onClick={() => navigate(`/products/${p.id}`)}
            >
              <div className="col-span-5 min-w-0">
                <div className="truncate font-medium">{p.name || 'Untitled'}</div>
                <div className="truncate text-xs text-muted-foreground">
                  <span className="font-mono">{shortId(p.id)}</span>
                  {p.description ? <> · {p.description}</> : null}
                </div>
              </div>
              <div className="col-span-2 truncate text-xs text-muted-foreground">{catName(p.category_id)}</div>
              <div className="col-span-2 text-right font-medium tabular-nums">{formatMoney(p.price)}</div>
              <div className="col-span-1 text-right tabular-nums">{formatNumber(p.stock)}</div>
              <div className="col-span-1"><StatusPill status={p.is_active ? 'active' : 'inactive'} /></div>
              <div className="col-span-1 flex justify-end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate(`/products/${p.id}`)}>
                      <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => { if (confirm(`Deactivate "${p.name}"?`)) deactivate.mutate(p.id) }}
                    >
                      <Trash2 className="mr-2 h-3.5 w-3.5" /> Deactivate
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        )}

        {!products.isLoading && items.length > 0 && (
          <Pager page={page} pageSize={PAGE_SIZE} total={products.data?.total} hasMore={items.length === PAGE_SIZE} onChange={setPage} />
        )}
      </div>

      <CreateProductDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        categories={cats.data ?? []}
        onCreated={() => qc.invalidateQueries({ queryKey: ['admin-products'] })}
      />
    </>
  )
}

function CreateProductDialog({ open, onOpenChange, categories, onCreated }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [categoryId, setCategoryId] = useState('')

  const reset = () => { setName(''); setDescription(''); setPrice(''); setStock(''); setCategoryId('') }

  const create = useMutation({
    mutationFn: () => api('/admin/products', {
      method: 'POST',
      body: { name, description: description || null, price: String(price), stock: Number(stock) || 0, category_id: categoryId || null },
    }),
    onSuccess: () => { toast.success('Product created'); onCreated(); reset(); onOpenChange(false) },
    onError: (e) => toast.error(e.message),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New product</DialogTitle>
          <DialogDescription>Add a new product to your catalog.</DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); create.mutate() }} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="desc">Description</Label>
            <Textarea id="desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="price">Price</Label>
              <Input id="price" required inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stock">Stock</Label>
              <Input id="stock" required type="number" value={stock} onChange={(e) => setStock(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={categoryId || ALL} onValueChange={(v) => setCategoryId(v === ALL ? '' : v)}>
              <SelectTrigger><SelectValue placeholder="No category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>No category</SelectItem>
                {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
