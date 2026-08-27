import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task } from '../../types'
import { formatShortDate, isOverdue } from '../../utils'
import { AssigneeStack } from '../shared/AssigneeAvatar'
import { CompletionCheck } from '../shared/CompletionCheck'
import { PriorityBadge } from '../shared/PriorityBadge'
import { TaskTag } from '../shared/TaskTag'

type CardProps = {
    task: Task
    onOpen: (taskId: string) => void
    onToggleComplete: (taskId: string) => void
}

function SubtaskCounter({ task }: { task: Task }) {
    if (task.subtasks.length === 0) return null
    const done = task.subtasks.filter((s) => s.completed).length
    return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-(--color-text-muted)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5" aria-hidden="true">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            {done}/{task.subtasks.length}
        </span>
    )
}

/** Presentational card body — shared by the sortable card and the drag overlay. */
export function TaskCardContent({
    task,
    onOpen,
    onToggleComplete,
    dragging = false,
    overlay = false,
}: CardProps & { dragging?: boolean; overlay?: boolean }) {
    const due = formatShortDate(task.dueDate)
    const overdue = isOverdue(task.dueDate, task.completed)

    return (
        // Presentational container. The single interactive/focusable element is
        // the sortable wrapper in `TaskCard` (dnd-kit sets role=button + keyboard
        // drag); here we only wire mouse click-to-open to avoid nested buttons.
        <div
            onClick={() => onOpen(task.id)}
            className={`group flex cursor-pointer flex-col gap-2.5 rounded-xl border border-(--color-border) bg-(--color-surface) p-3 text-left shadow-sm transition-all duration-200 ${
                overlay ? 'rotate-2 shadow-xl ring-1 ring-brand/20' : 'hover:-translate-y-0.5 hover:shadow-md'
            } ${dragging ? 'opacity-40' : ''}`}
        >
            <div className="flex items-start gap-2.5">
                <div className="pt-0.5">
                    <CompletionCheck
                        completed={task.completed}
                        onToggle={() => onToggleComplete(task.id)}
                        label={`Marcar "${task.title}" como completada`}
                        size="sm"
                    />
                </div>
                <p
                    className={`line-clamp-2 text-sm font-medium leading-snug text-(--color-text) ${
                        task.completed ? 'text-(--color-text-muted) line-through' : ''
                    }`}
                >
                    {task.title}
                </p>
            </div>

            {(task.tags.length > 0 || task.priority) && (
                <div className="flex flex-wrap items-center gap-1.5 pl-[26px]">
                    <PriorityBadge priority={task.priority} />
                    {task.tags.map((tag) => (
                        <TaskTag key={tag.id} tag={tag} />
                    ))}
                </div>
            )}

            <div className="flex items-center justify-between gap-2 pl-[26px]">
                <div className="flex items-center gap-3">
                    {due ? (
                        <span
                            className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                                overdue ? 'text-rose-600 dark:text-rose-400' : 'text-(--color-text-muted)'
                            }`}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5" aria-hidden="true">
                                <rect x="3" y="4" width="18" height="18" rx="2" />
                                <path d="M16 2v4M8 2v4M3 10h18" />
                            </svg>
                            {due}
                        </span>
                    ) : null}
                    <SubtaskCounter task={task} />
                </div>
                <AssigneeStack assignees={task.assignees} />
            </div>

            {task.location ? (
                <div className="flex items-center gap-1 pl-[26px] text-[11px] text-(--color-text-muted)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span className="truncate">{task.location}</span>
                </div>
            ) : null}
        </div>
    )
}

export function TaskCard({ task, onOpen, onToggleComplete }: CardProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: task.id,
        data: { type: 'task', sectionId: task.sectionId },
    })

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            aria-label={task.title}
            className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
            {...attributes}
            {...listeners}
        >
            <TaskCardContent
                task={task}
                onOpen={onOpen}
                onToggleComplete={onToggleComplete}
                dragging={isDragging}
            />
        </div>
    )
}
