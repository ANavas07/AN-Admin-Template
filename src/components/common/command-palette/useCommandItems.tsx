import { useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useTheme } from '../../../context/theme-context'
import { useWorkspace } from '../../../context/workspace-context'
import { MoonIcon, LogOutIcon, SunIcon } from '../../../icons/icons'
import { signOut } from '../../../services/session'
import ModuleIcon from '../modules/ModuleIcon'
import { getAccessibleCategories, getModuleById, hasModuleAccess, HOME_PATH } from '../../../navigation/navigation'
import { getQuickActions } from '../../../navigation/quickActions'

export type CommandGroup = 'Favoritos' | 'Recientes' | 'Acciones' | 'Módulos' | 'Páginas'

/** Display order of the groups in the palette. */
export const COMMAND_GROUPS: CommandGroup[] = ['Favoritos', 'Recientes', 'Acciones', 'Módulos', 'Páginas']

export type CommandItem = {
    id: string
    group: CommandGroup
    label: string
    /** Secondary text: a description or a route */
    hint?: string
    keywords?: string[]
    icon: ReactNode
    /** Present on module entries: enables the favorite toggle */
    moduleId?: string
    /** Only listed while searching (pages would flood the default view) */
    searchOnly?: boolean
    perform: () => void
}

const moduleIcon = (name: string) => <ModuleIcon name={name} className="size-4" />

/** Everything the palette can do, built from the navigation registry and the user's workspace. */
export function useCommandItems(): CommandItem[] {
    const navigate = useNavigate()
    const { isDarkMode, toggleTheme } = useTheme()
    const { role, favorites, recents, hasDemoActivity, clearDemoActivity } = useWorkspace()
    const categories = getAccessibleCategories(role)
    const modules = categories.flatMap((category) => category.modules)
    const moduleUrls = new Set(modules.map((module) => module.url))

    const items: CommandItem[] = []

    for (const moduleId of favorites) {
        const module = getModuleById(moduleId)
        if (!module?.url || !hasModuleAccess(module, role)) continue
        const url = module.url
        items.push({
            id: `favorite:${module.id}`,
            group: 'Favoritos',
            label: module.title,
            hint: module.description,
            keywords: module.keywords,
            icon: moduleIcon(module.icon),
            moduleId: module.id,
            perform: () => navigate(url),
        })
    }

    for (const entry of recents.slice(0, 5)) {
        const module = getModuleById(entry.moduleId)
        if (!module || !hasModuleAccess(module, role)) continue
        items.push({
            id: `recent:${entry.path}`,
            group: 'Recientes',
            label: entry.title,
            hint: entry.path,
            icon: moduleIcon('recent'),
            perform: () => navigate(entry.path),
        })
    }

    items.push({
        id: 'action:home',
        group: 'Acciones',
        label: 'Ir al inicio',
        hint: 'Tu espacio de trabajo',
        keywords: ['dashboard', 'home', 'panel'],
        icon: moduleIcon('home'),
        perform: () => navigate(HOME_PATH),
    })
    for (const action of getQuickActions(role)) {
        items.push({
            id: `action:${action.id}`,
            group: 'Acciones',
            label: action.label,
            hint: action.description,
            keywords: action.keywords,
            icon: moduleIcon(action.icon),
            perform: () => void action.run(navigate),
        })
    }
    items.push({
        id: 'action:theme',
        group: 'Acciones',
        label: isDarkMode ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro',
        keywords: ['tema', 'modo', 'oscuro', 'claro', 'dark', 'light', 'apariencia'],
        icon: isDarkMode ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />,
        perform: toggleTheme,
    })
    if (hasDemoActivity) {
        items.push({
            id: 'action:clear-demo',
            group: 'Acciones',
            label: 'Borrar actividad de demostración',
            hint: 'Conserva favoritos y visitas reales',
            keywords: ['demo', 'metricas', 'limpiar'],
            icon: moduleIcon('tools'),
            searchOnly: true,
            perform: clearDemoActivity,
        })
    }
    items.push({
        id: 'action:sign-out',
        group: 'Acciones',
        label: 'Cerrar sesión',
        keywords: ['salir', 'logout', 'sign out'],
        icon: <LogOutIcon className="size-4" />,
        searchOnly: true,
        perform: signOut,
    })

    for (const module of modules) {
        if (!module.url) continue
        const url = module.url
        items.push({
            id: `module:${module.id}`,
            group: 'Módulos',
            label: module.title,
            hint: module.description,
            keywords: [...(module.keywords ?? []), url],
            icon: moduleIcon(module.icon),
            moduleId: module.id,
            perform: () => navigate(url),
        })
        for (const page of module.children ?? []) {
            // Pages that are modules themselves (Workspace › Modules) are already listed
            if (moduleUrls.has(page.url) && page.url !== url) continue
            items.push({
                id: `page:${page.id}`,
                group: 'Páginas',
                label: `${module.title} › ${page.title}`,
                hint: page.url,
                keywords: [page.title, page.url],
                icon: moduleIcon(page.icon ?? module.icon),
                searchOnly: true,
                perform: () => navigate(page.url),
            })
        }
    }

    return items
}
