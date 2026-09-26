import { Outlet, useLocation } from 'react-router-dom'
import type { UserRole } from '../config/app.config'
import { findRouteMatch, hasModuleAccess } from '../navigation/navigation'
import ForbiddenPage from '../pages/system/ForbiddenPage'

/**
 * Permission-based routing: the same `requiredRoles` that hide a module from
 * the sidebar, palette and home also protect its routes (direct links,
 * bookmarks). Without access the page answers 403.
 */
export function ModuleAccessGuard({ role }: { role: UserRole }) {
    const { pathname } = useLocation()
    const match = findRouteMatch(pathname)
    if (match && !hasModuleAccess(match.module, role)) {
        return <ForbiddenPage moduleTitle={match.module.title} currentRole={role} requiredRoles={match.module.requiredRoles} />
    }
    return <Outlet />
}
