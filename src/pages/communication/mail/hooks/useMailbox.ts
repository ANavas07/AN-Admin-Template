import { useEffect, useState } from 'react'
import { sileo } from 'sileo'
import { useWorkspace } from '../../../../context/workspace-context'
import { buildThreads, mailService, unreadCount } from '../../../../services/mail/mail.service'
import type { DraftInput, MailAddress, MailFolder, MailMessage, MailView } from '../../../../services/mail/mail.service'
import { VIEWS } from '../mailPresentation'

const MOVE_MESSAGES: Record<MailFolder | 'restore', string> = {
    inbox: 'Movido a la bandeja de entrada',
    archive: 'Conversación archivada',
    trash: 'Conversación enviada a la papelera',
    restore: 'Conversación restaurada',
    sent: '',
    drafts: '',
}

const COUNTED_VIEWS: MailView[] = ['inbox', 'archive']

/** Messages of the user's mailbox and every action on them. */
export function useMailbox() {
    const { user } = useWorkspace()
    const sender: MailAddress = { name: user.name, email: user.email }
    const [messages, setMessages] = useState<MailMessage[] | null>(null)

    useEffect(() => {
        let isCurrent = true
        mailService.list(user.id).then((loaded) => {
            if (isCurrent) setMessages(loaded)
        })
        return () => {
            isCurrent = false
        }
    }, [user.id])

    const all = messages ?? []

    return {
        messages: all,
        isLoading: messages === null,
        threadsOf: (view: MailView) => buildThreads(all, view),
        // Unread conversations where new mail arrives, and how many drafts are pending
        counts: Object.fromEntries(
            VIEWS.map((view) => [
                view.id,
                view.id === 'drafts' ? buildThreads(all, 'drafts').length : COUNTED_VIEWS.includes(view.id) ? unreadCount(all, view.id) : 0,
            ])
        ) as Record<MailView, number>,
        setRead: (threadId: string, view: MailView, isRead: boolean) => mailService.setRead(user.id, threadId, view, isRead).then(setMessages),
        setStarred: (threadId: string, view: MailView, isStarred: boolean) =>
            mailService.setStarred(user.id, threadId, view, isStarred).then(setMessages),
        move: async (threadId: string, view: MailView, target: MailFolder | 'restore') => {
            setMessages(await mailService.move(user.id, threadId, view, target))
            sileo.success({ title: MOVE_MESSAGES[target] })
        },
        deleteForever: async (threadId: string) => {
            setMessages(await mailService.deleteForever(user.id, threadId))
            sileo.success({ title: 'Conversación eliminada definitivamente' })
        },
        saveDraft: async (draft: DraftInput) => {
            const result = await mailService.saveDraft(user.id, sender, draft)
            setMessages(result.messages)
            return result.draftId
        },
        deleteDraft: (draftId: string) => mailService.deleteDraft(user.id, draftId).then(setMessages),
        send: async (draft: DraftInput) => {
            try {
                setMessages(await mailService.send(user.id, sender, draft))
                sileo.success({ title: 'Mensaje enviado' })
                return true
            } catch (error) {
                sileo.error({ title: error instanceof Error ? error.message : 'No se pudo enviar el mensaje.' })
                return false
            }
        },
    }
}

export type Mailbox = ReturnType<typeof useMailbox>
