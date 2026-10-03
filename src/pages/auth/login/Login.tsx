import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import BrandMark from '../../../components/common/brand/BrandMark'
import ModuleIcon from '../../../components/common/modules/ModuleIcon'
import ButtonComponent from '../../../components/ui/buttons/ButtonComponent'
import InputComponent from '../../../components/ui/inputs/InputComponent'
import Alert from '../../../components/ui/alert/Alert'
import { FieldLabel, FieldMessage } from '../../../components/ui/inputs/field'
import { fieldControlClass, fieldSizeClasses } from '../../../components/ui/inputs/fieldStyles'
import { appConfig } from '../../../config/app.config'
import { EyeIcon, EyeOffIcon, MoonIcon, SunIcon } from '../../../icons/icons'
import { MODULE_CATEGORIES } from '../../../navigation/modules'
import { sanitize } from '../../../services/sanitize'
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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// What the platform holds, straight from the navigation registry (no invented figures)
const SHOWCASE = MODULE_CATEGORIES.filter((category) => category.catalog !== false).map((category) => ({
    name: category.name,
    modules: category.modules.slice(0, 5),
}))

function validate(form: LoginCredentials) {
    return {
        email: !form.email ? 'Escribe tu correo.' : EMAIL_PATTERN.test(form.email) ? '' : 'Revisa el correo: falta la @ o el dominio.',
        password: !form.password ? 'Escribe tu contraseña.' : form.password.length >= 6 ? '' : 'La contraseña tiene al menos 6 caracteres.',
    }
}

/** Sign in. The form comes first; the panel beside it shows what the user is about to open. */
export default function Login({ onLogin, isDarkMode, onToggleTheme }: LoginProps) {
    const navigate = useNavigate()
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
            navigate('/dashboard', { replace: true })
        } catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : 'No se pudo iniciar sesión. Inténtalo de nuevo.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main className="min-h-screen bg-canvas text-fg">
            <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
                {/* Sign-in */}
                <section className="flex flex-col px-6 py-6 sm:px-10 sm:py-8">
                    <header className="flex items-center justify-between">
                        <BrandMark size="lg" />
                        <ButtonComponent
                            variant="ghost"
                            size="icon"
                            onClick={onToggleTheme}
                            aria-label={isDarkMode ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
                            title={isDarkMode ? 'Tema claro' : 'Tema oscuro'}
                        >
                            {isDarkMode ? <SunIcon className="size-4.5" /> : <MoonIcon className="size-4.5" />}
                        </ButtonComponent>
                    </header>

                    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
                        <h1 className="font-display text-3xl font-semibold tracking-[-0.02em] text-fg">Inicia sesión</h1>
                        <p className="mt-2 text-sm leading-6 text-fg-muted">Usa el correo y la contraseña de tu cuenta de {appConfig.organization}.</p>

                        <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
                            <InputComponent
                                label="Correo electrónico"
                                type="email"
                                autoComplete="email"
                                autoFocus
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
                            </div>

                            <div className="flex items-center justify-between gap-3 text-sm">
                                <label className="inline-flex items-center gap-2 text-fg-muted">
                                    <input type="checkbox" className="size-4 rounded-sm accent-(--color-brand-solid)" />
                                    Mantener la sesión iniciada
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowRecovery((current) => !current)}
                                    aria-expanded={showRecovery}
                                    className="font-medium text-brand transition-colors hover:text-brand-strong"
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

                        <p className="mt-8 text-sm text-fg-muted">
                            ¿Aún no tienes cuenta? Pide acceso a la persona que administra la plataforma en tu área.
                        </p>
                    </div>

                    <footer className="text-xs text-fg-subtle">
                        Soporte: {appConfig.support.email} · {appConfig.support.hours}
                    </footer>
                </section>

                {/* What is behind the door */}
                <aside className="relative hidden overflow-hidden bg-brand-solid text-on-solid dark:bg-[color-mix(in_oklab,var(--color-brand-solid)_38%,var(--color-canvas))] lg:flex lg:flex-col lg:justify-center lg:px-14" aria-label="Contenido de la plataforma">
                    <div
                        className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] bg-size-[56px_56px] mask-[radial-gradient(ellipse_at_bottom_right,black,transparent_75%)]"
                        aria-hidden="true"
                    />
                    <div className="relative max-w-xl">
                        <p className="font-display text-4xl leading-[1.1] font-semibold tracking-[-0.02em]">Todo tu trabajo diario, en un solo lugar.</p>
                        <p className="mt-4 max-w-md text-base leading-7 text-on-solid/75">
                            Tareas, procesos, correo, soporte y administración comparten un mismo menú, una misma búsqueda y tus favoritos.
                        </p>
                        <div className="mt-10 space-y-6">
                            {SHOWCASE.map((category) => (
                                <div key={category.name}>
                                    <p className="text-2xs font-semibold uppercase tracking-caps text-on-solid/60">{category.name}</p>
                                    <ul className="mt-2 flex flex-wrap gap-2">
                                        {category.modules.map((module) => (
                                            <li key={module.id} className="inline-flex items-center gap-2 rounded-full bg-on-solid/10 px-3 py-1.5 text-sm ring-1 ring-on-solid/15">
                                                <ModuleIcon name={module.icon} className="size-4" />
                                                {module.title}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </main>
    )
}
