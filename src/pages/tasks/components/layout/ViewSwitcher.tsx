import type { ReactNode } from 'react'
import type { TaskView } from '../../types'

type Props = {
    active: TaskView
    onChange: (view: TaskView) => void
}

function BoardIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
            <rect x="3" y="4" width="5" height="16" rx="1" /><rect x="10" y="4" width="5" height="11" rx="1" /><rect x="17" y="4" width="4" height="14" rx="1" />
        </svg>
    )
}
function ListIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
            <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
        </svg>
    )
}
function TimelineIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
            <path d="M4 6h10M4 12h14M4 18h7" /><circle cx="18" cy="6" r="1.5" /><circle cx="20" cy="12" r="1.5" /><circle cx="13" cy="18" r="1.5" />
        </svg>
    )
}
function CalendarIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
    )
}

const tabs: { id: TaskView; label: string; icon: ReactNode }[] = [
    { id: 'board', label: 'Tablero', icon: <BoardIcon /> },
    { id: 'list', label: 'Lista', icon: <ListIcon /> },
    { id: 'timeline', label: 'Cronograma', icon: <TimelineIcon /> },
    { id: 'calendar', label: 'Calendario', icon: <CalendarIcon /> },
]

export function ViewSwitcher({ active, onChange }: Props) {
    return (
        <div role="tablist" aria-label="Cambiar vista" className="inline-flex items-center gap-1 rounded-xl border border-(--color-border) bg-(--color-surface) p-1">
            {tabs.map((tab) => {
                const selected = tab.id === active
                return (
                    <button
                        key={tab.id}
                        role="tab"
                        aria-selected={selected}
                        onClick={() => onChange(tab.id)}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                            selected
                                ? 'bg-brand text-white shadow-sm'
                                : 'text-(--color-text-muted) hover:bg-(--color-bg-soft) hover:text-(--color-text)'
                        }`}
                    >
                        {tab.icon}
                        <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                )
            })}
        </div>
    )
}
