import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2, Save, Trash2, Upload, X } from 'lucide-react'
import { api, uploadProductImage, deleteProductImage, updateProduct } from '@/lib/api'
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
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (product.data) {
      setName(product.data.name ?? '')
      setDescription(product.data.description ?? '')
      setPrice(String(product.data.price ?? ''))
      setStock(product.data.stock ?? 0)
      setCategoryId(product.data.category_id ?? '')
      setIsActive(product.data.is_active ?? true)
      setImagePreview(product.data.image_url ?? null)
    }
  }, [product.data])

  const update = useMutation({
    mutationFn: async () => {
      const updates = {}
      if (name !== product.data.name) updates.name = name
      if (description !== product.data.description) updates.description = description || null
      if (price !== String(product.data.price)) updates.price = Number(price)
      if (stock !== product.data.stock) updates.stock = Number(stock)
      if (categoryId !== product.data.category_id) updates.category_id = categoryId || null
      if (isActive !== product.data.is_active) updates.is_active = isActive

      if (Object.keys(updates).length > 0) {
        await updateProduct(id, updates)
      }

      if (imageFile) {
        await uploadProductImage(id, imageFile)
        setImageFile(null)
      }
    },
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

  const deleteImg = useMutation({
    mutationFn: () => deleteProductImage(id),
    onSuccess: () => {
      setImagePreview(null)
      toast.success('Image deleted')
      qc.invalidateQueries({ queryKey: ['admin-product', id] })
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

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      toast.error('Only JPEG, PNG, WebP, and GIF images are allowed')
      return
    }

    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (event) => setImagePreview(event.target.result)
    reader.readAsDataURL(file)
  }

  const hasChanges = name !== product.data?.name ||
    description !== product.data?.description ||
    price !== String(product.data?.price) ||
    stock !== product.data?.stock ||
    categoryId !== product.data?.category_id ||
    isActive !== product.data?.is_active ||
    imageFile !== null

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
            <Button onClick={() => update.mutate()} disabled={!hasChanges || update.isPending}>
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

            {/* Image Upload Section */}
            <div className="space-y-2 border-t pt-4">
              <Label>Product Image</Label>
              {imagePreview ? (
                <div className="relative inline-block">
                  <img src={imagePreview} alt="Product" className="max-h-48 max-w-full rounded-lg border object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-lg bg-black/50 opacity-0 transition-opacity hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded bg-white/20 p-2 text-white hover:bg-white/30"
                    >
                      <Upload className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => { setImageFile(null); setImagePreview(null); deleteImg.mutate() }}
                      className="rounded bg-white/20 p-2 text-white hover:bg-white/30"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef?.click?.()}
                  className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 px-4 py-6 text-center transition-colors hover:border-muted-foreground/50 hover:bg-muted/30"
                >
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <div className="text-sm">
                    <p className="font-medium">Click to upload image</p>
                    <p className="text-xs text-muted-foreground">JPEG, PNG, WebP, GIF (max 5MB)</p>
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
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
