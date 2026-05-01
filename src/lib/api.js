import { getBaseUrl } from './config'
import { getAccessToken, signOut } from './auth'

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.status = status
    this.data = data
    this.name = 'ApiError'
  }
}

function buildUrl(path, query) {
  const url = new URL(path.replace(/^\//, ''), getBaseUrl() + '/')
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === '') continue
      url.searchParams.set(k, String(v))
    }
  }
  return url.toString()
}

export async function api(path, opts = {}) {
  const token = getAccessToken()
  const headers = { Accept: 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json'

  const url = buildUrl(path, opts.query)
  
  const res = await fetch(url, {
    method: opts.method || 'GET',
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
  })

  if (res.status === 401) {
    console.error('⚠️ Unauthorized (401):', { path, hasToken: !!token, tokenLength: token?.length })
    signOut()
    throw new ApiError('Session expired. Please sign in again.', 401, null)
  }

  const text = await res.text()
  let data = null
  try { data = text ? JSON.parse(text) : null } catch { data = text }

  if (!res.ok) {
    const msg =
      data?.detail?.[0]?.msg ||
      data?.detail ||
      data?.message ||
      data?.error ||
      `Request failed (${res.status})`
    
    console.error('❌ API Error:', { 
      path, 
      status: res.status, 
      error: typeof msg === 'string' ? msg : JSON.stringify(msg)
    })
    
    throw new ApiError(typeof msg === 'string' ? msg : JSON.stringify(msg), res.status, data)
  }

  return data
}

// ============================================================================
// PRODUCTS
// ============================================================================

export async function listProducts(query = {}) {
  return api('/admin/products', { query })
}

export async function createProduct(body) {
  return api('/admin/products', { method: 'POST', body })
}

export async function getProduct(productId) {
  return api(`/admin/products/${productId}`)
}

export async function updateProduct(productId, body) {
  return api(`/admin/products/${productId}`, { method: 'PATCH', body })
}

export async function deactivateProduct(productId) {
  return api(`/admin/products/${productId}`, { method: 'DELETE' })
}

export async function updateProductStock(productId, newStock) {
  return api(`/admin/products/${productId}/stock`, {
    method: 'PATCH',
    query: { new_stock: newStock },
  })
}

export async function uploadProductImage(productId, file) {
  const token = getAccessToken()
  if (!token) {
    throw new ApiError('Authentication required', 401, null)
  }

  // Validate file on client side
  const MAX_SIZE = 5 * 1024 * 1024
  if (file.size > MAX_SIZE) {
    throw new ApiError('File size exceeds 5MB limit', 400, null)
  }

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new ApiError('File type not allowed. Supported: JPEG, PNG, WebP, GIF', 400, null)
  }

  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${getBaseUrl()}/admin/products/${productId}/image`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })

  if (res.status === 401) {
    signOut()
    throw new ApiError('Session expired. Please sign in again.', 401, null)
  }

  const text = await res.text()
  let data = null
  try { data = text ? JSON.parse(text) : null } catch { data = text }

  if (!res.ok) {
    const msg =
      data?.detail?.[0]?.msg ||
      data?.detail ||
      data?.message ||
      data?.error ||
      `Upload failed (${res.status})`
    throw new ApiError(typeof msg === 'string' ? msg : JSON.stringify(msg), res.status, data)
  }

  return data
}

export async function deleteProductImage(productId) {
  return api(`/admin/products/${productId}/image`, { method: 'DELETE' })
}

// ============================================================================
// CATEGORIES
// ============================================================================

export async function listCategories() {
  return api('/admin/categories')
}

export async function createCategory(body) {
  return api('/admin/categories', { method: 'POST', body })
}

export async function getCategory(categoryId) {
  return api(`/admin/categories/${categoryId}`)
}

export async function updateCategory(categoryId, body) {
  return api(`/admin/categories/${categoryId}`, { method: 'PATCH', body })
}

export async function deleteCategory(categoryId) {
  return api(`/admin/categories/${categoryId}`, { method: 'DELETE' })
}

// ============================================================================
// ORDERS
// ============================================================================

export async function listOrders(query = {}) {
  return api('/admin/orders', { query })
}

export async function getOrder(orderId) {
  return api(`/admin/orders/${orderId}`)
}

export async function updateOrderStatus(orderId, status) {
  return api(`/admin/orders/${orderId}/status`, {
    method: 'PUT',
    body: { status },
  })
}

// ============================================================================
// USERS
// ============================================================================

export async function listUsers(query = {}) {
  return api('/admin/users', { query })
}

export async function getUser(userId) {
  return api(`/admin/users/${userId}`)
}

export async function getUserProfile(userId) {
  return api(`/admin/users/${userId}/profile`)
}

// ============================================================================
// ANALYTICS
// ============================================================================

export async function getAnalytics(query = {}) {
  return api('/admin/analytics', { query })
}
