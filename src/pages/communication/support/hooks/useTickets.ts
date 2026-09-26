import { useEffect, useState } from 'react'
import { sileo } from 'sileo'
import { useWorkspace } from '../../../../context/workspace-context'
import { supportService } from '../../../../services/support/support.service'
import type { CommentInput, Ticket, TicketInput, TicketPriority, TicketStatus } from '../../../../services/support/support.service'
import { isSupportAgent, STATUS_META } from '../supportPresentation'

const errorMessage = (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback)

/** Tickets of the signed-in user. */
export function useTickets() {
    const { user } = useWorkspace()
    const [tickets, setTickets] = useState<Ticket[] | null>(null)

    useEffect(() => {
        let isCurrent = true
        supportService.list(user.id).then((loaded) => {
            if (isCurrent) setTickets(loaded)
        })
        return () => {
            isCurrent = false
        }
    }, [user.id])

    async function create(input: TicketInput) {
        try {
            const ticket = await supportService.create({ id: user.id, name: user.name }, input)
            sileo.success({ title: `Ticket ${ticket.number} creado`, description: 'Te avisaremos cuando soporte responda.' })
            return ticket
        } catch (error) {
            sileo.error({ title: errorMessage(error, 'No se pudo crear el ticket.') })
            return null
        }
    }

    return { tickets: tickets ?? [], isLoading: tickets === null, create }
}

/** One ticket with the actions available to the current role. */
export function useTicket(id: string | undefined) {
    const { user, role } = useWorkspace()
    const isAgent = isSupportAgent(role)
    // undefined: loading; null: not found
    const [ticket, setTicket] = useState<Ticket | null | undefined>(undefined)

    useEffect(() => {
        let isCurrent = true
        if (id) {
            supportService.get(user.id, id).then((loaded) => {
                if (isCurrent) setTicket(loaded)
            })
        }
        return () => {
            isCurrent = false
        }
    }, [id, user.id])

    async function run(action: () => Promise<Ticket>, success: string | null, failure: string) {
        try {
            const updated = await action()
            setTicket(updated)
            if (success) sileo.success({ title: success })
            return true
        } catch (error) {
            sileo.error({ title: errorMessage(error, failure) })
            return false
        }
    }

    return {
        ticket,
        isLoading: ticket === undefined,
        isAgent,
        addComment: (input: CommentInput) =>
            run(
                () => supportService.addComment(user.id, id!, { name: user.name, isAgent }, input),
                input.internal ? 'Nota interna agregada' : null,
                'No se pudo enviar el mensaje.'
            ),
        setStatus: (status: TicketStatus) =>
            run(() => supportService.updateStatus(user.id, id!, status, user.name), `Estado: ${STATUS_META[status].label}`, 'No se pudo cambiar el estado.'),
        setPriority: (priority: TicketPriority) =>
            run(() => supportService.updatePriority(user.id, id!, priority, user.name), null, 'No se pudo cambiar la prioridad.'),
        assign: (assignee: string) => run(() => supportService.assign(user.id, id!, assignee, user.name), `Asignado a ${assignee}`, 'No se pudo asignar.'),
    }
}
