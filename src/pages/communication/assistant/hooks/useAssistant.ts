import { useEffect, useRef, useState } from 'react'
import { useWorkspace } from '../../../../context/workspace-context'
import { assistantEngine } from '../../../../services/assistant/assistantEngine'
import { assistantService, newChatMessage } from '../../../../services/assistant/assistant.service'
import type { ChatMessage, Conversation } from '../../../../services/assistant/assistant.service'
import type { Attachment } from '../../../../utils/attachments'

type Streaming = { conversationId: string; messageId: string }

/**
 * Conversations of the assistant and the chat actions. Answers stream into
 * local state token by token and are persisted once complete (or stopped).
 */
export function useAssistant() {
    const { user } = useWorkspace()
    const [conversations, setConversations] = useState<Conversation[] | null>(null)
    const [streaming, setStreaming] = useState<Streaming | null>(null)
    const controllerRef = useRef<AbortController | null>(null)
    // Each regeneration of a conversation asks the engine for a new variant
    const variantsRef = useRef(new Map<string, number>())

    useEffect(() => {
        let isCurrent = true
        assistantService.list(user.id).then((loaded) => {
            if (isCurrent) setConversations(loaded)
        })
        return () => {
            isCurrent = false
            // Leaving the page stops an answer in progress
            controllerRef.current?.abort()
        }
    }, [user.id])

    function setLocalMessages(conversationId: string, messages: ChatMessage[]) {
        setConversations((current) => current?.map((conversation) => (conversation.id === conversationId ? { ...conversation, messages } : conversation)) ?? null)
    }

    async function streamReply(conversationId: string, history: ChatMessage[], variant: number) {
        const placeholder = newChatMessage('assistant', '')
        let content = ''
        let status: ChatMessage['status'] = 'complete'
        const controller = new AbortController()
        controllerRef.current = controller
        setStreaming({ conversationId, messageId: placeholder.id })
        setLocalMessages(conversationId, [...history, placeholder])

        try {
            await assistantEngine.reply(
                { messages: history.map(({ role, content: text, attachments }) => ({ role, content: text, attachments })), variant },
                (token) => {
                    content += token
                    setLocalMessages(conversationId, [...history, { ...placeholder, content }])
                },
                controller.signal
            )
        } catch (error) {
            const isAbort = error instanceof DOMException && error.name === 'AbortError'
            status = isAbort ? 'stopped' : 'error'
            if (!isAbort && !content) content = 'No se pudo generar la respuesta. Inténtalo de nuevo.'
        }

        const finalMessages = [...history, { ...placeholder, content, status }]
        setConversations(assistantService.saveMessages(user.id, conversationId, finalMessages))
        setStreaming(null)
        controllerRef.current = null
    }

    const list = conversations ?? []

    return {
        conversations: list,
        isLoading: conversations === null,
        streaming,
        isStreaming: streaming !== null,

        /** Sends a message; creates the conversation when there is none. Returns its id. */
        send(conversationId: string | undefined, text: string, attachments: Attachment[]) {
            const message = newChatMessage('user', text.trim(), attachments)
            const existing = conversationId ? list.find((conversation) => conversation.id === conversationId) : undefined
            if (!existing) {
                const created = assistantService.create(user.id, message)
                setConversations(created.conversations)
                void streamReply(created.conversation.id, [message], 0)
                return created.conversation.id
            }
            const history = [...existing.messages, message]
            setConversations(assistantService.saveMessages(user.id, existing.id, history))
            void streamReply(existing.id, history, 0)
            return existing.id
        },

        /** Answers the last question again with different wording. */
        regenerate(conversationId: string) {
            const conversation = list.find((item) => item.id === conversationId)
            if (!conversation) return
            const lastUser = conversation.messages.map((message) => message.role).lastIndexOf('user')
            if (lastUser < 0) return
            const variant = (variantsRef.current.get(conversationId) ?? 0) + 1
            variantsRef.current.set(conversationId, variant)
            void streamReply(conversationId, conversation.messages.slice(0, lastUser + 1), variant)
        },

        stop: () => controllerRef.current?.abort(),
        rename: (id: string, title: string) => setConversations(assistantService.rename(user.id, id, title)),
        setPinned: (id: string, pinned: boolean) => setConversations(assistantService.setPinned(user.id, id, pinned)),
        remove: (id: string) => setConversations(assistantService.remove(user.id, id)),
    }
}

export type AssistantController = ReturnType<typeof useAssistant>
