import type { ReactNode } from 'react'
import { cn } from '../../../utils/cn'

type EmptyStateProps = {
    icon?: ReactNode
    title: string
    description?: ReactNode
    /** Primary way out: a button or link */
    action?: ReactNode
    className?: string
}

/** Placeholder for lists and panels with nothing to show yet. */
export default function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
    return (
        <div className={cn('flex flex-col items-center justify-center px-6 py-12 text-center', className)}>
            {icon ? (
                <span className="mb-3 inline-flex size-10 items-center justify-center rounded-lg bg-canvas-subtle text-fg-muted">
                    {icon}
                </span>
            ) : null}
            <p className="text-sm font-semibold text-fg">{title}</p>
            {description ? <p className="mt-1 max-w-sm text-sm text-fg-muted">{description}</p> : null}
            {action ? <div className="mt-4">{action}</div> : null}
        </div>
    )
}
