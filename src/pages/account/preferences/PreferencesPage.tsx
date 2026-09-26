import { useShell } from '../../../components/common/layout/shell-context'
import Panel from '../../../components/ui/panel/Panel'
import Switch from '../../../components/ui/switch/Switch'
import { useAccount } from '../../../context/account-context'
import { useTheme } from '../../../context/theme-context'
import type { ThemePreference } from '../../../context/theme-context'
import { MoonIcon, SettingsIcon, SunIcon } from '../../../icons/icons'
import type { NotificationPreferences } from '../../../services/account/account.service'
import { cn } from '../../../utils/cn'

const THEME_OPTIONS: Array<{ value: ThemePreference; label: string; description: string; icon: typeof SunIcon }> = [
    { value: 'light', label: 'Claro', description: 'Fondo claro siempre', icon: SunIcon },
    { value: 'dark', label: 'Oscuro', description: 'Fondo oscuro siempre', icon: MoonIcon },
    { value: 'system', label: 'Sistema', description: 'Sigue la configuración del equipo', icon: SettingsIcon },
]

const NOTIFICATION_OPTIONS: Array<{ key: keyof NotificationPreferences; label: string; description: string }> = [
    { key: 'tickets', label: 'Actualizaciones de tickets', description: 'Cuando soporte responde o cambia el estado de tus tickets.' },
    { key: 'mail', label: 'Correo nuevo', description: 'Aviso de mensajes nuevos en tu bandeja de entrada.' },
    { key: 'security', label: 'Alertas de seguridad', description: 'Inicios de sesión nuevos y cambios en tu cuenta. Recomendado.' },
    { key: 'weeklySummary', label: 'Resumen semanal', description: 'Tu actividad y módulos más usados, cada lunes.' },
]

export default function PreferencesPage() {
    const { preference, setPreference } = useTheme()
    const { isSidebarCollapsed, setSidebarCollapsed } = useShell()
    const { preferences, updatePreferences } = useAccount()

    return (
        <div className="space-y-6">
            <Panel title="Apariencia" description="El tema se guarda en este navegador.">
                <div role="radiogroup" aria-label="Tema" className="grid gap-3 sm:grid-cols-3">
                    {THEME_OPTIONS.map((option) => {
                        const isSelected = preference === option.value
                        return (
                            <button
                                key={option.value}
                                type="button"
                                role="radio"
                                aria-checked={isSelected}
                                onClick={() => setPreference(option.value)}
                                className={cn(
                                    'flex items-start gap-3 rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand/25',
                                    isSelected ? 'border-brand bg-brand-soft' : 'border-line hover:border-line-strong hover:bg-canvas-subtle/60'
                                )}
                            >
                                <option.icon className={cn('mt-0.5 size-4.5 shrink-0', isSelected ? 'text-brand' : 'text-fg-muted')} />
                                <span>
                                    <span className="block text-sm font-medium text-fg">{option.label}</span>
                                    <span className="block text-xs text-fg-muted">{option.description}</span>
                                </span>
                            </button>
                        )
                    })}
                </div>
            </Panel>

            <Panel title="Navegación e inicio">
                <div className="divide-y divide-line">
                    <Switch
                        label="Barra lateral contraída"
                        description="Muestra solo los iconos del menú para ganar espacio. También se cambia con el botón de la barra."
                        checked={isSidebarCollapsed}
                        onChange={setSidebarCollapsed}
                    />
                    <Switch
                        label="Métricas en el inicio"
                        description="Muestra la sección «Tu actividad» con gráficos en la página de inicio."
                        checked={preferences.showHomeMetrics}
                        onChange={(checked) => updatePreferences({ showHomeMetrics: checked })}
                    />
                </div>
            </Panel>

            <Panel title="Notificaciones" description="Elige qué avisos recibes por correo.">
                <div className="divide-y divide-line">
                    {NOTIFICATION_OPTIONS.map((option) => (
                        <Switch
                            key={option.key}
                            label={option.label}
                            description={option.description}
                            checked={preferences.notifications[option.key]}
                            onChange={(checked) =>
                                updatePreferences({ notifications: { ...preferences.notifications, [option.key]: checked } })
                            }
                        />
                    ))}
                </div>
            </Panel>
        </div>
    )
}
