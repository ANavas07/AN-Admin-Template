type ZoomControlsProps = {
    scale: number
    onZoomIn: () => void
    onZoomOut: () => void
    onReset: () => void
}

const zoomButtonClass =
    'inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-(--color-text) transition-colors hover:bg-(--color-bg-soft)'

export default function ZoomControls({ scale, onZoomIn, onZoomOut, onReset }: ZoomControlsProps) {
    return (
        <div
            onPointerDown={(event) => event.stopPropagation()}
            className="absolute bottom-4 left-3 z-30 flex items-center gap-1 rounded-full border border-(--color-border) bg-(--color-surface)/95 px-1.5 py-1 shadow-lg backdrop-blur"
        >
            <button type="button" onClick={onZoomOut} className={zoomButtonClass} aria-label="Alejar">
                −
            </button>
            <span className="w-11 text-center text-xs font-semibold tabular-nums text-(--color-text-muted)">
                {Math.round(scale * 100)}%
            </span>
            <button type="button" onClick={onZoomIn} className={zoomButtonClass} aria-label="Acercar">
                +
            </button>
            <button
                type="button"
                onClick={onReset}
                className="ml-1 rounded-full px-2 py-1 text-[11px] font-semibold text-(--color-text-muted) transition-colors hover:bg-(--color-bg-soft) hover:text-brand"
                aria-label="Restablecer vista"
            >
                Reiniciar
            </button>
        </div>
    )
}
