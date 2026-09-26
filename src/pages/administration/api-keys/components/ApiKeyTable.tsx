import Badge from '../../../../components/ui/badge/Badge'
import { maskKey } from '../../../../services/api-keys/apiKeyCrypto'
import { daysUntilExpiry, getKeyStatus } from '../../../../services/api-keys/apiKeys.service'
import type { ApiKey } from '../../../../services/api-keys/apiKeys.service'
import { cn } from '../../../../utils/cn'
import { formatDate } from '../../../../utils/format'
import { formatRelativeTime } from '../../../../utils/relativeTime'
import { ENVIRONMENT_META, EXPIRY_WARNING_DAYS, STATUS_META } from '../apiKeyPresentation'

type ApiKeyTableProps = {
    keys: ApiKey[]
    now: number
    selectedId?: string
    onSelect: (key: ApiKey) => void
}

const headerClass = 'px-4 py-2.5 text-left text-2xs font-semibold uppercase tracking-caps text-fg-muted'
const cellClass = 'px-4 py-3 align-top'

function Expiry({ apiKey, now }: { apiKey: ApiKey; now: number }) {
    const days = daysUntilExpiry(apiKey, now)
    if (days === null) return <span className="text-fg-muted">Sin expiración</span>
    const isSoon = days > 0 && days <= EXPIRY_WARNING_DAYS
    return (
        <span className={cn(days <= 0 ? 'text-danger' : isSoon ? 'font-medium text-warning' : 'text-fg')}>
            {formatDate(apiKey.expiresAt!)}
            <span className="block text-2xs text-fg-muted">{days <= 0 ? 'Expirada' : `En ${days} días`}</span>
        </span>
    )
}

/** Key list with masked values. Selecting a row opens its detail. */
export default function ApiKeyTable({ keys, now, selectedId, onSelect }: ApiKeyTableProps) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-3xl text-sm">
                <thead className="border-b border-line bg-surface-muted">
                    <tr>
                        <th scope="col" className={headerClass}>Nombre</th>
                        <th scope="col" className={headerClass}>Clave</th>
                        <th scope="col" className={headerClass}>Entorno</th>
                        <th scope="col" className={headerClass}>Estado</th>
                        <th scope="col" className={headerClass}>Permisos</th>
                        <th scope="col" className={headerClass}>Creación</th>
                        <th scope="col" className={headerClass}>Último uso</th>
                        <th scope="col" className={headerClass}>Expiración</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-line">
                    {keys.map((apiKey) => {
                        const status = getKeyStatus(apiKey, now)
                        return (
                            <tr
                                key={apiKey.id}
                                onClick={() => onSelect(apiKey)}
                                className={cn(
                                    'cursor-pointer transition-colors hover:bg-canvas-subtle/60',
                                    selectedId === apiKey.id && 'bg-brand-soft/50',
                                    status === 'revoked' && 'text-fg-muted'
                                )}
                            >
                                <td className={cellClass}>
                                    {/* The button makes the row reachable by keyboard; the row click is a shortcut */}
                                    <button
                                        type="button"
                                        onClick={(event) => {
                                            event.stopPropagation()
                                            onSelect(apiKey)
                                        }}
                                        className="text-left font-medium text-fg hover:text-brand focus-visible:outline-none focus-visible:underline"
                                    >
                                        {apiKey.name}
                                    </button>
                                    {apiKey.description ? <p className="line-clamp-1 max-w-64 text-xs text-fg-muted">{apiKey.description}</p> : null}
                                </td>
                                <td className={cellClass}>
                                    <code className="font-mono text-xs text-fg-muted">{maskKey(apiKey.prefix, apiKey.lastFour)}</code>
                                </td>
                                <td className={cellClass}>
                                    <Badge tone={ENVIRONMENT_META[apiKey.environment].tone} size="sm">
                                        {ENVIRONMENT_META[apiKey.environment].label}
                                    </Badge>
                                </td>
                                <td className={cellClass}>
                                    <Badge tone={STATUS_META[status].tone} size="sm" dot>
                                        {STATUS_META[status].label}
                                    </Badge>
                                </td>
                                <td className={cn(cellClass, 'tabular-nums')} title={apiKey.scopes.join(', ')}>
                                    {apiKey.scopes.includes('admin:full') ? <Badge tone="warning" size="sm">Total</Badge> : apiKey.scopes.length}
                                </td>
                                <td className={cn(cellClass, 'whitespace-nowrap')}>{formatDate(apiKey.createdAt)}</td>
                                <td className={cn(cellClass, 'whitespace-nowrap text-fg-muted')}>
                                    {apiKey.lastUsedAt ? formatRelativeTime(new Date(apiKey.lastUsedAt).getTime(), now) : 'Nunca'}
                                </td>
                                <td className={cn(cellClass, 'whitespace-nowrap')}>
                                    <Expiry apiKey={apiKey} now={now} />
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}
