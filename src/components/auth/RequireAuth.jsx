import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export function RequireAuth({ children }) {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // Check if user is admin
  const isAdmin = user?.role === 'admin'
  if (!isAdmin) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <>{children}</>
}
