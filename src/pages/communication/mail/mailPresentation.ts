// Folder names, label colors and formatting of the mail center.
import type { ComponentType, SVGProps } from 'react'
import type { AccentTone } from '../../../components/ui/tone'
import { ArchiveIcon, EditIcon, MailIcon, SendIcon, StarIcon, TrashBinIcon } from '../../../icons/icons'
import type { MailAddress, MailView } from '../../../services/mail/mail.service'
import { normalizeText } from '../../../utils/text'

export const VIEWS: { id: MailView; label: string; Icon: ComponentType<SVGProps<SVGSVGElement>> }[] = [
    { id: 'inbox', label: 'Bandeja de entrada', Icon: MailIcon },
    { id: 'starred', label: 'Favoritos', Icon: StarIcon },
    { id: 'sent', label: 'Enviados', Icon: SendIcon },
    { id: 'drafts', label: 'Borradores', Icon: EditIcon },
    { id: 'archive', label: 'Archivados', Icon: ArchiveIcon },
    { id: 'trash', label: 'Papelera', Icon: TrashBinIcon },
]

export function isMailView(value: string | undefined): value is MailView {
    return VIEWS.some((view) => view.id === value)
}

export const LABEL_TONES: Record<string, AccentTone> = {
    Proyectos: 'indigo',
    Finanzas: 'emerald',
    Seguridad: 'rose',
    'RR. HH.': 'amber',
}

export const labelTone = (label: string): AccentTone => LABEL_TONES[label] ?? 'slate'

const timeFormatter = new Intl.DateTimeFormat('es', { hour: '2-digit', minute: '2-digit' })
const dayFormatter = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' })
const fullFormatter = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short', year: 'numeric' })
const longFormatter = new Intl.DateTimeFormat('es', { dateStyle: 'full', timeStyle: 'short' })

/** List date: time today, day this year, full date otherwise (Outlook / Gmail style). */
export function formatMailDate(iso: string, now = Date.now()) {
    const date = new Date(iso)
    const today = new Date(now)
    if (date.toDateString() === today.toDateString()) return timeFormatter.format(date)
    if (date.getFullYear() === today.getFullYear()) return dayFormatter.format(date)
    return fullFormatter.format(date)
}

export const formatMailDateLong = (iso: string) => longFormatter.format(new Date(iso))

export const formatAddress = (address: MailAddress) => `${address.name} <${address.email}>`

export const formatAddressList = (addresses: MailAddress[]) => addresses.map((address) => address.name || address.email).join(', ')

/** First line of the body for list previews. */
export const previewText = (body: string) => body.replace(/\s+/g, ' ').trim()

const EMAIL_PATTERN = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/

export const isValidEmail = (value: string) => EMAIL_PATTERN.test(value)

/**
 * "Ana <ana@x.com>", "ana@x.com" or part of a directory name ("lucia") →
 * address; null when it is neither an email nor a single directory match.
 */
export function parseAddress(value: string, directory: MailAddress[]): MailAddress | null {
    const text = value.trim()
    const match = /^(.*)<([^>]+)>$/.exec(text)
    const email = (match ? match[2] : text).trim().toLowerCase()
    if (!isValidEmail(email)) {
        const query = normalizeText(text)
        const matches = directory.filter((address) => normalizeText(`${address.name} ${address.email}`).includes(query))
        return query && matches.length === 1 ? matches[0] : null
    }
    const known = directory.find((address) => address.email.toLowerCase() === email)
    return known ?? { name: match?.[1].trim() || email, email }
}
