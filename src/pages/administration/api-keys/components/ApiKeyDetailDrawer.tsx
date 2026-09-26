import { useState } from 'react'
import type { ReactNode } from 'react'
import Drawer from '../../../../components/common/pop-up/Drawer'
import Badge from '../../../../components/ui/badge/Badge'
import ButtonComponent from '../../../../components/ui/buttons/ButtonComponent'
import ColumnChart from '../../../../components/ui/charts/ColumnChart'
import CopyButton from '../../../../components/ui/copy-button/CopyButton'
import Switch from '../../../../components/ui/switch/Switch'
import { EditIcon, RefreshIcon, TrashBinIcon } from '../../../../icons/icons'
import { maskKey } from '../../../../services/api-keys/apiKeyCrypto'
import { daysUntilExpiry, getKeyStatus, totalRequests, usageSeries } from '../../../../services/api-keys/apiKeys.service'
import type { ApiKey, ApiKeyAuditEvent } from '../../../../services/api-keys/apiKeys.service'
import { getScope } from '../../../../services/api-keys/scopes'
import { formatDateTime } from '../../../../utils/format'
import { formatRelativeTime } from '../../../../utils/relativeTime'
import { ENVIRONMENT_META, EXPIRY_WARNING_DAYS, formatCount, STATUS_META } from '../apiKeyPresentation'
import ApiKeyAuditTrail from './ApiKeyAuditTrail'

type ApiKeyDetailDrawerProps = {
    apiKey: ApiKey
    audit: ApiKeyAuditEvent[]
    onClose: () => void
    onEdit: () => void
    onRotate: () => void
    onRevoke: () => void
    onToggleActive: (active: boolean) => void
}

const dayFormatter = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' })

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="grid grid-cols-[8.5rem_1fr] gap-3 py-2 text-sm">
            <dt className="text-fg-muted">{label}</dt>
            <dd className="min-w-0 text-fg">{children}</dd>
        </div>
    )
}

export default function ApiKeyDetailDrawer({ apiKey, audit, onClose, onEdit, onRotate, onRevoke, onToggleActive }: ApiKeyDetailDrawerProps) {
    const [now] = useState(() => Date.now())
    const status = getKeyStatus(apiKey, now)
    const days = daysUntilExpiry(apiKey, now)
    const isRevoked = status === 'revoked'
    const series = usageSeries(apiKey, 30, now)
    const requests30 = totalRequests(apiKey)
    const errors30 = series.reduce((total, entry) => total + entry.errors, 0)
    const keyAudit = audit.filter((event) => event.keyId === apiKey.id)

    return (
        <Drawer
            isOpen
            onClose={onClose}
            title={apiKey.name}
            description={apiKey.description || 'Sin descripción'}
            meta={
                <>
                    <Badge tone={STATUS_META[status].tone} dot>
                        {STATUS_META[status].label}
                    </Badge>
                    <Badge tone={ENVIRONMENT_META[apiKey.environment].tone}>{ENVIRONMENT_META[apiKey.environment].label}</Badge>
                    {apiKey.source === 'registered' ? <Badge>Registrada</Badge> : null}
                </>
            }
            footer={
                isRevoked ? (
                    <p className="mr-auto text-xs text-fg-muted">Clave revocada: solo se conserva su historial.</p>
                ) : (
                    <>
                        <button
                            type="button"
                            onClick={onRevoke}
                            className="mr-auto inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium text-danger transition-colors hover:bg-danger-soft focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-danger/30"
                        >
                            <TrashBinIcon className="size-4" />
                            Revocar
                        </button>
                        <ButtonComponent variant="outline" leftIcon={<EditIcon className="size-4" />} onClick={onEdit}>
                            Editar
                        </ButtonComponent>
                        <ButtonComponent variant="outline" leftIcon={<RefreshIcon className="size-4" />} onClick={onRotate}>
                            Rotar
                        </ButtonComponent>
                    </>
                )
            }
        >
            <div className="space-y-6">
                <section aria-labelledby="key-value">
                    <h3 id="key-value" className="eyebrow mb-2">
                        Clave
                    </h3>
                    <div className="flex items-center gap-2 rounded-md border border-line bg-canvas px-3 py-2">
                        <code className="min-w-0 flex-1 truncate font-mono text-sm text-fg">{maskKey(apiKey.prefix, apiKey.lastFour)}</code>
                        <CopyButton value={apiKey.id} label="Copiar ID de la clave" />
                    </div>
                    <p className="mt-1.5 text-xs text-fg-muted">
                        El valor completo no se almacena y no puede recuperarse. Si se perdió, rota la clave.
                    </p>
                </section>

                {!isRevoked ? (
                    <Switch
                        label="Clave habilitada"
                        description={
                            status === 'expired'
                                ? 'Expirada: extiende la fecha desde «Editar» para volver a usarla.'
                                : 'Desactívala temporalmente sin perder su configuración.'
                        }
                        checked={apiKey.status === 'active'}
                        onChange={onToggleActive}
                    />
                ) : null}

                <section aria-labelledby="key-details">
                    <h3 id="key-details" className="eyebrow mb-1">
                        Detalles
                    </h3>
                    <dl className="divide-y divide-line">
                        <DetailRow label="ID">
                            <span className="font-mono text-xs">{apiKey.id}</span>
                        </DetailRow>
                        <DetailRow label="Creada">
                            {formatDateTime(apiKey.createdAt)} · {apiKey.createdBy}
                        </DetailRow>
                        <DetailRow label="Último uso">
                            {apiKey.lastUsedAt ? formatRelativeTime(new Date(apiKey.lastUsedAt).getTime(), now) : 'Nunca'}
                        </DetailRow>
                        <DetailRow label="Última rotación">{apiKey.rotatedAt ? formatDateTime(apiKey.rotatedAt) : 'Nunca'}</DetailRow>
                        <DetailRow label="Expiración">
                            {apiKey.expiresAt ? (
                                <span className={days !== null && days <= EXPIRY_WARNING_DAYS ? 'font-medium text-warning' : undefined}>
                                    {formatDateTime(apiKey.expiresAt)}
                                    {days !== null && days > 0 ? ` · en ${days} días` : days !== null ? ' · expirada' : ''}
                                </span>
                            ) : (
                                'Sin expiración'
                            )}
                        </DetailRow>
                    </dl>
                </section>

                <section aria-labelledby="key-scopes">
                    <h3 id="key-scopes" className="eyebrow mb-2">
                        Permisos ({apiKey.scopes.length})
                    </h3>
                    <ul className="flex flex-wrap gap-1.5">
                        {apiKey.scopes.map((id) => {
                            const scope = getScope(id)
                            return (
                                <li key={id}>
                                    <Badge tone={scope?.sensitive ? 'warning' : 'neutral'} title={scope?.description}>
                                        <span className="font-mono">{id}</span>
                                    </Badge>
                                </li>
                            )
                        })}
                    </ul>
                </section>

                <section aria-labelledby="key-usage">
                    <div className="mb-2 flex items-baseline justify-between gap-3">
                        <h3 id="key-usage" className="eyebrow">
                            Uso · 30 días
                        </h3>
                        <p className="text-xs text-fg-muted">
                            <span className="font-semibold text-fg">{formatCount(requests30)}</span> solicitudes ·{' '}
                            <span className={errors30 ? 'font-semibold text-danger' : 'font-semibold text-fg'}>{formatCount(errors30)}</span> errores
                        </p>
                    </div>
                    <ColumnChart
                        data={series}
                        x={(entry) => dayFormatter.format(new Date(`${entry.day}T12:00:00`))}
                        y={(entry) => entry.requests}
                        seriesLabel="Solicitudes"
                        labelEvery={7}
                        height={160}
                        ariaLabel={`Solicitudes diarias de ${apiKey.name} en los últimos 30 días`}
                    />
                </section>

                <section aria-labelledby="key-audit">
                    <h3 id="key-audit" className="eyebrow mb-1">
                        Auditoría
                    </h3>
                    <ApiKeyAuditTrail events={keyAudit} compact />
                </section>
            </div>
        </Drawer>
    )
}
