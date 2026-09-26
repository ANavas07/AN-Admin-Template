// Support tickets of the signed-in user. Mock persistence with the async API a
// helpdesk backend would expose. Internal comments are agent-only notes: the
// UI hides them from requesters (a real backend must filter them server-side).
import type { Attachment } from '../../utils/attachments'
import { createId, createLocalStore, isRecord, parseArray, simulateLatency } from '../storage/localStore'

export type TicketStatus = 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TicketCategory = 'incident' | 'access' | 'request' | 'integration' | 'question'

export type TicketComment = {
    id: string
    author: string
    /** agent: support staff; requester: the person who opened the ticket */
    authorRole: 'agent' | 'requester'
    body: string
    internal: boolean
    attachments: Attachment[]
    at: string
}

export type TicketEvent = {
    id: string
    type: 'created' | 'status' | 'priority' | 'assigned'
    /** New value (status, priority or assignee) */
    value: string
    actor: string
    at: string
}

export type Ticket = {
    id: string
    /** Human-friendly number: TKT-1042 */
    number: string
    subject: string
    description: string
    category: TicketCategory
    priority: TicketPriority
    status: TicketStatus
    requesterId: string
    requesterName: string
    assignee: string | null
    /** Error reference from a 500 page, when the ticket comes from there */
    reference?: string
    attachments: Attachment[]
    comments: TicketComment[]
    history: TicketEvent[]
    createdAt: string
    updatedAt: string
}

export type TicketInput = {
    subject: string
    description: string
    category: TicketCategory
    priority: TicketPriority
    reference?: string
    attachments: Attachment[]
}

export type CommentInput = { body: string; internal: boolean; attachments: Attachment[] }

type Requester = { id: string; name: string }

type SupportState = { version: 1; nextNumber: number; tickets: Ticket[] }

const HOUR_MS = 60 * 60 * 1000

/** Target first-response time per priority, in hours (shown on the contact page and tickets). */
export const RESPONSE_TARGET_HOURS: Record<TicketPriority, number> = { urgent: 1, high: 4, medium: 8, low: 24 }

function seed(scope: string): SupportState {
    const now = Date.now()
    const iso = (hoursAgo: number) => new Date(now - hoursAgo * HOUR_MS).toISOString()
    const requester = { requesterId: scope, requesterName: 'Tú' }
    const event = (type: TicketEvent['type'], value: string, actor: string, hoursAgo: number): TicketEvent => ({
        id: createId('tev'),
        type,
        value,
        actor,
        at: iso(hoursAgo),
    })
    const comment = (authorRole: TicketComment['authorRole'], author: string, body: string, hoursAgo: number, internal = false): TicketComment => ({
        id: createId('tcm'),
        author,
        authorRole,
        body,
        internal,
        attachments: [],
        at: iso(hoursAgo),
    })

    const tickets: Ticket[] = [
        {
            ...requester,
            id: 'tkt-1044',
            number: 'TKT-1044',
            subject: 'No puedo exportar el diagrama de procesos a PDF',
            description: 'Al pulsar «Exportar» en el diseñador de procesos la descarga no inicia. Probé en Chrome y Edge.',
            category: 'incident',
            priority: 'high',
            status: 'in_progress',
            assignee: 'María Torres',
            attachments: [],
            comments: [
                comment('agent', 'María Torres', 'Gracias por el reporte. ¿Puedes indicarnos el nombre del proceso y la hora aproximada del intento?', 5),
                comment('requester', 'Tú', 'Proceso «Aprobación de compras», hoy cerca de las 9:10.', 4),
                comment('agent', 'María Torres', 'Reproducido en staging. El exportador falla con diagramas de más de 40 nodos. Escalo a desarrollo.', 3, true),
            ],
            history: [event('created', 'open', 'Tú', 6), event('assigned', 'María Torres', 'Sistema', 5.5), event('status', 'in_progress', 'María Torres', 5)],
            createdAt: iso(6),
            updatedAt: iso(3),
        },
        {
            ...requester,
            id: 'tkt-1043',
            number: 'TKT-1043',
            subject: 'Acceso al módulo de planificación para el equipo de finanzas',
            description: 'Necesitamos que tres analistas de finanzas puedan ver la planificación trimestral.',
            category: 'access',
            priority: 'medium',
            status: 'waiting',
            assignee: 'Carlos Rivas',
            attachments: [],
            comments: [comment('agent', 'Carlos Rivas', 'Necesitamos la aprobación del responsable del módulo. ¿Nos confirmas quién la otorga?', 20)],
            history: [event('created', 'open', 'Tú', 26), event('assigned', 'Carlos Rivas', 'Sistema', 25), event('status', 'waiting', 'Carlos Rivas', 20)],
            createdAt: iso(26),
            updatedAt: iso(20),
        },
        {
            ...requester,
            id: 'tkt-1041',
            number: 'TKT-1041',
            subject: 'Rotación de la API key de la integración ERP',
            description: 'Queremos programar la rotación trimestral sin interrumpir la sincronización nocturna.',
            category: 'integration',
            priority: 'low',
            status: 'resolved',
            assignee: 'Carlos Rivas',
            attachments: [],
            comments: [
                comment('agent', 'Carlos Rivas', 'Puedes rotarla desde Administración › API Keys. La nueva clave se activa al instante; actualiza el ERP en la misma ventana.', 70),
                comment('requester', 'Tú', 'Listo, funcionó. ¡Gracias!', 66),
            ],
            history: [event('created', 'open', 'Tú', 76), event('status', 'in_progress', 'Carlos Rivas', 72), event('status', 'resolved', 'Carlos Rivas', 66)],
            createdAt: iso(76),
            updatedAt: iso(66),
        },
        {
            ...requester,
            id: 'tkt-1038',
            number: 'TKT-1038',
            subject: '¿Cómo agrego campos personalizados a un proceso?',
            description: 'Quisiera registrar el centro de costos en cada tarea del proceso.',
            category: 'question',
            priority: 'low',
            status: 'closed',
            assignee: 'María Torres',
            attachments: [],
            comments: [comment('agent', 'María Torres', 'Consulta el artículo «Personalizar las propiedades de un proceso» de la base de conocimiento.', 200)],
            history: [event('created', 'open', 'Tú', 210), event('status', 'resolved', 'María Torres', 200), event('status', 'closed', 'Sistema', 30)],
            createdAt: iso(210),
            updatedAt: iso(30),
        },
    ]
    return { version: 1, nextNumber: 1045, tickets }
}

function isTicket(item: unknown): item is Ticket {
    return isRecord(item) && typeof item.id === 'string' && typeof item.subject === 'string' && Array.isArray(item.comments) && Array.isArray(item.history)
}

function parse(raw: unknown): SupportState | null {
    if (!isRecord(raw) || raw.version !== 1 || typeof raw.nextNumber !== 'number') return null
    return { version: 1, nextNumber: raw.nextNumber, tickets: parseArray(raw.tickets, isTicket) }
}

const store = createLocalStore<SupportState>({ namespace: 'support:v1', seed, parse })

function mutateTicket(userId: string, id: string, change: (ticket: Ticket, now: string) => Ticket) {
    let updated: Ticket | undefined
    store.update((state) => {
        const now = new Date().toISOString()
        return {
            ...state,
            tickets: state.tickets.map((ticket) => {
                if (ticket.id !== id) return ticket
                updated = { ...change(ticket, now), updatedAt: now }
                return updated
            }),
        }
    }, userId)
    if (!updated) throw new Error('El ticket no existe.')
    return updated
}

const newEvent = (type: TicketEvent['type'], value: string, actor: string, at: string): TicketEvent => ({ id: createId('tev'), type, value, actor, at })

export const supportService = {
    async list(userId: string): Promise<Ticket[]> {
        await simulateLatency(200)
        return [...store.read(userId).tickets].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    },

    async get(userId: string, id: string): Promise<Ticket | null> {
        await simulateLatency(150)
        return store.read(userId).tickets.find((ticket) => ticket.id === id) ?? null
    },

    async create(requester: Requester, input: TicketInput): Promise<Ticket> {
        if (!input.subject.trim()) throw new Error('Escribe un asunto.')
        if (!input.description.trim()) throw new Error('Describe la solicitud.')
        await simulateLatency(400)
        let ticket: Ticket | undefined
        store.update((state) => {
            const now = new Date().toISOString()
            const number = `TKT-${state.nextNumber}`
            ticket = {
                id: number.toLowerCase(),
                number,
                subject: input.subject.trim(),
                description: input.description.trim(),
                category: input.category,
                priority: input.priority,
                status: 'open',
                requesterId: requester.id,
                requesterName: requester.name,
                assignee: null,
                reference: input.reference || undefined,
                attachments: input.attachments,
                comments: [],
                history: [newEvent('created', 'open', requester.name, now)],
                createdAt: now,
                updatedAt: now,
            }
            return { ...state, nextNumber: state.nextNumber + 1, tickets: [ticket, ...state.tickets] }
        }, requester.id)
        return ticket!
    },

    async addComment(userId: string, id: string, author: { name: string; isAgent: boolean }, input: CommentInput): Promise<Ticket> {
        if (!input.body.trim() && input.attachments.length === 0) throw new Error('Escribe un mensaje o adjunta un archivo.')
        await simulateLatency(250)
        return mutateTicket(userId, id, (ticket, now) => {
            const comment: TicketComment = {
                id: createId('tcm'),
                author: author.name,
                authorRole: author.isAgent ? 'agent' : 'requester',
                body: input.body.trim(),
                internal: author.isAgent && input.internal,
                attachments: input.attachments,
                at: now,
            }
            // A public reply from the requester reopens a ticket waiting on them
            const reopens = !author.isAgent && ticket.status === 'waiting'
            return {
                ...ticket,
                status: reopens ? 'open' : ticket.status,
                comments: [...ticket.comments, comment],
                history: reopens ? [...ticket.history, newEvent('status', 'open', author.name, now)] : ticket.history,
            }
        })
    },

    async updateStatus(userId: string, id: string, status: TicketStatus, actor: string): Promise<Ticket> {
        await simulateLatency(200)
        return mutateTicket(userId, id, (ticket, now) =>
            ticket.status === status ? ticket : { ...ticket, status, history: [...ticket.history, newEvent('status', status, actor, now)] }
        )
    },

    async updatePriority(userId: string, id: string, priority: TicketPriority, actor: string): Promise<Ticket> {
        await simulateLatency(200)
        return mutateTicket(userId, id, (ticket, now) =>
            ticket.priority === priority ? ticket : { ...ticket, priority, history: [...ticket.history, newEvent('priority', priority, actor, now)] }
        )
    },

    async assign(userId: string, id: string, assignee: string, actor: string): Promise<Ticket> {
        await simulateLatency(200)
        return mutateTicket(userId, id, (ticket, now) => ({
            ...ticket,
            assignee,
            history: [...ticket.history, newEvent('assigned', assignee, actor, now)],
        }))
    },
}
