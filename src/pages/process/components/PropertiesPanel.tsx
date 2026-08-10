import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import ButtonComponent from '../../../components/ui/buttons/ButtonComponent'
import InputComponent from '../../../components/ui/inputs/InputComponent'
import { FileDocIcon, NoteIcon, TrashBinIcon } from '../../../icons/icons'
import {
    KIND_BPMN_TYPES,
    bpmnTypeLabels,
    colorOptions,
    hasSemanticData,
    isContainer,
    kindLabels,
    nodeColorStyles,
} from '../flowTypes'
import type { AttachmentRef, BpmnType, EdgeKind, ElementData, FlowEdge, FlowNode } from '../flowTypes'
import BpmnGlyph from './BpmnGlyph'

const textareaClass =
    'w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-2.5 text-sm text-(--color-text) placeholder:text-(--color-text-muted) transition-all duration-200 focus:border-highlight focus:outline-none focus:ring-2 focus:ring-highlight/25'

const selectClass =
    'w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-3.5 py-2.5 text-sm text-(--color-text) transition-all duration-200 focus:border-highlight focus:outline-none focus:ring-2 focus:ring-highlight/25'

/** Files up to this size keep their content inline (localStorage); larger ones keep metadata only. */
const INLINE_ATTACHMENT_LIMIT = 300_000

const edgeKindLabels: Record<EdgeKind, string> = {
    sequence: 'Flujo de secuencia',
    message: 'Flujo de mensaje',
    association: 'Asociación',
}

export function formatBytes(size: number) {
    if (size <= 0) return '—'
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso: string) {
    const date = new Date(iso)
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString()
}

type ListInputProps = {
    label: string
    value: string[]
    placeholder: string
    onCommit: (items: string[]) => void
}

/** Comma-separated list editor: keeps the raw text locally so typing stays natural. */
function ListInput({ label, value, placeholder, onCommit }: ListInputProps) {
    const [raw, setRaw] = useState(value.join(', '))
    return (
        <div>
            <label className="mb-1.5 block text-sm font-medium text-(--color-text)">{label}</label>
            <input
                value={raw}
                onChange={(event) => {
                    setRaw(event.target.value)
                    onCommit(
                        event.target.value
                            .split(',')
                            .map((item) => item.trim())
                            .filter(Boolean)
                    )
                }}
                placeholder={placeholder}
                className="w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-2.5 text-sm text-(--color-text) placeholder:text-(--color-text-muted) transition-all duration-200 focus:border-highlight focus:outline-none focus:ring-2 focus:ring-highlight/25"
            />
            <p className="mt-1 text-[11px] text-(--color-text-muted)">Separa los valores con comas.</p>
        </div>
    )
}

type PropertiesPanelProps = {
    selectedNode: FlowNode | null
    selectedEdge: FlowEdge | null
    nodes: FlowNode[]
    onUpdateNode: (nodeId: string, patch: Partial<FlowNode>) => void
    onUpdateNodeData: (nodeId: string, patch: Partial<ElementData>) => void
    onUpdateEdge: (edgeId: string, patch: Partial<FlowEdge>) => void
    onDuplicateNode: (nodeId: string) => void
    onRemoveNode: (nodeId: string) => void
    onRemoveEdge: (edgeId: string) => void
    onStatus: (message: string) => void
}

/**
 * Contextual properties panel. Beyond the visual fields, it captures the
 * semantic documentation (responsible, systems, attachments…) that turns the
 * diagram into structured, consultable process knowledge.
 */
export default function PropertiesPanel({
    selectedNode,
    selectedEdge,
    nodes,
    onUpdateNode,
    onUpdateNodeData,
    onUpdateEdge,
    onDuplicateNode,
    onRemoveNode,
    onRemoveEdge,
    onStatus,
}: PropertiesPanelProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)

    async function handleAttachFiles(event: ChangeEvent<HTMLInputElement>) {
        const files = Array.from(event.target.files ?? [])
        event.target.value = ''
        if (!selectedNode || files.length === 0) return

        const attachments: AttachmentRef[] = []
        for (const file of files) {
            const base: AttachmentRef = {
                id: `doc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
                name: file.name,
                size: file.size,
                mimeType: file.type || 'application/octet-stream',
                addedAt: new Date().toISOString(),
            }
            if (file.size <= INLINE_ATTACHMENT_LIMIT) {
                try {
                    base.dataUrl = await new Promise<string>((resolve, reject) => {
                        const reader = new FileReader()
                        reader.onload = () => resolve(reader.result as string)
                        reader.onerror = () => reject(reader.error)
                        reader.readAsDataURL(file)
                    })
                } catch {
                    // Keep metadata only when the file cannot be read
                }
            }
            attachments.push(base)
        }

        onUpdateNodeData(selectedNode.id, {
            documents: [...selectedNode.data.documents, ...attachments],
        })
        const oversized = attachments.filter((doc) => !doc.dataUrl).length
        onStatus(
            oversized > 0
                ? `${attachments.length} documento(s) adjuntados. ${oversized} superan el límite local y guardan solo su referencia.`
                : `${attachments.length} documento(s) adjuntados al elemento.`
        )
    }

    function downloadAttachment(doc: AttachmentRef) {
        if (!doc.dataUrl) {
            onStatus('Este documento solo tiene referencia: su contenido se gestionará con el servidor de archivos.')
            return
        }
        const anchor = document.createElement('a')
        anchor.href = doc.dataUrl
        anchor.download = doc.name
        anchor.click()
    }

    function removeAttachment(doc: AttachmentRef) {
        if (!selectedNode) return
        onUpdateNodeData(selectedNode.id, {
            documents: selectedNode.data.documents.filter((item) => item.id !== doc.id),
        })
    }

    if (selectedNode) {
        const bpmnOptions = KIND_BPMN_TYPES[selectedNode.kind] ?? []
        const typeLabel = selectedNode.bpmnType
            ? bpmnTypeLabels[selectedNode.bpmnType]
            : kindLabels[selectedNode.kind]

        return (
            <div className="space-y-5 p-5">
                <div className="flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-soft text-brand">
                        <BpmnGlyph kind={selectedNode.kind} bpmnType={selectedNode.bpmnType} className="size-5" />
                    </span>
                    <span className="inline-flex rounded-full border border-(--color-border) bg-(--color-bg-soft) px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-(--color-text-muted)">
                        {typeLabel}
                    </span>
                </div>

                {bpmnOptions.length > 1 ? (
                    <div>
                        <label htmlFor="node-bpmn-type" className="mb-1.5 block text-sm font-medium text-(--color-text)">
                            Tipo BPMN
                        </label>
                        <select
                            id="node-bpmn-type"
                            value={selectedNode.bpmnType ?? ''}
                            onChange={(event) =>
                                onUpdateNode(selectedNode.id, { bpmnType: event.target.value as BpmnType })
                            }
                            className={selectClass}
                        >
                            {bpmnOptions.map((option) => (
                                <option key={option} value={option}>
                                    {bpmnTypeLabels[option]}
                                </option>
                            ))}
                        </select>
                    </div>
                ) : null}

                <InputComponent
                    label={selectedNode.kind === 'note' ? 'Título de la nota' : 'Nombre'}
                    value={selectedNode.title}
                    onChange={(event) => onUpdateNode(selectedNode.id, { title: event.target.value })}
                    placeholder="Nombre del elemento"
                />

                {!isContainer(selectedNode.kind) ? (
                    <div>
                        <label htmlFor="node-description" className="mb-1.5 block text-sm font-medium text-(--color-text)">
                            {selectedNode.kind === 'note' ? 'Contenido' : 'Descripción'}
                        </label>
                        <textarea
                            id="node-description"
                            value={selectedNode.description}
                            onChange={(event) => onUpdateNode(selectedNode.id, { description: event.target.value })}
                            rows={3}
                            placeholder={
                                selectedNode.kind === 'note'
                                    ? 'Escribe el contenido de la nota'
                                    : '¿Qué ocurre en este paso?'
                            }
                            className={textareaClass}
                        />
                    </div>
                ) : null}

                {hasSemanticData(selectedNode.kind) ? (
                    <div key={selectedNode.id} className="space-y-4 rounded-2xl border border-(--color-border) bg-(--color-bg-soft)/60 p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-(--color-text-muted)">
                            Documentación
                        </p>
                        <InputComponent
                            label="Responsable"
                            value={selectedNode.data.responsible}
                            onChange={(event) => onUpdateNodeData(selectedNode.id, { responsible: event.target.value })}
                            placeholder="p. ej. Secretaría Académica"
                        />
                        <InputComponent
                            label="Departamento / área"
                            value={selectedNode.data.department}
                            onChange={(event) => onUpdateNodeData(selectedNode.id, { department: event.target.value })}
                            placeholder="p. ej. Bienestar"
                        />
                        <InputComponent
                            label="Tiempo estimado"
                            value={selectedNode.data.estimatedTime}
                            onChange={(event) => onUpdateNodeData(selectedNode.id, { estimatedTime: event.target.value })}
                            placeholder="p. ej. 10 minutos"
                        />
                        <ListInput
                            label="Sistemas utilizados"
                            value={selectedNode.data.systems}
                            placeholder="p. ej. SGA, Sistema Académico"
                            onCommit={(systems) => onUpdateNodeData(selectedNode.id, { systems })}
                        />
                        <ListInput
                            label="Entradas"
                            value={selectedNode.data.inputs}
                            placeholder="p. ej. Solicitud, Datos del estudiante"
                            onCommit={(inputs) => onUpdateNodeData(selectedNode.id, { inputs })}
                        />
                        <ListInput
                            label="Salidas"
                            value={selectedNode.data.outputs}
                            placeholder="p. ej. Solicitud validada"
                            onCommit={(outputs) => onUpdateNodeData(selectedNode.id, { outputs })}
                        />

                        <div>
                            <p className="mb-1.5 text-sm font-medium text-(--color-text)">Documentos</p>
                            {selectedNode.data.documents.length > 0 ? (
                                <ul className="space-y-1.5">
                                    {selectedNode.data.documents.map((doc) => (
                                        <li
                                            key={doc.id}
                                            className="flex items-center gap-2 rounded-xl border border-(--color-border) bg-(--color-surface) px-3 py-2"
                                        >
                                            <FileDocIcon className="size-4 shrink-0 text-(--color-text-muted)" />
                                            <button
                                                type="button"
                                                onClick={() => downloadAttachment(doc)}
                                                className="min-w-0 flex-1 text-left"
                                                title={doc.dataUrl ? 'Descargar documento' : 'Solo referencia'}
                                            >
                                                <span className="block truncate text-xs font-semibold text-(--color-text)">
                                                    {doc.name}
                                                </span>
                                                <span className="block text-[10px] text-(--color-text-muted)">
                                                    {formatBytes(doc.size)} · {formatDate(doc.addedAt)}
                                                    {!doc.dataUrl ? ' · referencia' : ''}
                                                </span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeAttachment(doc)}
                                                className="shrink-0 rounded-lg p-1 text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-900/30"
                                                aria-label={`Eliminar ${doc.name}`}
                                            >
                                                <TrashBinIcon className="size-3.5" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-xs text-(--color-text-muted)">Sin documentos asociados.</p>
                            )}
                            <ButtonComponent
                                variant="outline"
                                size="sm"
                                fullWidth
                                className="mt-2"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                + Adjuntar archivo
                            </ButtonComponent>
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                className="hidden"
                                onChange={handleAttachFiles}
                                aria-label="Adjuntar documentos al elemento"
                            />
                        </div>
                    </div>
                ) : null}

                {selectedNode.kind === 'task' || selectedNode.kind === 'data' || selectedNode.kind === 'decision' ? (
                    <div>
                        <label htmlFor="node-note" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-(--color-text)">
                            <NoteIcon className="size-4 text-amber-600 dark:text-amber-400" />
                            Nota adjunta
                        </label>
                        <textarea
                            id="node-note"
                            value={selectedNode.note}
                            onChange={(event) => onUpdateNode(selectedNode.id, { note: event.target.value })}
                            rows={3}
                            placeholder="Agrega una anotación para este elemento"
                            className="w-full rounded-xl border border-amber-600/30 bg-amber-50/50 px-4 py-2.5 text-sm text-(--color-text) placeholder:text-(--color-text-muted) transition-all duration-200 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/25 dark:bg-amber-500/5"
                        />
                    </div>
                ) : null}

                {selectedNode.kind !== 'start' && selectedNode.kind !== 'end' && selectedNode.kind !== 'note' ? (
                    <div>
                        <p className="mb-2 text-sm font-medium text-(--color-text)">Color de acento</p>
                        <div className="flex flex-wrap gap-2">
                            {colorOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => onUpdateNode(selectedNode.id, { color: option.value })}
                                    className={[
                                        'h-8 w-8 rounded-full transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-surface)',
                                        nodeColorStyles[option.value].swatch,
                                        selectedNode.color === option.value
                                            ? 'ring-2 ring-(--color-text) ring-offset-2 ring-offset-(--color-surface)'
                                            : '',
                                    ].join(' ')}
                                    aria-label={`Usar color ${option.label}`}
                                    aria-pressed={selectedNode.color === option.value}
                                    title={option.label}
                                />
                            ))}
                        </div>
                    </div>
                ) : null}

                <div className="space-y-2 border-t border-(--color-border) pt-4">
                    <ButtonComponent variant="outline" size="sm" fullWidth onClick={() => onDuplicateNode(selectedNode.id)}>
                        Duplicar elemento
                    </ButtonComponent>
                    <ButtonComponent
                        variant="danger"
                        size="sm"
                        fullWidth
                        leftIcon={<TrashBinIcon className="size-4" />}
                        onClick={() => onRemoveNode(selectedNode.id)}
                    >
                        Eliminar elemento
                    </ButtonComponent>
                </div>
            </div>
        )
    }

    if (selectedEdge) {
        return (
            <div className="space-y-5 p-5">
                <span className="inline-flex rounded-full border border-(--color-border) bg-(--color-bg-soft) px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-(--color-text-muted)">
                    Conexión
                </span>
                <p className="text-sm text-(--color-text)">
                    <span className="font-semibold">
                        {nodes.find((node) => node.id === selectedEdge.from)?.title ?? 'Elemento desconocido'}
                    </span>
                    {' → '}
                    <span className="font-semibold">
                        {nodes.find((node) => node.id === selectedEdge.to)?.title ?? 'Elemento desconocido'}
                    </span>
                </p>
                <div>
                    <label htmlFor="edge-kind" className="mb-1.5 block text-sm font-medium text-(--color-text)">
                        Tipo de conector
                    </label>
                    <select
                        id="edge-kind"
                        value={selectedEdge.kind}
                        onChange={(event) => onUpdateEdge(selectedEdge.id, { kind: event.target.value as EdgeKind })}
                        className={selectClass}
                    >
                        {(Object.keys(edgeKindLabels) as EdgeKind[]).map((option) => (
                            <option key={option} value={option}>
                                {edgeKindLabels[option]}
                            </option>
                        ))}
                    </select>
                </div>
                <InputComponent
                    label="Etiqueta"
                    value={selectedEdge.label}
                    onChange={(event) => onUpdateEdge(selectedEdge.id, { label: event.target.value })}
                    placeholder="p. ej. Sí / No / Aprobado"
                    hint="Se muestra en la mitad de la flecha."
                />
                <InputComponent
                    label="Condición"
                    value={selectedEdge.condition}
                    onChange={(event) => onUpdateEdge(selectedEdge.id, { condition: event.target.value })}
                    placeholder="p. ej. monto > 100"
                    hint="Documenta cuándo se toma esta ruta."
                />
                <ButtonComponent
                    variant="danger"
                    size="sm"
                    fullWidth
                    leftIcon={<TrashBinIcon className="size-4" />}
                    onClick={() => onRemoveEdge(selectedEdge.id)}
                >
                    Eliminar conexión
                </ButtonComponent>
            </div>
        )
    }

    return (
        <div className="space-y-4 p-5">
            <span className="inline-flex rounded-full border border-(--color-border) bg-(--color-bg-soft) px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-(--color-text-muted)">
                Cómo funciona
            </span>
            <ul className="space-y-3 text-sm text-(--color-text-muted)">
                <li className="flex gap-2.5">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                    Agrega eventos, tareas, compuertas y más desde la paleta izquierda. Pasa el cursor sobre un elemento para ver qué hace.
                </li>
                <li className="flex gap-2.5">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                    Arrastra desde el puerto derecho de un elemento y suelta sobre otro para conectarlos.
                </li>
                <li className="flex gap-2.5">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                    Selecciona un elemento para documentarlo: responsable, sistemas, tiempos y archivos adjuntos.
                </li>
                <li className="flex gap-2.5">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                    Usa Ctrl+Z / Ctrl+Y para deshacer y rehacer, la rueda para hacer zoom y el minimapa para desplazarte.
                </li>
                <li className="flex gap-2.5">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                    Valida el diagrama con el botón «Validar» para detectar elementos sueltos o sin documentar.
                </li>
                <li className="flex gap-2.5">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                    Guardar almacena el proceso en el repositorio; Exportar / Importar lo mueve como archivo JSON.
                </li>
            </ul>
        </div>
    )
}
