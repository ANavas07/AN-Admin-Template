import { createContext, useContext } from 'react'

export type ShellContextType = {
    isSidebarCollapsed: boolean
    setSidebarCollapsed: (collapsed: boolean) => void
}

/** Layout state of the app shell, for pages that change it (Preferences). */
export const ShellContext = createContext<ShellContextType | undefined>(undefined)

export function useShell() {
    const context = useContext(ShellContext)
    if (context === undefined) throw new Error('useShell debe ser usado dentro de AppShell')
    return context
}
