// Mailbox of the signed-in user. Messages belong to one folder and to a
// thread; the UI lists threads. Mock persistence with the async API a mail
// backend (Graph, Gmail API, IMAP gateway) would sit behind.
import type { Attachment } from '../../utils/attachments'
import { createId, createLocalStore, isRecord, parseArray, simulateLatency } from '../storage/localStore'

export type MailFolder = 'inbox' | 'sent' | 'drafts' | 'archive' | 'trash'
/** Folders plus the "starred" view, which spans folders */
export type MailView = MailFolder | 'starred'

export type MailAddress = { name: string; email: string }

export type MailMessage = {
    id: string
    threadId: string
    folder: MailFolder
    /** Folder to go back to when restored from the trash */
    previousFolder?: MailFolder
    from: MailAddress
    to: MailAddress[]
    cc: MailAddress[]
    subject: string
    body: string
    sentAt: string
    isRead: boolean
    isStarred: boolean
    labels: string[]
    attachments: Attachment[]
}

export type MailThread = {
    id: string
    subject: string
    /** Messages of the thread visible in the current view, oldest first */
    messages: MailMessage[]
    latest: MailMessage
    /** Latest message that belongs to the view (e.g. the last one you sent, in Sent) */
    latestInView: MailMessage
    participants: MailAddress[]
    isUnread: boolean
    isStarred: boolean
    hasAttachments: boolean
    labels: string[]
}

export type DraftInput = {
    id?: string
    threadId?: string
    to: MailAddress[]
    cc: MailAddress[]
    subject: string
    body: string
    attachments: Attachment[]
}

type MailState = { version: 1; messages: MailMessage[] }

export const MAIL_LABELS = ['Proyectos', 'Finanzas', 'Seguridad', 'RR. HH.'] as const

/** Directory used for recipient suggestions. PLANTILLA: replace with your directory API. */
export const MAIL_CONTACTS: MailAddress[] = [
    { name: 'María Torres', email: 'maria.torres@example.com' },
    { name: 'Carlos Rivas', email: 'carlos.rivas@example.com' },
    { name: 'Lucía Andrade', email: 'lucia.andrade@example.com' },
    { name: 'Jorge Paredes', email: 'jorge.paredes@example.com' },
    { name: 'Ana Villacís', email: 'ana.villacis@example.com' },
    { name: 'Equipo de Seguridad', email: 'seguridad@example.com' },
    { name: 'Finanzas', email: 'finanzas@example.com' },
]

const HOUR_MS = 60 * 60 * 1000
const contact = (index: number) => MAIL_CONTACTS[index]

function seed(scope: string): MailState {
    const now = Date.now()
    // Mailbox owner in the demo data. Replies detect it via ownAddresses(), not by this value
    const me: MailAddress = { name: 'Usuario Demo', email: `usuario.${scope}@example.com` }
    const iso = (hoursAgo: number) => new Date(now - hoursAgo * HOUR_MS).toISOString()
    const message = (partial: Partial<MailMessage> & Pick<MailMessage, 'threadId' | 'from' | 'subject' | 'body'>, hoursAgo: number): MailMessage => ({
        id: createId('msg'),
        folder: 'inbox',
        to: [me],
        cc: [],
        sentAt: iso(hoursAgo),
        isRead: true,
        isStarred: false,
        labels: [],
        attachments: [],
        ...partial,
    })

    const messages: MailMessage[] = [
        message(
            {
                threadId: 'thr-q4',
                from: contact(0),
                cc: [contact(1)],
                subject: 'Planificación del cuarto trimestre',
                body: 'Hola,\n\nComparto el borrador de la planificación del cuarto trimestre. ¿Puedes revisar las fechas de los hitos 2 y 3 antes del jueves?\n\nGracias,\nMaría',
                labels: ['Proyectos'],
                attachments: [{ id: 'att-q4', name: 'Planificacion_Q4.xlsx', size: 184_320, mimeType: 'application/vnd.ms-excel', addedAt: iso(30) }],
            },
            30
        ),
        message(
            {
                threadId: 'thr-q4',
                folder: 'sent',
                from: me,
                to: [contact(0)],
                cc: [contact(1)],
                subject: 'RE: Planificación del cuarto trimestre',
                body: 'María, revisado. El hito 3 debería moverse una semana por la migración del ERP.\n\nSaludos.',
            },
            26
        ),
        message(
            {
                threadId: 'thr-q4',
                from: contact(0),
                cc: [contact(1)],
                subject: 'RE: Planificación del cuarto trimestre',
                body: 'Perfecto, ajusto el cronograma y lo publico en el módulo de planificación hoy mismo.',
                isRead: false,
                labels: ['Proyectos'],
            },
            2
        ),
        message(
            {
                threadId: 'thr-sec',
                from: contact(5),
                subject: 'Rotación trimestral de API keys',
                body: 'Recordatorio: las claves de producción con más de 90 días deben rotarse antes del 30 de septiembre.\n\nPuedes hacerlo desde Administración › API Keys. La clave «Reportes BI» vence en menos de dos semanas.',
                isRead: false,
                isStarred: true,
                labels: ['Seguridad'],
            },
            5
        ),
        message(
            {
                threadId: 'thr-budget',
                from: contact(6),
                subject: 'Aprobación de presupuesto — Proyecto Portal',
                body: 'Adjuntamos el presupuesto aprobado para el Proyecto Portal. Cualquier ajuste debe solicitarse antes del cierre de mes.',
                labels: ['Finanzas'],
                attachments: [
                    { id: 'att-budget', name: 'Presupuesto_Portal.pdf', size: 412_000, mimeType: 'application/pdf', addedAt: iso(28) },
                    { id: 'att-budget-2', name: 'Detalle_partidas.csv', size: 12_400, mimeType: 'text/csv', addedAt: iso(28) },
                ],
            },
            28
        ),
        message(
            {
                threadId: 'thr-onboarding',
                from: contact(4),
                subject: 'Incorporación de nuevos analistas',
                body: 'El lunes se incorporan dos analistas al equipo. ¿Podrías crear sus cuentas con el rol Analista?',
                labels: ['RR. HH.'],
                isStarred: true,
            },
            52
        ),
        message(
            {
                threadId: 'thr-weekly',
                from: contact(3),
                subject: 'Resumen semanal de operaciones',
                body: 'Tareas cerradas: 42\nProcesos publicados: 3\nIncidencias abiertas: 1\n\nBuen fin de semana.',
                folder: 'archive',
            },
            120
        ),
        message(
            {
                threadId: 'thr-vendor',
                from: contact(2),
                to: [me],
                subject: 'Propuesta de proveedor de firma electrónica',
                body: 'Te envío la propuesta. Si no aplica, podemos descartarla.',
                folder: 'trash',
                previousFolder: 'inbox',
            },
            200
        ),
        message(
            {
                threadId: 'thr-draft',
                folder: 'drafts',
                from: me,
                to: [contact(1)],
                subject: 'Accesos para el equipo de finanzas',
                body: 'Carlos,\n\nNecesitamos habilitar la planificación para',
            },
            4
        ),
    ]
    return { version: 1, messages }
}

function isMessage(item: unknown): item is MailMessage {
    return isRecord(item) && typeof item.id === 'string' && typeof item.threadId === 'string' && typeof item.folder === 'string' && isRecord(item.from)
}

function parse(raw: unknown): MailState | null {
    if (!isRecord(raw) || raw.version !== 1) return null
    return { version: 1, messages: parseArray(raw.messages, isMessage) }
}

const store = createLocalStore<MailState>({ namespace: 'mail:v1', seed, parse })

// ----- Threads (pure) --------------------------------------------------------

function belongsToView(message: MailMessage, view: MailView) {
    if (view === 'starred') return message.isStarred && message.folder !== 'trash' && message.folder !== 'drafts'
    return message.folder === view
}

/** Messages shown when a thread is opened from `view`. */
function threadMessages(all: MailMessage[], threadId: string, view: MailView) {
    return all
        .filter((message) => message.threadId === threadId)
        .filter((message) => (view === 'trash' ? message.folder === 'trash' : view === 'drafts' ? message.folder === 'drafts' : message.folder !== 'trash' && message.folder !== 'drafts'))
        .sort((a, b) => a.sentAt.localeCompare(b.sentAt))
}

/** Threads with at least one message in `view`, newest activity first. */
export function buildThreads(all: MailMessage[], view: MailView): MailThread[] {
    const threadIds = [...new Set(all.filter((message) => belongsToView(message, view)).map((message) => message.threadId))]
    return threadIds
        .map((threadId) => {
            const messages = threadMessages(all, threadId, view)
            const latest = messages[messages.length - 1]
            const latestInView = messages.filter((message) => belongsToView(message, view)).at(-1) ?? latest
            const participants = [...new Map(messages.flatMap((message) => [message.from, ...message.to]).map((address) => [address.email, address])).values()]
            return {
                id: threadId,
                subject: messages[0].subject.replace(/^(RE|RV|FW|FWD):\s*/i, ''),
                messages,
                latest,
                latestInView,
                participants,
                isUnread: messages.some((message) => !message.isRead),
                isStarred: messages.some((message) => message.isStarred),
                hasAttachments: messages.some((message) => message.attachments.length > 0),
                labels: [...new Set(messages.flatMap((message) => message.labels))],
            }
        })
        .sort((a, b) => b.latest.sentAt.localeCompare(a.latest.sentAt))
}

/** Addresses the user sends from (the account address plus the sender of their sent mail). */
export function ownAddresses(all: MailMessage[], accountEmail: string) {
    return new Set([accountEmail, ...all.filter((message) => message.folder === 'sent' || message.folder === 'drafts').map((message) => message.from.email)])
}

export function unreadCount(all: MailMessage[], view: MailView) {
    return buildThreads(all, view).filter((thread) => thread.isUnread).length
}

// ----- Mutations -------------------------------------------------------------

function updateMessages(userId: string, change: (message: MailMessage) => MailMessage) {
    return store.update((state) => ({ ...state, messages: state.messages.map(change) }), userId).messages
}

/** Messages of a thread that an action from `view` applies to. */
const inThreadView = (message: MailMessage, threadId: string, view: MailView) =>
    message.threadId === threadId && (view === 'trash' ? message.folder === 'trash' : message.folder !== 'trash' && message.folder !== 'drafts')

export const mailService = {
    async list(userId: string): Promise<MailMessage[]> {
        await simulateLatency(200)
        return store.read(userId).messages
    },

    async setRead(userId: string, threadId: string, view: MailView, isRead: boolean) {
        return updateMessages(userId, (message) => (inThreadView(message, threadId, view) ? { ...message, isRead } : message))
    },

    /** Starring a thread stars its latest message; un-starring clears every message. */
    async setStarred(userId: string, threadId: string, view: MailView, isStarred: boolean) {
        const latestId = buildThreads(store.read(userId).messages, view).find((thread) => thread.id === threadId)?.latest.id
        return updateMessages(userId, (message) => {
            if (!inThreadView(message, threadId, view)) return message
            if (isStarred) return message.id === latestId ? { ...message, isStarred: true } : message
            return { ...message, isStarred: false }
        })
    },

    /** Moves the thread out of inbox/archive or into the trash; restores from the trash. */
    async move(userId: string, threadId: string, view: MailView, target: MailFolder | 'restore') {
        return updateMessages(userId, (message) => {
            if (!inThreadView(message, threadId, view)) return message
            if (target === 'restore') return { ...message, folder: message.previousFolder ?? 'inbox', previousFolder: undefined }
            if (target === 'trash') return { ...message, folder: 'trash', previousFolder: message.folder }
            // Archive / move to inbox only affects received messages; sent ones stay in Sent
            if (message.folder === 'sent') return message
            return { ...message, folder: target }
        })
    },

    async deleteForever(userId: string, threadId: string) {
        return store.update(
            (state) => ({ ...state, messages: state.messages.filter((message) => !(message.threadId === threadId && message.folder === 'trash')) }),
            userId
        ).messages
    },

    async deleteDraft(userId: string, draftId: string) {
        return store.update((state) => ({ ...state, messages: state.messages.filter((message) => message.id !== draftId) }), userId).messages
    },

    async saveDraft(userId: string, sender: MailAddress, draft: DraftInput) {
        const id = draft.id ?? createId('msg')
        const message: MailMessage = {
            id,
            threadId: draft.threadId ?? createId('thr'),
            folder: 'drafts',
            from: sender,
            to: draft.to,
            cc: draft.cc,
            subject: draft.subject,
            body: draft.body,
            sentAt: new Date().toISOString(),
            isRead: true,
            isStarred: false,
            labels: [],
            attachments: draft.attachments,
        }
        const messages = store.update(
            (state) => ({ ...state, messages: [...state.messages.filter((existing) => existing.id !== id), message] }),
            userId
        ).messages
        return { messages, draftId: id }
    },

    async send(userId: string, sender: MailAddress, draft: DraftInput) {
        if (draft.to.length === 0) throw new Error('Agrega al menos un destinatario.')
        if (!draft.subject.trim() && !draft.body.trim()) throw new Error('El mensaje está vacío.')
        await simulateLatency(450)
        const message: MailMessage = {
            id: createId('msg'),
            threadId: draft.threadId ?? createId('thr'),
            folder: 'sent',
            from: sender,
            to: draft.to,
            cc: draft.cc,
            subject: draft.subject.trim() || '(sin asunto)',
            body: draft.body,
            sentAt: new Date().toISOString(),
            isRead: true,
            isStarred: false,
            labels: [],
            attachments: draft.attachments,
        }
        return store.update(
            (state) => ({ ...state, messages: [...state.messages.filter((existing) => existing.id !== draft.id), message] }),
            userId
        ).messages
    },
}
