import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { LANDING_PATH, SIGN_IN_SECTION_ID } from '../navigation/navigation'

type ProtectedRouteProps = {
  isAuthenticated: boolean
}

/**
 * Without a session, opens the sign-in section of the landing page and
 * remembers the requested page so the login returns to it.
 */
export function ProtectedRoute({ isAuthenticated }: ProtectedRouteProps) {
  const location = useLocation()
  if (!isAuthenticated) {
    return <Navigate to={{ pathname: LANDING_PATH, hash: SIGN_IN_SECTION_ID }} state={{ from: location }} replace />
  }
  return <Outlet />
}
