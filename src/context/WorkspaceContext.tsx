import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { describeRoute, findRouteMatch } from '../components/admin-panel/data/navigation'
import type { CurrentUser, UserRole } from '../config/app.config'
import { workspaceService } from '../services/workspace/workspace.service'
import type { WorkspaceState } from '../services/workspace/workspace.service'
import { WorkspaceContext } from './workspace-context'

type WorkspaceProviderProps = {
    user: CurrentUser
    role: UserRole
    children: ReactNode
}

/**
 * Personal workspace of the signed-in user: favorites, navigation history and
 * visit log. It is loaded per user when the session starts, saved on every
 * change and fed automatically by route changes.
 */
export function WorkspaceProvider({ user, role, children }: WorkspaceProviderProps) {
    const { pathname } = useLocation()
    const [state, setState] = useState<WorkspaceState | null>(null)
    const [loadedUserId, setLoadedUserId] = useState<string | null>(null)
    const lastRecordedPath = useRef<string | null>(null)

    // A different user starts from an empty (loading) workspace
    if (loadedUserId !== null && loadedUserId !== user.id) {
        setLoadedUserId(null)
        setState(null)
    }

    useEffect(() => {
        let cancelled = false
        lastRecordedPath.current = null
        workspaceService.load(user.id).then((loaded) => {
            if (cancelled) return
            setState(loaded)
            setLoadedUserId(user.id)
        })
        return () => {
            cancelled = true
        }
    }, [user.id])

    const isLoaded = state !== null && loadedUserId === user.id

    // Record module visits from route changes
    useEffect(() => {
        if (!isLoaded || lastRecordedPath.current === pathname) return
        lastRecordedPath.current = pathname
        const match = findRouteMatch(pathname)
        if (!match) return
        const userId = user.id
        workspaceService
            .recordVisit(userId, { path: pathname, moduleId: match.module.id, title: describeRoute(match), at: Date.now() })
            .then((next) => {
                // Ignore the answer if the session changed meanwhile
                if (lastRecordedPath.current === pathname) setState(next)
            })
    }, [isLoaded, pathname, user.id])

    function toggleFavorite(moduleId: string) {
        workspaceService.toggleFavorite(user.id, moduleId).then(setState)
    }

    function clearDemoActivity() {
        workspaceService.clearDemoActivity(user.id).then(setState)
    }

    const favorites = state?.favorites ?? []

    return (
        <WorkspaceContext.Provider
            value={{
                user,
                role,
                isLoaded,
                favorites,
                isFavorite: (moduleId) => favorites.includes(moduleId),
                toggleFavorite,
                recents: state?.recents ?? [],
                events: state?.events ?? [],
                hasDemoActivity: state?.hasDemoActivity ?? false,
                clearDemoActivity,
            }}
        >
            {children}
        </WorkspaceContext.Provider>
    )
}
