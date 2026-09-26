// Account of the signed-in user: profile details, preferences and security
// (2FA, sessions, security log). Mock persistence through localStore, with
// the async API a backend would expose.
import type { CurrentUser } from '../../config/app.config'
import { createId, createLocalStore, isRecord, parseArray, simulateLatency } from '../storage/localStore'

export type ProfileDetails = Pick<CurrentUser, 'name' | 'department' | 'jobTitle' | 'phone'> & { bio?: string }

export type NotificationPreferences = {
    tickets: boolean
    mail: boolean
    security: boolean
    weeklySummary: boolean
}

export type Preferences = {
    showHomeMetrics: boolean
    notifications: NotificationPreferences
}

export type Session = {
    id: string
    device: string
    location: string
    lastActiveAt: string
    current: boolean
}

export type SecurityEventType = 'login' | 'login_failed' | 'password_changed' | '2fa_enabled' | '2fa_disabled' | 'session_revoked' | 'api_key'

export type SecurityEvent = {
    id: string
    type: SecurityEventType
    description: string
    at: string
}

export type AccountState = {
    version: 1
    profile: Partial<ProfileDetails>
    preferences: Preferences
    security: {
        twoFactorEnabled: boolean
        passwordUpdatedAt: string | null
        sessions: Session[]
        events: SecurityEvent[]
    }
}

const DAY_MS = 24 * 60 * 60 * 1000
const EVENTS_LIMIT = 50

export const DEFAULT_PREFERENCES: Preferences = {
    showHomeMetrics: true,
    notifications: { tickets: true, mail: true, security: true, weeklySummary: false },
}

/** "Chrome en Windows" from the user agent, for the current session row. */
function describeCurrentDevice() {
    const agent = typeof navigator === 'undefined' ? '' : navigator.userAgent
    const browser = /Edg\//.test(agent) ? 'Edge' : /Firefox\//.test(agent) ? 'Firefox' : /Chrome\//.test(agent) ? 'Chrome' : /Safari\//.test(agent) ? 'Safari' : 'Navegador'
    const os = /Windows/.test(agent) ? 'Windows' : /Mac OS/.test(agent) ? 'macOS' : /Android/.test(agent) ? 'Android' : /iPhone|iPad/.test(agent) ? 'iOS' : /Linux/.test(agent) ? 'Linux' : 'otro sistema'
    return `${browser} en ${os}`
}

function seed(): AccountState {
    const now = Date.now()
    const iso = (offset: number) => new Date(now - offset).toISOString()
    return {
        version: 1,
        profile: {},
        preferences: DEFAULT_PREFERENCES,
        security: {
            twoFactorEnabled: false,
            passwordUpdatedAt: iso(94 * DAY_MS),
            sessions: [
                { id: 'ses-current', device: describeCurrentDevice(), location: 'Quito, EC', lastActiveAt: iso(0), current: true },
                { id: createId('ses'), device: 'Safari en iOS', location: 'Quito, EC', lastActiveAt: iso(2 * DAY_MS), current: false },
                { id: createId('ses'), device: 'Edge en Windows', location: 'Guayaquil, EC', lastActiveAt: iso(6 * DAY_MS), current: false },
            ],
            events: [
                { id: createId('sev'), type: 'login', description: 'Inicio de sesión correcto', at: iso(0) },
                { id: createId('sev'), type: 'login_failed', description: 'Intento de inicio de sesión fallido (contraseña incorrecta)', at: iso(3 * DAY_MS) },
                { id: createId('sev'), type: 'login', description: 'Inicio de sesión correcto desde Safari en iOS', at: iso(2 * DAY_MS) },
            ],
        },
    }
}

function parse(raw: unknown): AccountState | null {
    if (!isRecord(raw) || raw.version !== 1 || !isRecord(raw.preferences) || !isRecord(raw.security)) return null
    const security = raw.security
    const preferences = raw.preferences as Partial<Preferences>
    return {
        version: 1,
        profile: isRecord(raw.profile) ? (raw.profile as Partial<ProfileDetails>) : {},
        preferences: {
            showHomeMetrics: preferences.showHomeMetrics ?? DEFAULT_PREFERENCES.showHomeMetrics,
            notifications: { ...DEFAULT_PREFERENCES.notifications, ...(isRecord(preferences.notifications) ? preferences.notifications : {}) },
        },
        security: {
            twoFactorEnabled: Boolean(security.twoFactorEnabled),
            passwordUpdatedAt: typeof security.passwordUpdatedAt === 'string' ? security.passwordUpdatedAt : null,
            sessions: parseArray(security.sessions, (item): item is Session => isRecord(item) && typeof item.id === 'string'),
            events: parseArray(security.events, (item): item is SecurityEvent => isRecord(item) && typeof item.id === 'string'),
        },
    }
}

const store = createLocalStore<AccountState>({ namespace: 'account:v1', seed, parse })

function withEvent(state: AccountState, type: SecurityEventType, description: string): AccountState {
    const event: SecurityEvent = { id: createId('sev'), type, description, at: new Date().toISOString() }
    return { ...state, security: { ...state.security, events: [event, ...state.security.events].slice(0, EVENTS_LIMIT) } }
}

export const accountService = {
    async load(userId: string): Promise<AccountState> {
        return store.read(userId)
    },

    async updateProfile(userId: string, patch: Partial<ProfileDetails>): Promise<AccountState> {
        await simulateLatency(300)
        return store.update((state) => ({ ...state, profile: { ...state.profile, ...patch } }), userId)
    },

    async updatePreferences(userId: string, patch: Partial<Preferences>): Promise<AccountState> {
        return store.update((state) => ({ ...state, preferences: { ...state.preferences, ...patch } }), userId)
    },

    /** PLANTILLA: con backend, la validacion de la contraseña actual ocurre en el servidor. */
    async changePassword(userId: string, current: string, next: string): Promise<AccountState> {
        await simulateLatency(500)
        if (!current) throw new Error('Ingresa tu contraseña actual.')
        if (current === next) throw new Error('La nueva contraseña debe ser distinta de la actual.')
        return store.update(
            (state) =>
                withEvent(
                    { ...state, security: { ...state.security, passwordUpdatedAt: new Date().toISOString() } },
                    'password_changed',
                    'Contraseña actualizada'
                ),
            userId
        )
    },

    async setTwoFactor(userId: string, enabled: boolean): Promise<AccountState> {
        await simulateLatency(300)
        return store.update(
            (state) =>
                withEvent(
                    { ...state, security: { ...state.security, twoFactorEnabled: enabled } },
                    enabled ? '2fa_enabled' : '2fa_disabled',
                    enabled ? 'Verificación en dos pasos activada' : 'Verificación en dos pasos desactivada'
                ),
            userId
        )
    },

    /** Closes one session, or every session except the current one when `sessionId` is omitted. */
    async revokeSessions(userId: string, sessionId?: string): Promise<AccountState> {
        await simulateLatency(250)
        return store.update((state) => {
            const closed = state.security.sessions.filter((session) => !session.current && (!sessionId || session.id === sessionId))
            const next = {
                ...state,
                security: { ...state.security, sessions: state.security.sessions.filter((session) => !closed.includes(session)) },
            }
            const description = closed.length === 1 ? `Sesión cerrada: ${closed[0].device}` : `${closed.length} sesiones cerradas`
            return withEvent(next, 'session_revoked', description)
        }, userId)
    },

    /** Other modules (API keys) record sensitive actions in the user's security log. */
    async logSecurityEvent(userId: string, type: SecurityEventType, description: string): Promise<void> {
        store.update((state) => withEvent(state, type, description), userId)
    },
}
