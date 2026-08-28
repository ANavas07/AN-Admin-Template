import { useMemo, useState } from 'react'
import InputComponent from '../ui/inputs/InputComponent'
import SidebarPanel from './SidebarPanel'
import ModuleCard from './ModuleCard'
import type { ModuleCategory } from './data/modules'

export type { ModuleCategory }

type MainPanelProps = {
    categories: ModuleCategory[]
    userRole: string
    userName: string
    userEmail: string
    organization: string
    identifier: string
    location: string
    onModuleClick?: (moduleUrl: string) => void
}

export default function MainPanel({
    categories,
    userRole,
    userName,
    userEmail,
    organization,
    identifier,
    location,
    onModuleClick,
}: MainPanelProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

    // Filtrar módulos según búsqueda y rol
    const filteredCategories = useMemo(() => {
        return categories
            .map((category) => ({
                ...category,
                modules: category.modules.filter((module) => {
                    const matchesSearch =
                        module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        module.description
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())

                    const hasAccess =
                        !module.requiredRoles || module.requiredRoles.includes(userRole)

                    return matchesSearch && hasAccess
                }),
            }))
            .filter((category) => category.modules.length > 0)
    }, [categories, searchQuery, userRole])

    // Auto-expandir primer categoría al iniciar
    const firstCategoryName = useMemo(
        () => filteredCategories[0]?.name || null,
        [filteredCategories]
    )

    const activeCategory = expandedCategory || firstCategoryName

    return (
        <div className="min-h-screen bg-(--color-bg) py-6">
            <div className="mx-auto  px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <div className="mb-6 flex items-center gap-2 text-sm">
                    <span className="text-(--color-text-muted)">Inicio</span>
                    <span className="text-(--color-text-muted)">/</span>
                    <span className="font-medium text-(--color-text)">Panel Admin</span>
                </div>

                {/* Layout de 2 columnas */}
                <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
                    {/* Sidebar */}
                    <aside>
                        <SidebarPanel
                            userName={userName}
                            userEmail={userEmail}
                            organization={organization}
                            identifier={identifier}
                            location={location}
                            onUploadPhoto={() =>
                                console.log('Subir foto clicked')
                            }
                            onIdentification={() =>
                                console.log('Identificación clicked')
                            }
                        />
                    </aside>

                    {/* Contenido Principal */}
                    <main className="space-y-6">
                        {/* Encabezado */}
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-(--color-border) bg-(--color-bg-soft) px-3 py-1 text-xs font-semibold uppercase tracking-wider text-(--color-text-muted)">
                                <span>📚</span>
                                Módulos Disponibles
                            </div>
                            <h1 className="mt-3 text-3xl font-bold text-(--color-text)">
                                Módulos Disponibles
                            </h1>
                            <p className="mt-2 text-sm text-(--color-text-muted)">
                                Grupos:{' '}
                                <span className="font-semibold">
                                    {filteredCategories
                                        .map((c) => c.name)
                                        .join(', ')}
                                </span>
                            </p>
                        </div>

                        {/* Búsqueda */}
                        <div className="relative">
                            <InputComponent
                                label="Buscar módulos por nombre o descripción..."
                                placeholder="Ej. calendario, reportes, soporte"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                variant="search"
                                showSearchIcon
                                hint="Busca por nombre o descripcion."
                            />
                        </div>

                        {/* Categorías de módulos */}
                        <div className="space-y-4">
                            {filteredCategories.length > 0 ? (
                                filteredCategories.map((category) => (
                                    <div key={category.name}>
                                        {/* Encabezado de categoría */}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setExpandedCategory(
                                                    activeCategory === category.name ? null : category.name
                                                )
                                            }
                                            className="group mb-4 flex w-full items-center gap-2 text-lg font-bold text-(--color-text) transition-colors hover:text-highlight"
                                        >
                                            <span className="text-2xl">{category.icon}</span>
                                            {category.name.toUpperCase()}
                                            <span
                                                className={`ml-auto text-lg transition-transform ${activeCategory === category.name
                                                    ? 'rotate-180'
                                                    : ''
                                                    }`}
                                            >
                                                ▼
                                            </span>
                                        </button>

                                        {/* Grid de módulos */}
                                        {activeCategory === category.name && (
                                            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                                                {category.modules.map((module) => (
                                                    <ModuleCard
                                                        key={module.id}
                                                        icon={module.icon}
                                                        title={module.title}
                                                        description={module.description}
                                                        isAvailable={Boolean(module.url)}
                                                        onClick={
                                                            module.url
                                                                ? () => onModuleClick?.(module.url as string)
                                                                : undefined
                                                        }
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-2xl border-2 border-dashed border-(--color-border) bg-(--color-bg-soft) p-12 text-center">
                                    <p className="text-lg font-semibold text-(--color-text)">
                                        No hay módulos disponibles
                                    </p>
                                    <p className="mt-2 text-sm text-(--color-text-muted)">
                                        Intenta ajustar tu búsqueda
                                    </p>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}
