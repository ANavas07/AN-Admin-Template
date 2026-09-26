type SparklineProps = {
    values: number[]
    width?: number
    height?: number
}

/** Tiny trend line for stat tiles: history in the recessive tone, current point in the series color. */
export default function Sparkline({ values, width = 96, height = 28 }: SparklineProps) {
    if (values.length < 2) return null
    const max = Math.max(...values, 1)
    const step = width / (values.length - 1)
    const pad = 3
    const pointY = (value: number) => pad + (height - pad * 2) * (1 - value / max)
    const path = values.map((value, index) => `${index === 0 ? 'M' : 'L'} ${index * step} ${pointY(value)}`).join(' ')
    const last = values.length - 1

    return (
        <svg width={width} height={height} className="block overflow-visible" aria-hidden="true">
            <path d={path} fill="none" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" className="stroke-chart-muted" />
            <circle cx={last * step} cy={pointY(values[last])} r={3} strokeWidth={2} className="fill-chart-series stroke-surface" />
        </svg>
    )
}
