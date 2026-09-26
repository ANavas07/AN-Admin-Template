import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ButtonComponent from '../../../components/ui/buttons/ButtonComponent'
import InputComponent from '../../../components/ui/inputs/InputComponent'
import { sanitize } from '../../../services/sanitize'
import Alert from '../../../components/ui/alert/Alert'
import { FieldLabel, FieldMessage } from '../../../components/ui/inputs/field'
import { fieldControlClass, fieldSizeClasses } from '../../../components/ui/inputs/fieldStyles'
import { EyeIcon, EyeOffIcon, MoonIcon, ShieldIcon, SunIcon, UserIcon } from '../../../icons/icons'
import { cn } from '../../../utils/cn'

type LoginCredentials = {
    email: string
    password: string
}

type LoginProps = {
    onLogin: (credentials: LoginCredentials) => Promise<void> | void
    isDarkMode: boolean
    onToggleTheme: () => void
}

export default function Login({ onLogin, isDarkMode, onToggleTheme }: LoginProps) {
    const navigate = useNavigate()
    const [form, setForm] = useState<LoginCredentials>({
        email: '',
        password: '',
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')

    const emailError = useMemo(() => {
        if (!form.email) return ''
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
        return isValid ? '' : 'Ingresa un correo valido.'
    }, [form.email])

    const passwordError = useMemo(() => {
        if (!form.password) return ''
        return form.password.length >= 6 ? '' : 'La contrasena debe tener al menos 6 caracteres.'
    }, [form.password])

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const payload = sanitize(form) as LoginCredentials

        if (!payload.email || !payload.password) {
            setError('Completa tu correo y contrasena para continuar.')
            return
        }

        if (emailError || passwordError) {
            setError('Revisa los datos del formulario antes de ingresar.')
            return
        }

        try {
            setError('')
            setIsSubmitting(true)
            await onLogin(payload)
            navigate('/dashboard', { replace: true })
        } catch (submitError) {
            const message =
                submitError instanceof Error
                    ? submitError.message
                    : 'No pudimos iniciar sesion. Intenta nuevamente.'
            setError(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const highlights = [
        { value: '24/7', label: 'Supervisa actividad, incidencias y progreso operativo.' },
        { value: '+10', label: 'Empresas confian en nuestro productos.' },
        { value: '99.9%', label: 'Flujo listo para trabajo administrativo continuo.' },
    ]

    return (
        <main className="min-h-screen bg-canvas text-fg">
            <div className="grid min-h-screen lg:grid-cols-[1.15fr_0.85fr]">
                <section className="relative overflow-hidden border-b border-line bg-surface lg:border-b-0 lg:border-r">
                    {/* Blueprint grid, faded towards the edges */}
                    <div
                        className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-line)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-line)_1px,transparent_1px)] bg-size-[48px_48px] opacity-50 mask-[radial-gradient(ellipse_at_top_left,black,transparent_70%)]"
                        aria-hidden="true"
                    />

                    <div className="relative flex min-h-full flex-col justify-between gap-10 px-6 py-6 sm:px-10 sm:py-8 lg:px-12 lg:py-10">
                        <div className="flex items-center justify-between">
                            <div className="inline-flex items-center gap-3">
                                <span className="inline-flex size-10 items-center justify-center rounded-lg bg-brand-solid text-sm font-bold tracking-wide text-on-solid">
                                    SGC
                                </span>
                                <div className="leading-tight">
                                    <p className="text-xs font-medium text-fg-muted">Sistema de Gestion Centralizada</p>
                                    <h1 className="text-base font-semibold text-fg">Panel administrativo</h1>
                                </div>
                            </div>

                            <ButtonComponent
                                variant="ghost"
                                size="icon"
                                onClick={onToggleTheme}
                                aria-label={isDarkMode ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
                            >
                                {isDarkMode ? <SunIcon className="size-4.5" /> : <MoonIcon className="size-4.5" />}
                            </ButtonComponent>
                        </div>

                        <div className="max-w-2xl">
                            <p className="eyebrow inline-flex items-center gap-2 text-brand">
                                <ShieldIcon className="size-4" />
                                Acceso centralizado
                            </p>

                            <h2 className="mt-5 max-w-xl text-4xl font-semibold tracking-tight text-fg sm:text-5xl sm:leading-[1.05]">
                                Entra al sistema integrado + completo.
                            </h2>
                            <p className="mt-4 max-w-xl text-base leading-7 text-fg-muted">
                                Controla usuarios, tareas, procesos desde una plataforma centralizada y en tiempo real.
                            </p>

                            <dl className="mt-10 grid max-w-xl gap-6 border-t border-line pt-6 sm:grid-cols-3">
                                {highlights.map((item) => (
                                    <div key={item.value}>
                                        <dt className="text-2xl font-semibold tabular-nums text-fg">{item.value}</dt>
                                        <dd className="mt-1 text-sm leading-6 text-fg-muted">{item.label}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <article className="card flex items-start gap-3 p-4">
                                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-strong">
                                    <ShieldIcon className="size-5" />
                                </span>
                                <div>
                                    <p className="text-sm font-semibold text-fg">Seguridad operativa</p>
                                    <p className="mt-0.5 text-sm text-fg-muted">
                                        Acceso independiente del resto del sistema y listo para autenticacion real.
                                    </p>
                                </div>
                            </article>

                            <article className="card flex items-start gap-3 p-4">
                                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-canvas-subtle text-fg-muted">
                                    <UserIcon className="size-5" />
                                </span>
                                <div>
                                    <p className="text-sm font-semibold text-fg">Recomendaciones</p>
                                    <p className="mt-0.5 text-sm text-fg-muted">
                                        Si eres un nuevo usuario debes solicitar acceso a tus administradores
                                    </p>
                                </div>
                            </article>
                        </div>
                    </div>
                </section>

                <section className="flex items-center justify-center px-4 py-8 sm:px-8 lg:px-10">
                    <div className="w-full max-w-md rounded-3xl border border-line bg-surface p-6 shadow-lg sm:p-8">
                        <div className="mb-7">
                            <p className="eyebrow">Iniciar sesion</p>
                            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-fg">Bienvenido al SGC</h3>
                            <p className="mt-1.5 text-sm leading-6 text-fg-muted">
                                Accede a la administracion del sistema con tu cuenta operativa.
                            </p>
                        </div>

                        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                            <InputComponent
                                label="Correo electronico"
                                type="email"
                                autoComplete="email"
                                placeholder="admin@crm-tournaments.com"
                                value={form.email}
                                onChange={(event) =>
                                    setForm((currentForm) => ({
                                        ...currentForm,
                                        email: event.target.value,
                                    }))
                                }
                                error={emailError || undefined}
                                size="lg"
                                requiredMark
                                fullWidth
                            />

                            <div>
                                <FieldLabel htmlFor="login-password" required>
                                    Contrasena
                                </FieldLabel>

                                <div className="relative">
                                    <input
                                        id="login-password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        value={form.password}
                                        onChange={(event) =>
                                            setForm((currentForm) => ({
                                                ...currentForm,
                                                password: event.target.value,
                                            }))
                                        }
                                        placeholder="Ingresa tu contrasena"
                                        aria-invalid={Boolean(passwordError)}
                                        aria-describedby={passwordError ? 'login-password-message' : undefined}
                                        className={cn(fieldControlClass(Boolean(passwordError)), fieldSizeClasses.lg, 'px-3.5 pr-11')}
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((currentValue) => !currentValue)}
                                        className="absolute right-1.5 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-canvas-subtle hover:text-fg"
                                        aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                                    >
                                        {showPassword ? <EyeOffIcon className="size-4.5" /> : <EyeIcon className="size-4.5" />}
                                    </button>
                                </div>

                                <FieldMessage id="login-password-message" error={passwordError || undefined} />
                            </div>

                            {error ? <Alert tone="danger">{error}</Alert> : null}

                            <div className="flex items-center justify-between gap-3 text-sm">
                                <label className="inline-flex items-center gap-2 text-fg-muted">
                                    <input type="checkbox" className="size-4 rounded-sm border-line accent-brand-solid" />
                                    Mantener sesion activa
                                </label>
                                <button
                                    type="button"
                                    className="font-medium text-brand transition-colors hover:text-brand-strong"
                                >
                                    Recuperar acceso
                                </button>
                            </div>

                            <ButtonComponent
                                type="submit"
                                fullWidth
                                size="lg"
                                isLoading={isSubmitting}
                                loadingText="Ingresando..."
                            >
                                Entrar al sistema
                            </ButtonComponent>
                        </form>
                    </div>
                </section>
            </div>
        </main>
    )
}
