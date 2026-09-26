import type { ReactNode } from 'react'
import { formatNumber } from './chartUtils'
import type { Accessor } from './chartUtils'

type BarListProps<T> = {
    data: T[]
    label: Accessor<T, string>
    value: Accessor<T, number>
    /** Optional mark before the label (e.g. the module icon) */
    icon?: Accessor<T, ReactNode>
    formatValue?: (value: number) => string
    /** Makes a row actionable (e.g. open the module) */
    onSelect?: (row: T) => void
    ariaLabel: string
}

/**
 * Ranked horizontal bars. Every value is labeled at the bar tip, so the list
 * needs no tooltip and reads as a table for assistive technology.
 */
export default function BarList<T>({ data, label, value, icon, formatValue = formatNumber, onSelect, ariaLabel }: BarListProps<T>) {
    const values = data.map((row, index) => value(row, index))
    const max = Math.max(...values, 1)

    return (
        <ol className="space-y-2.5" aria-label={ariaLabel}>
            {data.map((row, index) => {
                const content = (
                    <>
                        <span className="flex items-center justify-between gap-3 text-sm">
                            <span className="flex min-w-0 items-center gap-2 text-fg">
                                {icon ? <span className="shrink-0 text-fg-subtle">{icon(row, index)}</span> : null}
                                <span className="truncate">{label(row, index)}</span>
                            </span>
                            <span className="shrink-0 font-medium tabular-nums text-fg">{formatValue(values[index])}</span>
                        </span>
                        <span className="mt-1.5 block h-1.5 w-full rounded-full bg-canvas-subtle" aria-hidden="true">
                            <span
                                className="block h-full rounded-full bg-chart-series"
                                style={{ width: `${Math.max((values[index] / max) * 100, 2)}%` }}
                            />
                        </span>
                    </>
                )
                return (
                    <li key={index}>
                        {onSelect ? (
                            <button
                                type="button"
                                onClick={() => onSelect(row)}
                                className="block w-full rounded-md p-1 -m-1 text-left transition-colors hover:bg-canvas-subtle/60 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand/25"
                            >
                                {content}
                            </button>
                        ) : (
                            content
                        )}
                    </li>
                )
            })}
        </ol>
    )
}
