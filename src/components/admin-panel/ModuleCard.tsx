import { ArrowRightIcon } from '../../icons/icons'
import FavoriteToggle from './FavoriteToggle'
import ModuleIcon from './ModuleIcon'

type ModuleCardProps = {
    icon: string
    title: string
    description: string
    onClick?: () => void
    isAvailable?: boolean
    /** Optional favorite star; shown only when a toggle handler is given */
    isFavorite?: boolean
    onToggleFavorite?: () => void
    /** Optional secondary line, e.g. "12 visitas este mes" */
    meta?: string
}

export default function ModuleCard({
    icon,
    title,
    description,
    onClick,
    isAvailable = true,
    isFavorite = false,
    onToggleFavorite,
    meta,
}: ModuleCardProps) {
    return (
        // The star is a sibling of the card button: interactive elements cannot be nested
        <div className="group relative">
            <button
                type="button"
                onClick={onClick}
                disabled={!isAvailable}
                className="card-interactive flex h-full w-full items-start gap-3.5 p-4 pr-11 text-left focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand/25 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-strong">
                    <ModuleIcon name={icon} />
                </span>
                <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold text-fg">{title}</span>
                        <ArrowRightIcon className="size-4 shrink-0 text-fg-subtle opacity-0 transition-opacity group-hover:opacity-100" />
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-fg-muted">{description}</span>
                    {meta ? <span className="mt-2 block text-2xs font-medium text-fg-subtle">{meta}</span> : null}
                </span>
            </button>
            {onToggleFavorite ? (
                <FavoriteToggle
                    isFavorite={isFavorite}
                    onToggle={onToggleFavorite}
                    label={title}
                    className="absolute right-2 top-2"
                />
            ) : null}
        </div>
    )
}
