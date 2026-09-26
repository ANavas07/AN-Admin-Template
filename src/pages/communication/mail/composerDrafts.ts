// Builds the initial draft of the composer for new mail, replies and forwards.
import type { DraftInput, MailAddress, MailMessage } from '../../../services/mail/mail.service'
import { formatAddress, formatAddressList, formatMailDateLong } from './mailPresentation'

export type ComposeMode = 'new' | 'reply' | 'replyAll' | 'forward' | 'draft'

export type ComposerState = { mode: ComposeMode; draft: DraftInput }

const withPrefix = (prefix: string, subject: string) => (subject.toUpperCase().startsWith(`${prefix}:`) ? subject : `${prefix}: ${subject}`)

function quote(message: MailMessage) {
    const header = `El ${formatMailDateLong(message.sentAt)}, ${formatAddress(message.from)} escribió:`
    return `\n\n${header}\n${message.body
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n')}`
}

export function newDraft(to: MailAddress[] = []): ComposerState {
    return { mode: 'new', draft: { to, cc: [], subject: '', body: '', attachments: [] } }
}

export function draftFromMessage(message: MailMessage): ComposerState {
    const { id, threadId, to, cc, subject, body, attachments } = message
    return { mode: 'draft', draft: { id, threadId, to, cc, subject, body, attachments } }
}

/**
 * Reply goes to the sender (or to the original recipients when replying to
 * your own message); reply all adds everyone else except you.
 */
export function replyDraft(message: MailMessage, ownEmails: Set<string>, replyAll: boolean): ComposerState {
    const isOwn = ownEmails.has(message.from.email)
    const primary = isOwn ? message.to : [message.from]
    const others = replyAll ? [...message.to, ...message.cc].filter((address) => !ownEmails.has(address.email)) : []
    const seen = new Set(primary.map((address) => address.email))
    const cc = others.filter((address) => !seen.has(address.email) && seen.add(address.email))
    return {
        mode: replyAll ? 'replyAll' : 'reply',
        draft: { threadId: message.threadId, to: primary, cc, subject: withPrefix('RE', message.subject), body: quote(message), attachments: [] },
    }
}

export function forwardDraft(message: MailMessage): ComposerState {
    const header = [
        '---------- Mensaje reenviado ----------',
        `De: ${formatAddress(message.from)}`,
        `Fecha: ${formatMailDateLong(message.sentAt)}`,
        `Asunto: ${message.subject}`,
        `Para: ${formatAddressList(message.to)}`,
    ].join('\n')
    return {
        mode: 'forward',
        draft: { to: [], cc: [], subject: withPrefix('RV', message.subject), body: `\n\n${header}\n\n${message.body}`, attachments: message.attachments },
    }
}

export const COMPOSE_TITLES: Record<ComposeMode, string> = {
    new: 'Mensaje nuevo',
    reply: 'Responder',
    replyAll: 'Responder a todos',
    forward: 'Reenviar',
    draft: 'Borrador',
}
