import { StarIcon } from '../../icons/icons'
import { cn } from '../../utils/cn'

type FavoriteToggleProps = {
    isFavorite: boolean
    onToggle: () => void
    label: string
    className?: string
}

/** Star button to add / remove a module from the user's favorites. */
export default function FavoriteToggle({ isFavorite, onToggle, label, className }: FavoriteToggleProps) {
    return (
        <button
            type="button"
            onClick={(event) => {
                event.stopPropagation()
                onToggle()
            }}
            aria-pressed={isFavorite}
            aria-label={isFavorite ? `Quitar ${label} de favoritos` : `Agregar ${label} a favoritos`}
            title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            className={cn(
                'inline-flex size-8 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-canvas-subtle focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand/25',
                isFavorite ? 'text-warning' : 'text-fg-subtle hover:text-fg',
                className
            )}
        >
            <StarIcon className={cn('size-4', isFavorite && 'fill-current')} />
        </button>
    )
}
