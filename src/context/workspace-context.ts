import { createContext, useContext } from 'react'
import type { CurrentUser, UserRole } from '../config/app.config'
import type { RecentEntry, VisitEvent } from '../services/workspace/workspace.service'

export type WorkspaceContextType = {
    user: CurrentUser
    role: UserRole
    /** False until the workspace of the current user has been loaded */
    isLoaded: boolean
    favorites: string[]
    isFavorite: (moduleId: string) => boolean
    toggleFavorite: (moduleId: string) => void
    recents: RecentEntry[]
    events: VisitEvent[]
    hasDemoActivity: boolean
    clearDemoActivity: () => void
}

// El contexto y el hook viven aparte del provider para que el archivo del
// componente solo exporte componentes (requisito de react-refresh / HMR).
export const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined)

export function useWorkspace() {
    const context = useContext(WorkspaceContext)
    if (context === undefined) {
        throw new Error('useWorkspace debe ser usado dentro de WorkspaceProvider')
    }
    return context
}
