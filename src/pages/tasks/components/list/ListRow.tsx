import { useEffect, useRef, useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task } from '../../types'
import { formatShortDate, isOverdue } from '../../utils'
import { AssigneeStack } from '../shared/AssigneeAvatar'
import { CompletionCheck } from '../shared/CompletionCheck'
import { PriorityBadge } from '../shared/PriorityBadge'
import { TaskTag } from '../shared/TaskTag'

type Props = {
    task: Task
    onOpen: (taskId: string) => void
    onToggleComplete: (taskId: string) => void
    onRename: (taskId: string, title: string) => void
}

function GripDots() {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
            <circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" />
            <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
            <circle cx="9" cy="18" r="1.5" /><circle cx="15" cy="18" r="1.5" />
        </svg>
    )
}

export function ListRow({ task, onOpen, onToggleComplete, onRename }: Props) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: task.id,
        data: { type: 'task', sectionId: task.sectionId },
    })
    const [editing, setEditing] = useState(false)
    const [draft, setDraft] = useState(task.title)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (editing) inputRef.current?.select()
    }, [editing])

    const due = formatShortDate(task.dueDate)
    const overdue = isOverdue(task.dueDate, task.completed)

    function commit() {
        const next = draft.trim()
        if (next && next !== task.title) onRename(task.id, next)
        else setDraft(task.title)
        setEditing(false)
    }

    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Translate.toString(transform), transition }}
            className={`group flex items-center gap-2 border-b border-(--color-border) bg-(--color-surface) px-2 py-2 transition-colors hover:bg-(--color-bg-soft)/50 ${
                isDragging ? 'opacity-40' : ''
            }`}
        >
            <button
                type="button"
                className="cursor-grab text-(--color-text-muted) opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
                aria-label={`Reordenar ${task.title}`}
                {...attributes}
                {...listeners}
            >
                <GripDots />
            </button>

            <CompletionCheck
                completed={task.completed}
                onToggle={() => onToggleComplete(task.id)}
                label={`Marcar "${task.title}" como completada`}
                size="sm"
            />

            <div className="min-w-0 flex-1">
                {editing ? (
                    <input
                        ref={inputRef}
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        onBlur={commit}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') commit()
                            if (event.key === 'Escape') {
                                setDraft(task.title)
                                setEditing(false)
                            }
                        }}
                        className="w-full rounded-md border border-highlight bg-(--color-surface) px-2 py-1 text-sm text-(--color-text) focus:outline-none focus:ring-2 focus:ring-highlight/25"
                    />
                ) : (
                    <button
                        type="button"
                        onClick={() => onOpen(task.id)}
                        onDoubleClick={() => {
                            setDraft(task.title)
                            setEditing(true)
                        }}
                        className={`block truncate text-left text-sm font-medium text-(--color-text) hover:text-brand ${
                            task.completed ? 'text-(--color-text-muted) line-through' : ''
                        }`}
                        title="Clic para abrir · doble clic para renombrar"
                    >
                        {task.title}
                    </button>
                )}
            </div>

            <div className="hidden items-center gap-1.5 sm:flex">
                {task.tags.slice(0, 2).map((tag) => (
                    <TaskTag key={tag.id} tag={tag} />
                ))}
            </div>
            <PriorityBadge priority={task.priority} />
            {due ? (
                <span
                    className={`hidden w-16 shrink-0 text-right text-[11px] font-medium md:inline ${
                        overdue ? 'text-rose-600 dark:text-rose-400' : 'text-(--color-text-muted)'
                    }`}
                >
                    {due}
                </span>
            ) : (
                <span className="hidden w-16 shrink-0 md:inline" />
            )}
            <div className="w-16 shrink-0">
                <AssigneeStack assignees={task.assignees} max={2} />
            </div>
        </div>
    )
}
