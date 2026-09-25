import { useRef } from 'react'
import type { ChangeEvent } from 'react'
import ButtonComponent from '../../../components/ui/buttons/ButtonComponent'
import { ArrowLeftIcon, FlowIcon, SparkIcon, TrashBinIcon } from '../../../icons/icons'
import { processStatusLabels, processStatusStyles } from '../types'
import type { ProcessMeta } from '../types'

type DesignerToolbarProps = {
    meta: ProcessMeta
    nodeCount: number
    edgeCount: number
    isDirty: boolean
    isConnecting: boolean
    canUndo: boolean
    canRedo: boolean
    onBack: () => void
    onOpenInfo: () => void
    onUndo: () => void
    onRedo: () => void
    onValidate: () => void
    onOpenAi: () => void
    onImport: (file: File) => void
    onExport: () => void
    onSave: () => void
    onClear: () => void
}

const historyButtonClass =
    'px-2.5 py-1.5 text-sm text-(--color-text) transition-colors hover:bg-(--color-bg-soft) disabled:cursor-not-allowed disabled:opacity-40'

/** Top bar of the process designer: process identity, history and diagram actions. */
export default function DesignerToolbar({
    meta,
    nodeCount,
    edgeCount,
    isDirty,
    isConnecting,
    canUndo,
    canRedo,
    onBack,
    onOpenInfo,
    onUndo,
    onRedo,
    onValidate,
    onOpenAi,
    onImport,
    onExport,
    onSave,
    onClear,
}: DesignerToolbarProps) {
    const importInputRef = useRef<HTMLInputElement>(null)

    function handleImportChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0]
        // Reset so choosing the same file again triggers onChange
        event.target.value = ''
        if (file) onImport(file)
    }

    return (
        <div className="border-b border-(--color-border) bg-(--color-surface)/80 backdrop-blur">
            <div className="mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
                <div className="flex min-w-0 items-center gap-3">
                    <button
                        type="button"
                        onClick={onBack}
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-(--color-border) text-(--color-text-muted) transition-colors hover:bg-(--color-bg-soft) hover:text-(--color-text)"
                        aria-label="Volver al repositorio de procesos"
                        title="Volver al repositorio"
                    >
                        <ArrowLeftIcon className="size-4" />
                    </button>
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                        <FlowIcon className="size-5" />
                    </span>
                    <div className="min-w-0">
                        <button
                            type="button"
                            onClick={onOpenInfo}
                            className="flex max-w-full items-center gap-2 text-left"
                            title="Editar información del proceso"
                        >
                            <h1 className="truncate text-sm font-bold text-(--color-text) hover:text-brand">
                                {meta.name}
                            </h1>
                            <span
                                className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${processStatusStyles[meta.status]}`}
                            >
                                {processStatusLabels[meta.status]}
                            </span>
                        </button>
                        <p className="truncate text-xs text-(--color-text-muted)">
                            {meta.code ? `${meta.code} · ` : ''}v{meta.version} · {nodeCount} elementos ·{' '}
                            {edgeCount} conexiones
                            {isDirty ? ' · cambios sin guardar' : ''}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {isConnecting ? (
                        <span className="animate-pulse rounded-full border border-brand/40 bg-brand-soft px-3 py-1.5 text-xs font-semibold text-brand">
                            Suelta sobre el elemento destino · Esc para cancelar
                        </span>
                    ) : null}
                    <div className="flex items-center overflow-hidden rounded-xl border border-(--color-border)">
                        <button
                            type="button"
                            onClick={onUndo}
                            disabled={!canUndo}
                            className={historyButtonClass}
                            aria-label="Deshacer"
                            title="Deshacer (Ctrl+Z)"
                        >
                            ↶
                        </button>
                        <span className="h-5 w-px bg-(--color-border)" aria-hidden="true" />
                        <button
                            type="button"
                            onClick={onRedo}
                            disabled={!canRedo}
                            className={historyButtonClass}
                            aria-label="Rehacer"
                            title="Rehacer (Ctrl+Y)"
                        >
                            ↷
                        </button>
                    </div>
                    <ButtonComponent size="sm" variant="outline" onClick={onValidate}>
                        Validar
                    </ButtonComponent>
                    <ButtonComponent
                        size="sm"
                        variant="outline"
                        leftIcon={<SparkIcon className="size-4" />}
                        onClick={onOpenAi}
                    >
                        Generar con IA
                    </ButtonComponent>
                    <ButtonComponent size="sm" variant="outline" onClick={() => importInputRef.current?.click()}>
                        Importar
                    </ButtonComponent>
                    <ButtonComponent size="sm" variant="outline" onClick={onExport}>
                        Exportar
                    </ButtonComponent>
                    <ButtonComponent size="sm" variant="primary" onClick={onSave}>
                        Guardar
                    </ButtonComponent>
                    <ButtonComponent
                        size="sm"
                        variant="outline"
                        leftIcon={<TrashBinIcon className="size-4" />}
                        onClick={onClear}
                        disabled={nodeCount === 0}
                        aria-label="Limpiar lienzo"
                        title="Limpiar lienzo"
                    >
                        Limpiar
                    </ButtonComponent>
                    <input
                        ref={importInputRef}
                        type="file"
                        accept=".json,application/json"
                        className="hidden"
                        onChange={handleImportChange}
                        aria-label="Importar diagrama JSON"
                    />
                </div>
            </div>
        </div>
    )
}
