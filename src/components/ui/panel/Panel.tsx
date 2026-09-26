import type { ReactNode } from 'react'
import { cn } from '../../../utils/cn'

type PanelProps = {
    title: string
    description?: ReactNode
    /** Right side of the header: links, toggles, counters */
    actions?: ReactNode
    children: ReactNode
    className?: string
    /** id of the heading, e.g. for aria-labelledby on the section */
    headingId?: string
    /** Heading level inside the page outline (h3 when nested in another section) */
    headingLevel?: 'h2' | 'h3'
}

/** Card with a title row. The standard container for dashboard sections and charts. */
export default function Panel({ title, description, actions, children, className, headingId, headingLevel = 'h2' }: PanelProps) {
    const Heading = headingLevel
    return (
        <section className={cn('card flex flex-col p-5', className)} aria-labelledby={headingId}>
            <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                    <Heading id={headingId} className="text-sm font-semibold text-fg">
                        {title}
                    </Heading>
                    {description ? <p className="mt-0.5 text-xs text-fg-muted">{description}</p> : null}
                </div>
                {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
            </header>
            <div className="min-h-0 flex-1">{children}</div>
        </section>
    )
}
