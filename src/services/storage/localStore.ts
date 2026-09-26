// Small persistence helper shared by the mock services (support, mail,
// assistant, API keys, account). Each service keeps an async API with the
// shape a backend would have; this is the only place that talks to
// localStorage, validates what it reads and seeds demo data.

type LocalStoreOptions<T> = {
    /** Storage namespace, e.g. "support:v1". The scope (user id) is appended. */
    namespace: string
    /** Data used the first time (or when stored data is invalid) */
    seed: (scope: string) => T
    /** Validates stored data defensively: storage can be edited by hand */
    parse: (raw: unknown) => T | null
}

export type LocalStore<T> = {
    read: (scope?: string) => T
    write: (value: T, scope?: string) => T
    /** Read-modify-write in one synchronous step, so updates never overwrite each other */
    update: (change: (current: T) => T, scope?: string) => T
}

const GLOBAL_SCOPE = 'global'

export function createLocalStore<T>({ namespace, seed, parse }: LocalStoreOptions<T>): LocalStore<T> {
    const key = (scope: string) => `${namespace}:${scope}`

    function write(value: T, scope = GLOBAL_SCOPE) {
        try {
            localStorage.setItem(key(scope), JSON.stringify(value))
        } catch {
            // Storage full or unavailable (private mode): keep working in memory for this call
        }
        return value
    }

    function read(scope = GLOBAL_SCOPE): T {
        try {
            const raw = localStorage.getItem(key(scope))
            const parsed = raw ? parse(JSON.parse(raw)) : null
            if (parsed) return parsed
        } catch {
            // Corrupted JSON falls back to the seed
        }
        return write(seed(scope), scope)
    }

    return {
        read,
        write,
        update: (change, scope = GLOBAL_SCOPE) => write(change(read(scope)), scope),
    }
}

/** Unique, sortable id with a readable prefix: "tkt-lx2k9f-4a7b". */
export function createId(prefix: string) {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

/** Resolves after `ms`, to give mock services a realistic latency. */
export function simulateLatency(ms = 250) {
    return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

export function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
}

/** Keeps only the array items that pass `guard` (invalid entries are dropped). */
export function parseArray<T>(raw: unknown, guard: (item: unknown) => item is T): T[] {
    return Array.isArray(raw) ? raw.filter(guard) : []
}
