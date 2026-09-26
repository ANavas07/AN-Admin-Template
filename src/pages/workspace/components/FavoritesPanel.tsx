import { useNavigate } from 'react-router-dom'
import { useWorkspace } from '../../../context/workspace-context'
import { StarIcon } from '../../../icons/icons'
import { modifierKeyLabel } from '../../../utils/platform'
import Panel from '../../../components/ui/panel/Panel'
import ModuleCard from '../../../components/common/modules/ModuleCard'
import ModuleIcon from '../../../components/common/modules/ModuleIcon'
import type { ModuleDefinition } from '../../../navigation/modules'

type FavoritesPanelProps = {
    favorites: ModuleDefinition[]
    suggestions: ModuleDefinition[]
    usageOf: (moduleId: string) => number
    className?: string
}

function visitsLabel(count: number) {
    if (count === 0) return 'Sin visitas en 30 días'
    return `${count} ${count === 1 ? 'visita' : 'visitas'} en 30 días`
}

/** The user's pinned modules, most used first; suggests frequent ones when empty. */
export default function FavoritesPanel({ favorites, suggestions, usageOf, className }: FavoritesPanelProps) {
    const navigate = useNavigate()
    const { toggleFavorite } = useWorkspace()

    return (
        <Panel
            title="Favoritos"
            headingId="home-favorites"
            description={
                favorites.length > 0
                    ? 'Tus módulos fijados, ordenados por uso'
                    : `Marca módulos con la estrella, aquí o desde la paleta (${modifierKeyLabel()} K → ${modifierKeyLabel()} D)`
            }
            className={className}
        >
            {favorites.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                    {favorites.map((module) => (
                        <ModuleCard
                            key={module.id}
                            icon={module.icon}
                            title={module.title}
                            description={module.description}
                            meta={visitsLabel(usageOf(module.id))}
                            isAvailable={Boolean(module.url)}
                            onClick={module.url ? () => navigate(module.url!) : undefined}
                            isFavorite
                            onToggleFavorite={() => toggleFavorite(module.id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex h-full flex-col justify-center rounded-lg border border-dashed border-line-strong p-5">
                    <div className="flex items-center gap-3">
                        <span className="inline-flex size-9 items-center justify-center rounded-lg bg-warning-soft text-warning">
                            <StarIcon className="size-4.5" />
                        </span>
                        <div>
                            <p className="text-sm font-semibold text-fg">Aún no tienes favoritos</p>
                            <p className="text-xs text-fg-muted">Sugerencias según los módulos que más usas:</p>
                        </div>
                    </div>
                    {suggestions.length > 0 ? (
                        <ul className="mt-4 divide-y divide-line">
                            {suggestions.map((module) => (
                                <li key={module.id} className="flex items-center gap-3 py-2">
                                    <ModuleIcon name={module.icon} className="size-4 text-fg-muted" />
                                    <span className="min-w-0 flex-1 truncate text-sm text-fg">{module.title}</span>
                                    <span className="hidden text-2xs text-fg-subtle sm:inline">{visitsLabel(usageOf(module.id))}</span>
                                    <button
                                        type="button"
                                        onClick={() => toggleFavorite(module.id)}
                                        className="inline-flex h-7 items-center gap-1.5 rounded-md border border-line px-2 text-xs font-medium text-fg transition-colors hover:border-line-strong hover:bg-canvas-subtle"
                                    >
                                        <StarIcon className="size-3.5" />
                                        Fijar
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : null}
                </div>
            )}
        </Panel>
    )
}
