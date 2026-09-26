// Conversations of the AI assistant, persisted per user. Answers come from
// assistantEngine; this service only stores the chat history.
import type { Attachment } from '../../utils/attachments'
import { createId, createLocalStore, isRecord, parseArray, simulateLatency } from '../storage/localStore'

export type ChatMessage = {
    id: string
    role: 'user' | 'assistant'
    /** Markdown for assistant messages, plain text for user messages */
    content: string
    attachments: Attachment[]
    createdAt: string
    /** stopped: the user interrupted it; error: the engine failed */
    status?: 'complete' | 'stopped' | 'error'
}

export type Conversation = {
    id: string
    title: string
    pinned: boolean
    createdAt: string
    updatedAt: string
    messages: ChatMessage[]
}

type AssistantState = { version: 1; conversations: Conversation[] }

const HOUR_MS = 60 * 60 * 1000
const TITLE_WORDS = 7

/** Title from the first user message: its first words. */
export function titleFrom(text: string) {
    const words = text.replace(/\s+/g, ' ').trim().split(' ')
    const title = words.slice(0, TITLE_WORDS).join(' ')
    return (words.length > TITLE_WORDS ? `${title}…` : title) || 'Nueva conversación'
}

function seed(): AssistantState {
    const now = Date.now()
    const iso = (hoursAgo: number) => new Date(now - hoursAgo * HOUR_MS).toISOString()
    const message = (role: ChatMessage['role'], content: string, hoursAgo: number): ChatMessage => ({
        id: createId('chm'),
        role,
        content,
        attachments: [],
        createdAt: iso(hoursAgo),
        status: 'complete',
    })
    return {
        version: 1,
        conversations: [
            {
                id: 'cnv-rotation',
                title: 'Política de rotación de API keys',
                pinned: true,
                createdAt: iso(50),
                updatedAt: iso(50),
                messages: [
                    message('user', '¿Cada cuánto debería rotar las API keys de producción?', 50),
                    message(
                        'assistant',
                        'Para claves de **producción** se recomienda rotar al menos cada **90 días**, y de inmediato si:\n\n- Una persona con acceso deja el equipo.\n- La clave apareció en un repositorio, ticket o chat.\n- Observas uso desde orígenes desconocidos en la auditoría.\n\nEn *Administración › API Keys* usa **Rotar**: se emite un valor nuevo y el anterior deja de funcionar al instante.',
                        50
                    ),
                ],
            },
            {
                id: 'cnv-sql',
                title: 'Consulta SQL de usuarios activos',
                pinned: false,
                createdAt: iso(5),
                updatedAt: iso(5),
                messages: [
                    message('user', 'Escribe una consulta SQL que cuente los usuarios activos por departamento', 5),
                    message(
                        'assistant',
                        'Claro:\n\n```sql\nSELECT d.name AS departamento, COUNT(*) AS activos\nFROM users u\nJOIN departments d ON d.id = u.department_id\nWHERE u.status = \'active\'\nGROUP BY d.name\nORDER BY activos DESC;\n```',
                        5
                    ),
                ],
            },
            {
                id: 'cnv-mail',
                title: 'Correo de bienvenida para analistas',
                pinned: false,
                createdAt: iso(120),
                updatedAt: iso(120),
                messages: [
                    message('user', 'Redacta un correo de bienvenida breve para dos analistas nuevos', 120),
                    message(
                        'assistant',
                        '**Asunto:** Bienvenidos al equipo\n\nHola, Ana y Jorge:\n\nLes damos la bienvenida al área de Tecnología. Esta semana recibirán sus accesos a la plataforma y una sesión de inducción sobre procesos y tareas.\n\nCualquier duda, escríbannos por el Centro de soporte.\n\nSaludos cordiales.',
                        120
                    ),
                ],
            },
        ],
    }
}

function isConversation(item: unknown): item is Conversation {
    return isRecord(item) && typeof item.id === 'string' && typeof item.title === 'string' && Array.isArray(item.messages)
}

function parse(raw: unknown): AssistantState | null {
    if (!isRecord(raw) || raw.version !== 1) return null
    return { version: 1, conversations: parseArray(raw.conversations, isConversation) }
}

const store = createLocalStore<AssistantState>({ namespace: 'assistant:v1', seed, parse })

function updateConversation(userId: string, id: string, change: (conversation: Conversation) => Conversation) {
    return store.update(
        (state) => ({ ...state, conversations: state.conversations.map((conversation) => (conversation.id === id ? change(conversation) : conversation)) }),
        userId
    ).conversations
}

export const assistantService = {
    async list(userId: string): Promise<Conversation[]> {
        await simulateLatency(150)
        return store.read(userId).conversations
    },

    /** Creates a conversation that starts with the user's first message. */
    create(userId: string, firstMessage: ChatMessage): { conversations: Conversation[]; conversation: Conversation } {
        const now = new Date().toISOString()
        const conversation: Conversation = {
            id: createId('cnv'),
            title: titleFrom(firstMessage.content || firstMessage.attachments[0]?.name || ''),
            pinned: false,
            createdAt: now,
            updatedAt: now,
            messages: [firstMessage],
        }
        const conversations = store.update((state) => ({ ...state, conversations: [conversation, ...state.conversations] }), userId).conversations
        return { conversations, conversation }
    },

    /** Replaces the messages of a conversation (after each exchange). */
    saveMessages(userId: string, id: string, messages: ChatMessage[]) {
        return updateConversation(userId, id, (conversation) => ({ ...conversation, messages, updatedAt: new Date().toISOString() }))
    },

    rename(userId: string, id: string, title: string) {
        return updateConversation(userId, id, (conversation) => ({ ...conversation, title: title.trim() || conversation.title }))
    },

    setPinned(userId: string, id: string, pinned: boolean) {
        return updateConversation(userId, id, (conversation) => ({ ...conversation, pinned }))
    },

    remove(userId: string, id: string) {
        return store.update((state) => ({ ...state, conversations: state.conversations.filter((conversation) => conversation.id !== id) }), userId)
            .conversations
    },
}

export function newChatMessage(role: ChatMessage['role'], content: string, attachments: Attachment[] = []): ChatMessage {
    return { id: createId('chm'), role, content, attachments, createdAt: new Date().toISOString() }
}
