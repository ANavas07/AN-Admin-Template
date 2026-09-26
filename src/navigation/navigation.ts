/**
 * Consultas sobre el catalogo de modulos (modules.ts). Es la unica fuente de
 * navegacion: el sidebar, la paleta de comandos, el home y el registro de
 * actividad la leen desde aqui para no repetir rutas en cada componente.
 */
import { MODULE_CATEGORIES } from './modules'
import type { ModuleCategory, ModuleDefinition, ModulePage } from './modules'

/** Ruta del home, que no es un modulo del catalogo. */
export const HOME_PATH = '/dashboard'

export function hasModuleAccess(module: ModuleDefinition, role: string) {
    return !module.requiredRoles || module.requiredRoles.includes(role)
}

/** Categorias con solo los modulos visibles para el rol (las vacias se omiten). */
export function getAccessibleCategories(role: string, categories: ModuleCategory[] = MODULE_CATEGORIES) {
    return categories
        .map((category) => ({
            ...category,
            modules: category.modules.filter((module) => hasModuleAccess(module, role)),
        }))
        .filter((category) => category.modules.length > 0)
}

/** Sections shown as groups in the sidebar. */
export function getSidebarCategories(role: string) {
    return getAccessibleCategories(role).filter((category) => category.sidebar !== false)
}

/** Sections listed in the module catalog (home and Workspace › Modules). */
export function getCatalogCategories(role: string, categories: ModuleCategory[] = MODULE_CATEGORIES) {
    return getAccessibleCategories(role, categories).filter((category) => category.catalog !== false)
}

export function getAllModules(categories: ModuleCategory[] = MODULE_CATEGORIES) {
    return categories.flatMap((category) => category.modules)
}

const modulesById = new Map(getAllModules().map((module) => [module.id, module]))

export function getModuleById(id: string) {
    return modulesById.get(id) ?? null
}

export type RouteMatch = {
    module: ModuleDefinition
    /** Pagina interna cuando la ruta apunta a una de ellas */
    page: ModulePage | null
}

function matchesPath(pathname: string, url: string) {
    return pathname === url || pathname.startsWith(`${url}/`)
}

/**
 * Modulo (y pagina) al que pertenece una ruta. Gana la coincidencia mas
 * especifica: /superuser/rbac/audit es el modulo "Auditoria", no "Roles y permisos".
 */
export function findRouteMatch(pathname: string): RouteMatch | null {
    let best: RouteMatch | null = null
    let bestLength = -1

    for (const module of modulesById.values()) {
        // On a tie a standalone module beats another module's page with the same URL
        const beatsBest =
            module.url !== undefined &&
            (module.url.length > bestLength || (module.url.length === bestLength && best?.page != null))
        if (module.url && matchesPath(pathname, module.url) && beatsBest) {
            best = { module, page: null }
            bestLength = module.url.length
        }
        for (const page of module.children ?? []) {
            if (matchesPath(pathname, page.url) && page.url.length > bestLength) {
                best = { module, page }
                bestLength = page.url.length
            }
        }
    }
    return best
}

/** Titulo legible de una ruta: "Roles y permisos › Grupos". */
export function describeRoute(match: RouteMatch) {
    return match.page ? `${match.module.title} › ${match.page.title}` : match.module.title
}

/** True when `pathname` is `url` or one of its sub-routes. */
export function isPathActive(pathname: string, url: string) {
    return matchesPath(pathname, url)
}
