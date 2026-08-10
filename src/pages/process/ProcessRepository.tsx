import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ButtonComponent from '../../components/ui/buttons/ButtonComponent'
import InputComponent from '../../components/ui/inputs/InputComponent'
import PopUp from '../../components/common/pop-up/PopUp'
import ModuleHeader from '../../components/common/page/ModuleHeader'
import { FlowIcon, PlusIcon, TrashBinIcon } from '../../icons/icons'
import { processService } from '../../services/process/process.service'
import { processStatusFlow, processStatusLabels, processStatusStyles } from './types'
import type { ProcessStatus, ProcessSummary } from './types'

function formatDate(iso: string) {
    const date = new Date(iso)
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString()
}

/**
 * Central process repository: the place where the organization finds, filters
 * and opens its documented processes. The editor lives at /process/:id.
 */
export default function ProcessRepository() {
    const navigate = useNavigate()
    const [processes, setProcesses] = useState<ProcessSummary[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<ProcessStatus | 'all'>('all')
    const [categoryFilter, setCategoryFilter] = useState<string>('all')
    const [deleteTarget, setDeleteTarget] = useState<ProcessSummary | null>(null)

    const load = useCallback(() => {
        setLoading(true)
        processService.list().then((items) => {
            setProcesses(items)
            setLoading(false)
        })
    }, [])

    useEffect(() => {
        load()
    }, [load])

    const categories = useMemo(() => {
        const unique = new Set(processes.map((process) => process.category.trim()).filter(Boolean))
        return Array.from(unique).sort()
    }, [processes])

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase()
        return processes.filter((process) => {
            if (statusFilter !== 'all' && process.status !== statusFilter) return false
            if (categoryFilter !== 'all' && process.category.trim() !== categoryFilter) return false
            if (!query) return true
            const haystack = [
                process.name,
                process.code,
                process.area,
                process.category,
                process.responsible,
                ...process.tags,
            ]
                .join(' ')
                .toLowerCase()
            return haystack.includes(query)
        })
    }, [processes, search, statusFilter, categoryFilter])

    async function createProcess() {
        const record = await processService.create()
        navigate(`/process/${record.meta.id}`)
    }

    async function duplicateProcess(id: string) {
        await processService.duplicate(id)
        load()
    }

    async function confirmDelete() {
        if (!deleteTarget) return
        await processService.remove(deleteTarget.id)
        setDeleteTarget(null)
        load()
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-(--color-bg)">
            <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
                <ModuleHeader
                    eyebrow="Gestión de procesos"
                    title="Repositorio de procesos"
                    description="Encuentra, consulta y modela los procesos de la organización. Cada proceso reúne su diagrama BPMN, su documentación y sus archivos."
                    actions={
                        <ButtonComponent
                            variant="primary"
                            leftIcon={<PlusIcon className="size-4" />}
                            onClick={createProcess}
                        >
                            Nuevo proceso
                        </ButtonComponent>
                    }
                />

                {/* Search + filters */}
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <div className="lg:w-80">
                        <InputComponent
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Buscar por nombre, área, responsable…"
                            variant="search"
                            showSearchIcon
                            aria-label="Buscar procesos"
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => setStatusFilter('all')}
                            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                                statusFilter === 'all'
                                    ? 'border-brand bg-brand-soft text-brand'
                                    : 'border-(--color-border) bg-(--color-surface) text-(--color-text-muted) hover:text-(--color-text)'
                            }`}
                        >
                            Todos
                        </button>
                        {processStatusFlow.map((status) => (
                            <button
                                key={status}
                                type="button"
                                onClick={() => setStatusFilter(status)}
                                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                                    statusFilter === status
                                        ? 'border-brand bg-brand-soft text-brand'
                                        : 'border-(--color-border) bg-(--color-surface) text-(--color-text-muted) hover:text-(--color-text)'
                                }`}
                            >
                                {processStatusLabels[status]}
                            </button>
                        ))}
                        {categories.length > 0 ? (
                            <select
                                value={categoryFilter}
                                onChange={(event) => setCategoryFilter(event.target.value)}
                                className="rounded-full border border-(--color-border) bg-(--color-surface) px-3 py-1.5 text-xs font-semibold text-(--color-text-muted) focus:border-highlight focus:outline-none"
                                aria-label="Filtrar por categoría"
                            >
                                <option value="all">Todas las categorías</option>
                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        ) : null}
                    </div>
                </div>

                {/* Process cards */}
                {loading ? (
                    <p className="py-16 text-center text-sm text-(--color-text-muted)">Cargando procesos…</p>
                ) : filtered.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-(--color-border) bg-(--color-surface)/60 py-16 text-center">
                        <FlowIcon className="mx-auto size-10 text-(--color-text-muted)" />
                        <p className="mt-4 text-sm font-semibold text-(--color-text)">
                            {processes.length === 0 ? 'Aún no hay procesos en el repositorio' : 'Ningún proceso coincide con la búsqueda'}
                        </p>
                        <p className="mt-1 text-xs text-(--color-text-muted)">
                            {processes.length === 0
                                ? 'Crea tu primer proceso para empezar a construir el conocimiento de la organización.'
                                : 'Ajusta la búsqueda o los filtros para encontrar lo que necesitas.'}
                        </p>
                        {processes.length === 0 ? (
                            <ButtonComponent
                                variant="primary"
                                size="sm"
                                className="mt-5"
                                leftIcon={<PlusIcon className="size-4" />}
                                onClick={createProcess}
                            >
                                Crear primer proceso
                            </ButtonComponent>
                        ) : null}
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {filtered.map((process) => (
                            <article
                                key={process.id}
                                className="flex flex-col rounded-3xl border border-(--color-border) bg-(--color-surface) p-5 shadow-sm transition-shadow hover:shadow-md"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <h2 className="truncate text-base font-bold text-(--color-text)" title={process.name}>
                                            {process.name}
                                        </h2>
                                        <p className="mt-0.5 text-xs text-(--color-text-muted)">
                                            {process.code ? `${process.code} · ` : ''}
                                            {process.area || 'Sin área'} · v{process.version}
                                        </p>
                                    </div>
                                    <span
                                        className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${processStatusStyles[process.status]}`}
                                    >
                                        {processStatusLabels[process.status]}
                                    </span>
                                </div>

                                {process.description ? (
                                    <p className="mt-3 line-clamp-2 text-xs leading-5 text-(--color-text-muted)">
                                        {process.description}
                                    </p>
                                ) : null}

                                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-(--color-text-muted)">
                                    <span>🧩 {process.elementCount} elementos</span>
                                    <span>📎 {process.documentCount} documentos</span>
                                    {process.responsible ? <span>👤 {process.responsible}</span> : null}
                                </div>

                                <p className="mt-2 text-[11px] text-(--color-text-muted)">
                                    Actualizado: {formatDate(process.updatedAt)}
                                </p>

                                <div className="mt-4 flex items-center gap-2 border-t border-(--color-border) pt-4">
                                    <ButtonComponent
                                        variant="primary"
                                        size="sm"
                                        onClick={() => navigate(`/process/${process.id}`)}
                                    >
                                        Abrir proceso
                                    </ButtonComponent>
                                    <ButtonComponent variant="outline" size="sm" onClick={() => duplicateProcess(process.id)}>
                                        Duplicar
                                    </ButtonComponent>
                                    <button
                                        type="button"
                                        onClick={() => setDeleteTarget(process)}
                                        className="ml-auto rounded-lg p-2 text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-900/30"
                                        aria-label={`Eliminar ${process.name}`}
                                        title="Eliminar proceso"
                                    >
                                        <TrashBinIcon className="size-4" />
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete confirmation */}
            <PopUp
                isOpen={deleteTarget !== null}
                onClose={() => setDeleteTarget(null)}
                title="Eliminar proceso"
                description="Esta acción no se puede deshacer."
                size="sm"
                footer={
                    <>
                        <ButtonComponent variant="outline" onClick={() => setDeleteTarget(null)}>
                            Cancelar
                        </ButtonComponent>
                        <ButtonComponent variant="danger" onClick={confirmDelete}>
                            Eliminar proceso
                        </ButtonComponent>
                    </>
                }
            >
                <p>
                    Se eliminará <strong>{deleteTarget?.name}</strong> junto con su diagrama, documentación y
                    archivos asociados. Exporta el diagrama primero si quieres conservar una copia.
                </p>
            </PopUp>
        </div>
    )
}
