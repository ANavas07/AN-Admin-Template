import { cn } from '../../../utils/cn'

type SegmentedOption<T extends string> = {
    value: T
    label: string
    count?: number
}

type SegmentedControlProps<T extends string> = {
    options: SegmentedOption<T>[]
    value: T
    onChange: (value: T) => void
    /** Accessible name of the group */
    label: string
    size?: 'sm' | 'md'
    className?: string
}

/** Mutually exclusive choice among a few options (filters, modes, environments). */
export default function SegmentedControl<T extends string>({ options, value, onChange, label, size = 'md', className }: SegmentedControlProps<T>) {
    return (
        <div role="radiogroup" aria-label={label} className={cn('inline-flex max-w-full overflow-x-auto rounded-md border border-line bg-canvas p-0.5', className)}>
            {options.map((option) => {
                const isSelected = option.value === value
                return (
                    <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => onChange(option.value)}
                        className={cn(
                            'inline-flex shrink-0 items-center gap-1.5 rounded-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand/25',
                            size === 'sm' ? 'h-7 px-2.5 text-xs' : 'h-8 px-3 text-sm',
                            isSelected ? 'bg-surface text-fg shadow-xs' : 'text-fg-muted hover:text-fg'
                        )}
                    >
                        {option.label}
                        {option.count !== undefined ? <span className="tabular-nums text-fg-subtle">{option.count}</span> : null}
                    </button>
                )
            })}
        </div>
    )
}
