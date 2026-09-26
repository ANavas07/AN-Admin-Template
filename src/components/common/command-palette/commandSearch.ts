/** Lowercase and without accents, so "auditoria" finds "Auditoría". */
export function normalizeText(text: string) {
    return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

/**
 * Relevance of `text` for an already normalized `query`, or null when it does
 * not match. Prefix > word start > substring > in-order characters (fuzzy).
 */
export function scoreText(query: string, text: string): number | null {
    if (!query) return 0
    const target = normalizeText(text)
    if (target.startsWith(query)) return 100 - Math.min(target.length - query.length, 20)
    if (target.split(/[\s/›·-]+/).some((word) => word.startsWith(query))) return 80
    if (target.includes(query)) return 60

    // Fuzzy: every query character appears in order; tighter matches score higher
    let position = -1
    let gaps = 0
    for (const char of query) {
        if (char === ' ') continue
        const next = target.indexOf(char, position + 1)
        if (next === -1) return null
        if (position >= 0) gaps += next - position - 1
        position = next
    }
    // Scattered letters are noise, not a match ("audit" must not find "gestion de usuarios")
    if (gaps > query.length) return null
    return Math.max(1, 40 - gaps)
}

/** Best score among several fields, each with its own weight. */
export function scoreFields(query: string, fields: Array<[string | undefined, number]>) {
    let best: number | null = null
    for (const [text, weight] of fields) {
        if (!text) continue
        const score = scoreText(query, text)
        if (score !== null && (best === null || score * weight > best)) best = score * weight
    }
    return best
}
