import { cn } from '../../../utils/cn'
import ChartTooltip from './ChartTooltip'
import { formatNumber, niceTicks, roundedTopBar, useActivePoint, useElementWidth } from './chartUtils'
import type { Accessor } from './chartUtils'

type ColumnChartProps<T> = {
    data: T[]
    /** Category label of each column (TanStack-style accessor) */
    x: Accessor<T, string>
    y: Accessor<T, number>
    /** Series name shown in the tooltip */
    seriesLabel: string
    /** Longer title of a column for the tooltip; defaults to the x label */
    tooltipTitle?: Accessor<T, string>
    formatValue?: (value: number) => string
    /** Show every n-th x label (the last one is always shown) */
    labelEvery?: number
    height?: number
    /** Accessible summary of what the chart shows */
    ariaLabel: string
}

const MARGIN = { top: 12, right: 4, bottom: 22, left: 32 }
const MAX_BAR_WIDTH = 24
const MIN_GAP = 2

/** Single-series column chart for counts over ordered categories (days, weekdays). */
export default function ColumnChart<T>({
    data,
    x,
    y,
    seriesLabel,
    tooltipTitle,
    formatValue = formatNumber,
    labelEvery = 1,
    height = 200,
    ariaLabel,
}: ColumnChartProps<T>) {
    const { ref, width } = useElementWidth<HTMLDivElement>()
    const { activeIndex, setActiveIndex, containerProps } = useActivePoint(data.length)

    const values = data.map((row, index) => y(row, index))
    const { max, ticks } = niceTicks(Math.max(...values, 0))
    const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 0)
    const plotHeight = height - MARGIN.top - MARGIN.bottom
    const band = data.length > 0 ? plotWidth / data.length : 0
    const barWidth = Math.max(Math.min(MAX_BAR_WIDTH, band * 0.7, band - MIN_GAP), 1)
    const scaleY = (value: number) => MARGIN.top + plotHeight - (value / max) * plotHeight

    const active = activeIndex !== null ? data[activeIndex] : null

    return (
        <div
            ref={ref}
            className="relative w-full rounded-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand/25"
            role="group"
            aria-label={`${ariaLabel}. Usa las flechas para recorrer los valores.`}
            {...containerProps}
        >
            {width > 0 ? (
                <svg width={width} height={height} className="block" aria-hidden="true">
                    {ticks.map((tick) => (
                        <g key={tick}>
                            <line
                                x1={MARGIN.left}
                                x2={width - MARGIN.right}
                                y1={scaleY(tick)}
                                y2={scaleY(tick)}
                                className="stroke-chart-grid"
                                strokeWidth={1}
                                shapeRendering="crispEdges"
                            />
                            <text
                                x={MARGIN.left - 8}
                                y={scaleY(tick)}
                                dy="0.32em"
                                textAnchor="end"
                                className="fill-fg-subtle text-3xs tabular-nums"
                            >
                                {formatValue(tick)}
                            </text>
                        </g>
                    ))}

                    {data.map((row, index) => {
                        const value = values[index]
                        const barX = MARGIN.left + index * band + (band - barWidth) / 2
                        const barY = scaleY(value)
                        const isActive = activeIndex === index
                        const showLabel = index === data.length - 1 || index % labelEvery === 0
                        return (
                            <g key={index}>
                                {/* Hit area: the whole band, bigger than the mark */}
                                <rect
                                    x={MARGIN.left + index * band}
                                    y={MARGIN.top}
                                    width={band}
                                    height={plotHeight}
                                    fill="transparent"
                                    onPointerEnter={() => setActiveIndex(index)}
                                />
                                <path
                                    d={roundedTopBar(barX, barY, barWidth, MARGIN.top + plotHeight - barY)}
                                    className={cn(
                                        'pointer-events-none transition-opacity duration-(--duration-fast)',
                                        isActive ? 'fill-chart-series-strong' : 'fill-chart-series',
                                        activeIndex !== null && !isActive && 'opacity-45'
                                    )}
                                />
                                {showLabel ? (
                                    <text
                                        x={MARGIN.left + index * band + band / 2}
                                        y={height - 6}
                                        textAnchor="middle"
                                        className={cn('text-3xs', isActive ? 'fill-fg' : 'fill-fg-subtle')}
                                    >
                                        {x(row, index)}
                                    </text>
                                ) : null}
                            </g>
                        )
                    })}
                </svg>
            ) : (
                <div style={{ height }} />
            )}

            {active !== null && activeIndex !== null ? (
                <ChartTooltip
                    x={MARGIN.left + activeIndex * band + band / 2}
                    containerWidth={width}
                    title={(tooltipTitle ?? x)(active, activeIndex)}
                    value={formatValue(values[activeIndex])}
                    seriesLabel={seriesLabel}
                />
            ) : null}
        </div>
    )
}
