// Pure aggregations over the visit log. No React, no storage: easy to test and
// to move to a backend endpoint later.
import type { VisitEvent } from './workspace.service'

const DAY_MS = 24 * 60 * 60 * 1000

export type DailyCount = { date: Date; count: number }
export type MonthlyCount = { month: Date; count: number }
export type ModuleCount = { moduleId: string; count: number }
export type WeekdayCount = { weekday: number; label: string; count: number }

function startOfDay(time: number) {
    const date = new Date(time)
    date.setHours(0, 0, 0, 0)
    return date
}

/** Visits per day for the last `days` days, today included, oldest first. */
export function countByDay(events: VisitEvent[], days: number, now = Date.now()): DailyCount[] {
    const today = startOfDay(now)
    const buckets = Array.from({ length: days }, (_, index) => ({
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - (days - 1 - index)),
        count: 0,
    }))
    const first = buckets[0].date.getTime()
    for (const event of events) {
        if (event.at < first || event.at > now) continue
        // Calendar-day difference, safe across daylight saving changes
        const index = Math.round((startOfDay(event.at).getTime() - first) / DAY_MS)
        if (buckets[index]) buckets[index].count += 1
    }
    return buckets
}

/** Visits per calendar month for the last `months` months, current month included. */
export function countByMonth(events: VisitEvent[], months: number, now = Date.now()): MonthlyCount[] {
    const current = new Date(now)
    const buckets = Array.from({ length: months }, (_, index) => ({
        month: new Date(current.getFullYear(), current.getMonth() - (months - 1 - index), 1),
        count: 0,
    }))
    for (const event of events) {
        const date = new Date(event.at)
        const index = buckets.findIndex(
            (bucket) => bucket.month.getFullYear() === date.getFullYear() && bucket.month.getMonth() === date.getMonth()
        )
        if (index >= 0) buckets[index].count += 1
    }
    return buckets
}

/** Visits per module since `since`, most used first. */
export function countByModule(events: VisitEvent[], since = 0): ModuleCount[] {
    const counts = new Map<string, number>()
    for (const event of events) {
        if (event.at < since) continue
        counts.set(event.moduleId, (counts.get(event.moduleId) ?? 0) + 1)
    }
    return [...counts.entries()]
        .map(([moduleId, count]) => ({ moduleId, count }))
        .sort((a, b) => b.count - a.count)
}

const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

/** Average visits per weekday (Monday first) since `since`: the weekly usage pattern. */
export function averageByWeekday(events: VisitEvent[], since: number, now = Date.now()): WeekdayCount[] {
    const totals = Array(7).fill(0)
    for (const event of events) {
        if (event.at < since || event.at > now) continue
        totals[(new Date(event.at).getDay() + 6) % 7] += 1
    }
    const weeks = Math.max(1, (now - since) / (7 * DAY_MS))
    return totals.map((total, weekday) => ({
        weekday,
        label: WEEKDAY_LABELS[weekday],
        count: Math.round((total / weeks) * 10) / 10,
    }))
}

export type ActivitySummary = {
    today: number
    last30: number
    previous30: number
    activeModules30: number
    /** Consecutive days with activity, ending today or yesterday */
    streakDays: number
    lastVisitAt: number | null
}

export function summarizeActivity(events: VisitEvent[], now = Date.now()): ActivitySummary {
    const todayStart = startOfDay(now).getTime()
    const since30 = todayStart - 29 * DAY_MS
    const since60 = todayStart - 59 * DAY_MS

    let today = 0
    let last30 = 0
    let previous30 = 0
    const modules30 = new Set<string>()
    const activeDays = new Set<number>()
    let lastVisitAt: number | null = null

    for (const event of events) {
        if (event.at > now) continue
        if (event.at >= todayStart) today += 1
        if (event.at >= since30) {
            last30 += 1
            modules30.add(event.moduleId)
        } else if (event.at >= since60) {
            previous30 += 1
        }
        activeDays.add(startOfDay(event.at).getTime())
        if (lastVisitAt === null || event.at > lastVisitAt) lastVisitAt = event.at
    }

    let streakDays = 0
    let cursor = activeDays.has(todayStart) ? todayStart : todayStart - DAY_MS
    while (activeDays.has(startOfDay(cursor).getTime())) {
        streakDays += 1
        cursor -= DAY_MS
    }

    return { today, last30, previous30, activeModules30: modules30.size, streakDays, lastVisitAt }
}

/** Relative change between two periods, or null when there is no base to compare. */
export function percentChange(current: number, previous: number) {
    if (previous === 0) return null
    return (current - previous) / previous
}
