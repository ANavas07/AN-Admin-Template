import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { accentDot } from '../../constants'
import type { Section, Task } from '../../types'
import { ListRow } from './ListRow'

type Props = {
    section: Section
    tasks: Task[]
    onOpenTask: (taskId: string) => void
    onToggleComplete: (taskId: string) => void
    onRename: (taskId: string, title: string) => void
    onAddTask: (sectionId: string) => void
}

export function ListGroup({ section, tasks, onOpenTask, onToggleComplete, onRename, onAddTask }: Props) {
    const [open, setOpen] = useState(true)
    const { setNodeRef } = useDroppable({ id: section.id, data: { type: 'column' } })
    const taskIds = tasks.map((task) => task.id)

    return (
        <section className="overflow-hidden rounded-xl border border-(--color-border) bg-(--color-surface)">
            <header className="flex items-center justify-between gap-2 bg-(--color-bg-soft)/60 px-3 py-2">
                <button
                    type="button"
                    onClick={() => setOpen((value) => !value)}
                    className="flex items-center gap-2 text-sm font-semibold text-(--color-text)"
                    aria-expanded={open}
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        className={`h-3.5 w-3.5 text-(--color-text-muted) transition-transform ${open ? 'rotate-90' : ''}`}
                        aria-hidden="true"
                    >
                        <path d="m9 18 6-6-6-6" />
                    </svg>
                    <span className={`h-2.5 w-2.5 rounded-full ${accentDot[section.color]}`} aria-hidden="true" />
                    {section.name}
                    <span className="rounded-full bg-(--color-surface) px-1.5 text-xs font-medium text-(--color-text-muted)">
                        {tasks.length}
                    </span>
                </button>
                <button
                    type="button"
                    onClick={() => onAddTask(section.id)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-(--color-text-muted) hover:text-brand"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5" aria-hidden="true">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    Añadir
                </button>
            </header>

            {open ? (
                <div ref={setNodeRef} className="min-h-2">
                    <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                        {tasks.map((task) => (
                            <ListRow
                                key={task.id}
                                task={task}
                                onOpen={onOpenTask}
                                onToggleComplete={onToggleComplete}
                                onRename={onRename}
                            />
                        ))}
                    </SortableContext>
                    {tasks.length === 0 ? (
                        <p className="px-4 py-4 text-center text-xs text-(--color-text-muted)">
                            Sin tareas en esta sección
                        </p>
                    ) : null}
                </div>
            ) : null}
        </section>
    )
}
