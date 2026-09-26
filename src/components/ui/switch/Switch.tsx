import { useId } from 'react'
import type { ReactNode } from 'react'
import { cn } from '../../../utils/cn'

type SwitchProps = {
    checked: boolean
    onChange: (checked: boolean) => void
    label: ReactNode
    description?: ReactNode
    disabled?: boolean
}

/** On / off setting row: label and description on the left, the switch on the right. */
export default function Switch({ checked, onChange, label, description, disabled = false }: SwitchProps) {
    const labelId = useId()
    const descriptionId = useId()
    return (
        <div className="flex items-start justify-between gap-4 py-3">
            <div className="min-w-0">
                <p id={labelId} className="text-sm font-medium text-fg">
                    {label}
                </p>
                {description ? (
                    <p id={descriptionId} className="mt-0.5 text-xs text-fg-muted">
                        {description}
                    </p>
                ) : null}
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                aria-labelledby={labelId}
                aria-describedby={description ? descriptionId : undefined}
                disabled={disabled}
                onClick={() => onChange(!checked)}
                className={cn(
                    'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand/25 disabled:cursor-not-allowed disabled:opacity-50',
                    checked ? 'border-brand-solid bg-brand-solid' : 'border-line-strong bg-canvas-subtle'
                )}
            >
                <span
                    className={cn(
                        'inline-block size-3.5 rounded-full shadow-xs transition-transform duration-(--duration-fast)',
                        checked ? 'translate-x-4.5 bg-on-solid' : 'translate-x-0.5 bg-fg-subtle'
                    )}
                    aria-hidden="true"
                />
            </button>
        </div>
    )
}
