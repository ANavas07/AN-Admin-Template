import { useId, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { CloseIcon } from '../../../../icons/icons'
import { MAIL_CONTACTS } from '../../../../services/mail/mail.service'
import type { MailAddress } from '../../../../services/mail/mail.service'
import { parseAddress } from '../mailPresentation'

type RecipientInputProps = {
    label: string
    value: MailAddress[]
    onChange: (addresses: MailAddress[]) => void
    autoFocus?: boolean
}

/** Recipients as chips. Enter, comma or leaving the field adds the typed address. */
export default function RecipientInput({ label, value, onChange, autoFocus }: RecipientInputProps) {
    const inputId = useId()
    const listId = useId()
    const [text, setText] = useState('')
    const [error, setError] = useState('')

    function commit(input = text) {
        const entries = input.split(/[,;]/).map((entry) => entry.trim()).filter(Boolean)
        if (entries.length === 0) return true
        const parsed = entries.map((entry) => parseAddress(entry, MAIL_CONTACTS))
        if (parsed.some((address) => address === null)) {
            setError('Dirección de correo no válida')
            return false
        }
        const existing = new Set(value.map((address) => address.email))
        onChange([...value, ...(parsed as MailAddress[]).filter((address) => !existing.has(address.email))])
        setText('')
        setError('')
        return true
    }

    function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if ((event.key === 'Enter' || event.key === ',' || event.key === ';') && text.trim()) {
            event.preventDefault()
            commit()
        } else if (event.key === 'Backspace' && !text && value.length) {
            onChange(value.slice(0, -1))
        }
    }

    return (
        <div className="flex items-start gap-2 border-b border-line px-4 py-1.5">
            <label htmlFor={inputId} className="w-10 shrink-0 pt-1.5 text-sm text-fg-muted">
                {label}
            </label>
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
                {value.map((address) => (
                    <span key={address.email} title={address.email} className="inline-flex max-w-full items-center gap-1 rounded-full bg-canvas-subtle py-0.5 pl-2.5 pr-1 text-xs text-fg">
                        <span className="truncate">{address.name}</span>
                        <button
                            type="button"
                            onClick={() => onChange(value.filter((item) => item.email !== address.email))}
                            className="inline-flex size-4 items-center justify-center rounded-full text-fg-subtle hover:bg-line hover:text-fg"
                            aria-label={`Quitar ${address.name}`}
                        >
                            <CloseIcon className="size-3" />
                        </button>
                    </span>
                ))}
                <input
                    id={inputId}
                    list={listId}
                    value={text}
                    autoFocus={autoFocus}
                    onChange={(event) => {
                        const next = event.target.value
                        // Picking a suggestion ("Name <email>") adds it right away
                        if (/<[^>]+@[^>]+>$/.test(next.trim()) && commit(next)) return
                        setText(next)
                        setError('')
                    }}
                    onKeyDown={handleKeyDown}
                    onBlur={() => commit()}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? `${inputId}-error` : undefined}
                    autoComplete="off"
                    className="h-7 min-w-32 flex-1 bg-transparent text-sm text-fg placeholder:text-fg-subtle focus:outline-none"
                    placeholder={value.length ? '' : 'nombre@empresa.com'}
                />
                <datalist id={listId}>
                    {MAIL_CONTACTS.map((address) => (
                        <option key={address.email} value={`${address.name} <${address.email}>`} />
                    ))}
                </datalist>
            </div>
            {error ? (
                <span id={`${inputId}-error`} role="alert" className="shrink-0 pt-1.5 text-xs font-medium text-danger">
                    {error}
                </span>
            ) : null}
        </div>
    )
}
