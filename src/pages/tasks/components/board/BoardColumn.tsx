import { useSortable } from '@dnd-kit/sortable'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { accentDot } from '../../constants'
import type { Section, Task } from '../../types'
import { TaskCard } from './TaskCard'

type Props = {
    section: Section
    tasks: Task[]
    onOpenTask: (taskId: string) => void
    onToggleComplete: (taskId: string) => void
    onAddTask: (sectionId: string) => void
}

function DragHandleDots() {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
            <circle cx="9" cy="6" r="1.6" /><circle cx="15" cy="6" r="1.6" />
            <circle cx="9" cy="12" r="1.6" /><circle cx="15" cy="12" r="1.6" />
            <circle cx="9" cy="18" r="1.6" /><circle cx="15" cy="18" r="1.6" />
        </svg>
    )
}

export function BoardColumn({ section, tasks, onOpenTask, onToggleComplete, onAddTask }: Props) {
    // Sortable wrapper lets whole columns be reordered horizontally.
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: section.id,
        data: { type: 'column' },
    })

    // Droppable body so a card can be dropped into an empty column too.
    const { setNodeRef: setDroppableRef } = useDroppable({
        id: section.id,
        data: { type: 'column' },
    })

    const style = { transform: CSS.Translate.toString(transform), transition }
    const taskIds = tasks.map((task) => task.id)

    return (
        <section
            ref={setNodeRef}
            style={style}
            className={`flex w-72 shrink-0 snap-start flex-col rounded-2xl border border-(--color-border) bg-(--color-bg-soft)/60 ${
                isDragging ? 'opacity-50' : ''
            }`}
        >
            <header className="flex items-center justify-between gap-2 px-3 py-2.5">
                <div className="flex min-w-0 items-center gap-2">
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${accentDot[section.color]}`} aria-hidden="true" />
                    <h3 className="truncate text-sm font-semibold text-(--color-text)">{section.name}</h3>
                    <span className="rounded-full bg-(--color-surface) px-1.5 text-xs font-medium text-(--color-text-muted)">
                        {tasks.length}
                    </span>
                </div>
                <button
                    type="button"
                    className="inline-flex h-6 w-6 cursor-grab items-center justify-center rounded-md text-(--color-text-muted) hover:bg-(--color-surface) hover:text-(--color-text) active:cursor-grabbing"
                    aria-label={`Reordenar columna ${section.name}`}
                    {...attributes}
                    {...listeners}
                >
                    <DragHandleDots />
                </button>
            </header>

            <div
                ref={setDroppableRef}
                className="flex min-h-24 flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2"
            >
                <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                    {tasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onOpen={onOpenTask}
                            onToggleComplete={onToggleComplete}
                        />
                    ))}
                </SortableContext>

                {tasks.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-(--color-border) px-3 py-6 text-center text-xs text-(--color-text-muted)">
                        Arrastra tareas aquí
                    </p>
                ) : null}

                <button
                    type="button"
                    onClick={() => onAddTask(section.id)}
                    className="mt-1 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-(--color-text-muted) transition-colors hover:bg-(--color-surface) hover:text-brand"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5" aria-hidden="true">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    Añadir tarea
                </button>
            </div>
        </section>
    )
}
