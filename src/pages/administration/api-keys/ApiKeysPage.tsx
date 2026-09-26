import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ModuleHeader from '../../../components/common/page/ModuleHeader'
import PageContainer from '../../../components/common/page/PageContainer'
import ConfirmDialog from '../../../components/common/pop-up/ConfirmDialog'
import ButtonComponent from '../../../components/ui/buttons/ButtonComponent'
import StatTile from '../../../components/ui/charts/StatTile'
import EmptyState from '../../../components/ui/empty-state/EmptyState'
import InputComponent from '../../../components/ui/inputs/InputComponent'
import { FieldLabel } from '../../../components/ui/inputs/field'
import { fieldSelectClass, fieldTextareaClass } from '../../../components/ui/inputs/fieldStyles'
import Panel from '../../../components/ui/panel/Panel'
import { KeyIcon, PlusIcon, ShieldIcon } from '../../../icons/icons'
import { daysUntilExpiry, getKeyStatus, usageSeries } from '../../../services/api-keys/apiKeys.service'
import type { ApiKey, ApiKeyStatus, IssuedKey, KeyEnvironment } from '../../../services/api-keys/apiKeys.service'
import { ENVIRONMENT_META, ENVIRONMENTS, EXPIRY_WARNING_DAYS, formatCount, STATUS_META } from './apiKeyPresentation'
import ApiKeyAuditTrail from './components/ApiKeyAuditTrail'
import ApiKeyDetailDrawer from './components/ApiKeyDetailDrawer'
import ApiKeyFormModal from './components/ApiKeyFormModal'
import type { ApiKeyFormMode } from './components/ApiKeyFormModal'
import ApiKeyTable from './components/ApiKeyTable'
import SecretRevealModal from './components/SecretRevealModal'
import { useApiKeys } from './hooks/useApiKeys'

type FormState = { mode: ApiKeyFormMode; keyId?: string } | null
type PendingAction = { type: 'rotate' | 'revoke'; key: ApiKey } | null

const STATUSES = Object.keys(STATUS_META) as ApiKeyStatus[]

const GUIDELINES = [
    'Una clave por integración y entorno: facilita revocar sin afectar a otros sistemas.',
    'Concede solo los permisos necesarios y evita «Administración total».',
    'Define una expiración y rota las claves de producción al menos cada 90 días.',
    'Guarda las claves en un gestor de secretos, nunca en el código ni en tickets.',
]

/** Administration › API keys: issue, rotate and revoke integration credentials. */
export default function ApiKeysPage() {
    const { keys, audit, isLoading, create, register, update, setActive, regenerate, revoke, recordCopy } = useApiKeys()
    const [now] = useState(() => Date.now())
    const [query, setQuery] = useState('')
    const [environment, setEnvironment] = useState<KeyEnvironment | 'all'>('all')
    const [status, setStatus] = useState<ApiKeyStatus | 'all'>('all')
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [searchParams] = useSearchParams()
    // ?new opens the generate form (quick action from the command palette)
    const [form, setForm] = useState<FormState>(() => (searchParams.has('new') ? { mode: 'generate' } : null))
    // The issued secret lives only in this state and is dropped when the modal closes
    const [issued, setIssued] = useState<{ value: IssuedKey; isRotation: boolean } | null>(null)
    const [pending, setPending] = useState<PendingAction>(null)
    const [revokeReason, setRevokeReason] = useState('')
    const [isConfirming, setIsConfirming] = useState(false)

    const selected = keys.find((key) => key.id === selectedId) ?? null
    const editing = form?.keyId ? keys.find((key) => key.id === form.keyId) : undefined

    const normalizedQuery = query.trim().toLowerCase()
    const filtered = keys.filter((key) => {
        if (environment !== 'all' && key.environment !== environment) return false
        if (status !== 'all' && getKeyStatus(key, now) !== status) return false
        if (!normalizedQuery) return true
        return [key.name, key.description, key.id, key.lastFour, ...key.scopes].some((text) => text.toLowerCase().includes(normalizedQuery))
    })

    const activeCount = keys.filter((key) => getKeyStatus(key, now) === 'active').length
    const expiringSoon = keys.filter((key) => {
        const days = daysUntilExpiry(key, now)
        return getKeyStatus(key, now) === 'active' && days !== null && days <= EXPIRY_WARNING_DAYS
    }).length
    const dailyTotals = Array.from({ length: 30 }, (_, index) => keys.reduce((total, key) => total + usageSeries(key, 30, now)[index].requests, 0))
    const requests30 = dailyTotals.reduce((total, value) => total + value, 0)
    const lastWeek = dailyTotals.slice(-7).reduce((a, b) => a + b, 0)
    const previousWeek = dailyTotals.slice(-14, -7).reduce((a, b) => a + b, 0)

    async function handleFormSubmit(input: Parameters<typeof create>[0], secret: string) {
        if (form?.mode === 'edit' && form.keyId) {
            const { name, description, scopes, expiresAt } = input
            return Boolean(await update(form.keyId, { name, description, scopes, expiresAt }))
        }
        if (form?.mode === 'register') {
            const key = await register(input, secret)
            if (key) setSelectedId(key.id)
            return Boolean(key)
        }
        const result = await create(input)
        if (result) {
            setIssued({ value: result, isRotation: false })
            setSelectedId(result.key.id)
        }
        return Boolean(result)
    }

    async function handleConfirm() {
        if (!pending) return
        setIsConfirming(true)
        if (pending.type === 'rotate') {
            const result = await regenerate(pending.key)
            if (result) setIssued({ value: result, isRotation: true })
        } else {
            await revoke(pending.key, revokeReason)
        }
        setIsConfirming(false)
        setPending(null)
        setRevokeReason('')
    }

    return (
        <PageContainer>
            <ModuleHeader
                eyebrow="Administración"
                title="API Keys"
                description="Credenciales para integrar sistemas externos. Las claves se muestran una sola vez y se almacenan como hash."
                actions={
                    <>
                        <ButtonComponent variant="outline" onClick={() => setForm({ mode: 'register' })}>
                            Registrar existente
                        </ButtonComponent>
                        <ButtonComponent leftIcon={<PlusIcon className="size-4" />} onClick={() => setForm({ mode: 'generate' })}>
                            Generar API key
                        </ButtonComponent>
                    </>
                }
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatTile label="Claves activas" value={formatCount(activeCount)} deltaLabel={`de ${keys.length} registradas`} />
                <StatTile
                    label="Expiran en 30 días"
                    value={formatCount(expiringSoon)}
                    deltaLabel={expiringSoon ? 'Planifica su rotación' : 'Ninguna próxima a vencer'}
                />
                <StatTile
                    label="Solicitudes · 30 días"
                    value={formatCount(requests30)}
                    delta={previousWeek ? (lastWeek - previousWeek) / previousWeek : null}
                    deltaLabel="vs. semana anterior"
                    trend={dailyTotals}
                />
                <StatTile
                    label="Revocadas o expiradas"
                    value={formatCount(keys.filter((key) => ['revoked', 'expired'].includes(getKeyStatus(key, now))).length)}
                    deltaLabel="Sin acceso a la API"
                />
            </div>

            <section className="card overflow-hidden" aria-labelledby="api-keys-list">
                <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-center">
                    <h2 id="api-keys-list" className="sr-only">
                        Listado de API keys
                    </h2>
                    <InputComponent
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Buscar por nombre, permiso o terminación"
                        aria-label="Buscar API keys"
                        showSearchIcon
                        iconPosition="left"
                        containerClassName="lg:max-w-sm"
                    />
                    <div className="flex gap-2 lg:ml-auto">
                        <select
                            aria-label="Filtrar por entorno"
                            className={fieldSelectClass}
                            value={environment}
                            onChange={(event) => setEnvironment(event.target.value as KeyEnvironment | 'all')}
                        >
                            <option value="all">Todos los entornos</option>
                            {ENVIRONMENTS.map((value) => (
                                <option key={value} value={value}>
                                    {ENVIRONMENT_META[value].label}
                                </option>
                            ))}
                        </select>
                        <select
                            aria-label="Filtrar por estado"
                            className={fieldSelectClass}
                            value={status}
                            onChange={(event) => setStatus(event.target.value as ApiKeyStatus | 'all')}
                        >
                            <option value="all">Todos los estados</option>
                            {STATUSES.map((value) => (
                                <option key={value} value={value}>
                                    {STATUS_META[value].label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {isLoading ? (
                    <p className="p-6 text-sm text-fg-muted">Cargando claves…</p>
                ) : filtered.length ? (
                    <ApiKeyTable keys={filtered} now={now} selectedId={selectedId ?? undefined} onSelect={(key) => setSelectedId(key.id)} />
                ) : (
                    <EmptyState
                        icon={<KeyIcon className="size-5" />}
                        title={keys.length ? 'Ninguna clave coincide' : 'Aún no hay API keys'}
                        description={keys.length ? 'Prueba con otro término o quita los filtros.' : 'Genera la primera clave para conectar una integración.'}
                        action={
                            keys.length ? null : (
                                <ButtonComponent leftIcon={<PlusIcon className="size-4" />} onClick={() => setForm({ mode: 'generate' })}>
                                    Generar API key
                                </ButtonComponent>
                            )
                        }
                    />
                )}
            </section>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                <Panel title="Auditoría reciente" description="Acciones sobre las claves de la organización." className="lg:col-span-8">
                    <ApiKeyAuditTrail events={audit} limit={8} />
                </Panel>
                <Panel title="Buenas prácticas" className="lg:col-span-4">
                    <ul className="space-y-3">
                        {GUIDELINES.map((guideline) => (
                            <li key={guideline} className="flex gap-2.5 text-sm text-fg-muted">
                                <ShieldIcon className="mt-0.5 size-4 shrink-0 text-brand" />
                                {guideline}
                            </li>
                        ))}
                    </ul>
                </Panel>
            </div>

            {selected ? (
                <ApiKeyDetailDrawer
                    apiKey={selected}
                    audit={audit}
                    onClose={() => setSelectedId(null)}
                    onEdit={() => setForm({ mode: 'edit', keyId: selected.id })}
                    onRotate={() => setPending({ type: 'rotate', key: selected })}
                    onRevoke={() => setPending({ type: 'revoke', key: selected })}
                    onToggleActive={(active) => void setActive(selected, active)}
                />
            ) : null}

            {form ? (
                <ApiKeyFormModal
                    key={`${form.mode}-${form.keyId ?? 'new'}`}
                    isOpen
                    mode={form.mode}
                    apiKey={editing}
                    onClose={() => setForm(null)}
                    onSubmit={handleFormSubmit}
                />
            ) : null}

            {issued ? (
                <SecretRevealModal
                    issued={issued.value}
                    isRotation={issued.isRotation}
                    onCopied={() => void recordCopy(issued.value.key)}
                    onClose={() => setIssued(null)}
                />
            ) : null}

            <ConfirmDialog
                isOpen={pending?.type === 'rotate'}
                title="Rotar API key"
                description={pending ? `Se emitirá una nueva clave para «${pending.key.name}».` : undefined}
                confirmLabel="Rotar ahora"
                tone="primary"
                isConfirming={isConfirming}
                onConfirm={handleConfirm}
                onCancel={() => setPending(null)}
            >
                <p className="text-fg-muted">
                    La clave actual (…{pending?.key.lastFour}) dejará de funcionar de inmediato. Actualiza la integración con el nuevo valor.
                </p>
            </ConfirmDialog>

            <ConfirmDialog
                isOpen={pending?.type === 'revoke'}
                title="Revocar API key"
                description={pending ? `«${pending.key.name}» dejará de funcionar de forma permanente.` : undefined}
                confirmLabel="Revocar clave"
                isConfirming={isConfirming}
                onConfirm={handleConfirm}
                onCancel={() => {
                    setPending(null)
                    setRevokeReason('')
                }}
            >
                <FieldLabel htmlFor="revoke-reason">Motivo (queda en la auditoría)</FieldLabel>
                <textarea
                    id="revoke-reason"
                    rows={2}
                    className={fieldTextareaClass}
                    value={revokeReason}
                    onChange={(event) => setRevokeReason(event.target.value)}
                    placeholder="p. ej. Integración dada de baja"
                    maxLength={140}
                />
            </ConfirmDialog>
        </PageContainer>
    )
}
