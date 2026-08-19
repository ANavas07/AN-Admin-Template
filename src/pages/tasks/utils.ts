import { differenceInCalendarDays, format, isValid, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

/** "18 ago" style short label, or null when the date is missing/invalid. */
export function formatShortDate(iso: string | null): string | null {
    if (!iso) return null
    const date = parseISO(iso)
    if (!isValid(date)) return null
    return format(date, 'd MMM', { locale: es })
}

export function formatLongDate(iso: string | null): string | null {
    if (!iso) return null
    const date = parseISO(iso)
    if (!isValid(date)) return null
    return format(date, "d 'de' MMMM 'de' yyyy", { locale: es })
}

/** True when the due date is strictly before today and the task is not done. */
export function isOverdue(iso: string | null, completed: boolean, today = new Date()): boolean {
    if (!iso || completed) return false
    const date = parseISO(iso)
    if (!isValid(date)) return false
    return differenceInCalendarDays(date, today) < 0
}
