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
                <span className="inline-flex rounded-full border border-(--color-border) bg-(--color-surface) px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-(--color-text-muted)">
                    {eyebrow}
                </span>
                <h1 className="mt-3 text-2xl font-bold tracking-tight text-(--color-text)">
                    {title}
                </h1>
                <p className="mt-1.5 max-w-2xl text-sm text-(--color-text-muted)">
                    {description}
                </p>
            </div>
            {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
        </div>
    )
}
