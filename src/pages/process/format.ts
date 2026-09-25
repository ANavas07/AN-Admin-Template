/** Human-readable file size ("12.4 KB"), or "—" when unknown. */
export function formatBytes(size: number) {
    if (size <= 0) return '—'
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

/** Local date of an ISO timestamp, or "—" when it is not a valid date. */
export function formatDate(iso: string) {
    const date = new Date(iso)
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString()
}
