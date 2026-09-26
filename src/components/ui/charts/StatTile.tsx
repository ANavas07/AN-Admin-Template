import type { ReactNode } from 'react'
import { cn } from '../../../utils/cn'
import Sparkline from './Sparkline'

type StatTileProps = {
    label: string
    value: string
    /** Relative change vs. the previous period (0.12 = +12 %) */
    delta?: number | null
    deltaLabel?: string
    /** Whether a higher value is good (colors the delta) */
    upIsGood?: boolean
    trend?: number[]
    icon?: ReactNode
}

const percentFormatter = new Intl.NumberFormat('es', { style: 'percent', maximumFractionDigits: 0, signDisplay: 'exceptZero' })

/** Headline figure with optional change vs. a named period and a sparkline. */
export default function StatTile({ label, value, delta, deltaLabel, upIsGood = true, trend, icon }: StatTileProps) {
    const hasDelta = delta !== undefined && delta !== null
    const isGood = hasDelta && (delta >= 0) === upIsGood
    return (
        <div className="card flex flex-col justify-between gap-3 p-4">
            <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-medium text-fg-muted">{label}</p>
                {icon ? <span className="text-fg-subtle">{icon}</span> : null}
            </div>
            <div className="flex items-end justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-2xl font-semibold text-fg">{value}</p>
                    {hasDelta ? (
                        <p className="mt-0.5 text-2xs text-fg-muted">
                            <span className={cn('font-semibold', isGood ? 'text-success' : 'text-danger')}>
                                {percentFormatter.format(delta)}
                            </span>{' '}
                            {deltaLabel}
                        </p>
                    ) : deltaLabel ? (
                        <p className="mt-0.5 text-2xs text-fg-muted">{deltaLabel}</p>
                    ) : null}
                </div>
                {trend ? <Sparkline values={trend} /> : null}
            </div>
        </div>
    )
}
