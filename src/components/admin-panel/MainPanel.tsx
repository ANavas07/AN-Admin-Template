import { useMemo, useState } from 'react'
import InputComponent from '../ui/inputs/InputComponent'
import SidebarPanel from './SidebarPanel'
import ModuleCard from './ModuleCard'
import ModuleIcon from './ModuleIcon'
import { ChevronIcon } from '../../icons/icons'
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
        <div className="min-h-[calc(100vh-var(--layout-navbar-height))] bg-canvas py-6">
            <div className="mx-auto max-w-(--layout-content-max-width) px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <nav className="mb-6 flex items-center gap-2 text-sm" aria-label="Breadcrumb">
                    <span className="text-fg-muted">Inicio</span>
                    <span className="text-fg-subtle" aria-hidden="true">/</span>
                    <span className="font-medium text-fg">Panel Admin</span>
                </nav>

                <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
                    <aside>
                        <SidebarPanel
                            userName={userName}
                            userEmail={userEmail}
                            organization={organization}
                            identifier={identifier}
                            location={location}
                            onUploadPhoto={() => console.log('Subir foto clicked')}
                            onIdentification={() => console.log('Identificación clicked')}
                        />
                    </aside>

                    <main className="min-w-0 space-y-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="eyebrow">Espacio de trabajo</p>
                                <h1 className="page-title mt-1.5">Módulos disponibles</h1>
                                <p className="mt-1.5 text-sm text-fg-muted">
                                    {filteredCategories.length} grupos ·{' '}
                                    {filteredCategories.reduce((total, c) => total + c.modules.length, 0)} módulos con
                                    acceso para tu rol
                                </p>
                            </div>
                            <div className="w-full sm:max-w-sm">
                                <InputComponent
                                    aria-label="Buscar módulos por nombre o descripción"
                                    placeholder="Buscar módulos…"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    showSearchIcon
                                    iconPosition="left"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            {filteredCategories.length > 0 ? (
                                filteredCategories.map((category) => {
                                    const isOpen = activeCategory === category.name
                                    return (
                                        <section key={category.name} className="card">
                                            <button
                                                type="button"
                                                onClick={() => setExpandedCategory(isOpen ? null : category.name)}
                                                aria-expanded={isOpen}
                                                className="flex w-full items-center gap-3 rounded-2xl px-5 py-3.5 text-left transition-colors hover:bg-canvas-subtle/60"
                                            >
                                                <span className="inline-flex size-8 items-center justify-center rounded-md bg-canvas-subtle text-fg-muted">
                                                    <ModuleIcon name={category.icon} className="size-4" />
                                                </span>
                                                <span className="text-sm font-semibold text-fg">
                                                    {formatCategoryName(category.name)}
                                                </span>
                                                <span className="rounded-full bg-canvas-subtle px-2 py-0.5 text-2xs font-medium text-fg-muted">
                                                    {category.modules.length}
                                                </span>
                                                <ChevronIcon
                                                    className={`ml-auto size-4 text-fg-subtle transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                                />
                                            </button>

                                            {isOpen && (
                                                <div className="grid grid-cols-1 gap-3 border-t border-line p-4 sm:grid-cols-2 xl:grid-cols-3">
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
                                        </section>
                                    )
                                })
                            ) : (
                                <div className="rounded-2xl border border-dashed border-line-strong p-12 text-center">
                                    <p className="text-sm font-semibold text-fg">No hay módulos disponibles</p>
                                    <p className="mt-1 text-sm text-fg-muted">Intenta ajustar tu búsqueda</p>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}

/** "OPERACION" → "Operacion": category ids are stored uppercase. */
function formatCategoryName(name: string) {
    return name.charAt(0) + name.slice(1).toLowerCase()
}
