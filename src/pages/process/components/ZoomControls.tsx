type ZoomControlsProps = {
    scale: number
    onZoomIn: () => void
    onZoomOut: () => void
    onReset: () => void
}

const zoomButtonClass =
    'inline-flex h-7 w-7 items-center justify-center rounded-md text-sm font-semibold text-fg transition-colors hover:bg-canvas-subtle'

export default function ZoomControls({ scale, onZoomIn, onZoomOut, onReset }: ZoomControlsProps) {
    return (
        <div
            onPointerDown={(event) => event.stopPropagation()}
            className="absolute bottom-4 left-3 z-30 flex items-center gap-1 rounded-lg border border-line bg-surface px-1.5 py-1 shadow-md"
        >
            <button type="button" onClick={onZoomOut} className={zoomButtonClass} aria-label="Alejar">
                −
            </button>
            <span className="w-11 text-center text-xs font-semibold tabular-nums text-fg-muted">
                {Math.round(scale * 100)}%
            </span>
            <button type="button" onClick={onZoomIn} className={zoomButtonClass} aria-label="Acercar">
                +
            </button>
            <button
                type="button"
                onClick={onReset}
                className="ml-1 rounded-md px-2 py-1 text-2xs font-semibold text-fg-muted transition-colors hover:bg-canvas-subtle hover:text-brand"
                aria-label="Restablecer vista"
            >
                Reiniciar
            </button>
        </div>
    )
}
