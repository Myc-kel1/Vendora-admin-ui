# Admin Panel Implementation - Setup Guide

## Overview
This guide explains how to set up and use the implemented admin endpoints and features.

## Prerequisites
- Backend API running at `https://vendora-api-6xo8.onrender.com`
- Supabase project configured with storage bucket `product-images`
- User authentication via Supabase

## Key Features Implemented

### 1. API Layer (`src/lib/api.js`)
All admin endpoints are now wrapped with dedicated functions:

**Products**
- `listProducts(query)` - List all products with filters
- `createProduct(body)` - Create a new product
- `getProduct(productId)` - Get product details
- `updateProduct(productId, body)` - Update product
- `deactivateProduct(productId)` - Soft-delete product
- `updateProductStock(productId, newStock)` - Set stock level
- `uploadProductImage(productId, file)` - Upload product image
- `deleteProductImage(productId)` - Remove product image

**Categories**
- `listCategories()` - List all categories
- `createCategory(body)` - Create category
- `getCategory(categoryId)` - Get category details
- `updateCategory(categoryId, body)` - Update category
- `deleteCategory(categoryId)` - Delete category

**Orders**
- `listOrders(query)` - List orders with filters
- `getOrder(orderId)` - Get order details
- `updateOrderStatus(orderId, status)` - Update order status

**Users**
- `listUsers(query)` - List all users
- `getUser(userId)` - Get user details
- `getUserProfile(userId)` - Get full user profile

**Analytics**
- `getAnalytics(query)` - Get dashboard analytics

### 2. Image Upload (`src/lib/supabase-storage.js`)
- Validates file size (max 5MB)
- Validates MIME type (JPEG, PNG, WebP, GIF)
- Validates magic bytes (file content validation)
- Uploads to Supabase Storage with auth token
- Returns public URL

### 3. Admin Pages

**Products** (`src/pages/Products.jsx`)
- List products with search, category filter, stock filter, active/inactive toggle
- Create products with optional image upload during creation
- Soft-delete products

**ProductDetail** (`src/pages/ProductDetail.jsx`)
- View full product details
- Edit product info (name, description, price, stock, category, active status)
- Upload/change/delete product image
- Real-time image preview

**Categories** (`src/pages/Categories.jsx`)
- List categories
- Create new categories
- Edit category names
- Delete categories

**Orders** (`src/pages/Orders.jsx`)
- List orders with status and user filters
- Paginated results
- View order details

**OrderDetail** (`src/pages/OrderDetail.jsx`)
- View full order with line items
- Update order status (pending, paid, failed, cancelled)
- View customer information

**Users** (`src/pages/Users.jsx`)
- List all users with roles
- Paginated results
- Quick access to user details

**UserDetail** (`src/pages/UserDetail.jsx`)
- View user account info (email, role, ID)
- View extended profile (name, phone, address, DOB)
- All profile fields displayed if available

**Dashboard** (`src/pages/Dashboard.jsx`)
- Revenue overview (total, today, this month)
- Order statistics (total, paid, pending, failed, cancelled)
- Top 10 products by sales
- Real-time analytics

### 4. Authentication (`src/components/auth/RequireAuth.jsx`)
- Protected routes require authentication
- Admin role check enforces admin-only access
- Redirects to login for non-admin users

## Important: Admin Role Setup

### Prerequisites for Admin Access

Users must have the `admin` role assigned via Supabase. Since this is typically set during backend processing, you'll need to manually promote users in Supabase:

**Method 1: Supabase SQL Query**
```sql
-- Run this in Supabase SQL Editor to promote a user to admin
UPDATE auth.users 
SET app_metadata = jsonb_set(
  COALESCE(app_metadata, '{}'::jsonb), 
  '{role}', 
  '"admin"'::jsonb
)
WHERE email = 'admin@example.com';
```

**Method 2: Using Supabase Dashboard**
1. Go to Supabase Dashboard → Authentication → Users
2. Find the user to promote
3. Click the user row to open details
4. Edit `app_metadata` JSON (or `user_metadata` depending on your setup)
5. Add: `{ "role": "admin" }`
6. Save changes

**Verify Admin Role**
```sql
-- Check if a user has admin role
SELECT id, email, app_metadata 
FROM auth.users 
WHERE email = 'admin@example.com';
```

The role will appear in the JWT token and be available via `useAuth()` hook as `user.role`.

## Image Upload Workflow

### During Product Creation
1. Fill in product details (name, price, stock, category)
2. Optionally upload an image
3. Image is validated before submission
4. Product is created first, then image is uploaded to Supabase
5. If image upload fails, product is still created (toast notification warns user)

### During Product Edit
1. Open ProductDetail page
2. Click existing image to replace or upload new one
3. Changes are saved when you click "Save"
4. Image is replaced in Supabase Storage

### Image Validation
- **Size**: Max 5MB
- **Format**: JPEG, PNG, WebP, GIF only
- **Content**: Magic bytes validation (prevents file type spoofing)
- **Storage**: Supabase bucket `product-images`
- **Access**: Public URL returned for display

## API Error Handling

All endpoints include proper error handling:
- **401 Unauthorized**: Auto-logout and redirect to login
- **422 Validation Error**: Field-level error messages displayed
- **Other errors**: Generic error toast notifications
- **Network errors**: Graceful fallback with retry logic

## Query Caching

React Query manages data caching:
- Products list: `admin-products`
- Product detail: `admin-product`
- Categories: `admin-categories`
- Orders list: `admin-orders`
- Order detail: `admin-order`
- Users list: `admin-users`
- User detail: `admin-user`, `admin-user-profile`
- Analytics: `analytics`

Mutations automatically invalidate relevant queries on success.

## Best Practices Implemented

✅ **Input Validation**
- Frontend validation for file size/type
- Backend validates all inputs
- Magic bytes validation for images

✅ **Error Handling**
- Comprehensive error messages
- Toast notifications for user feedback
- Graceful fallbacks

✅ **Performance**
- Query caching with React Query
- Pagination for list endpoints
- Debounced search filters
- Lazy loading for images

✅ **Security**
- Role-based access control (admin only)
- Token-based authentication
- Secure file uploads to Supabase
- CORS configured for API calls

✅ **UX**
- Real-time image previews
- Optimistic loading states
- Disabled save buttons when no changes
- Confirmation dialogs for destructive actions
- Empty states with action suggestions

## Testing the Implementation

### Test Admin Access
```javascript
// In browser console
import { getSession } from '@/lib/auth'
const session = getSession()
console.log(session?.user?.role) // Should output: 'admin'
```

### Test Image Upload
1. Create new product
2. Click image upload area
3. Select JPEG/PNG/WebP/GIF under 5MB
4. Should show preview
5. Create product → image uploads to Supabase

### Test All Features
1. Dashboard - verify analytics load
2. Products - create, edit, delete, upload image
3. Categories - create, edit, delete
4. Orders - view, filter, update status
5. Users - view list and details

## Troubleshooting

**"Admin role required" error**
- User needs to be promoted via SQL query
- Check Supabase user metadata has role set

**Image upload fails**
- Check file size (max 5MB)
- Verify file type (JPEG, PNG, WebP, GIF)
- Check Supabase bucket exists: `product-images`
- Verify Supabase auth token valid

**Endpoints return 401**
- User session expired
- Token needs refresh
- Auto-redirects to login

**Products not showing image**
- Image upload failed (check network)
- Check Supabase bucket is public
- Verify `image_url` field populated in database

## File Structure

```
src/
├── lib/
│   ├── api.js              (All admin endpoint functions)
│   ├── supabase-storage.js (Image upload utilities)
│   ├── auth.js             (Authentication)
│   └── config.js           (API configuration)
├── pages/
│   ├── Dashboard.jsx
│   ├── Products.jsx
│   ├── ProductDetail.jsx
│   ├── Categories.jsx
│   ├── Orders.jsx
│   ├── OrderDetail.jsx
│   ├── Users.jsx
│   └── UserDetail.jsx
└── components/
    └── auth/
        └── RequireAuth.jsx (Admin role check)
```

## Support

For issues with endpoints, check:
1. API documentation in `/admin/docs` (if available)
2. Browser network tab for request/response
3. Supabase logs for auth/storage issues
4. Browser console for client-side errors
