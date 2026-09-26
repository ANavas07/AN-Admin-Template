// Deterministic demo activity for the template: ~6 months of plausible module
// visits so the home metrics have something to show before real usage exists.
// It is flagged (`demo: true`) and can be cleared from the home screen.
import { describeRoute, findRouteMatch, getAllModules } from '../../navigation/navigation'
import type { RecentEntry, VisitEvent } from './workspace.service'

const DAY_MS = 24 * 60 * 60 * 1000
const DEMO_DAYS = 185

/** Relative popularity of each module in the demo; unknown modules get 1. */
const MODULE_WEIGHTS: Record<string, number> = {
    tasks: 10,
    process: 7,
    files: 5,
    planning: 4,
    users: 3,
    rbac: 2,
    audit: 1.5,
    gantt: 1.5,
    playground: 1,
}

/** Small seeded PRNG (mulberry32) so the same user always sees the same history. */
function seededRandom(seedText: string) {
    let seed = 0
    for (const char of seedText) seed = (Math.imul(seed, 31) + char.charCodeAt(0)) >>> 0
    return () => {
        seed = (seed + 0x6d2b79f5) >>> 0
        let t = seed
        t = Math.imul(t ^ (t >>> 15), t | 1)
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

export function createDemoActivity(userId: string, now = Date.now()): { events: VisitEvent[]; recents: RecentEntry[] } {
    const random = seededRandom(`workspace-demo-${userId}`)
    const modules = getAllModules().filter((module) => module.url)
    const weights = modules.map((module) => MODULE_WEIGHTS[module.id] ?? 1)
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)

    function pickModule() {
        let target = random() * totalWeight
        for (let index = 0; index < modules.length; index += 1) {
            target -= weights[index]
            if (target <= 0) return modules[index]
        }
        return modules[modules.length - 1]
    }

    const startOfToday = new Date(now)
    startOfToday.setHours(0, 0, 0, 0)

    const events: VisitEvent[] = []
    for (let daysAgo = DEMO_DAYS; daysAgo >= 0; daysAgo -= 1) {
        const dayStart = startOfToday.getTime() - daysAgo * DAY_MS
        const weekday = new Date(dayStart).getDay()
        const isWeekend = weekday === 0 || weekday === 6
        // Gentle growth over time plus weekday rhythm
        const growth = 0.6 + 0.4 * (1 - daysAgo / DEMO_DAYS)
        const base = isWeekend ? 2 : 14
        const visits = Math.round(base * growth + random() * (isWeekend ? 3 : 9))

        for (let index = 0; index < visits; index += 1) {
            // Working hours, 8:00 to 18:00
            const at = dayStart + (8 + random() * 10) * 60 * 60 * 1000
            if (at > now) continue
            events.push({ moduleId: pickModule().id, at, demo: true })
        }
    }
    events.sort((a, b) => a.at - b.at)

    // Recents: the latest distinct modules of the generated history
    const recents: RecentEntry[] = []
    for (let index = events.length - 1; index >= 0 && recents.length < 6; index -= 1) {
        const event = events[index]
        if (recents.some((entry) => entry.moduleId === event.moduleId)) continue
        const module = modules.find((candidate) => candidate.id === event.moduleId)
        if (!module?.url) continue
        const match = findRouteMatch(module.url)
        recents.push({
            path: module.url,
            moduleId: module.id,
            title: match ? describeRoute(match) : module.title,
            at: event.at,
            demo: true,
        })
    }

    return { events, recents }
}
