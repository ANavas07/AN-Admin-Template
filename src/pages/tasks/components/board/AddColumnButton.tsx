type Props = { onClick: () => void }

/** Placeholder for adding a new section (visual only in this phase). */
export function AddColumnButton({ onClick }: Props) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex h-11 w-72 shrink-0 items-center justify-center gap-2 rounded-2xl border border-dashed border-(--color-border) text-sm font-medium text-(--color-text-muted) transition-colors hover:border-brand hover:text-brand"
        >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
            </svg>
            Añadir sección
        </button>
    )
}
