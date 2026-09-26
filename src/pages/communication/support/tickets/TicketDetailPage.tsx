import { Link, useParams } from 'react-router-dom'
import Alert from '../../../../components/ui/alert/Alert'
import Badge from '../../../../components/ui/badge/Badge'
import ButtonComponent from '../../../../components/ui/buttons/ButtonComponent'
import EmptyState from '../../../../components/ui/empty-state/EmptyState'
import { ArrowLeftIcon, SupportIcon } from '../../../../icons/icons'
import { useTicket } from '../hooks/useTickets'
import { CATEGORY_META, PRIORITY_META, STATUS_META } from '../supportPresentation'
import TicketComposer from './components/TicketComposer'
import TicketProperties from './components/TicketProperties'
import TicketThread from './components/TicketThread'
import TicketTimeline from './components/TicketTimeline'

/** Support › Ticket: conversation, internal notes, attachments and status tracking. */
export default function TicketDetailPage() {
    const { ticketId } = useParams()
    const { ticket, isLoading, isAgent, addComment, setStatus, setPriority, assign } = useTicket(ticketId)

    if (isLoading) return <p className="text-sm text-fg-muted">Cargando ticket…</p>
    if (!ticket) {
        return (
            <EmptyState
                icon={<SupportIcon className="size-5" />}
                title="Ticket no encontrado"
                description="Puede que el enlace sea incorrecto o que el ticket pertenezca a otra cuenta."
                action={<ButtonComponent to="/support/tickets">Ver mis tickets</ButtonComponent>}
            />
        )
    }

    const isClosed = ticket.status === 'closed'

    return (
        <div className="space-y-5">
            <div>
                <Link to="/support/tickets" className="inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg">
                    <ArrowLeftIcon className="size-4" />
                    Mis tickets
                </Link>
                <p className="mt-3 text-xs font-medium text-fg-subtle">
                    <span className="font-mono">{ticket.number}</span> · {CATEGORY_META[ticket.category].label}
                </p>
                <h2 className="mt-1 text-xl font-semibold text-fg">{ticket.subject}</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                    <Badge tone={STATUS_META[ticket.status].tone} dot>
                        {STATUS_META[ticket.status].label}
                    </Badge>
                    <Badge tone={PRIORITY_META[ticket.priority].tone}>Prioridad {PRIORITY_META[ticket.priority].label.toLowerCase()}</Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="space-y-5 lg:col-span-8">
                    {ticket.status === 'waiting' && !isAgent ? (
                        <Alert tone="warning" title="Soporte espera tu respuesta">
                            Responde abajo para que el ticket vuelva a la cola de atención.
                        </Alert>
                    ) : null}
                    <TicketThread ticket={ticket} showInternal={isAgent} />
                    {isClosed ? (
                        <Alert tone="info">Este ticket está cerrado. Si el problema persiste, crea un ticket nuevo.</Alert>
                    ) : (
                        <TicketComposer canWriteInternal={isAgent} onSubmit={addComment} />
                    )}
                </div>
                <aside className="space-y-4 lg:col-span-4" aria-label="Propiedades del ticket">
                    <TicketProperties
                        ticket={ticket}
                        canManage={isAgent}
                        onStatusChange={(status) => void setStatus(status)}
                        onPriorityChange={(priority) => void setPriority(priority)}
                        onAssign={(assignee) => void assign(assignee)}
                    />
                    <TicketTimeline events={ticket.history} />
                </aside>
            </div>
        </div>
    )
}
