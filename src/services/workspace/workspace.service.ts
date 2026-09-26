// Personal workspace of each user: favorite modules, navigation history and
// the visit log that feeds the home metrics. Persists to localStorage today,
// but exposes an async API with the same shape as the http-backed services
// (see services/rbac) so it can be swapped for a real backend without
// touching the UI.
import { createDemoActivity } from './demo-activity'

export type VisitEvent = {
    moduleId: string
    /** Epoch milliseconds */
    at: number
    /** Generated demo activity (see demo-activity.ts), removable on its own */
    demo?: boolean
}

export type RecentEntry = {
    path: string
    moduleId: string
    /** Readable title at the time of the visit, e.g. "Roles y permisos › Grupos" */
    title: string
    at: number
    demo?: boolean
}

export type WorkspaceState = {
    version: 1
    favorites: string[]
    recents: RecentEntry[]
    events: VisitEvent[]
    /** True while the log still contains the generated demo activity */
    hasDemoActivity: boolean
}

const RECENTS_LIMIT = 12
const EVENTS_LIMIT = 5000
const EVENTS_MAX_AGE_MS = 400 * 24 * 60 * 60 * 1000

function storageKey(userId: string) {
    return `workspace:v1:${userId}`
}

function emptyState(): WorkspaceState {
    return { version: 1, favorites: [], recents: [], events: [], hasDemoActivity: false }
}

function isStringArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

/** Validates stored data defensively: storage can be edited by hand. */
function parseState(raw: unknown): WorkspaceState | null {
    if (typeof raw !== 'object' || raw === null) return null
    const data = raw as Partial<WorkspaceState>
    if (data.version !== 1) return null
    return {
        version: 1,
        favorites: isStringArray(data.favorites) ? data.favorites : [],
        recents: Array.isArray(data.recents)
            ? data.recents.filter(
                  (entry): entry is RecentEntry =>
                      typeof entry?.path === 'string' &&
                      typeof entry.moduleId === 'string' &&
                      typeof entry.title === 'string' &&
                      typeof entry.at === 'number'
              )
            : [],
        events: Array.isArray(data.events)
            ? data.events.filter(
                  (event): event is VisitEvent => typeof event?.moduleId === 'string' && typeof event.at === 'number'
              )
            : [],
        hasDemoActivity: Boolean(data.hasDemoActivity),
    }
}

function read(userId: string): WorkspaceState | null {
    try {
        const raw = localStorage.getItem(storageKey(userId))
        return raw ? parseState(JSON.parse(raw)) : null
    } catch {
        return null
    }
}

/** Keeps the log bounded so storage never grows without limit. */
function compact(state: WorkspaceState): WorkspaceState {
    const oldestAllowed = Date.now() - EVENTS_MAX_AGE_MS
    return {
        ...state,
        recents: state.recents.slice(0, RECENTS_LIMIT),
        events: state.events.filter((event) => event.at >= oldestAllowed).slice(-EVENTS_LIMIT),
    }
}

async function write(userId: string, state: WorkspaceState): Promise<WorkspaceState> {
    const next = compact(state)
    try {
        localStorage.setItem(storageKey(userId), JSON.stringify(next))
    } catch {
        // Storage full or unavailable (private mode): the workspace keeps working in memory
    }
    return next
}

/**
 * Every mutation reads the stored state, applies the change and saves it, like
 * a backend endpoint would, so concurrent updates never overwrite each other.
 */
async function update(userId: string, change: (state: WorkspaceState) => WorkspaceState) {
    // Read and write in the same synchronous step: two updates issued in the
    // same tick (a visit and a star click) must not both start from one state
    const current = read(userId) ?? (await workspaceService.load(userId))
    return write(userId, change(current))
}

export const workspaceService = {
    /**
     * Loads the workspace of a user. The first time, it is initialized with
     * demo activity so the home metrics are not empty in the template.
     */
    async load(userId: string): Promise<WorkspaceState> {
        const stored = read(userId)
        if (stored) return stored
        return write(userId, { ...emptyState(), ...createDemoActivity(userId), hasDemoActivity: true })
    },

    /** Logs a visit to a module page and moves it to the top of the history. */
    async recordVisit(userId: string, visit: Omit<RecentEntry, 'demo'>): Promise<WorkspaceState> {
        return update(userId, (state) => ({
            ...state,
            events: [...state.events, { moduleId: visit.moduleId, at: visit.at }],
            recents: [visit, ...state.recents.filter((entry) => entry.path !== visit.path)],
        }))
    },

    async toggleFavorite(userId: string, moduleId: string): Promise<WorkspaceState> {
        return update(userId, (state) => ({
            ...state,
            favorites: state.favorites.includes(moduleId)
                ? state.favorites.filter((id) => id !== moduleId)
                : [...state.favorites, moduleId],
        }))
    },

    /** Removes the generated demo activity, keeping favorites and real visits. */
    async clearDemoActivity(userId: string): Promise<WorkspaceState> {
        return update(userId, (state) => ({
            ...state,
            events: state.events.filter((event) => !event.demo),
            recents: state.recents.filter((entry) => !entry.demo),
            hasDemoActivity: false,
        }))
    },
}
