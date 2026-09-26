import { useState } from 'react'
import { useWorkspace } from '../../../context/workspace-context'
import { cn } from '../../../utils/cn'
import InputComponent from '../../../components/ui/inputs/InputComponent'
import Panel from '../../../components/ui/panel/Panel'
import ModuleCard from '../../../components/common/modules/ModuleCard'
import type { ModuleCategory } from '../../../navigation/modules'

type ModuleCatalogProps = {
    /** Categories already filtered by the active role */
    categories: ModuleCategory[]
    usageOf: (moduleId: string) => number
    onOpen: (url: string) => void
}

const chipClass = 'h-7 rounded-full border px-3 text-xs font-medium transition-colors'

function formatCategoryName(name: string) {
    return name.charAt(0) + name.slice(1).toLowerCase()
}

/** Every module the role can open, searchable and filterable, with favorite stars. */
export default function ModuleCatalog({ categories, usageOf, onOpen }: ModuleCatalogProps) {
    const { isFavorite, toggleFavorite } = useWorkspace()
    const [query, setQuery] = useState('')
    const [category, setCategory] = useState<string | null>(null)

    const normalized = query.trim().toLowerCase()
    const modules = categories
        .filter((entry) => category === null || entry.name === category)
        .flatMap((entry) => entry.modules)
        .filter(
            (module) =>
                module.title.toLowerCase().includes(normalized) || module.description.toLowerCase().includes(normalized)
        )

    return (
        <Panel
            title="Todos los módulos"
            description={`${modules.length} disponibles para tu rol`}
            headingId="home-catalog"
            actions={
                <div className="w-56">
                    <InputComponent
                        aria-label="Filtrar módulos"
                        placeholder="Filtrar…"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        size="sm"
                        showSearchIcon
                        iconPosition="left"
                    />
                </div>
            }
        >
            <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Categoría">
                {[null, ...categories.map((entry) => entry.name)].map((name) => {
                    const isActive = category === name
                    return (
                        <button
                            key={name ?? 'all'}
                            type="button"
                            onClick={() => setCategory(name)}
                            aria-pressed={isActive}
                            className={cn(
                                chipClass,
                                isActive
                                    ? 'border-brand/25 bg-brand-soft text-brand-strong'
                                    : 'border-line text-fg-muted hover:border-line-strong hover:text-fg'
                            )}
                        >
                            {name ? formatCategoryName(name) : 'Todos'}
                        </button>
                    )
                })}
            </div>

            {modules.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {modules.map((module) => {
                        const visits = usageOf(module.id)
                        return (
                            <ModuleCard
                                key={module.id}
                                icon={module.icon}
                                title={module.title}
                                description={module.description}
                                meta={visits > 0 ? `${visits} visitas en 30 días` : undefined}
                                isAvailable={Boolean(module.url)}
                                onClick={module.url ? () => onOpen(module.url!) : undefined}
                                isFavorite={isFavorite(module.id)}
                                onToggleFavorite={() => toggleFavorite(module.id)}
                            />
                        )
                    })}
                </div>
            ) : (
                <p className="rounded-lg border border-dashed border-line-strong py-10 text-center text-sm text-fg-muted">
                    Ningún módulo coincide con «{query}».
                </p>
            )}
        </Panel>
    )
}
