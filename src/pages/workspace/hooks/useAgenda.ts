import { useEffect, useState } from 'react'
import type { StatusTone } from '../../../components/ui/tone'
import { useWorkspace } from '../../../context/workspace-context'
import { getModuleById, hasModuleAccess } from '../../../navigation/navigation'
import { apiKeysService, daysUntilExpiry, getKeyStatus } from '../../../services/api-keys/apiKeys.service'
import { buildThreads, mailService } from '../../../services/mail/mail.service'
import { processService } from '../../../services/process/process.service'
import { supportService } from '../../../services/support/support.service'

/** Something waiting for the user in another module, with a direct link to it. */
export type AgendaItem = {
    id: string
    icon: string
    tone: StatusTone
    count: number
    /** Short noun phrase that follows the count: "correos sin leer" */
    label: string
    /** The first concrete item, so the user knows what it is before opening it */
    detail?: string
    to: string
}

const EXPIRY_WINDOW_DAYS = 30

const plural = (count: number, one: string, many: string) => (count === 1 ? one : many)

/**
 * What needs the user's attention today, gathered from mail, support, API
 * keys and processes. Only modules the active role can open are consulted.
 */
export function useAgenda() {
    const { user, role } = useWorkspace()
    const [items, setItems] = useState<AgendaItem[] | null>(null)

    useEffect(() => {
        let isCurrent = true
        const can = (moduleId: string) => {
            const module = getModuleById(moduleId)
            return module !== null && hasModuleAccess(module, role)
        }

        async function load(): Promise<AgendaItem[]> {
            const now = Date.now()
            const [messages, tickets, keys, processes] = await Promise.all([
                can('mail') ? mailService.list(user.id) : null,
                can('support') ? supportService.list(user.id) : null,
                can('api-keys') ? apiKeysService.list().then((state) => state.keys) : null,
                can('process') ? processService.list() : null,
            ])
            const result: AgendaItem[] = []

            if (messages) {
                const unread = buildThreads(messages, 'inbox').filter((thread) => thread.isUnread)
                if (unread.length) {
                    result.push({
                        id: 'mail-unread',
                        icon: 'mail',
                        tone: 'brand',
                        count: unread.length,
                        label: plural(unread.length, 'correo sin leer', 'correos sin leer'),
                        detail: `${unread[0].latest.from.name} · ${unread[0].subject}`,
                        to: unread.length === 1 ? `/mail/inbox/${unread[0].id}` : '/mail/inbox',
                    })
                }
                const drafts = buildThreads(messages, 'drafts')
                if (drafts.length) {
                    result.push({
                        id: 'mail-drafts',
                        icon: 'mail',
                        tone: 'neutral',
                        count: drafts.length,
                        label: plural(drafts.length, 'borrador sin enviar', 'borradores sin enviar'),
                        detail: drafts[0].subject || '(sin asunto)',
                        to: '/mail/drafts',
                    })
                }
            }

            if (tickets) {
                const waiting = tickets.filter((ticket) => ticket.status === 'waiting')
                if (waiting.length) {
                    result.push({
                        id: 'support-waiting',
                        icon: 'support',
                        tone: 'warning',
                        count: waiting.length,
                        label: plural(waiting.length, 'ticket esperando tu respuesta', 'tickets esperando tu respuesta'),
                        detail: `${waiting[0].number} · ${waiting[0].subject}`,
                        to: `/support/tickets/${waiting[0].id}`,
                    })
                }
            }

            if (keys) {
                const expiring = keys
                    .filter((key) => getKeyStatus(key, now) === 'active')
                    .map((key) => ({ key, days: daysUntilExpiry(key, now) }))
                    .filter((entry): entry is { key: typeof entry.key; days: number } => entry.days !== null && entry.days <= EXPIRY_WINDOW_DAYS)
                    .sort((a, b) => a.days - b.days)
                if (expiring.length) {
                    result.push({
                        id: 'keys-expiring',
                        icon: 'key',
                        tone: 'danger',
                        count: expiring.length,
                        label: plural(expiring.length, 'API key por vencer', 'API keys por vencer'),
                        detail: `${expiring[0].key.name} · en ${expiring[0].days} ${plural(expiring[0].days, 'día', 'días')}`,
                        to: '/admin/api-keys',
                    })
                }
            }

            if (processes) {
                const inReview = processes.filter((process) => process.status === 'review')
                if (inReview.length) {
                    result.push({
                        id: 'process-review',
                        icon: 'process',
                        tone: 'info',
                        count: inReview.length,
                        label: plural(inReview.length, 'proceso en revisión', 'procesos en revisión'),
                        detail: inReview[0].name,
                        to: '/process',
                    })
                }
            }
            return result
        }

        load().then((loaded) => {
            if (isCurrent) setItems(loaded)
        })
        return () => {
            isCurrent = false
        }
    }, [user.id, role])

    return { items: items ?? [], isLoading: items === null }
}

const listFormatter = new Intl.ListFormat('es', { style: 'long', type: 'conjunction' })

/** "Hoy tienes 2 correos sin leer y 1 ticket esperando tu respuesta." */
export function summarizeAgenda(items: AgendaItem[]) {
    if (items.length === 0) return 'Todo está al día: no tienes pendientes en correo, soporte ni administración.'
    const parts = items.slice(0, 3).map((item) => `${item.count} ${item.label}`)
    return `Hoy tienes ${listFormatter.format(parts)}${items.length > 3 ? ', entre otros pendientes' : ''}.`
}
