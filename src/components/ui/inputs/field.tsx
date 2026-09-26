import type { ReactNode } from 'react'
import { cn } from '../../../utils/cn'

type FieldLabelProps = {
    htmlFor: string
    required?: boolean
    className?: string
    children: ReactNode
}

/** Label above a form control, with the required-field marker. */
export function FieldLabel({ htmlFor, required = false, className, children }: FieldLabelProps) {
    return (
        <label htmlFor={htmlFor} className={cn('mb-1.5 block text-sm font-medium text-fg', className)}>
            {children}
            {required ? (
                <span className="ml-0.5 text-danger" aria-hidden="true">
                    *
                </span>
            ) : null}
        </label>
    )
}

type FieldMessageProps = {
    id: string
    error?: string
    hint?: string
}

/** Hint or validation error below a form control. The error wins when both exist. */
export function FieldMessage({ id, error, hint }: FieldMessageProps) {
    const text = error ?? hint
    if (!text) return null
    return (
        <p id={id} className={cn('mt-1.5 text-xs', error ? 'font-medium text-danger' : 'text-fg-muted')}>
            {text}
        </p>
    )
}
