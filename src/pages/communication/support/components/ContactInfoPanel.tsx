import Panel from '../../../../components/ui/panel/Panel'
import { appConfig } from '../../../../config/app.config'
import { ClockIcon, MailIcon, SupportIcon } from '../../../../icons/icons'

/** Support channels from appConfig.support (VITE_SUPPORT_* variables). */
export default function ContactInfoPanel({ className }: { className?: string }) {
    const { email, phone, hours } = appConfig.support
    const channels = [
        { icon: <MailIcon className="size-4" />, label: 'Correo', value: email, href: `mailto:${email}` },
        { icon: <SupportIcon className="size-4" />, label: 'Teléfono', value: phone, href: `tel:${phone.replace(/[^\d+]/g, '')}` },
        { icon: <ClockIcon className="size-4" />, label: 'Horario', value: hours },
    ]
    return (
        <Panel title="Contacto directo" description="Para urgencias fuera de la plataforma." className={className}>
            <ul className="space-y-3">
                {channels.map((channel) => (
                    <li key={channel.label} className="flex items-start gap-3">
                        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-strong">
                            {channel.icon}
                        </span>
                        <span className="min-w-0">
                            <span className="block text-xs text-fg-muted">{channel.label}</span>
                            {channel.href ? (
                                <a href={channel.href} className="block truncate text-sm font-medium text-fg hover:text-brand">
                                    {channel.value}
                                </a>
                            ) : (
                                <span className="block text-sm font-medium text-fg">{channel.value}</span>
                            )}
                        </span>
                    </li>
                ))}
            </ul>
        </Panel>
    )
}
