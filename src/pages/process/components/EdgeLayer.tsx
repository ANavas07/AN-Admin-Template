import type { MouseEvent as ReactMouseEvent } from 'react'
import { TrashBinIcon } from '../../../icons/icons'
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../flowTypes'
import type { EdgeRoute } from '../connectors'

type EdgeLayerProps = {
    routes: EdgeRoute[]
    selectedEdgeId: string | null
    /** SVG path of the connection being drawn, if any */
    previewPath: string | null
    onSelectEdge: (edgeId: string) => void
    onEdgeContextMenu: (event: ReactMouseEvent, edgeId: string) => void
    onRemoveEdge: (edgeId: string) => void
}

/** Connections of the diagram: curves, arrows, labels and the delete button of the selected one. */
export default function EdgeLayer({
    routes,
    selectedEdgeId,
    previewPath,
    onSelectEdge,
    onEdgeContextMenu,
    onRemoveEdge,
}: EdgeLayerProps) {
    const selectedRoute = routes.find(({ edge }) => edge.id === selectedEdgeId)

    return (
        <>
            <svg
                className="absolute inset-0 h-full w-full"
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                // pointerEvents none lets clicks pass through to containers (z-index 1
                // below this layer); edge hit paths re-enable their own stroke events
                style={{ zIndex: 2, pointerEvents: 'none' }}
                aria-hidden="true"
            >
                <defs>
                    <marker id="flow-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" className="fill-fg-muted" />
                    </marker>
                    <marker id="flow-arrow-active" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" className="fill-brand" />
                    </marker>
                </defs>

                {routes.map(({ edge, path, isDashed }) => {
                    const isSelected = edge.id === selectedEdgeId
                    return (
                        <g key={edge.id}>
                            {/* Wide invisible stroke to make edges easy to click */}
                            <path
                                d={path}
                                fill="none"
                                stroke="transparent"
                                strokeWidth={16}
                                className="cursor-pointer"
                                style={{ pointerEvents: 'stroke' }}
                                onPointerDown={(event) => {
                                    event.stopPropagation()
                                    onSelectEdge(edge.id)
                                }}
                                onContextMenu={(event) => onEdgeContextMenu(event, edge.id)}
                            />
                            <path
                                d={path}
                                fill="none"
                                strokeWidth={isSelected ? 2.5 : 1.8}
                                strokeDasharray={isDashed ? '5 4' : undefined}
                                className={isSelected ? 'stroke-brand' : 'stroke-fg-muted'}
                                markerEnd={isSelected ? 'url(#flow-arrow-active)' : 'url(#flow-arrow)'}
                                style={{ pointerEvents: 'none' }}
                            />
                        </g>
                    )
                })}

                {previewPath ? (
                    <path
                        d={previewPath}
                        fill="none"
                        strokeWidth={2}
                        strokeDasharray="6 5"
                        className="animate-pulse stroke-brand"
                        style={{ pointerEvents: 'none' }}
                    />
                ) : null}
            </svg>

            {routes
                .filter(({ edge }) => edge.label)
                .map(({ edge, midX, midY }) => (
                    <span
                        key={`label-${edge.id}`}
                        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-line bg-surface px-2 py-0.5 text-3xs font-bold uppercase tracking-caps text-fg shadow-sm"
                        style={{ left: midX, top: midY, zIndex: 4 }}
                    >
                        {edge.label}
                    </span>
                ))}

            {selectedRoute ? (
                <button
                    type="button"
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={() => onRemoveEdge(selectedRoute.edge.id)}
                    className="absolute z-20 inline-flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface text-danger shadow-md transition-colors hover:bg-danger-soft"
                    style={{
                        left: selectedRoute.midX,
                        top: selectedRoute.midY - (selectedRoute.edge.label ? 22 : 0),
                    }}
                    aria-label="Eliminar conexión"
                    title="Eliminar conexión"
                >
                    <TrashBinIcon className="size-4" />
                </button>
            ) : null}
        </>
    )
}
