import type { PointerEvent as ReactPointerEvent } from 'react'
import ChartTooltip from './ChartTooltip'
import { formatNumber, niceTicks, useActivePoint, useElementWidth } from './chartUtils'
import type { Accessor } from './chartUtils'

type AreaLineChartProps<T> = {
    data: T[]
    x: Accessor<T, string>
    y: Accessor<T, number>
    seriesLabel: string
    tooltipTitle?: Accessor<T, string>
    formatValue?: (value: number) => string
    height?: number
    ariaLabel: string
}

const MARGIN = { top: 12, right: 12, bottom: 22, left: 36 }

/** Single-series trend line with a light area wash, crosshair and end label. */
export default function AreaLineChart<T>({
    data,
    x,
    y,
    seriesLabel,
    tooltipTitle,
    formatValue = formatNumber,
    height = 200,
    ariaLabel,
}: AreaLineChartProps<T>) {
    const { ref, width } = useElementWidth<HTMLDivElement>()
    const { activeIndex, setActiveIndex, containerProps } = useActivePoint(data.length)

    const values = data.map((row, index) => y(row, index))
    const { max, ticks } = niceTicks(Math.max(...values, 0))
    const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 0)
    const plotHeight = height - MARGIN.top - MARGIN.bottom
    const step = data.length > 1 ? plotWidth / (data.length - 1) : 0
    const pointX = (index: number) => MARGIN.left + index * step
    const pointY = (value: number) => MARGIN.top + plotHeight - (value / max) * plotHeight

    const linePath = values.map((value, index) => `${index === 0 ? 'M' : 'L'} ${pointX(index)} ${pointY(value)}`).join(' ')
    const areaPath =
        values.length > 0
            ? `${linePath} L ${pointX(values.length - 1)} ${MARGIN.top + plotHeight} L ${pointX(0)} ${MARGIN.top + plotHeight} Z`
            : ''
    const lastIndex = data.length - 1
    const markerIndex = activeIndex ?? lastIndex

    function handlePointerMove(event: ReactPointerEvent<SVGRectElement>) {
        if (step === 0) return
        const bounds = event.currentTarget.getBoundingClientRect()
        const index = Math.round((event.clientX - bounds.left) / step)
        setActiveIndex(Math.min(Math.max(index, 0), lastIndex))
    }

    return (
        <div
            ref={ref}
            className="relative w-full rounded-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand/25"
            role="group"
            aria-label={`${ariaLabel}. Usa las flechas para recorrer los valores.`}
            {...containerProps}
        >
            {width > 0 && data.length > 0 ? (
                <svg width={width} height={height} className="block" aria-hidden="true">
                    {ticks.map((tick) => (
                        <g key={tick}>
                            <line
                                x1={MARGIN.left}
                                x2={width - MARGIN.right}
                                y1={pointY(tick)}
                                y2={pointY(tick)}
                                className="stroke-chart-grid"
                                strokeWidth={1}
                                shapeRendering="crispEdges"
                            />
                            <text x={MARGIN.left - 8} y={pointY(tick)} dy="0.32em" textAnchor="end" className="fill-fg-subtle text-3xs tabular-nums">
                                {formatValue(tick)}
                            </text>
                        </g>
                    ))}

                    <path d={areaPath} className="fill-chart-series opacity-10" />
                    <path d={linePath} fill="none" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" className="stroke-chart-series" />

                    {activeIndex !== null ? (
                        <line
                            x1={pointX(activeIndex)}
                            x2={pointX(activeIndex)}
                            y1={MARGIN.top}
                            y2={MARGIN.top + plotHeight}
                            className="stroke-line-strong"
                            strokeWidth={1}
                            shapeRendering="crispEdges"
                        />
                    ) : null}

                    {/* Marker with a surface ring so it stays legible over the line */}
                    <circle
                        cx={pointX(markerIndex)}
                        cy={pointY(values[markerIndex])}
                        r={4}
                        strokeWidth={2}
                        className="fill-chart-series stroke-surface"
                    />

                    {data.map((row, index) => (
                        <text key={index} x={pointX(index)} y={height - 6} textAnchor="middle" className={index === markerIndex ? 'fill-fg text-3xs' : 'fill-fg-subtle text-3xs'}>
                            {x(row, index)}
                        </text>
                    ))}

                    {/* Crosshair hit area covering the whole plot */}
                    <rect
                        x={MARGIN.left - step / 2}
                        y={MARGIN.top}
                        width={plotWidth + step}
                        height={plotHeight}
                        fill="transparent"
                        onPointerMove={handlePointerMove}
                    />
                </svg>
            ) : (
                <div style={{ height }} />
            )}

            {activeIndex !== null ? (
                <ChartTooltip
                    x={pointX(activeIndex)}
                    containerWidth={width}
                    title={(tooltipTitle ?? x)(data[activeIndex], activeIndex)}
                    value={formatValue(values[activeIndex])}
                    seriesLabel={seriesLabel}
                />
            ) : null}
        </div>
    )
}
