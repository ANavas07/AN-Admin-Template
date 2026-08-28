import type { ReactNode } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

type PlaygroundNavItem = {
    label: string
    description: string
    path: string
    icon: ReactNode
}

const playgroundNavItems: PlaygroundNavItem[] = [
    {
        label: 'Inputs',
        description: 'Campos, busqueda y estados de formulario',
        path: '/playground/inputs',
        icon: null,
    },
    {
        label: 'Botones',
        description: 'Variantes, tamanos, estados e iconos',
        path: '/playground/buttons',
        icon: null,
    },
    {
        label: 'Tablas',
        description: 'Ordenamiento, filtrado, paginacion y expansion',
        path: '/playground/tables',
        icon: null,
    },
    {
        label: 'Gantt',
        description: 'Diagrama de Gantt con tareas, dependencias y recursos',
        path: '/gantt',
        icon: null,
    },
    {
        label: 'Formularios',
        description: 'Formularios dinamicos, validacion y dependencias entre campos',
        path: '/playground/forms',
        icon: null,
    },
    {
        label: 'Modales',
        description: 'Formularios dinamicos, validacion y dependencias entre campos',
        path: '/playground/modals',
        icon: null,
    },
    {
        label: 'Tareas',
        description: 'Manejo y trazabilidad de proyectos tipo asana',
        path: '/tasks',
        icon: null,
    },
    {
        label: 'Procesos BPMN',
        description: 'Gestion de procesos BPMN',
        path: '/process',
        icon: null,
    },
    {
        label: 'Gestion de Archivos',
        description: 'Gestion de archivos Drag and drop + visualizacion',
        path: '/files',
        icon: null,
    },
    {
        label: 'Gestion de usuarios',
        description: 'Gestionar usuarios y verlos',
        path: '/users',
        icon: null,
    }
]

function cn(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(' ')
}


function DashboardIcon() {
    return (
        <svg viewBox="0 0 20 20" fill="none" className="size-5" aria-hidden="true">
            <path
                d="M3 10.5 10 4l7 6.5M5 9v7h10V9"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

export default function Playground() {
    return (
        <div className="min-h-[calc(100vh-4rem)] bg-(--color-bg)">
            <div className="mx-auto grid max-w-400 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[300px_1fr] lg:px-8">
                <aside className="lg:sticky lg:top-22 lg:h-[calc(100vh-6.5rem)]">
                    <div className="overflow-hidden rounded-3xl border border-(--color-border) bg-(--color-surface) shadow-sm">
                        <div className="border-b border-(--color-border) p-5">
                            <span className="inline-flex rounded-full border border-(--color-border) bg-(--color-bg-soft) px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-(--color-text-muted)">
                                Playground
                            </span>
                            <h1 className="mt-4 text-xl font-bold text-(--color-text)">
                                Catalogo de componentes
                            </h1>
                            <p className="mt-2 text-sm text-(--color-text-muted)">
                                Navega entre los componentes reutilizables del panel.
                            </p>
                        </div>

                        <nav className="space-y-2 p-3 max-h-[50vh] overflow-y-auto" aria-label="Playground navigation">
                            {playgroundNavItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    target={item.path === '/gantt' ? '_blank' : undefined}
                                    rel={item.path === '/gantt' ? 'noreferrer noopener' : undefined}
                                    className={({ isActive }) =>
                                        cn(
                                            'group flex items-start gap-3 rounded-2xl border p-3 transition-all duration-200',
                                            item.path === '/gantt'
                                                ? 'border-transparent text-(--color-text) hover:border-(--color-border) hover:bg-(--color-bg-soft)'
                                                : isActive
                                                    ? 'border-brand/40 bg-brand-soft text-brand shadow-sm'
                                                    : 'border-transparent text-(--color-text) hover:border-(--color-border) hover:bg-(--color-bg-soft)'
                                        )
                                    }
                                >
                                    {item.icon}
                                    <span className="min-w-0">
                                        <span className="block text-sm font-semibold">
                                            {item.label}
                                        </span>
                                        <span className="mt-0.5 block text-xs leading-5 text-(--color-text-muted)">
                                            {item.description}
                                        </span>
                                        {item.path === '/gantt' ? (
                                            <span className="mt-1 inline-flex rounded-full border border-(--color-border) bg-(--color-bg-soft) px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-(--color-text-muted)">
                                                Nueva ventana
                                            </span>
                                        ) : null}
                                    </span>
                                </NavLink>
                            ))}
                        </nav>

                        <div className="border-t border-(--color-border) p-3">
                            <NavLink
                                to="/dashboard"
                                className="flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold text-(--color-text-muted) transition-colors hover:bg-(--color-bg-soft) hover:text-brand"
                            >
                                <DashboardIcon />
                                Volver al dashboard
                            </NavLink>
                        </div>
                    </div>
                </aside>

                <section className="min-w-0">
                    <Outlet />
                </section>
            </div>
        </div>
    )
}
