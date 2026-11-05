import { useState } from 'react'
import type { FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { Location } from 'react-router-dom'
import ButtonComponent from '../../../components/ui/buttons/ButtonComponent'
import InputComponent from '../../../components/ui/inputs/InputComponent'
import Alert from '../../../components/ui/alert/Alert'
import { FieldLabel, FieldMessage } from '../../../components/ui/inputs/field'
import { fieldControlClass, fieldSizeClasses } from '../../../components/ui/inputs/fieldStyles'
import { appConfig } from '../../../config/app.config'
import { EyeIcon, EyeOffIcon } from '../../../icons/icons'
import { HOME_PATH } from '../../../navigation/navigation'
import { sanitize } from '../../../services/sanitize'
import { cn } from '../../../utils/cn'

export type LoginCredentials = {
    email: string
    password: string
}

type LoginFormProps = {
    onLogin: (credentials: LoginCredentials) => Promise<void> | void
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Credentials filled by "Usar cuenta de demostración" while the template runs on mock data. */
const DEMO_CREDENTIALS: LoginCredentials = { email: 'demo@example.com', password: 'demo1234' }

function validate(form: LoginCredentials) {
    return {
        email: !form.email ? 'Escribe tu correo.' : EMAIL_PATTERN.test(form.email) ? '' : 'Revisa el correo: falta la @ o el dominio.',
        password: !form.password ? 'Escribe tu contraseña.' : form.password.length >= 6 ? '' : 'La contraseña tiene al menos 6 caracteres.',
    }
}

/** Page the user wanted before being asked to sign in (see ProtectedRoute), or the home. */
function redirectTarget(state: unknown) {
    const from = (state as { from?: Location } | null)?.from
    return from ? `${from.pathname}${from.search}${from.hash}` : HOME_PATH
}

/** Sign-in form. After signing in it opens the page the user was trying to reach. */
export default function LoginForm({ onLogin }: LoginFormProps) {
    const navigate = useNavigate()
    const location = useLocation()
    const [form, setForm] = useState<LoginCredentials>({ email: '', password: '' })
    // Errors appear once a field was left (or on submit), never while typing the first time
    const [touched, setTouched] = useState({ email: false, password: false })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showRecovery, setShowRecovery] = useState(false)
    const [error, setError] = useState('')

    const errors = validate(form)
    const visible = (field: keyof LoginCredentials) => (touched[field] ? errors[field] || undefined : undefined)

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setTouched({ email: true, password: true })
        if (errors.email || errors.password) return

        try {
            setError('')
            setIsSubmitting(true)
            await onLogin(sanitize(form) as LoginCredentials)
            navigate(redirectTarget(location.state), { replace: true })
        } catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : 'No se pudo iniciar sesión. Inténtalo de nuevo.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            {appConfig.mockApi ? (
                <Alert tone="info" title="Modo demostración">
                    Funciona cualquier correo con una contraseña de 6 caracteres o más.{' '}
                    <button
                        type="button"
                        onClick={() => setForm(DEMO_CREDENTIALS)}
                        className="font-medium text-brand underline-offset-2 hover:underline"
                    >
                        Usar cuenta de demostración
                    </button>
                </Alert>
            ) : null}

            <InputComponent
                id="login-email"
                label="Correo electrónico"
                type="email"
                autoComplete="email"
                placeholder="nombre@empresa.com"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                onBlur={() => setTouched((current) => ({ ...current, email: true }))}
                error={visible('email')}
                size="lg"
            />

            <div>
                <FieldLabel htmlFor="login-password">Contraseña</FieldLabel>
                <div className="relative">
                    <input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        value={form.password}
                        onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                        onBlur={() => setTouched((current) => ({ ...current, password: true }))}
                        aria-invalid={Boolean(visible('password'))}
                        aria-describedby={visible('password') ? 'login-password-message' : undefined}
                        className={cn(fieldControlClass(Boolean(visible('password'))), fieldSizeClasses.lg, 'px-3.5 pr-11')}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        className="absolute right-1.5 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-canvas-subtle hover:text-fg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand/25"
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        aria-pressed={showPassword}
                    >
                        {showPassword ? <EyeOffIcon className="size-4.5" /> : <EyeIcon className="size-4.5" />}
                    </button>
                </div>
                <FieldMessage id="login-password-message" error={visible('password')} />
                <button
                    type="button"
                    onClick={() => setShowRecovery((current) => !current)}
                    aria-expanded={showRecovery}
                    className="mt-2 text-sm font-medium text-brand transition-colors hover:text-brand-strong"
                >
                    ¿Olvidaste tu contraseña?
                </button>
            </div>

            {showRecovery ? (
                <Alert tone="info" title="Recuperar el acceso">
                    Escribe a{' '}
                    <a href={`mailto:${appConfig.support.email}?subject=Recuperar%20acceso`} className="font-medium text-brand underline-offset-2 hover:underline">
                        {appConfig.support.email}
                    </a>{' '}
                    desde tu correo institucional y te enviarán un enlace para crear una contraseña nueva.
                </Alert>
            ) : null}

            {error ? <Alert tone="danger">{error}</Alert> : null}

            <ButtonComponent type="submit" fullWidth size="lg" isLoading={isSubmitting} loadingText="Entrando…">
                Entrar
            </ButtonComponent>
        </form>
    )
}
