import { appConfig } from '../../config/app.config'
import { useTheme } from '../../context/theme-context'
import { MoonIcon, SunIcon, WrenchIcon } from '../../icons/icons'
import { formatRelativeTime } from '../../utils/relativeTime'
import ButtonComponent from '../../components/ui/buttons/ButtonComponent'
import StatusPageLayout from './StatusPageLayout'

type MaintenanceInfo = {
    message?: string
    /** ISO 8601 estimated end */
    until?: string
    statusPageUrl?: string
}

const untilFormatter = new Intl.DateTimeFormat('es', { dateStyle: 'full', timeStyle: 'short' })

/** Shown for every route while VITE_MAINTENANCE_MODE is on (and at /maintenance as a preview). */
export default function MaintenancePage({ info = appConfig.maintenance }: { info?: MaintenanceInfo }) {
    const { isDarkMode, toggleTheme } = useTheme()
    const until = info.until ? new Date(info.until) : null
    const hasValidUntil = until !== null && !Number.isNaN(until.getTime())

    return (
        <div className="relative">
            <div className="absolute right-4 top-4">
                <ButtonComponent
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    aria-label={isDarkMode ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
                >
                    {isDarkMode ? <SunIcon className="size-4.5" /> : <MoonIcon className="size-4.5" />}
                </ButtonComponent>
            </div>
            <StatusPageLayout
                fullScreen
                code={`${appConfig.name} · Mantenimiento`}
                title="Estamos mejorando la plataforma"
                description="El sistema no está disponible temporalmente mientras aplicamos una actualización programada. Tus datos están a salvo; vuelve a intentarlo en unos minutos."
                icon={<WrenchIcon className="size-6" />}
                tone="info"
                actions={
                    info.statusPageUrl ? (
                        <ButtonComponent variant="outline" href={info.statusPageUrl}>
                            Ver estado del servicio
                        </ButtonComponent>
                    ) : undefined
                }
            >
                {info.message || hasValidUntil ? (
                    <dl className="space-y-3 rounded-lg border border-line bg-surface-muted p-4 text-sm">
                        {info.message ? (
                            <div>
                                <dt className="text-xs text-fg-muted">Detalle</dt>
                                <dd className="mt-0.5 text-fg">{info.message}</dd>
                            </div>
                        ) : null}
                        {hasValidUntil ? (
                            <div>
                                <dt className="text-xs text-fg-muted">Disponible nuevamente</dt>
                                <dd className="mt-0.5 font-medium text-fg first-letter:uppercase">
                                    {untilFormatter.format(until)} ({formatRelativeTime(until.getTime())})
                                </dd>
                            </div>
                        ) : null}
                    </dl>
                ) : null}
                <p className="mt-4 text-xs text-fg-muted">
                    ¿Es urgente? Escribe a{' '}
                    <a href={`mailto:${appConfig.support.email}`} className="font-medium text-brand hover:underline">
                        {appConfig.support.email}
                    </a>
                </p>
            </StatusPageLayout>
        </div>
    )
}
