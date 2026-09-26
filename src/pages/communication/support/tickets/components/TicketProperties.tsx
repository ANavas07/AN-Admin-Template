import type { ReactNode } from 'react'
import Badge from '../../../../../components/ui/badge/Badge'
import CopyButton from '../../../../../components/ui/copy-button/CopyButton'
import { fieldSelectClass } from '../../../../../components/ui/inputs/fieldStyles'
import Panel from '../../../../../components/ui/panel/Panel'
import { RESPONSE_TARGET_HOURS } from '../../../../../services/support/support.service'
import type { Ticket, TicketPriority, TicketStatus } from '../../../../../services/support/support.service'
import { formatDateTime } from '../../../../../utils/format'
import { CATEGORY_META, PRIORITIES, PRIORITY_META, STATUS_META, STATUSES, SUPPORT_AGENTS } from '../../supportPresentation'

type TicketPropertiesProps = {
    ticket: Ticket
    /** Agents manage status, priority and assignment; requesters only see them */
    canManage: boolean
    onStatusChange: (status: TicketStatus) => void
    onPriorityChange: (priority: TicketPriority) => void
    onAssign: (assignee: string) => void
}

function Property({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="space-y-1 py-2.5">
            <dt className="text-xs text-fg-muted">{label}</dt>
            <dd className="text-sm text-fg">{children}</dd>
        </div>
    )
}

export default function TicketProperties({ ticket, canManage, onStatusChange, onPriorityChange, onAssign }: TicketPropertiesProps) {
    const status = STATUS_META[ticket.status]
    const priority = PRIORITY_META[ticket.priority]
    return (
        <Panel title="Detalles">
            <dl className="-mt-2 divide-y divide-line">
                <Property label="Estado">
                    {canManage ? (
                        <select
                            aria-label="Estado"
                            className={fieldSelectClass}
                            value={ticket.status}
                            onChange={(event) => onStatusChange(event.target.value as TicketStatus)}
                        >
                            {STATUSES.map((value) => (
                                <option key={value} value={value}>
                                    {STATUS_META[value].label}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <>
                            <Badge tone={status.tone} dot>
                                {status.label}
                            </Badge>
                            <p className="mt-1 text-xs text-fg-muted">{status.description}</p>
                        </>
                    )}
                </Property>
                <Property label="Prioridad">
                    {canManage ? (
                        <select
                            aria-label="Prioridad"
                            className={fieldSelectClass}
                            value={ticket.priority}
                            onChange={(event) => onPriorityChange(event.target.value as TicketPriority)}
                        >
                            {PRIORITIES.map((value) => (
                                <option key={value} value={value}>
                                    {PRIORITY_META[value].label}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <Badge tone={priority.tone}>{priority.label}</Badge>
                    )}
                    <p className="mt-1 text-xs text-fg-muted">Primera respuesta objetivo: {RESPONSE_TARGET_HOURS[ticket.priority]} h</p>
                </Property>
                <Property label="Asignado a">
                    {canManage ? (
                        <select
                            aria-label="Asignado a"
                            className={fieldSelectClass}
                            value={ticket.assignee ?? ''}
                            onChange={(event) => onAssign(event.target.value)}
                        >
                            <option value="" disabled>
                                Sin asignar
                            </option>
                            {SUPPORT_AGENTS.map((agent) => (
                                <option key={agent} value={agent}>
                                    {agent}
                                </option>
                            ))}
                        </select>
                    ) : (
                        (ticket.assignee ?? 'Pendiente de asignación')
                    )}
                </Property>
                <Property label="Categoría">{CATEGORY_META[ticket.category].label}</Property>
                <Property label="Solicitante">{ticket.requesterName}</Property>
                <Property label="Creado">{formatDateTime(ticket.createdAt)}</Property>
                {ticket.reference ? (
                    <Property label="Referencia de error">
                        <span className="flex items-center gap-1">
                            <code className="font-mono text-xs">{ticket.reference}</code>
                            <CopyButton value={ticket.reference} label="Copiar referencia" />
                        </span>
                    </Property>
                ) : null}
            </dl>
        </Panel>
    )
}
