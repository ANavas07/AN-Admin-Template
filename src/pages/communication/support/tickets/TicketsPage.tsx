import { useState } from 'react'
import { Link } from 'react-router-dom'
import ButtonComponent from '../../../../components/ui/buttons/ButtonComponent'
import StatTile from '../../../../components/ui/charts/StatTile'
import EmptyState from '../../../../components/ui/empty-state/EmptyState'
import InputComponent from '../../../../components/ui/inputs/InputComponent'
import { fieldSelectClass } from '../../../../components/ui/inputs/fieldStyles'
import Panel from '../../../../components/ui/panel/Panel'
import SegmentedControl from '../../../../components/ui/segmented/SegmentedControl'
import { BookIcon, PlusIcon, SupportIcon } from '../../../../icons/icons'
import { ARTICLES } from '../../../../services/knowledge-base/articles'
import { normalizeText } from '../../../../utils/text'
import type { TicketCategory, TicketPriority, TicketStatus } from '../../../../services/support/support.service'
import { articlePath } from '../../../help/knowledge-base/articlePath'
import ContactInfoPanel from '../components/ContactInfoPanel'
import { useTickets } from '../hooks/useTickets'
import { ACTIVE_STATUSES, CATEGORIES, CATEGORY_META, PRIORITIES, PRIORITY_META, STATUS_META } from '../supportPresentation'
import TicketRow from './components/TicketRow'

type StatusFilter = 'active' | 'all' | TicketStatus

const POPULAR_ARTICLES = ARTICLES.slice(0, 4)

/** Support › My tickets: history, status tracking and filters. */
export default function TicketsPage() {
    const { tickets, isLoading } = useTickets()
    const [now] = useState(() => Date.now())
    const [query, setQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('active')
    const [priority, setPriority] = useState<TicketPriority | 'all'>('all')
    const [category, setCategory] = useState<TicketCategory | 'all'>('all')

    const count = (status: TicketStatus) => tickets.filter((ticket) => ticket.status === status).length
    const activeCount = tickets.filter((ticket) => ACTIVE_STATUSES.includes(ticket.status)).length

    const normalizedQuery = normalizeText(query.trim())
    const filtered = tickets.filter((ticket) => {
        if (statusFilter === 'active' && !ACTIVE_STATUSES.includes(ticket.status)) return false
        if (statusFilter !== 'active' && statusFilter !== 'all' && ticket.status !== statusFilter) return false
        if (priority !== 'all' && ticket.priority !== priority) return false
        if (category !== 'all' && ticket.category !== category) return false
        return !normalizedQuery || normalizeText(`${ticket.number} ${ticket.subject} ${ticket.description}`).includes(normalizedQuery)
    })

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-8">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <StatTile label="Abiertos" value={String(count('open'))} />
                    <StatTile label="En curso" value={String(count('in_progress'))} />
                    <StatTile label="Esperan tu respuesta" value={String(count('waiting'))} />
                    <StatTile label="Resueltos" value={String(count('resolved') + count('closed'))} />
                </div>

                <section className="card overflow-hidden" aria-labelledby="tickets-heading">
                    <h2 id="tickets-heading" className="sr-only">
                        Mis tickets
                    </h2>
                    <div className="space-y-3 border-b border-line p-4">
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <InputComponent
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Buscar por número o asunto"
                                aria-label="Buscar tickets"
                                showSearchIcon
                                iconPosition="left"
                            />
                            <select
                                aria-label="Filtrar por prioridad"
                                className={fieldSelectClass + ' sm:w-44'}
                                value={priority}
                                onChange={(event) => setPriority(event.target.value as TicketPriority | 'all')}
                            >
                                <option value="all">Toda prioridad</option>
                                {PRIORITIES.map((value) => (
                                    <option key={value} value={value}>
                                        {PRIORITY_META[value].label}
                                    </option>
                                ))}
                            </select>
                            <select
                                aria-label="Filtrar por categoría"
                                className={fieldSelectClass + ' sm:w-52'}
                                value={category}
                                onChange={(event) => setCategory(event.target.value as TicketCategory | 'all')}
                            >
                                <option value="all">Todas las categorías</option>
                                {CATEGORIES.map((value) => (
                                    <option key={value} value={value}>
                                        {CATEGORY_META[value].label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <SegmentedControl
                            label="Estado"
                            size="sm"
                            value={statusFilter}
                            onChange={setStatusFilter}
                            options={[
                                { value: 'active', label: 'Activos', count: activeCount },
                                { value: 'all', label: 'Todos', count: tickets.length },
                                { value: 'resolved', label: STATUS_META.resolved.label, count: count('resolved') },
                                { value: 'closed', label: STATUS_META.closed.label, count: count('closed') },
                            ]}
                        />
                    </div>

                    {isLoading ? (
                        <p className="p-6 text-sm text-fg-muted">Cargando tickets…</p>
                    ) : filtered.length ? (
                        <ul className="divide-y divide-line">
                            {filtered.map((ticket) => (
                                <TicketRow key={ticket.id} ticket={ticket} now={now} />
                            ))}
                        </ul>
                    ) : (
                        <EmptyState
                            icon={<SupportIcon className="size-5" />}
                            title={tickets.length ? 'Ningún ticket coincide' : 'Aún no tienes tickets'}
                            description={tickets.length ? 'Cambia los filtros o la búsqueda.' : 'Cuando necesites ayuda, crea un ticket y sigue aquí su estado.'}
                            action={
                                <ButtonComponent to="/support/new" leftIcon={<PlusIcon className="size-4" />}>
                                    Nuevo ticket
                                </ButtonComponent>
                            }
                        />
                    )}
                </section>
            </div>

            <aside className="space-y-4 lg:col-span-4" aria-label="Ayuda">
                <Panel title="Respuestas rápidas" description="Artículos más consultados.">
                    <ul className="space-y-1">
                        {POPULAR_ARTICLES.map((article) => (
                            <li key={article.slug}>
                                <Link
                                    to={articlePath(article.slug)}
                                    className="flex items-start gap-2.5 rounded-md px-2 py-1.5 text-sm text-fg transition-colors hover:bg-canvas-subtle"
                                >
                                    <BookIcon className="mt-0.5 size-4 shrink-0 text-fg-subtle" />
                                    {article.title}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </Panel>
                <ContactInfoPanel />
            </aside>
        </div>
    )
}
