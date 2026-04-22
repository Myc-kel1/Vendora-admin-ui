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

  const res = await fetch(buildUrl(path, opts.query), {
    method: opts.method || 'GET',
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
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
      `Request failed (${res.status})`
    throw new ApiError(typeof msg === 'string' ? msg : JSON.stringify(msg), res.status, data)
  }

  return data
}
