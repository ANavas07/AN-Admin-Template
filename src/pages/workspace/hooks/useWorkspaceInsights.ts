import { useMemo, useState } from 'react'
import { useWorkspace } from '../../../context/workspace-context'
import {
    averageByWeekday,
    countByDay,
    countByModule,
    countByMonth,
    summarizeActivity,
} from '../../../services/workspace/metrics'
import { getCatalogCategories, getModuleById, hasModuleAccess } from '../../../navigation/navigation'
import type { ModuleDefinition } from '../../../navigation/modules'
import { getQuickActions } from '../../../navigation/quickActions'

const DAY_MS = 24 * 60 * 60 * 1000

export type ModuleUsage = { module: ModuleDefinition; count: number }

/**
 * Everything the home derives from the workspace, computed once per change:
 * usage ranking, favorites and quick actions ordered by frequency, and the
 * series behind the metrics.
 */
export function useWorkspaceInsights() {
    const { events, favorites, role } = useWorkspace()
    // Reference time of the view, fixed when the home mounts (render must stay pure)
    const [now] = useState(() => Date.now())

    return useMemo(() => {
        const since30 = now - 30 * DAY_MS
        const accessible = getCatalogCategories(role).flatMap((category) => category.modules)
        const visits30 = new Map(countByModule(events, since30).map((entry) => [entry.moduleId, entry.count]))
        const usageOf = (moduleId: string) => visits30.get(moduleId) ?? 0

        const topModules: ModuleUsage[] = countByModule(events, since30)
            .map((entry) => ({ module: getModuleById(entry.moduleId), count: entry.count }))
            .filter((entry): entry is ModuleUsage => entry.module !== null && hasModuleAccess(entry.module, role))

        // Favorites keep the user's choice but show the most used first
        const favoriteModules = favorites
            .map((id) => getModuleById(id))
            .filter((module): module is ModuleDefinition => module !== null && hasModuleAccess(module, role))
            .sort((a, b) => usageOf(b.id) - usageOf(a.id))

        const suggestions = topModules
            .filter((entry) => !favorites.includes(entry.module.id) && entry.module.url)
            .slice(0, 3)
            .map((entry) => entry.module)

        const quickActions = [...getQuickActions(role)].sort((a, b) => usageOf(b.moduleId) - usageOf(a.moduleId))

        return {
            accessibleModules: accessible,
            usageOf,
            topModules,
            favoriteModules,
            suggestions,
            quickActions,
            summary: summarizeActivity(events, now),
            daily: countByDay(events, 30, now),
            monthly: countByMonth(events, 6, now),
            weekly: averageByWeekday(events, now - 8 * 7 * DAY_MS, now),
        }
    }, [events, favorites, role, now])
}
