import type { MouseEvent } from 'react'

type Props = {
    completed: boolean
    onToggle: () => void
    /** Accessible label; defaults to a generic one. */
    label?: string
    size?: 'sm' | 'md'
}

/**
 * Circular completion checkbox in the Asana style. Empty ring when pending,
 * filled with an animated check when done.
 */
export function CompletionCheck({ completed, onToggle, label = 'Completar tarea', size = 'md' }: Props) {
    const dimension = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'

    function handleClick(event: MouseEvent) {
        // Never let the toggle bubble into card/row click (which opens the panel).
        event.stopPropagation()
        onToggle()
    }

    return (
        <button
            type="button"
            role="checkbox"
            aria-checked={completed}
            aria-label={label}
            onClick={handleClick}
            className={`group inline-flex ${dimension} shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
                completed
                    ? 'border-brand bg-brand text-white'
                    : 'border-(--color-border) text-transparent hover:border-brand hover:text-brand/40'
            }`}
        >
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className={`h-3 w-3 transition-transform duration-200 ${completed ? 'scale-100' : 'scale-75'}`}
            >
                <path d="M20 6 9 17l-5-5" />
            </svg>
        </button>
    )
}
