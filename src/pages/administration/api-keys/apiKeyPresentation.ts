// Labels and tones of the API keys module, kept out of the components so the
// table, the drawer and the filters describe a key the same way.
import type { StatusTone } from '../../../components/ui/tone'
import type { ApiKeyAuditAction, ApiKeyStatus, KeyEnvironment } from '../../../services/api-keys/apiKeys.service'

export const STATUS_META: Record<ApiKeyStatus, { label: string; tone: StatusTone }> = {
    active: { label: 'Activa', tone: 'success' },
    inactive: { label: 'Inactiva', tone: 'neutral' },
    expired: { label: 'Expirada', tone: 'warning' },
    revoked: { label: 'Revocada', tone: 'danger' },
}

export const ENVIRONMENT_META: Record<KeyEnvironment, { label: string; tone: StatusTone }> = {
    production: { label: 'Producción', tone: 'danger' },
    staging: { label: 'Staging', tone: 'warning' },
    development: { label: 'Desarrollo', tone: 'info' },
}

export const ENVIRONMENTS = Object.keys(ENVIRONMENT_META) as KeyEnvironment[]

export const AUDIT_META: Record<ApiKeyAuditAction, { label: string; tone: StatusTone }> = {
    created: { label: 'Generada', tone: 'success' },
    registered: { label: 'Registrada', tone: 'success' },
    updated: { label: 'Editada', tone: 'info' },
    activated: { label: 'Activada', tone: 'success' },
    deactivated: { label: 'Desactivada', tone: 'neutral' },
    regenerated: { label: 'Rotada', tone: 'brand' },
    revoked: { label: 'Revocada', tone: 'danger' },
    copied: { label: 'Copiada', tone: 'neutral' },
}

/** Keys expiring within this many days are highlighted. */
export const EXPIRY_WARNING_DAYS = 30

export const EXPIRY_PRESETS = [
    { value: '30', label: '30 días' },
    { value: '90', label: '90 días' },
    { value: '180', label: '6 meses' },
    { value: '365', label: '1 año' },
    { value: 'never', label: 'Sin expiración' },
    { value: 'custom', label: 'Fecha personalizada' },
] as const

export type ExpiryPreset = (typeof EXPIRY_PRESETS)[number]['value']

/** ISO date for a preset or a custom yyyy-mm-dd value (end of that day, local time). */
export function resolveExpiry(preset: ExpiryPreset, customDate: string, now = Date.now()): string | null {
    if (preset === 'never') return null
    if (preset === 'custom') {
        if (!customDate) return null
        const [year, month, day] = customDate.split('-').map(Number)
        return new Date(year, month - 1, day, 23, 59, 59).toISOString()
    }
    return new Date(now + Number(preset) * 24 * 60 * 60 * 1000).toISOString()
}

/** yyyy-mm-dd of an ISO date in local time, for <input type="date">. */
export function toDateInputValue(iso: string | null) {
    if (!iso) return ''
    const date = new Date(iso)
    const pad = (value: number) => String(value).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

const numberFormatter = new Intl.NumberFormat('es')
export const formatCount = (value: number) => numberFormatter.format(value)
