import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2, Save, Trash2 } from 'lucide-react'
import { api } from '@/lib/api'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { StatusPill } from '@/components/StatusPill'
import { formatDateTime, formatMoney, shortId } from '@/lib/format'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

const NONE = '__none__'

export default function ProductDetail() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const product = useQuery({
    queryKey: ['admin-product', id],
    queryFn: () => api(`/admin/products/${id}`),
    enabled: !!id,
  })

  const cats = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => api('/admin/categories'),
  })

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState(0)
  const [categoryId, setCategoryId] = useState('')
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (product.data) {
      setName(product.data.name ?? '')
      setDescription(product.data.description ?? '')
      setPrice(String(product.data.price ?? ''))
      setStock(product.data.stock ?? 0)
      setCategoryId(product.data.category_id ?? '')
      setIsActive(product.data.is_active ?? true)
    }
  }, [product.data])

  const update = useMutation({
    mutationFn: () => api(`/admin/products/${id}`, {
      method: 'PATCH',
      body: { name, description: description || null, price: String(price), stock: Number(stock), category_id: categoryId || null, is_active: isActive },
    }),
    onSuccess: () => {
      toast.success('Product updated')
      qc.invalidateQueries({ queryKey: ['admin-product', id] })
      qc.invalidateQueries({ queryKey: ['admin-products'] })
    },
    onError: (e) => toast.error(e.message),
  })

  const updateStock = useMutation({
    mutationFn: (n) => api(`/admin/products/${id}/stock`, { method: 'PATCH', query: { new_stock: n } }),
    onSuccess: () => {
      toast.success('Stock updated')
      qc.invalidateQueries({ queryKey: ['admin-product', id] })
      qc.invalidateQueries({ queryKey: ['admin-products'] })
    },
    onError: (e) => toast.error(e.message),
  })

  const deactivate = useMutation({
    mutationFn: () => api(`/admin/products/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Product deactivated')
      qc.invalidateQueries({ queryKey: ['admin-products'] })
      navigate('/products')
    },
    onError: (e) => toast.error(e.message),
  })

  if (product.isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-96" /></div>

  if (!product.data) return (
    <div>
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="mr-1.5 h-4 w-4" /> Back</Button>
      <p className="mt-6 text-sm text-muted-foreground">Product not found.</p>
    </div>
  )

  return (
    <>
      <Link to="/products" className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to products
      </Link>

      <PageHeader
        title={product.data.name || 'Untitled product'}
        description={`ID ${shortId(product.data.id, 12)} · Updated ${formatDateTime(product.data.updated_at)}`}
        actions={
          <>
            <StatusPill status={product.data.is_active ? 'active' : 'inactive'} />
            <Button variant="outline" onClick={() => { if (confirm('Deactivate this product?')) deactivate.mutate() }}>
              <Trash2 className="mr-1.5 h-4 w-4" /> Deactivate
            </Button>
            <Button onClick={() => update.mutate()} disabled={update.isPending}>
              {update.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
              Save
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="surface-card p-6 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold">Details</h2>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="price">Price</Label>
                <Input id="price" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={categoryId || NONE} onValueChange={(v) => setCategoryId(v === NONE ? '' : v)}>
                  <SelectTrigger><SelectValue placeholder="No category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>No category</SelectItem>
                    {cats.data?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <Label htmlFor="active" className="text-sm">Active</Label>
                <p className="text-xs text-muted-foreground">Inactive products are hidden from the storefront.</p>
              </div>
              <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="surface-card p-6">
            <h2 className="mb-3 text-sm font-semibold">Inventory</h2>
            <div className="space-y-3">
              <div className="rounded-md border bg-muted/40 p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Current stock</div>
                <div className="mt-1 text-2xl font-semibold tabular-nums">{product.data.stock}</div>
              </div>
              <Label htmlFor="stock">Set new stock</Label>
              <div className="flex gap-2">
                <Input id="stock" type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} />
                <Button variant="outline" onClick={() => updateStock.mutate(Number(stock))} disabled={updateStock.isPending}>
                  {updateStock.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update'}
                </Button>
              </div>
            </div>
          </div>

          <div className="surface-card p-6">
            <h2 className="mb-3 text-sm font-semibold">Metadata</h2>
            <dl className="space-y-2 text-xs">
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">ID</dt><dd className="font-mono">{shortId(product.data.id, 18)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Price</dt><dd className="font-medium">{formatMoney(product.data.price)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Created</dt><dd>{formatDateTime(product.data.created_at)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Updated</dt><dd>{formatDateTime(product.data.updated_at)}</dd></div>
            </dl>
          </div>
        </div>
      </div>
    </>
  )
}
