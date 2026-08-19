import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ButtonComponent from '../../components/ui/buttons/ButtonComponent'
import InputComponent from '../../components/ui/inputs/InputComponent'
import { sanitize } from '../../services/sanitize'
import { EyeIcon, EyeOffIcon, ShieldIcon, SparkIcon } from '../../icons/icons'

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

    return (
        <main className="min-h-screen bg-(--color-bg) text-(--color-text)">
            <div className="grid min-h-screen lg:grid-cols-[1.15fr_0.85fr]">
                <section className="relative overflow-hidden border-b border-(--color-border) bg-(--color-surface) lg:border-b-0 lg:border-r">
                    <div className="absolute inset-0">
                        <div className="absolute inset-x-0 top-0 h-64 bg-brand-soft/70 blur-3xl" />
                        <div className="absolute -left-10 top-1/3 h-72 w-72 rounded-full bg-highlight-soft/60 blur-3xl" />
                        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />
                        <div className="absolute inset-0 opacity-40 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-size-[56px_56px]" />
                    </div>

                    <div className="relative flex min-h-full flex-col justify-between px-6 py-6 sm:px-10 sm:py-8 lg:px-12 lg:py-10">
                        <div className="flex items-center justify-between">
                            <div className="inline-flex items-center gap-3">
                                <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-brand text-lg font-bold text-white shadow-sm">
                                    SGC
                                </span>
                                <div>
                                    <p className="text-sm font-semibold tracking-[0.08em] text-(--color-text-muted)">
                                        Sistema de Gestion Centralizada
                                    </p>
                                    <h1 className="text-lg font-bold text-(--color-text)">
                                        Panel administrativo
                                    </h1>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={onToggleTheme}
                                className="inline-flex size-11 items-center justify-center rounded-2xl border border-(--color-border) bg-(--color-bg-soft) text-(--color-text) transition-colors hover:border-brand hover:text-brand"
                                aria-label={isDarkMode ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
                            >
                                <span className="text-lg leading-none" aria-hidden="true">
                                    {isDarkMode ? '☀️' : '🌙'}
                                </span>
                            </button>
                        </div>

                        <div className="mt-10 max-w-2xl lg:mt-0">
                            <div className="inline-flex items-center gap-2 rounded-full border border-(--color-border) bg-(--color-bg-soft) px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-(--color-text-muted)">
                                <SparkIcon className='size-4' />
                                Acceso centralizado
                            </div>

                            <h2 className="mt-6 max-w-xl text-4xl font-bold tracking-tight text-(--color-text) sm:text-5xl">
                                Entra al sistema integrado + completo.
                            </h2>
                            <p className="mt-4 max-w-xl text-base leading-7 text-(--color-text-muted) sm:text-lg">
                                Controla usuarios, tareas, procesos desde una plataforma centralizada y en tiempo real.
                            </p>

                            <div className="mt-8 grid gap-4 sm:grid-cols-3">
                                <article className="rounded-2xl border border-(--color-border) bg-(--color-bg-soft) p-4 shadow-sm">
                                    <p className="text-2xl font-bold text-(--color-text)">24/7</p>
                                    <p className="mt-1 text-sm text-(--color-text-muted)">
                                        Supervisa actividad, incidencias y progreso operativo.
                                    </p>
                                </article>
                                <article className="rounded-2xl border border-(--color-border) bg-(--color-bg-soft) p-4 shadow-sm">
                                    <p className="text-2xl font-bold text-(--color-text)">+10</p>
                                    <p className="mt-1 text-sm text-(--color-text-muted)">
                                        Empresas confian en nuestro productos.
                                    </p>
                                </article>
                                <article className="rounded-2xl border border-(--color-border) bg-(--color-bg-soft) p-4 shadow-sm">
                                    <p className="text-2xl font-bold text-(--color-text)">99.9%</p>
                                    <p className="mt-1 text-sm text-(--color-text-muted)">
                                        Flujo listo para trabajo administrativo continuo.
                                    </p>
                                </article>
                            </div>
                        </div>

                        <div className="mt-10 grid gap-4 sm:grid-cols-2">
                            <article className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
                                        <ShieldIcon className='size-6' />
                                    </span>
                                    <div>
                                        <p className="text-sm font-semibold text-(--color-text)">
                                            Seguridad operativa
                                        </p>
                                        <p className="text-sm text-(--color-text-muted)">
                                            Acceso independiente del resto del sistema y listo para autenticacion real.
                                        </p>
                                    </div>
                                </div>
                            </article>

                            <article className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-sm">
                                <p className="text-sm font-semibold text-(--color-text)">
                                    Recomendaciones
                                </p>
                                <p className="mt-2 text-sm text-(--color-text-muted)">
                                    Si eres un nuevo usuario debes solicitar acceso a tus administradores
                                </p>
                            </article>
                        </div>
                    </div>
                </section>

                <section className="flex items-center justify-center px-4 py-8 sm:px-8 lg:px-10">
                    <div className="w-full max-w-md rounded-3xl border border-(--color-border) bg-(--color-surface) p-6 shadow-xl sm:p-8">
                        <div className="mb-8">
                            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-(--color-text-muted)">
                                Iniciar sesion
                            </p>
                            <h3 className="mt-3 text-3xl font-bold tracking-tight text-(--color-text)">
                                Bienvenido al SGC
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-(--color-text-muted)">
                                Accede a la administracion del sistema con tu cuenta operativa.
                            </p>
                        </div>

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <InputComponent
                                label="Correo electronico"
                                type="email"
                                placeholder="admin@crm-tournaments.com"
                                value={form.email}
                                onChange={(event) =>
                                    setForm((currentForm) => ({
                                        ...currentForm,
                                        email: event.target.value,
                                    }))
                                }
                                error={emailError || undefined}
                                requiredMark
                                fullWidth
                            />

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-(--color-text)">
                                    Contrasena
                                    <span className="ml-1 text-red-500">*</span>
                                </label>

                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={form.password}
                                        onChange={(event) =>
                                            setForm((currentForm) => ({
                                                ...currentForm,
                                                password: event.target.value,
                                            }))
                                        }
                                        placeholder="Ingresa tu contrasena"
                                        className={`h-11 w-full rounded-xl border bg-(--color-surface) px-4 pr-12 text-sm text-(--color-text) placeholder:text-(--color-text-muted) transition-all duration-200 focus:outline-none focus:ring-2 ${passwordError
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                            : 'border-(--color-border) focus:border-highlight focus:ring-highlight/25'
                                            }`}
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((currentValue) => !currentValue)}
                                        className="absolute right-2 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-(--color-text-muted) transition-colors hover:bg-(--color-bg-soft) hover:text-(--color-text)"
                                        aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                                    >
                                        {showPassword ? <EyeOffIcon className='size-5' /> : <EyeIcon className='size-5' />}
                                    </button>
                                </div>

                                {passwordError ? (
                                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                                        {passwordError}
                                    </p>
                                ) : null}
                            </div>

                            {error ? (
                                <div className="rounded-2xl border border-red-500/30 bg-red-500/8 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                                    {error}
                                </div>
                            ) : null}

                            <div className="flex items-center justify-between gap-3 text-sm">
                                <label className="inline-flex items-center gap-2 text-(--color-text-muted)">
                                    <input
                                        type="checkbox"
                                        className="size-4 rounded border-(--color-border) accent-brand"
                                    />
                                    Mantener sesion activa
                                </label>
                                <button
                                    type="button"
                                    className="font-semibold text-brand transition-colors hover:text-highlight"
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
