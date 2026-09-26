// API keys of the organization. Only the SHA-256 hash, the prefix and the last
// four characters of a key are persisted: the full secret is returned once by
// create / regenerate and never stored or returned again. Every change is
// written to an audit trail (and to the acting user's security log).
import { accountService } from '../account/account.service'
import { createId, createLocalStore, isRecord, parseArray, simulateLatency } from '../storage/localStore'
import { describeSecret, generateSecret, hashSecret } from './apiKeyCrypto'
import type { KeyEnvironment } from './apiKeyCrypto'

export type { KeyEnvironment } from './apiKeyCrypto'

/** Stored status. "expired" is derived from `expiresAt` (see getKeyStatus). */
export type StoredKeyStatus = 'active' | 'inactive' | 'revoked'
export type ApiKeyStatus = StoredKeyStatus | 'expired'

export type DailyUsage = { day: string; requests: number; errors: number }

export type ApiKey = {
    id: string
    name: string
    description: string
    environment: KeyEnvironment
    prefix: string
    lastFour: string
    /** SHA-256 of the secret. Never shown in the UI */
    hash: string
    scopes: string[]
    status: StoredKeyStatus
    /** Generated here, or registered from an external system */
    source: 'generated' | 'registered'
    expiresAt: string | null
    createdAt: string
    createdBy: string
    lastUsedAt: string | null
    rotatedAt: string | null
    /** Requests per day, oldest first */
    usage: DailyUsage[]
}

export type ApiKeyAuditAction =
    | 'created'
    | 'registered'
    | 'updated'
    | 'activated'
    | 'deactivated'
    | 'regenerated'
    | 'revoked'
    | 'copied'

export type ApiKeyAuditEvent = {
    id: string
    keyId: string
    keyName: string
    action: ApiKeyAuditAction
    actor: string
    detail?: string
    at: string
}

export type ApiKeysState = {
    version: 1
    keys: ApiKey[]
    audit: ApiKeyAuditEvent[]
}

/** Who performs an action: recorded in the audit trail and the user's security log. */
export type Actor = { id: string; name: string }

export type ApiKeyInput = {
    name: string
    description: string
    environment: KeyEnvironment
    scopes: string[]
    expiresAt: string | null
}

export type ApiKeyPatch = Partial<Pick<ApiKey, 'name' | 'description' | 'scopes' | 'expiresAt'>>

/** Result of create / regenerate: the only moment the secret is available. */
export type IssuedKey = { key: ApiKey; secret: string }

const DAY_MS = 24 * 60 * 60 * 1000
const USAGE_DAYS = 30
const AUDIT_LIMIT = 200
const MIN_REGISTERED_LENGTH = 20

// ----- Derived values (pure) -------------------------------------------------

export function getKeyStatus(key: ApiKey, now = Date.now()): ApiKeyStatus {
    if (key.status === 'revoked') return 'revoked'
    if (key.expiresAt && new Date(key.expiresAt).getTime() <= now) return 'expired'
    return key.status
}

/** Days until expiration (negative when expired), or null for keys that never expire. */
export function daysUntilExpiry(key: ApiKey, now = Date.now()) {
    return key.expiresAt ? Math.ceil((new Date(key.expiresAt).getTime() - now) / DAY_MS) : null
}

export function totalRequests(key: ApiKey, days = USAGE_DAYS) {
    return key.usage.slice(-days).reduce((total, entry) => total + entry.requests, 0)
}

const dayKey = (time: number) => new Date(time).toISOString().slice(0, 10)

/** Usage for the last `days` days, today included, with the missing days as zero. */
export function usageSeries(key: ApiKey, days = USAGE_DAYS, now = Date.now()): DailyUsage[] {
    const byDay = new Map(key.usage.map((entry) => [entry.day, entry]))
    return Array.from({ length: days }, (_, index) => {
        const day = dayKey(now - (days - 1 - index) * DAY_MS)
        return byDay.get(day) ?? { day, requests: 0, errors: 0 }
    })
}

// ----- Seed ------------------------------------------------------------------

function randomHash() {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function seedUsage(now: number, average: number, activeDays = USAGE_DAYS) {
    return Array.from({ length: USAGE_DAYS }, (_, index) => {
        const time = now - (USAGE_DAYS - 1 - index) * DAY_MS
        const isWeekend = [0, 6].includes(new Date(time).getDay())
        const active = index >= USAGE_DAYS - activeDays
        const requests = active ? Math.round(average * (isWeekend ? 0.3 : 0.8 + Math.random() * 0.5)) : 0
        return { day: dayKey(time), requests, errors: Math.round(requests * Math.random() * 0.02) }
    })
}

function seed(): ApiKeysState {
    const now = Date.now()
    const iso = (offsetDays: number) => new Date(now + offsetDays * DAY_MS).toISOString()
    type SeedKey = Omit<ApiKey, 'hash' | 'source' | 'rotatedAt' | 'createdBy'> & Partial<Pick<ApiKey, 'source' | 'rotatedAt'>>
    const make = (key: SeedKey): ApiKey => ({ source: 'generated', rotatedAt: null, createdBy: 'Administrador', hash: randomHash(), ...key })
    const seedKeys: SeedKey[] = [
        {
            id: 'key-erp',
            name: 'Integración ERP',
            description: 'Sincroniza usuarios y procesos con el ERP corporativo.',
            environment: 'production',
            prefix: 'sk_live_',
            lastFour: 'R7kQ',
            scopes: ['users:read', 'processes:read', 'processes:write'],
            status: 'active',
            expiresAt: iso(142),
            createdAt: iso(-223),
            lastUsedAt: iso(-0.02),
            rotatedAt: iso(-40),
            usage: seedUsage(now, 1850),
        },
        {
            id: 'key-bi',
            name: 'Reportes BI',
            description: 'Lectura de métricas para el tablero de inteligencia de negocio.',
            environment: 'production',
            prefix: 'sk_live_',
            lastFour: 'm2Xa',
            scopes: ['reports:read', 'audit:read'],
            status: 'active',
            expiresAt: iso(12),
            createdAt: iso(-353),
            lastUsedAt: iso(-0.3),
            usage: seedUsage(now, 420),
        },
        {
            id: 'key-mail',
            name: 'Notificaciones por correo',
            description: 'Servicio de envío de notificaciones transaccionales.',
            environment: 'staging',
            prefix: 'sk_stg_',
            lastFour: '9fPc',
            scopes: ['mail:send', 'users:read'],
            status: 'inactive',
            expiresAt: null,
            createdAt: iso(-96),
            lastUsedAt: iso(-18),
            usage: seedUsage(now, 160, 12),
        },
        {
            id: 'key-ci',
            name: 'Pipeline de CI',
            description: 'Pruebas de integración automatizadas.',
            environment: 'development',
            prefix: 'sk_test_',
            lastFour: 'Tz04',
            scopes: ['tasks:read', 'tasks:write', 'files:read'],
            status: 'active',
            expiresAt: iso(-3),
            createdAt: iso(-93),
            lastUsedAt: iso(-3.2),
            usage: seedUsage(now, 90, 27),
        },
        {
            id: 'key-legacy',
            name: 'Portal antiguo',
            description: 'Reemplazada por la integración ERP.',
            environment: 'production',
            prefix: 'sk_live_',
            lastFour: 'b8Ld',
            source: 'registered',
            scopes: ['admin:full'],
            status: 'revoked',
            expiresAt: null,
            createdAt: iso(-410),
            lastUsedAt: iso(-60),
            usage: seedUsage(now, 0, 0),
        },
    ]
    const keys = seedKeys.map(make)

    const audit: ApiKeyAuditEvent[] = (
        [
        { id: createId('kev'), keyId: 'key-erp', keyName: 'Integración ERP', action: 'regenerated', actor: 'Administrador', detail: 'Rotación programada', at: iso(-40) },
        { id: createId('kev'), keyId: 'key-legacy', keyName: 'Portal antiguo', action: 'revoked', actor: 'Administrador', detail: 'Reemplazada por Integración ERP', at: iso(-60) },
        { id: createId('kev'), keyId: 'key-mail', keyName: 'Notificaciones por correo', action: 'deactivated', actor: 'Administrador', at: iso(-18) },
        { id: createId('kev'), keyId: 'key-mail', keyName: 'Notificaciones por correo', action: 'created', actor: 'Administrador', at: iso(-96) },
        { id: createId('kev'), keyId: 'key-ci', keyName: 'Pipeline de CI', action: 'created', actor: 'Administrador', at: iso(-93) },
        ] satisfies ApiKeyAuditEvent[]
    ).sort((a, b) => b.at.localeCompare(a.at))

    return { version: 1, keys, audit }
}

function isApiKey(item: unknown): item is ApiKey {
    return (
        isRecord(item) &&
        typeof item.id === 'string' &&
        typeof item.name === 'string' &&
        typeof item.prefix === 'string' &&
        typeof item.lastFour === 'string' &&
        Array.isArray(item.scopes) &&
        Array.isArray(item.usage)
    )
}

function parse(raw: unknown): ApiKeysState | null {
    if (!isRecord(raw) || raw.version !== 1) return null
    return {
        version: 1,
        keys: parseArray(raw.keys, isApiKey),
        audit: parseArray(raw.audit, (item): item is ApiKeyAuditEvent => isRecord(item) && typeof item.id === 'string'),
    }
}

const store = createLocalStore<ApiKeysState>({ namespace: 'api-keys:v1', seed, parse })

// ----- Mutations -------------------------------------------------------------

const AUDIT_DESCRIPTIONS: Record<ApiKeyAuditAction, string> = {
    created: 'API key generada',
    registered: 'API key registrada',
    updated: 'API key actualizada',
    activated: 'API key activada',
    deactivated: 'API key desactivada',
    regenerated: 'API key rotada',
    revoked: 'API key revocada',
    copied: 'API key copiada',
}

function record(state: ApiKeysState, key: ApiKey, action: ApiKeyAuditAction, actor: Actor, detail?: string): ApiKeysState {
    const event: ApiKeyAuditEvent = {
        id: createId('kev'),
        keyId: key.id,
        keyName: key.name,
        action,
        actor: actor.name,
        detail,
        at: new Date().toISOString(),
    }
    return { ...state, audit: [event, ...state.audit].slice(0, AUDIT_LIMIT) }
}

function logSecurity(actor: Actor, action: ApiKeyAuditAction, key: ApiKey) {
    void accountService.logSecurityEvent(actor.id, 'api_key', `${AUDIT_DESCRIPTIONS[action]}: ${key.name}`)
}

/** Applies `change` to one key and records the action. Throws if the key cannot change. */
function mutateKey(id: string, actor: Actor, action: ApiKeyAuditAction, change: (key: ApiKey) => ApiKey, detail?: string) {
    let updated: ApiKey | undefined
    store.update((state) => {
        const current = state.keys.find((key) => key.id === id)
        if (!current) throw new Error('La API key no existe.')
        if (current.status === 'revoked') throw new Error('Una API key revocada no se puede modificar.')
        updated = change(current)
        const next = { ...state, keys: state.keys.map((key) => (key.id === id ? updated! : key)) }
        return record(next, updated, action, actor, detail)
    })
    logSecurity(actor, action, updated!)
    return updated!
}

function validateInput(input: ApiKeyInput) {
    if (!input.name.trim()) throw new Error('Asigna un nombre a la API key.')
    if (input.scopes.length === 0) throw new Error('Selecciona al menos un permiso.')
    if (input.expiresAt && new Date(input.expiresAt).getTime() <= Date.now()) throw new Error('La fecha de expiración debe ser futura.')
}

function describeChanges(before: ApiKey, patch: ApiKeyPatch) {
    const changes: string[] = []
    if (patch.name !== undefined && patch.name !== before.name) changes.push('nombre')
    if (patch.description !== undefined && patch.description !== before.description) changes.push('descripción')
    if (patch.expiresAt !== undefined && patch.expiresAt !== before.expiresAt) changes.push('expiración')
    if (patch.scopes && [...patch.scopes].sort().join() !== [...before.scopes].sort().join()) changes.push('permisos')
    return changes.length ? `Cambios: ${changes.join(', ')}` : undefined
}

async function issue(input: ApiKeyInput, actor: Actor, secret: string, source: ApiKey['source']): Promise<ApiKey> {
    const hash = await hashSecret(secret)
    const { prefix, lastFour } = describeSecret(secret)
    const key: ApiKey = {
        id: createId('key'),
        name: input.name.trim(),
        description: input.description.trim(),
        environment: input.environment,
        prefix,
        lastFour,
        hash,
        scopes: input.scopes,
        status: 'active',
        source,
        expiresAt: input.expiresAt,
        createdAt: new Date().toISOString(),
        createdBy: actor.name,
        lastUsedAt: null,
        rotatedAt: null,
        usage: [],
    }
    store.update((state) => {
        if (state.keys.some((existing) => existing.hash === hash)) throw new Error('Esa API key ya está registrada.')
        return record({ ...state, keys: [key, ...state.keys] }, key, source === 'generated' ? 'created' : 'registered', actor)
    })
    logSecurity(actor, source === 'generated' ? 'created' : 'registered', key)
    return key
}

export const apiKeysService = {
    async list(): Promise<ApiKeysState> {
        await simulateLatency(200)
        return store.read()
    },

    /** Generates a new key. The returned secret is shown once and never stored. */
    async create(input: ApiKeyInput, actor: Actor): Promise<IssuedKey> {
        validateInput(input)
        await simulateLatency(350)
        const secret = generateSecret(input.environment)
        return { key: await issue(input, actor, secret, 'generated'), secret }
    },

    /** Registers a key issued by an external system: only its hash is kept. */
    async register(input: ApiKeyInput, secret: string, actor: Actor): Promise<ApiKey> {
        validateInput(input)
        const trimmed = secret.trim()
        if (trimmed.length < MIN_REGISTERED_LENGTH || /\s/.test(trimmed)) {
            throw new Error(`La clave debe tener al menos ${MIN_REGISTERED_LENGTH} caracteres y no contener espacios.`)
        }
        await simulateLatency(350)
        return issue(input, actor, trimmed, 'registered')
    },

    async update(id: string, patch: ApiKeyPatch, actor: Actor): Promise<ApiKey> {
        if (patch.name !== undefined && !patch.name.trim()) throw new Error('Asigna un nombre a la API key.')
        if (patch.scopes && patch.scopes.length === 0) throw new Error('Selecciona al menos un permiso.')
        await simulateLatency(250)
        const before = store.read().keys.find((key) => key.id === id)
        return mutateKey(id, actor, 'updated', (key) => ({ ...key, ...patch }), before ? describeChanges(before, patch) : undefined)
    },

    async setActive(id: string, active: boolean, actor: Actor): Promise<ApiKey> {
        await simulateLatency(200)
        return mutateKey(id, actor, active ? 'activated' : 'deactivated', (key) => ({ ...key, status: active ? 'active' : 'inactive' }))
    },

    /**
     * Rotation: issues a new secret for the same key (id, scopes and history
     * are kept) and invalidates the previous one immediately.
     */
    async regenerate(id: string, actor: Actor): Promise<IssuedKey> {
        await simulateLatency(350)
        const current = store.read().keys.find((key) => key.id === id)
        if (!current) throw new Error('La API key no existe.')
        const secret = generateSecret(current.environment)
        const hash = await hashSecret(secret)
        const { prefix, lastFour } = describeSecret(secret)
        const key = mutateKey(
            id,
            actor,
            'regenerated',
            (existing) => ({ ...existing, hash, prefix, lastFour, status: 'active', rotatedAt: new Date().toISOString() }),
            `Terminación anterior …${current.lastFour}`
        )
        return { key, secret }
    },

    /** Permanent: a revoked key stops working and cannot be reactivated. */
    async revoke(id: string, reason: string, actor: Actor): Promise<ApiKey> {
        await simulateLatency(250)
        return mutateKey(id, actor, 'revoked', (key) => ({ ...key, status: 'revoked' }), reason.trim() || undefined)
    },

    /** Records that a just-issued secret was copied (the copy itself happens in the browser). */
    async recordCopy(id: string, actor: Actor): Promise<void> {
        store.update((state) => {
            const key = state.keys.find((item) => item.id === id)
            return key ? record(state, key, 'copied', actor, 'Copiada al portapapeles al emitirse') : state
        })
    },
}
