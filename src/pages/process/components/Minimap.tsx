import type { PointerEvent as ReactPointerEvent } from 'react'
import { CANVAS_HEIGHT, CANVAS_WIDTH, isContainer, nodeColorStyles } from '../flowTypes'
import type { FlowNode } from '../flowTypes'
import type { Box } from '../connectors'
import type { ViewportState } from '../hooks/useCanvasViewport'

const MINIMAP_WIDTH = 168
const MINIMAP_SCALE = MINIMAP_WIDTH / CANVAS_WIDTH
const MINIMAP_HEIGHT = Math.round(CANVAS_HEIGHT * MINIMAP_SCALE)

type MinimapProps = {
    nodes: FlowNode[]
    boxOf: (node: FlowNode) => Box
    viewport: ViewportState
    viewportSize: { width: number; height: number }
    /** Called with the world point the user clicked on */
    onNavigate: (x: number, y: number) => void
}

/** Overview of the whole canvas with the visible area highlighted. */
export default function Minimap({ nodes, boxOf, viewport, viewportSize, onNavigate }: MinimapProps) {
    function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
        event.stopPropagation()
        const rect = event.currentTarget.getBoundingClientRect()
        onNavigate((event.clientX - rect.left) / MINIMAP_SCALE, (event.clientY - rect.top) / MINIMAP_SCALE)
    }

    return (
        <div
            onPointerDown={handlePointerDown}
            className="absolute bottom-4 right-4 z-30 hidden cursor-pointer overflow-hidden rounded-xl border border-(--color-border) bg-(--color-surface)/90 shadow-lg backdrop-blur md:block"
            style={{ width: MINIMAP_WIDTH, height: MINIMAP_HEIGHT }}
            role="img"
            aria-label="Vista general del diagrama — clic para mover la vista"
            title="Clic para mover la vista"
        >
            {nodes.map((node) => {
                const box = boxOf(node)
                const colorStyle = nodeColorStyles[node.color]
                return (
                    <span
                        key={node.id}
                        className={`absolute rounded-xs ${isContainer(node.kind) ? `${colorStyle.soft} border ${colorStyle.border}` : colorStyle.swatch}`}
                        style={{
                            left: box.x * MINIMAP_SCALE,
                            top: box.y * MINIMAP_SCALE,
                            width: Math.max(3, box.width * MINIMAP_SCALE),
                            height: Math.max(2, box.height * MINIMAP_SCALE),
                        }}
                    />
                )
            })}
            <span
                className="absolute border border-brand bg-brand/10"
                style={{
                    left: (-viewport.tx / viewport.scale) * MINIMAP_SCALE,
                    top: (-viewport.ty / viewport.scale) * MINIMAP_SCALE,
                    width: (viewportSize.width / viewport.scale) * MINIMAP_SCALE,
                    height: (viewportSize.height / viewport.scale) * MINIMAP_SCALE,
                }}
            />
        </div>
    )
}
