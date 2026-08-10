import { useState } from 'react'
import PopUp from '../../../components/common/pop-up/PopUp'
import ButtonComponent from '../../../components/ui/buttons/ButtonComponent'
import { SparkIcon } from '../../../icons/icons'
import { aiService, buildDiagramFromDraft } from '../../../services/process/ai.service'
import type { ProcessDraft } from '../../../services/process/ai.service'
import { validateDiagram, summarizeValidation } from '../validation'
import type { DiagramSnapshot } from '../flowTypes'

type AiAssistantModalProps = {
    isOpen: boolean
    onClose: () => void
    /** Applies the generated diagram to the editor (replacing the current canvas) */
    onApply: (diagram: DiagramSnapshot, draft: ProcessDraft) => void
}

const areaOptions = ['Académica', 'Administrativa', 'Financiera', 'Bienestar', 'Tecnología', 'Otra']

const textareaClass =
    'w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-2.5 text-sm text-(--color-text) placeholder:text-(--color-text-muted) transition-all duration-200 focus:border-highlight focus:outline-none focus:ring-2 focus:ring-highlight/25'

/**
 * "Generate with AI" flow. The AI proposes, the user reviews and applies:
 * describe -> generate draft -> automatic validation -> apply to the canvas.
 */
export default function AiAssistantModal({ isOpen, onClose, onApply }: AiAssistantModalProps) {
    const [description, setDescription] = useState('')
    const [area, setArea] = useState(areaOptions[0])
    const [isGenerating, setIsGenerating] = useState(false)
    const [draft, setDraft] = useState<ProcessDraft | null>(null)
    const [diagram, setDiagram] = useState<DiagramSnapshot | null>(null)

    function reset() {
        setDraft(null)
        setDiagram(null)
        setIsGenerating(false)
    }

    function handleClose() {
        reset()
        onClose()
    }

    async function generate() {
        if (!description.trim()) return
        setIsGenerating(true)
        setDraft(null)
        setDiagram(null)
        try {
            const result = await aiService.generateDraft({ description, area })
            setDraft(result)
            setDiagram(buildDiagramFromDraft(result))
        } finally {
            setIsGenerating(false)
        }
    }

    const validation = diagram ? summarizeValidation(validateDiagram(diagram)) : null

    return (
        <PopUp
            isOpen={isOpen}
            onClose={handleClose}
            title="✨ Crear proceso con IA"
            description="Describe el proceso que necesitas y revisa la propuesta antes de aplicarla."
            size="lg"
            footer={
                draft && diagram ? (
                    <>
                        <ButtonComponent variant="outline" onClick={reset} disabled={isGenerating}>
                            Regenerar
                        </ButtonComponent>
                        <ButtonComponent variant="outline" onClick={handleClose}>
                            Cancelar
                        </ButtonComponent>
                        <ButtonComponent
                            variant="primary"
                            onClick={() => {
                                onApply(diagram, draft)
                                handleClose()
                            }}
                        >
                            Aplicar al diagramador
                        </ButtonComponent>
                    </>
                ) : (
                    <>
                        <ButtonComponent variant="outline" onClick={handleClose}>
                            Cancelar
                        </ButtonComponent>
                        <ButtonComponent
                            variant="primary"
                            onClick={generate}
                            disabled={isGenerating || description.trim().length === 0}
                            leftIcon={<SparkIcon className="size-4" />}
                        >
                            {isGenerating ? 'Generando…' : 'Generar propuesta'}
                        </ButtonComponent>
                    </>
                )
            }
        >
            {!draft ? (
                <div className="space-y-4">
                    <div>
                        <label htmlFor="ai-description" className="mb-1.5 block text-sm font-medium text-(--color-text)">
                            Describe el proceso que necesitas
                        </label>
                        <textarea
                            id="ai-description"
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            rows={4}
                            placeholder="Necesito un proceso para gestionar solicitudes de certificados académicos…"
                            className={textareaClass}
                            disabled={isGenerating}
                        />
                    </div>
                    <div>
                        <label htmlFor="ai-area" className="mb-1.5 block text-sm font-medium text-(--color-text)">
                            Área
                        </label>
                        <select
                            id="ai-area"
                            value={area}
                            onChange={(event) => setArea(event.target.value)}
                            className="w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-3.5 py-2.5 text-sm text-(--color-text) focus:border-highlight focus:outline-none focus:ring-2 focus:ring-highlight/25"
                            disabled={isGenerating}
                        >
                            {areaOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>
                    <p className="rounded-xl bg-(--color-bg-soft) px-4 py-3 text-xs leading-5 text-(--color-text-muted)">
                        La IA genera una <strong>propuesta editable</strong>: nunca modifica ni publica un proceso
                        automáticamente. Tú revisas, ajustas y decides aplicarla.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-start gap-3 rounded-2xl border border-brand/30 bg-brand-soft/60 p-4">
                        <SparkIcon className="mt-0.5 size-5 shrink-0 text-brand" />
                        <div>
                            <p className="text-sm font-bold text-(--color-text)">Proceso generado: {draft.name}</p>
                            <p className="mt-0.5 text-xs text-(--color-text-muted)">
                                La IA propone {draft.steps.length} actividades, {draft.decisions.length}{' '}
                                {draft.decisions.length === 1 ? 'decisión' : 'decisiones'} y 1 evento de inicio.
                                {validation
                                    ? ` Validación automática: ${validation.errors} errores, ${validation.warnings} advertencias.`
                                    : ''}
                            </p>
                            {draft.simulated ? (
                                <p className="mt-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                                    Propuesta simulada — el servicio de IA aún no está conectado a un modelo.
                                </p>
                            ) : null}
                        </div>
                    </div>

                    <ol className="max-h-64 space-y-2 overflow-y-auto pr-1">
                        {draft.steps.map((step, index) => (
                            <li
                                key={`${step.name}-${index}`}
                                className="rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-2.5"
                            >
                                <p className="text-sm font-semibold text-(--color-text)">
                                    {index + 1}. {step.name}
                                </p>
                                <p className="mt-0.5 text-xs text-(--color-text-muted)">{step.description}</p>
                                <p className="mt-1 text-[11px] text-(--color-text-muted)">
                                    Responsable: <span className="font-semibold">{step.responsible}</span>
                                </p>
                            </li>
                        ))}
                        {draft.decisions.map((decision) => (
                            <li
                                key={decision.name}
                                className="rounded-xl border border-dashed border-violet-500/50 bg-violet-500/5 px-4 py-2.5"
                            >
                                <p className="text-sm font-semibold text-(--color-text)">◆ {decision.name}</p>
                                <p className="mt-0.5 text-xs text-(--color-text-muted)">
                                    {decision.yesLabel} → continúa · {decision.noLabel} → {decision.noStepName}
                                </p>
                            </li>
                        ))}
                    </ol>

                    <p className="text-xs text-(--color-text-muted)">
                        Al aplicar, la propuesta reemplaza el contenido actual del lienzo. Podrás editar cada
                        elemento y usar Ctrl+Z para deshacer.
                    </p>
                </div>
            )}
        </PopUp>
    )
}
