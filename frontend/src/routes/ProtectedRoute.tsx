import { Navigate, Outlet, useLocation } from 'react-router-dom'
import {
  AUTH_STORAGE_KEYS,
  type AuthRole,
  getDefaultRouteForRole,
  getStoredAuthUser,
} from '../services/authApi'

type ProtectedRouteProps = {
  allowedRoles: AuthRole[]
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const location = useLocation()
  const user = getStoredAuthUser()
  const token = localStorage.getItem(AUTH_STORAGE_KEYS.accessToken)

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />
  }

  return <Outlet />
}
