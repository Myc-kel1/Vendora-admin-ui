import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config'
import { getAccessToken } from './auth'

/**
 * Initialize Supabase Storage client
 */
function getStorageHeaders() {
  const token = getAccessToken()
  const headers = {
    'Content-Type': 'application/json',
    apikey: SUPABASE_ANON_KEY,
  }
  
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  
  return headers
}

/**
 * Upload an image file to Supabase Storage
 * @param {File} file - The image file to upload
 * @param {string} bucket - Bucket name (e.g., 'product-images')
 * @param {string} path - File path in bucket (e.g., 'products/123.jpg')
 * @returns {Promise<{url: string, path: string}>} Public URL and path
 */
export async function uploadImage(file, bucket, path) {
  // Validate file size (max 5MB)
  const MAX_SIZE = 5 * 1024 * 1024
  if (file.size > MAX_SIZE) {
    throw new Error(`File size exceeds 5MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`)
  }

  // Validate file type via MIME type
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`File type not allowed. Supported: JPEG, PNG, WebP, GIF`)
  }

  // Validate magic bytes (content validation)
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  if (!isValidImageMagic(bytes)) {
    throw new Error('File content is not a valid image')
  }

  const token = getAccessToken()
  if (!token) {
    throw new Error('Authentication required')
  }

  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`

  // Upload to Supabase Storage using authenticated endpoint
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: file,
  })

  if (!response.ok) {
    let errorMsg = `Upload failed: ${response.status}`
    try {
      const error = await response.json()
      errorMsg = error.message || error.error || errorMsg
    } catch (e) {
      // Response wasn't JSON, use status text
      errorMsg = `Upload failed: ${response.statusText}`
    }
    throw new Error(errorMsg)
  }

  // Construct public URL
  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`
  return { url: publicUrl, path }
}

/**
 * Delete an image from Supabase Storage
 */
export async function deleteImage(bucket, path) {
  const token = getAccessToken()
  if (!token) throw new Error('Authentication required')

  const deleteUrl = `${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`
  
  const response = await fetch(deleteUrl, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: SUPABASE_ANON_KEY,
    },
  })

  if (!response.ok) {
    let errorMsg = `Delete failed: ${response.status}`
    try {
      const error = await response.json()
      errorMsg = error.message || error.error || errorMsg
    } catch (e) {
      errorMsg = `Delete failed: ${response.statusText}`
    }
    throw new Error(errorMsg)
  }
}

/**
 * Validate image magic bytes (file signatures)
 */
function isValidImageMagic(bytes) {
  if (bytes.length < 4) return false

  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return true
  // PNG: 89 50 4E 47
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return true
  // WebP: RIFF ... WEBP
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
    if (bytes.length >= 12 && 
        bytes[8] === 0x57 && bytes[9] === 0x45 && 
        bytes[10] === 0x42 && bytes[11] === 0x50) return true
  }
  // GIF: GIF8 (47 49 46 38)
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) return true

  return false
}
