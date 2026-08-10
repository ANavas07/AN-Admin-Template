import { useEffect, useState } from 'react'
import PopUp from '../../../components/common/pop-up/PopUp'
import ButtonComponent from '../../../components/ui/buttons/ButtonComponent'
import InputComponent from '../../../components/ui/inputs/InputComponent'
import { processStatusFlow, processStatusLabels } from '../types'
import type { ProcessMeta, ProcessStatus } from '../types'

type ProcessInfoModalProps = {
    isOpen: boolean
    onClose: () => void
    meta: ProcessMeta
    onSave: (patch: Partial<Omit<ProcessMeta, 'id' | 'createdAt'>>) => void
}

const textareaClass =
    'w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-2.5 text-sm text-(--color-text) placeholder:text-(--color-text-muted) transition-all duration-200 focus:border-highlight focus:outline-none focus:ring-2 focus:ring-highlight/25'

/**
 * General process information, independent from the diagram: identification,
 * ownership, lifecycle status and documentation (description, objective, scope).
 */
export default function ProcessInfoModal({ isOpen, onClose, meta, onSave }: ProcessInfoModalProps) {
    const [form, setForm] = useState(meta)

    useEffect(() => {
        if (isOpen) setForm(meta)
    }, [isOpen, meta])

    function patch(field: keyof ProcessMeta, value: string) {
        setForm((current) => ({ ...current, [field]: value }))
    }

    function handleSave() {
        onSave({
            name: form.name.trim() || 'Proceso sin título',
            code: form.code.trim(),
            area: form.area.trim(),
            category: form.category.trim(),
            responsible: form.responsible.trim(),
            version: form.version.trim() || meta.version,
            status: form.status,
            description: form.description,
            objective: form.objective,
            scope: form.scope,
            tags: form.tags,
        })
        onClose()
    }

    return (
        <PopUp
            isOpen={isOpen}
            onClose={onClose}
            title="Información del proceso"
            description="Datos generales del proceso, independientes del diagrama."
            size="lg"
            footer={
                <>
                    <ButtonComponent variant="outline" onClick={onClose}>
                        Cancelar
                    </ButtonComponent>
                    <ButtonComponent variant="primary" onClick={handleSave}>
                        Guardar información
                    </ButtonComponent>
                </>
            }
        >
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <InputComponent
                        label="Nombre"
                        value={form.name}
                        onChange={(event) => patch('name', event.target.value)}
                        placeholder="p. ej. Atención de solicitudes estudiantiles"
                        requiredMark
                    />
                </div>
                <InputComponent
                    label="Código"
                    value={form.code}
                    onChange={(event) => patch('code', event.target.value)}
                    placeholder="p. ej. PROC-ACA-001"
                />
                <InputComponent
                    label="Versión"
                    value={form.version}
                    onChange={(event) => patch('version', event.target.value)}
                    placeholder="p. ej. 1.2"
                />
                <InputComponent
                    label="Área"
                    value={form.area}
                    onChange={(event) => patch('area', event.target.value)}
                    placeholder="p. ej. Secretaría Académica"
                />
                <InputComponent
                    label="Categoría"
                    value={form.category}
                    onChange={(event) => patch('category', event.target.value)}
                    placeholder="p. ej. Académicos"
                />
                <InputComponent
                    label="Responsable"
                    value={form.responsible}
                    onChange={(event) => patch('responsible', event.target.value)}
                    placeholder="p. ej. Coordinación Académica"
                />
                <div>
                    <label htmlFor="process-status" className="mb-1.5 block text-sm font-medium text-(--color-text)">
                        Estado
                    </label>
                    <select
                        id="process-status"
                        value={form.status}
                        onChange={(event) => patch('status', event.target.value as ProcessStatus)}
                        className="w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-3.5 py-2.5 text-sm text-(--color-text) focus:border-highlight focus:outline-none focus:ring-2 focus:ring-highlight/25"
                    >
                        {processStatusFlow.map((status) => (
                            <option key={status} value={status}>
                                {processStatusLabels[status]}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="sm:col-span-2">
                    <label htmlFor="process-description" className="mb-1.5 block text-sm font-medium text-(--color-text)">
                        Descripción
                    </label>
                    <textarea
                        id="process-description"
                        value={form.description}
                        onChange={(event) => patch('description', event.target.value)}
                        rows={2}
                        placeholder="Proceso utilizado para gestionar…"
                        className={textareaClass}
                    />
                </div>
                <div className="sm:col-span-2">
                    <label htmlFor="process-objective" className="mb-1.5 block text-sm font-medium text-(--color-text)">
                        Objetivo
                    </label>
                    <textarea
                        id="process-objective"
                        value={form.objective}
                        onChange={(event) => patch('objective', event.target.value)}
                        rows={2}
                        placeholder="Garantizar que…"
                        className={textareaClass}
                    />
                </div>
                <div className="sm:col-span-2">
                    <label htmlFor="process-scope" className="mb-1.5 block text-sm font-medium text-(--color-text)">
                        Alcance
                    </label>
                    <textarea
                        id="process-scope"
                        value={form.scope}
                        onChange={(event) => patch('scope', event.target.value)}
                        rows={2}
                        placeholder="Desde la recepción de la solicitud hasta…"
                        className={textareaClass}
                    />
                </div>
            </div>
        </PopUp>
    )
}
