import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { sileo } from 'sileo'
import ConfirmDialog from '../../../components/common/pop-up/ConfirmDialog'
import Alert from '../../../components/ui/alert/Alert'
import Badge from '../../../components/ui/badge/Badge'
import ButtonComponent from '../../../components/ui/buttons/ButtonComponent'
import InputComponent from '../../../components/ui/inputs/InputComponent'
import Panel from '../../../components/ui/panel/Panel'
import Switch from '../../../components/ui/switch/Switch'
import { toneSolid } from '../../../components/ui/tone'
import { useAccount } from '../../../context/account-context'
import { useWorkspace } from '../../../context/workspace-context'
import { CheckIcon, KeyIcon } from '../../../icons/icons'
import { getModuleById, hasModuleAccess } from '../../../navigation/navigation'
import type { SecurityEventType } from '../../../services/account/account.service'
import { cn } from '../../../utils/cn'
import { formatRelativeTime } from '../../../utils/relativeTime'
import { checkPassword, passwordStrength } from './passwordStrength'

const EVENT_TONES: Record<SecurityEventType, 'success' | 'danger' | 'warning' | 'info' | 'neutral'> = {
    login: 'success',
    login_failed: 'danger',
    password_changed: 'info',
    '2fa_enabled': 'success',
    '2fa_disabled': 'warning',
    session_revoked: 'neutral',
    api_key: 'info',
}

const EMPTY_PASSWORDS = { current: '', next: '', confirm: '' }

export default function SecurityPage() {
    const { role } = useWorkspace()
    const { account, changePassword, setTwoFactor, revokeSessions } = useAccount()
    const [passwords, setPasswords] = useState(EMPTY_PASSWORDS)
    const [passwordError, setPasswordError] = useState('')
    const [isSavingPassword, setIsSavingPassword] = useState(false)
    const [twoFactorTarget, setTwoFactorTarget] = useState<boolean | null>(null)
    const [isUpdating, setIsUpdating] = useState(false)

    const security = account?.security
    const checks = checkPassword(passwords.next)
    const strength = passwordStrength(passwords.next)
    const confirmError = passwords.confirm && passwords.confirm !== passwords.next ? 'Las contraseñas no coinciden.' : undefined
    const canSubmit = passwords.current && checks.every((check) => check.passed) && passwords.confirm === passwords.next
    const apiKeys = getModuleById('api-keys')

    async function handlePasswordSubmit(event: FormEvent) {
        event.preventDefault()
        if (!canSubmit) return
        setIsSavingPassword(true)
        setPasswordError('')
        try {
            await changePassword(passwords.current, passwords.next)
            setPasswords(EMPTY_PASSWORDS)
            sileo.success({ title: 'Contraseña actualizada' })
        } catch (error) {
            setPasswordError(error instanceof Error ? error.message : 'No se pudo cambiar la contraseña.')
        } finally {
            setIsSavingPassword(false)
        }
    }

    async function confirmTwoFactor() {
        if (twoFactorTarget === null) return
        setIsUpdating(true)
        await setTwoFactor(twoFactorTarget)
        setIsUpdating(false)
        setTwoFactorTarget(null)
    }

    const passwordField = (key: keyof typeof EMPTY_PASSWORDS) => ({
        value: passwords[key],
        onChange: (event: { target: { value: string } }) => setPasswords((current) => ({ ...current, [key]: event.target.value })),
    })

    return (
        <div className="space-y-6">
            <Panel
                title="Contraseña"
                description={
                    security?.passwordUpdatedAt ? `Actualizada ${formatRelativeTime(new Date(security.passwordUpdatedAt).getTime())}` : undefined
                }
            >
                <form className="grid gap-4 sm:grid-cols-2" onSubmit={handlePasswordSubmit} noValidate>
                    <InputComponent label="Contraseña actual" type="password" autoComplete="current-password" containerClassName="sm:col-span-2" {...passwordField('current')} />
                    <InputComponent label="Nueva contraseña" type="password" autoComplete="new-password" {...passwordField('next')} />
                    <InputComponent label="Confirmar nueva contraseña" type="password" autoComplete="new-password" error={confirmError} {...passwordField('confirm')} />

                    <div className="sm:col-span-2">
                        <div className="flex items-center gap-3">
                            <div className="grid flex-1 grid-cols-4 gap-1" aria-hidden="true">
                                {[1, 2, 3, 4].map((step) => (
                                    <span key={step} className={cn('h-1 rounded-full', step <= strength.score ? toneSolid[strength.tone] : 'bg-canvas-subtle')} />
                                ))}
                            </div>
                            <span className="w-20 text-right text-xs font-medium text-fg-muted" aria-live="polite">
                                {strength.label}
                            </span>
                        </div>
                        <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
                            {checks.map((check) => (
                                <li key={check.label} className={cn('flex items-center gap-2 text-xs', check.passed ? 'text-success' : 'text-fg-muted')}>
                                    <CheckIcon className={cn('size-3.5', !check.passed && 'opacity-30')} />
                                    {check.label}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {passwordError ? <Alert tone="danger" className="sm:col-span-2">{passwordError}</Alert> : null}
                    <div className="flex justify-end sm:col-span-2">
                        <ButtonComponent type="submit" disabled={!canSubmit} isLoading={isSavingPassword} loadingText="Actualizando…">
                            Cambiar contraseña
                        </ButtonComponent>
                    </div>
                </form>
            </Panel>

            <Panel
                title="Verificación en dos pasos"
                actions={<Badge tone={security?.twoFactorEnabled ? 'success' : 'warning'} dot>{security?.twoFactorEnabled ? 'Activa' : 'Inactiva'}</Badge>}
            >
                <Switch
                    label="Solicitar un código al iniciar sesión"
                    description="Además de tu contraseña, se pedirá un código de tu aplicación de autenticación."
                    checked={Boolean(security?.twoFactorEnabled)}
                    onChange={(checked) => setTwoFactorTarget(checked)}
                    disabled={!security}
                />
            </Panel>

            <Panel
                title="Sesiones activas"
                description="Dispositivos con una sesión abierta en tu cuenta."
                actions={
                    security && security.sessions.length > 1 ? (
                        <ButtonComponent size="sm" variant="outline" onClick={() => revokeSessions()}>
                            Cerrar las demás
                        </ButtonComponent>
                    ) : null
                }
            >
                <ul className="divide-y divide-line">
                    {security?.sessions.map((session) => (
                        <li key={session.id} className="flex items-center justify-between gap-3 py-3">
                            <div className="min-w-0">
                                <p className="flex items-center gap-2 text-sm font-medium text-fg">
                                    {session.device}
                                    {session.current ? <Badge tone="success" size="sm">Esta sesión</Badge> : null}
                                </p>
                                <p className="text-xs text-fg-muted">
                                    {session.location} · activa {formatRelativeTime(new Date(session.lastActiveAt).getTime())}
                                </p>
                            </div>
                            {session.current ? null : (
                                <ButtonComponent size="sm" variant="ghost" onClick={() => revokeSessions(session.id)}>
                                    Cerrar sesión
                                </ButtonComponent>
                            )}
                        </li>
                    ))}
                </ul>
            </Panel>

            <Panel title="Actividad de seguridad" description="Últimos eventos sensibles de tu cuenta.">
                <ol className="space-y-3">
                    {security?.events.slice(0, 8).map((event) => (
                        <li key={event.id} className="flex items-start gap-3 text-sm">
                            <span className={cn('mt-1.5 size-2 shrink-0 rounded-full', toneSolid[EVENT_TONES[event.type]])} aria-hidden="true" />
                            <span className="min-w-0 flex-1 text-fg">{event.description}</span>
                            <time dateTime={event.at} className="shrink-0 text-xs text-fg-muted">
                                {formatRelativeTime(new Date(event.at).getTime())}
                            </time>
                        </li>
                    ))}
                </ol>
            </Panel>

            {apiKeys?.url && hasModuleAccess(apiKeys, role) ? (
                <Link to={apiKeys.url} className="card-interactive flex items-center gap-3 p-4">
                    <span className="inline-flex size-9 items-center justify-center rounded-lg bg-brand-soft text-brand-strong">
                        <KeyIcon className="size-4.5" />
                    </span>
                    <span>
                        <span className="block text-sm font-semibold text-fg">API Keys</span>
                        <span className="block text-xs text-fg-muted">Gestiona las credenciales de integración y su rotación.</span>
                    </span>
                </Link>
            ) : null}

            <ConfirmDialog
                isOpen={twoFactorTarget !== null}
                title={twoFactorTarget ? 'Activar verificación en dos pasos' : 'Desactivar verificación en dos pasos'}
                description={
                    twoFactorTarget
                        ? 'En el próximo inicio de sesión se pedirá un código de tu aplicación de autenticación.'
                        : 'Tu cuenta quedará protegida solo con la contraseña. No se recomienda.'
                }
                confirmLabel={twoFactorTarget ? 'Activar' : 'Desactivar'}
                tone={twoFactorTarget ? 'primary' : 'danger'}
                isConfirming={isUpdating}
                onConfirm={confirmTwoFactor}
                onCancel={() => setTwoFactorTarget(null)}
            />
        </div>
    )
}
