import { useEffect, useState } from 'react'
import type { RefObject } from 'react'
import { MAX_SCALE, MIN_SCALE } from '../flowTypes'
import type { Point } from '../connectors'

export type ViewportState = { scale: number; tx: number; ty: number }

const INITIAL_VIEWPORT: ViewportState = { scale: 1, tx: 0, ty: 0 }

function clampScale(scale: number) {
    return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale))
}

/** Zooms by `factor` keeping the screen point (px, py) fixed. */
function zoomAround(current: ViewportState, factor: number, px: number, py: number): ViewportState {
    const scale = clampScale(current.scale * factor)
    const ratio = scale / current.scale
    return {
        scale,
        tx: px - ratio * (px - current.tx),
        ty: py - ratio * (py - current.ty),
    }
}

/**
 * Pan / zoom state of the designer canvas and the conversions between screen
 * coordinates and world (diagram) coordinates.
 */
export function useCanvasViewport(viewportRef: RefObject<HTMLDivElement | null>) {
    const [viewport, setViewport] = useState<ViewportState>(INITIAL_VIEWPORT)
    const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 })

    // Track viewport dimensions for the minimap and centered placement
    useEffect(() => {
        const element = viewportRef.current
        if (!element) return
        const observer = new ResizeObserver((entries) => {
            const entry = entries[0]
            if (entry) {
                setViewportSize({ width: entry.contentRect.width, height: entry.contentRect.height })
            }
        })
        observer.observe(element)
        return () => observer.disconnect()
    }, [viewportRef])

    // Mouse-wheel zoom keeps the world point under the cursor fixed.
    // Native listener because React wheel handlers cannot preventDefault (passive).
    useEffect(() => {
        const element = viewportRef.current
        if (!element) return

        function handleWheel(event: WheelEvent) {
            event.preventDefault()
            const rect = element!.getBoundingClientRect()
            const factor = Math.exp(-event.deltaY * 0.0014)
            setViewport((current) =>
                zoomAround(current, factor, event.clientX - rect.left, event.clientY - rect.top)
            )
        }

        element.addEventListener('wheel', handleWheel, { passive: false })
        return () => element.removeEventListener('wheel', handleWheel)
    }, [viewportRef])

    /** Converts a pointer position (client coordinates) into world coordinates. */
    function toWorld(event: { clientX: number; clientY: number }): Point {
        const rect = viewportRef.current?.getBoundingClientRect()
        if (!rect) return { x: 0, y: 0 }
        return {
            x: (event.clientX - rect.left - viewport.tx) / viewport.scale,
            y: (event.clientY - rect.top - viewport.ty) / viewport.scale,
        }
    }

    /** World point currently shown at the center of the viewport. */
    function centerInWorld(): Point {
        return {
            x: (viewportSize.width / 2 - viewport.tx) / viewport.scale,
            y: (viewportSize.height / 2 - viewport.ty) / viewport.scale,
        }
    }

    /** Moves the view so the world point (x, y) ends up in the middle of the viewport. */
    function centerOn(x: number, y: number) {
        setViewport((current) => ({
            ...current,
            tx: viewportSize.width / 2 - x * current.scale,
            ty: viewportSize.height / 2 - y * current.scale,
        }))
    }

    function panTo(tx: number, ty: number) {
        setViewport((current) => ({ ...current, tx, ty }))
    }

    function zoomBy(factor: number) {
        setViewport((current) => zoomAround(current, factor, viewportSize.width / 2, viewportSize.height / 2))
    }

    function resetView() {
        setViewport(INITIAL_VIEWPORT)
    }

    return { viewport, viewportSize, toWorld, centerInWorld, centerOn, panTo, zoomBy, resetView }
}
