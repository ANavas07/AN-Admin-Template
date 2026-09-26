import type { ReactNode } from 'react'

type ModuleHeaderProps = {
    eyebrow: string
    title: string
    description: string
    actions?: ReactNode
}

/**
 * Shared page header for module screens. Keeps the eyebrow chip,
 * title and actions aligned across Users, Files and Process modules.
 */
export default function ModuleHeader({ eyebrow, title, description, actions }: ModuleHeaderProps) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <p className="eyebrow">{eyebrow}</p>
                <h1 className="page-title mt-1.5">{title}</h1>
                <p className="mt-1.5 max-w-2xl text-sm text-fg-muted">
                    {description}
                </p>
            </div>
            {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
        </div>
    )
}
