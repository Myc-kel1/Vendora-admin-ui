export const DEFAULT_BASE_URL = 'https://vendora-api-6xo8.onrender.com'
export const SUPABASE_URL = 'https://ohudxnauhoauegkqccxs.supabase.co'
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9odWR4bmF1aG9hdWVna3FjY3hzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMzg2NTgsImV4cCI6MjA5MTgxNDY1OH0.qC8dNdToSuy7RZNeSv8yEib6TKWG44SVx7XoxzNZYDY'

const STORAGE_KEY = 'vendora.baseUrl'

export function getBaseUrl() {
  if (typeof window === 'undefined') return DEFAULT_BASE_URL
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_BASE_URL
}

export function setBaseUrl(url) {
  if (!url) localStorage.removeItem(STORAGE_KEY)
  else localStorage.setItem(STORAGE_KEY, url.replace(/\/$/, ''))
}

export function getDefaultBaseUrl() { return DEFAULT_BASE_URL }
