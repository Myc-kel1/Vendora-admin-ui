# Vendora Admin Panel

Production-ready admin dashboard for the Vendora e-commerce backend.

---

## Quick Start

```bash
npm install
npm run dev
# → http://localhost:5173
```

---

## Sign In

Use your **Supabase admin credentials**.  
Your account must have `role = 'admin'` in `app_metadata`.

To promote an account to admin, run this in the **Supabase SQL Editor**:

```sql
SELECT promote_to_admin('your-user-uuid-here');
```

Then sign in again to get a fresh JWT with the admin role.

---

## API Configuration

The panel talks to two services:

| Service | URL |
|---------|-----|
| Vendora API | `https://vendora-api-6xo8.onrender.com` |
| Supabase Auth | `https://ohudxnauhoauegkqccxs.supabase.co` |

The API base URL can be changed at runtime in **Settings → API endpoint** without rebuilding. The change persists in `localStorage`.

---

## Pages & Endpoints

| Page | Route | API Endpoints |
|------|-------|--------------|
| Dashboard | `/` | `GET /admin/analytics` |
| Products | `/products` | `GET /admin/products` (search, filter, paginate) |
| Product Detail | `/products/:id` | `GET`, `PATCH`, `DELETE /admin/products/:id` · `PATCH /admin/products/:id/stock` |
| Categories | `/categories` | `GET`, `POST`, `PATCH`, `DELETE /admin/categories` |
| Orders | `/orders` | `GET /admin/orders` (status filter, user filter, paginate) |
| Order Detail | `/orders/:id` | `GET /admin/orders/:id` · `PUT /admin/orders/:id/status` |
| Users | `/users` | `GET /admin/users` (paginated) |
| User Detail | `/users/:id` | `GET /admin/users/:id` |
| Settings | `/settings` | Configure API base URL |

---

## Auth Flow

1. Admin enters credentials → `POST https://ohudxnauhoauegkqccxs.supabase.co/auth/v1/token`
2. Supabase returns `access_token` (JWT) + `refresh_token`
3. JWT is stored in `localStorage` under `vendora.session`
4. Every API request sends `Authorization: Bearer <access_token>`
5. A 401 response automatically signs the user out and redirects to `/login`

---

## Project Structure

```
src/
├── components/
│   ├── auth/         RequireAuth.jsx
│   ├── layout/       AppLayout.jsx  PageHeader.jsx
│   ├── ui/           button  input  dialog  select  sheet  toast …
│   ├── EmptyState.jsx
│   ├── NavLink.jsx
│   ├── Pager.jsx
│   └── StatusPill.jsx
├── hooks/
│   ├── useAuth.js    (session state, synced across tabs)
│   └── use-toast.js
├── lib/
│   ├── api.js        (central fetch wrapper, auth injection)
│   ├── auth.js       (Supabase sign-in, session management)
│   ├── config.js     (base URLs, Supabase credentials)
│   ├── format.js     (money, date, number formatters)
│   └── utils.js      (cn helper)
└── pages/
    ├── Login.jsx
    ├── Dashboard.jsx
    ├── Products.jsx  ProductDetail.jsx
    ├── Categories.jsx
    ├── Orders.jsx    OrderDetail.jsx
    ├── Users.jsx     UserDetail.jsx
    ├── Settings.jsx
    └── NotFound.jsx
```

---

## Build for Production

```bash
npm run build
# output → dist/
```

Deploy the `dist/` folder to any static host (Netlify, Vercel, Render static site, S3).
"# Vendora-admin-ui" 
