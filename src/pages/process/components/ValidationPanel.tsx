import PopUp from '../../../components/common/pop-up/PopUp'
import ButtonComponent from '../../../components/ui/buttons/ButtonComponent'
import { summarizeValidation } from '../validation'
import type { ValidationResult } from '../validation'

type ValidationPanelProps = {
    isOpen: boolean
    onClose: () => void
    results: ValidationResult[]
    /** Selects and focuses the element a finding points to */
    onGoToNode: (nodeId: string) => void
}

const levelStyles = {
    ok: { icon: '✓', row: 'text-emerald-700 dark:text-emerald-300', chip: 'bg-emerald-500/10' },
    warning: { icon: '⚠', row: 'text-amber-700 dark:text-amber-300', chip: 'bg-amber-500/10' },
    error: { icon: '✕', row: 'text-rose-700 dark:text-rose-300', chip: 'bg-rose-500/10' },
} as const

export default function ValidationPanel({ isOpen, onClose, results, onGoToNode }: ValidationPanelProps) {
    const summary = summarizeValidation(results)
    const ordered = [...results].sort((a, b) => {
        const weight = { error: 0, warning: 1, ok: 2 }
        return weight[a.level] - weight[b.level]
    })

    return (
        <PopUp
            isOpen={isOpen}
            onClose={onClose}
            title="Validación BPMN"
            description="Revisión de la estructura y la documentación del proceso."
            size="md"
            footer={
                <ButtonComponent variant="primary" onClick={onClose}>
                    Entendido
                </ButtonComponent>
            }
        >
            <div className="mb-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-700 dark:text-rose-300">
                    {summary.errors} {summary.errors === 1 ? 'error' : 'errores'}
                </span>
                <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
                    {summary.warnings} {summary.warnings === 1 ? 'advertencia' : 'advertencias'}
                </span>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    {summary.passed} {summary.passed === 1 ? 'verificación correcta' : 'verificaciones correctas'}
                </span>
            </div>

            <ul className="max-h-80 space-y-1.5 overflow-y-auto pr-1">
                {ordered.map((result, index) => {
                    const style = levelStyles[result.level]
                    return (
                        <li
                            key={`${result.level}-${index}`}
                            className={`flex items-start gap-2.5 rounded-xl px-3 py-2 text-sm ${style.chip}`}
                        >
                            <span className={`mt-0.5 shrink-0 font-bold ${style.row}`} aria-hidden="true">
                                {style.icon}
                            </span>
                            <span className="min-w-0 flex-1 text-(--color-text)">{result.message}</span>
                            {result.nodeId ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        onGoToNode(result.nodeId!)
                                        onClose()
                                    }}
                                    className="shrink-0 rounded-lg px-2 py-0.5 text-xs font-semibold text-brand transition-colors hover:bg-brand-soft"
                                >
                                    Ver
                                </button>
                            ) : null}
                        </li>
                    )
                })}
            </ul>
        </PopUp>
    )
}
