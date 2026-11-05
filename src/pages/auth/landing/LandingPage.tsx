import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import BrandMark from '../../../components/common/brand/BrandMark'
import ModuleIcon from '../../../components/common/modules/ModuleIcon'
import ButtonComponent from '../../../components/ui/buttons/ButtonComponent'
import { appConfig } from '../../../config/app.config'
import { ArrowRightIcon, MoonIcon, SunIcon } from '../../../icons/icons'
import { MODULE_CATEGORIES } from '../../../navigation/modules'
import { SIGN_IN_SECTION_ID as SIGN_IN_SECTION } from '../../../navigation/navigation'
import LoginForm from '../login/LoginForm'
import type { LoginCredentials } from '../login/LoginForm'

type LandingPageProps = {
    onLogin: (credentials: LoginCredentials) => Promise<void> | void
    isDarkMode: boolean
    onToggleTheme: () => void
}

// What the platform holds, straight from the navigation registry (no invented figures)
const SHOWCASE = MODULE_CATEGORIES.filter((category) => category.catalog !== false).map((category) => ({
    name: category.name,
    modules: category.modules.slice(0, 5),
}))

/**
 * Public entry of the template: what the platform is, the modules it holds
 * and, as one section of the page, the sign-in form.
 */
export default function LandingPage({ onLogin, isDarkMode, onToggleTheme }: LandingPageProps) {
    const { hash } = useLocation()

    // Arriving at /#ingresar (from /login or a protected link) goes straight to the form
    useEffect(() => {
        if (hash !== `#${SIGN_IN_SECTION}`) return
        document.getElementById(SIGN_IN_SECTION)?.scrollIntoView({ block: 'start' })
        document.getElementById('login-email')?.focus({ preventScroll: true })
    }, [hash])

    return (
        <div className="min-h-screen bg-canvas text-fg">
            <header className="sticky top-0 z-(--z-sticky) border-b border-line bg-surface/90 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
                    <BrandMark />
                    <div className="flex items-center gap-2">
                        <ButtonComponent
                            variant="ghost"
                            size="icon"
                            onClick={onToggleTheme}
                            aria-label={isDarkMode ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
                            title={isDarkMode ? 'Tema claro' : 'Tema oscuro'}
                        >
                            {isDarkMode ? <SunIcon className="size-4.5" /> : <MoonIcon className="size-4.5" />}
                        </ButtonComponent>
                        <ButtonComponent href={`#${SIGN_IN_SECTION}`}>Ingresar</ButtonComponent>
                    </div>
                </div>
            </header>

            <main>
                {/* What this is */}
                <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-20">
                    <div>
                        <p className="eyebrow">{appConfig.organization}</p>
                        <h1 className="mt-3 font-display text-4xl leading-[1.1] font-semibold tracking-[-0.02em] text-fg sm:text-5xl">
                            Todo tu trabajo diario, en un solo lugar.
                        </h1>
                        <p className="mt-5 max-w-lg text-base leading-7 text-fg-muted">
                            Tareas, procesos, correo, soporte y administración comparten un mismo menú, una misma búsqueda y tus favoritos.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <ButtonComponent href={`#${SIGN_IN_SECTION}`} size="lg" rightIcon={<ArrowRightIcon className="size-4" />}>
                                Ingresar a la plataforma
                            </ButtonComponent>
                        </div>
                    </div>

                    <div
                        className="rounded-2xl bg-brand-solid p-6 text-on-solid shadow-lg dark:bg-[color-mix(in_oklab,var(--color-brand-solid)_38%,var(--color-canvas))] sm:p-8"
                        aria-label="Módulos de la plataforma"
                        role="region"
                    >
                        <div className="space-y-5">
                            {SHOWCASE.map((category) => (
                                <div key={category.name}>
                                    <p className="text-2xs font-semibold uppercase tracking-caps text-on-solid/70">{category.name}</p>
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
                </section>

                {/* Sign in */}
                <section id={SIGN_IN_SECTION} aria-labelledby="sign-in-title" className="scroll-mt-16 border-t border-line bg-surface">
                    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-20">
                        <div>
                            <h2 id="sign-in-title" className="font-display text-3xl font-semibold tracking-[-0.02em] text-fg">
                                Ingresa a tu cuenta
                            </h2>
                            <p className="mt-3 max-w-md text-sm leading-6 text-fg-muted">
                                Usa el correo y la contraseña de tu cuenta de {appConfig.organization}. Al entrar verás tus pendientes del día.
                            </p>
                            <p className="mt-6 max-w-md text-sm leading-6 text-fg-muted">
                                ¿Aún no tienes cuenta? Pide acceso a la persona que administra la plataforma en tu área.
                            </p>
                        </div>
                        <div className="card w-full max-w-md p-6 sm:p-8 lg:justify-self-end">
                            <LoginForm onLogin={onLogin} />
                        </div>
                    </div>
                </section>
            </main>

            <footer className="mx-auto max-w-6xl px-4 py-8 text-xs text-fg-subtle sm:px-6">
                Soporte: {appConfig.support.email} · {appConfig.support.hours}
            </footer>
        </div>
    )
}
