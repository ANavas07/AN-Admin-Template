import { Link } from 'react-router-dom'
import ModuleIcon from '../../../components/common/modules/ModuleIcon'
import { toneSolid, toneTint } from '../../../components/ui/tone'
import { ArrowRightIcon, CheckIcon } from '../../../icons/icons'
import { cn } from '../../../utils/cn'
import type { AgendaItem } from '../hooks/useAgenda'

type AgendaPanelProps = {
    items: AgendaItem[]
    isLoading: boolean
    className?: string
}

/**
 * "Pending today": the first thing on the home. Each tile names what is
 * waiting, shows the first concrete item and opens it in one click.
 */
export default function AgendaPanel({ items, isLoading, className }: AgendaPanelProps) {
    if (isLoading) {
        return (
            <section aria-label="Pendientes" aria-busy="true" className={cn('grid gap-3 sm:grid-cols-2 xl:grid-cols-4', className)}>
                {[0, 1, 2, 3].map((index) => (
                    <div key={index} className="card h-28 animate-pulse bg-surface-muted" />
                ))}
            </section>
        )
    }

    if (items.length === 0) {
        return (
            <section aria-label="Pendientes" className={cn('card flex items-center gap-4 p-5', className)}>
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
                    <CheckIcon className="size-5" />
                </span>
                <div>
                    <p className="font-display text-lg font-semibold text-fg">Todo al día</p>
                    <p className="text-sm text-fg-muted">Nada espera tu respuesta. Los nuevos pendientes aparecerán aquí.</p>
                </div>
            </section>
        )
    }

    return (
        <section aria-labelledby="agenda-title" className={className}>
            <h2 id="agenda-title" className="sr-only">
                Pendientes
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {items.map((item, index) => (
                    <li key={item.id} className="animate-rise" style={{ animationDelay: `${index * 60}ms` }}>
                        <Link
                            to={item.to}
                            className="card-interactive group relative flex h-full flex-col gap-3 overflow-hidden p-4 pl-5"
                        >
                            {/* Tone rail: the same color the module uses for this kind of item */}
                            <span className={cn('absolute inset-y-0 left-0 w-1', toneSolid[item.tone])} aria-hidden="true" />
                            <span className="flex items-start justify-between gap-3">
                                <span className="flex items-baseline gap-2">
                                    <span className="font-display text-3xl leading-none font-semibold tabular-nums text-fg">{item.count}</span>
                                    <span className="text-sm font-medium leading-snug text-fg">{item.label}</span>
                                </span>
                                <span className={cn('inline-flex size-8 shrink-0 items-center justify-center rounded-lg', toneTint[item.tone])}>
                                    <ModuleIcon name={item.icon} className="size-4" />
                                </span>
                            </span>
                            {item.detail ? (
                                <span className="mt-auto flex items-center gap-2 text-xs text-fg-muted">
                                    <span className="min-w-0 flex-1 truncate">{item.detail}</span>
                                    <ArrowRightIcon className="size-3.5 shrink-0 text-fg-subtle transition-transform duration-(--duration-base) group-hover:translate-x-0.5 group-hover:text-brand" />
                                </span>
                            ) : null}
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    )
}
