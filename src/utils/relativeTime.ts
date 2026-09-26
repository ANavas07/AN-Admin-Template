const formatter = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })

const UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['year', 365 * 24 * 60 * 60 * 1000],
    ['month', 30 * 24 * 60 * 60 * 1000],
    ['week', 7 * 24 * 60 * 60 * 1000],
    ['day', 24 * 60 * 60 * 1000],
    ['hour', 60 * 60 * 1000],
    ['minute', 60 * 1000],
]

/** "hace 5 minutos", "ayer", "hace 2 semanas". */
export function formatRelativeTime(time: number, now = Date.now()) {
    const elapsed = time - now
    for (const [unit, size] of UNITS) {
        if (Math.abs(elapsed) >= size) return formatter.format(Math.round(elapsed / size), unit)
    }
    return 'justo ahora'
}
