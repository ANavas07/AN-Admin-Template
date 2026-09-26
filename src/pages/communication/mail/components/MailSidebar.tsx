import { NavLink } from 'react-router-dom'
import ButtonComponent from '../../../../components/ui/buttons/ButtonComponent'
import { toneSolid } from '../../../../components/ui/tone'
import { EditIcon } from '../../../../icons/icons'
import { MAIL_LABELS } from '../../../../services/mail/mail.service'
import type { MailView } from '../../../../services/mail/mail.service'
import { cn } from '../../../../utils/cn'
import { labelTone, VIEWS } from '../mailPresentation'

type MailSidebarProps = {
    counts: Record<MailView, number>
    activeLabel: string | null
    onSelectLabel: (label: string | null) => void
    onCompose: () => void
    onNavigate: () => void
}

/** Compose button, folders with unread counts and labels. */
export default function MailSidebar({ counts, activeLabel, onSelectLabel, onCompose, onNavigate }: MailSidebarProps) {
    return (
        <div className="flex h-full flex-col gap-4 overflow-y-auto p-3">
            <ButtonComponent fullWidth leftIcon={<EditIcon className="size-4" />} onClick={onCompose}>
                Redactar
            </ButtonComponent>

            <nav aria-label="Carpetas">
                <ul className="space-y-0.5">
                    {VIEWS.map(({ id, label, Icon }) => (
                        <li key={id}>
                            <NavLink
                                to={`/mail/${id}`}
                                onClick={onNavigate}
                                className={({ isActive }) =>
                                    cn(
                                        'flex h-9 items-center gap-3 rounded-md px-2.5 text-sm transition-colors',
                                        isActive ? 'bg-brand-soft font-semibold text-brand-strong' : 'text-fg hover:bg-canvas-subtle'
                                    )
                                }
                            >
                                <Icon className="size-4 shrink-0" />
                                <span className="flex-1 truncate">{label}</span>
                                {counts[id] ? (
                                    <span className="text-xs font-semibold tabular-nums" aria-label={id === 'drafts' ? `${counts[id]} borradores` : `${counts[id]} sin leer`}>
                                        {counts[id]}
                                    </span>
                                ) : null}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div>
                <p className="eyebrow mb-1.5 px-2.5">Etiquetas</p>
                <ul className="space-y-0.5">
                    {MAIL_LABELS.map((label) => {
                        const isActive = activeLabel === label
                        return (
                            <li key={label}>
                                <button
                                    type="button"
                                    aria-pressed={isActive}
                                    onClick={() => {
                                        onSelectLabel(isActive ? null : label)
                                        onNavigate()
                                    }}
                                    className={cn(
                                        'flex h-8 w-full items-center gap-3 rounded-md px-2.5 text-left text-sm transition-colors',
                                        isActive ? 'bg-canvas-subtle font-semibold text-fg' : 'text-fg-muted hover:bg-canvas-subtle hover:text-fg'
                                    )}
                                >
                                    <span className={cn('size-2.5 shrink-0 rounded-full', toneSolid[labelTone(label)])} aria-hidden="true" />
                                    {label}
                                </button>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </div>
    )
}
