import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { AppLayout } from '@/components/layout/AppLayout'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Categories from './pages/Categories'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import Users from './pages/Users'
import UserDetail from './pages/UserDetail'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30_000 },
  },
})

function Protected({ children }) {
  return (
    <RequireAuth>
      <AppLayout>{children}</AppLayout>
    </RequireAuth>
  )
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/"                element={<Protected><Dashboard /></Protected>} />
          <Route path="/products"        element={<Protected><Products /></Protected>} />
          <Route path="/products/:id"    element={<Protected><ProductDetail /></Protected>} />
          <Route path="/categories"      element={<Protected><Categories /></Protected>} />
          <Route path="/orders"          element={<Protected><Orders /></Protected>} />
          <Route path="/orders/:id"      element={<Protected><OrderDetail /></Protected>} />
          <Route path="/users"           element={<Protected><Users /></Protected>} />
          <Route path="/users/:id"       element={<Protected><UserDetail /></Protected>} />
          <Route path="/settings"        element={<Protected><Settings /></Protected>} />
          <Route path="*"                element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
)

export default App
