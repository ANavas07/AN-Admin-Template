import { useCallback, useState } from 'react'
import type { Size } from '../connectors'

/**
 * Measures the rendered size of each node. Tasks, notes and data objects grow
 * with their content, so edges need the real size to touch the node outline.
 *
 * `measureRef` goes on the node root element, which must carry `data-node-id`.
 */
export function useNodeSizes() {
    const [sizes, setSizes] = useState<ReadonlyMap<string, Size>>(() => new Map())

    const [observer] = useState(() => {
        if (typeof ResizeObserver === 'undefined') return null
        return new ResizeObserver((entries) => {
            setSizes((current) => {
                let next: Map<string, Size> | null = null
                for (const entry of entries) {
                    const element = entry.target as HTMLElement
                    const nodeId = element.dataset.nodeId
                    if (!nodeId) continue
                    // offset* ignores the canvas zoom transform: sizes stay in world units
                    const size = { width: element.offsetWidth, height: element.offsetHeight }
                    const previous = current.get(nodeId)
                    if (previous?.width === size.width && previous.height === size.height) continue
                    next ??= new Map(current)
                    next.set(nodeId, size)
                }
                return next ?? current
            })
        })
    })

    const measureRef = useCallback(
        (element: HTMLElement | null) => {
            if (!element || !observer) return
            observer.observe(element)
            return () => observer.unobserve(element)
        },
        [observer]
    )

    return { sizes, measureRef }
}
