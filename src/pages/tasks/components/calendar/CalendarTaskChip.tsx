import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { priorityDot } from '../../constants'
import type { Task } from '../../types'

type Props = {
    task: Task
    onOpen: (taskId: string) => void
    overlay?: boolean
}

/** Compact, draggable task representation for a calendar day cell. */
export function CalendarTaskChip({ task, onOpen, overlay = false }: Props) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: task.id,
        data: { type: 'task' },
    })

    return (
        <div
            ref={overlay ? undefined : setNodeRef}
            style={overlay ? undefined : { transform: CSS.Translate.toString(transform) }}
            {...(overlay ? {} : attributes)}
            {...(overlay ? {} : listeners)}
            onClick={(event) => {
                event.stopPropagation()
                onOpen(task.id)
            }}
            className={`flex cursor-grab items-center gap-1 rounded-md border border-(--color-border) bg-(--color-surface) px-1.5 py-1 text-[11px] leading-tight active:cursor-grabbing ${
                overlay ? 'rotate-2 shadow-lg ring-1 ring-brand/20' : 'hover:border-brand/50'
            } ${isDragging ? 'opacity-40' : ''}`}
        >
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${priorityDot[task.priority]}`} aria-hidden="true" />
            <span className={`truncate font-medium text-(--color-text) ${task.completed ? 'line-through text-(--color-text-muted)' : ''}`}>
                {task.title}
            </span>
        </div>
    )
}
