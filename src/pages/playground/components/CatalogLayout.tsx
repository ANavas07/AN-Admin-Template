import type { ReactNode } from 'react'

type CatalogHeaderProps = {
    title: string
    description: ReactNode
    eyebrow?: string
}

/** Page header shared by every UI catalog page. */
export function CatalogHeader({ title, description, eyebrow = 'UI Catalog' }: CatalogHeaderProps) {
    return (
        <header className="border-b border-line pb-6">
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="page-title mt-1.5">{title}</h1>
            <p className="mt-1.5 max-w-3xl text-sm text-fg-muted">{description}</p>
        </header>
    )
}

type CatalogSectionProps = {
    title: string
    description: string
    children: ReactNode
}

/** Card that groups the examples of one component variant. */
export function CatalogSection({ title, description, children }: CatalogSectionProps) {
    return (
        <article className="card p-5">
            <div className="mb-5">
                <h2 className="text-sm font-semibold text-fg">{title}</h2>
                <p className="mt-1 text-sm text-fg-muted">{description}</p>
            </div>
            {children}
        </article>
    )
}
