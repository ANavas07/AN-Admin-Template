type ChartTooltipProps = {
    /** Horizontal position in px inside the chart container */
    x: number
    containerWidth: number
    title: string
    value: string
    seriesLabel: string
}

const TOOLTIP_WIDTH = 168

/** Readout for the active data point: the value leads, the series name follows. */
export default function ChartTooltip({ x, containerWidth, title, value, seriesLabel }: ChartTooltipProps) {
    // Keep the tooltip inside the chart
    const left = Math.min(Math.max(x - TOOLTIP_WIDTH / 2, 0), Math.max(containerWidth - TOOLTIP_WIDTH, 0))
    return (
        <div
            className="pointer-events-none absolute top-0 z-10 rounded-lg border border-line bg-surface px-3 py-2 shadow-lg"
            style={{ left, width: TOOLTIP_WIDTH }}
            role="status"
        >
            <p className="text-2xs text-fg-muted">{title}</p>
            <p className="mt-1 flex items-center gap-2">
                <span className="h-0.5 w-3 shrink-0 rounded-full bg-chart-series" aria-hidden="true" />
                <span className="text-sm font-semibold tabular-nums text-fg">{value}</span>
                <span className="truncate text-2xs text-fg-muted">{seriesLabel}</span>
            </p>
        </div>
    )
}
