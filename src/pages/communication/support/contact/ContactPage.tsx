import ButtonComponent from '../../../../components/ui/buttons/ButtonComponent'
import Badge from '../../../../components/ui/badge/Badge'
import Panel from '../../../../components/ui/panel/Panel'
import { appConfig } from '../../../../config/app.config'
import { ActivityIcon, PlusIcon } from '../../../../icons/icons'
import { RESPONSE_TARGET_HOURS } from '../../../../services/support/support.service'
import ContactInfoPanel from '../components/ContactInfoPanel'
import { PRIORITIES, PRIORITY_META } from '../supportPresentation'

const PRIORITY_EXAMPLES: Record<(typeof PRIORITIES)[number], string> = {
    urgent: 'La plataforma no está disponible para toda la organización',
    high: 'Un módulo crítico falla y no hay alternativa',
    medium: 'Un error con alternativa temporal o una solicitud con fecha',
    low: 'Consultas, mejoras y solicitudes sin urgencia',
}

/** Support › Contact: channels, response times and escalation. */
export default function ContactPage() {
    const statusPageUrl = appConfig.maintenance.statusPageUrl
    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-8">
                <Panel title="Tiempos de respuesta" description="Objetivo de primera respuesta en horario hábil, según la prioridad del ticket.">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-md text-sm">
                            <thead>
                                <tr className="border-b border-line text-left text-2xs uppercase tracking-caps text-fg-muted">
                                    <th scope="col" className="py-2 pr-4 font-semibold">Prioridad</th>
                                    <th scope="col" className="py-2 pr-4 font-semibold">Cuándo usarla</th>
                                    <th scope="col" className="py-2 text-right font-semibold">Respuesta</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-line">
                                {PRIORITIES.slice().reverse().map((priority) => (
                                    <tr key={priority}>
                                        <td className="py-3 pr-4">
                                            <Badge tone={PRIORITY_META[priority].tone}>{PRIORITY_META[priority].label}</Badge>
                                        </td>
                                        <td className="py-3 pr-4 text-fg-muted">{PRIORITY_EXAMPLES[priority]}</td>
                                        <td className="py-3 text-right font-medium tabular-nums text-fg">{RESPONSE_TARGET_HOURS[priority]} h</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Panel>

                <Panel title="Antes de escribirnos">
                    <ol className="grid gap-4 sm:grid-cols-3">
                        {[
                            ['Busca en la base de conocimiento', 'Muchas dudas de uso ya tienen una guía paso a paso.'],
                            ['Incluye la referencia de error', 'Las pantallas de error muestran un código ERR-… que acelera el diagnóstico.'],
                            ['Adjunta capturas', 'Una imagen del error y los pasos previos evitan idas y vueltas.'],
                        ].map(([title, text], index) => (
                            <li key={title} className="rounded-lg border border-line p-4">
                                <span className="inline-flex size-6 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand-strong">
                                    {index + 1}
                                </span>
                                <p className="mt-2 text-sm font-medium text-fg">{title}</p>
                                <p className="mt-1 text-xs text-fg-muted">{text}</p>
                            </li>
                        ))}
                    </ol>
                </Panel>
            </div>

            <aside className="space-y-4 lg:col-span-4" aria-label="Canales de contacto">
                <ContactInfoPanel />
                <Panel title="Canal recomendado" description="Los tickets quedan registrados y permiten seguir el estado.">
                    <ButtonComponent to="/support/new" fullWidth leftIcon={<PlusIcon className="size-4" />}>
                        Crear un ticket
                    </ButtonComponent>
                    {statusPageUrl ? (
                        <a
                            href={statusPageUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="mt-2 inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-line bg-surface text-sm font-medium text-fg shadow-xs transition-colors hover:border-line-strong hover:bg-canvas-subtle/60"
                        >
                            <ActivityIcon className="size-4" />
                            Estado del servicio
                        </a>
                    ) : null}
                </Panel>
            </aside>
        </div>
    )
}
