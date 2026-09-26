import { useCallback, useState } from 'react'
import type { KeyboardEvent } from 'react'

/** Row accessor in the TanStack style (`accessorFn`): reads a value from a data row. */
export type Accessor<T, V> = (row: T, index: number) => V

const numberFormatter = new Intl.NumberFormat('es')

export function formatNumber(value: number) {
    return numberFormatter.format(value)
}

/** Compact figure for stat tiles: 1.284 · 12,9 mil · 4,2 M */
export function formatCompact(value: number) {
    return new Intl.NumberFormat('es', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

/** Round axis maximum and evenly spaced ticks (0 included). */
export function niceTicks(max: number, count = 3) {
    if (max <= 0) return { max: 1, ticks: [0, 1] }
    const rawStep = max / count
    const magnitude = 10 ** Math.floor(Math.log10(rawStep))
    const step = [1, 2, 2.5, 5, 10].map((factor) => factor * magnitude).find((candidate) => candidate >= rawStep) ?? rawStep
    const niceMax = Math.ceil(max / step) * step
    const ticks: number[] = []
    for (let value = 0; value <= niceMax + step / 2; value += step) ticks.push(Math.round(value * 100) / 100)
    return { max: niceMax, ticks }
}

/** Measures an element's width (charts render in pixels to keep marks crisp). */
export function useElementWidth<E extends HTMLElement>() {
    const [width, setWidth] = useState(0)
    const ref = useCallback((element: E | null) => {
        if (!element) return
        const observer = new ResizeObserver((entries) => setWidth(entries[0]?.contentRect.width ?? 0))
        observer.observe(element)
        return () => observer.disconnect()
    }, [])
    return { ref, width }
}

/**
 * Hover + keyboard exploration shared by the charts: arrows move between data
 * points, Home/End jump to the ends, Escape clears. Same readout on focus as on hover.
 */
export function useActivePoint(length: number) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null)

    function handleKeyDown(event: KeyboardEvent) {
        if (length === 0) return
        const current = activeIndex ?? length - 1
        const next: Record<string, number> = {
            ArrowRight: Math.min(length - 1, current + 1),
            ArrowLeft: Math.max(0, current - 1),
            Home: 0,
            End: length - 1,
        }
        if (event.key in next) {
            event.preventDefault()
            setActiveIndex(next[event.key])
        } else if (event.key === 'Escape') {
            setActiveIndex(null)
        }
    }

    return {
        activeIndex,
        setActiveIndex,
        containerProps: {
            tabIndex: 0,
            onKeyDown: handleKeyDown,
            onFocus: () => setActiveIndex((current) => current ?? length - 1),
            onBlur: () => setActiveIndex(null),
            onPointerLeave: () => setActiveIndex(null),
        },
    }
}

/** SVG path of a bar with rounded data-end (top) and square baseline. */
export function roundedTopBar(x: number, y: number, width: number, height: number, radius = 4) {
    if (height <= 0) return ''
    const r = Math.min(radius, width / 2, height)
    return `M ${x} ${y + height} V ${y + r} Q ${x} ${y} ${x + r} ${y} H ${x + width - r} Q ${x + width} ${y} ${x + width} ${y + r} V ${y + height} Z`
}
