import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../../utils/cn'
import { toneSoft } from '../tone'
import type { StatusTone } from '../tone'

type AlertProps = HTMLAttributes<HTMLDivElement> & {
    tone?: StatusTone
    title?: ReactNode
    icon?: ReactNode
    children?: ReactNode
}

/**
 * Inline message box for feedback, warnings and contextual help.
 * Errors are announced to assistive technology (role="alert").
 */
export default function Alert({ tone = 'info', title, icon, className, children, ...rest }: AlertProps) {
    return (
        <div
            role={tone === 'danger' ? 'alert' : 'status'}
            className={cn('flex gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm', toneSoft[tone], className)}
            {...rest}
        >
            {icon ? <span className="mt-0.5 shrink-0" aria-hidden="true">{icon}</span> : null}
            <div className="min-w-0">
                {title ? <p className="font-semibold">{title}</p> : null}
                {children ? <div className={cn(title && 'mt-0.5', 'text-fg')}>{children}</div> : null}
            </div>
        </div>
    )
}
