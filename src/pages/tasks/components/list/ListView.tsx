import { useMemo } from 'react'
import { DndContext, DragOverlay } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import type { TasksApi } from '../../hooks/useTasksMock'
import { useBoardDnd } from '../../hooks/useBoardDnd'
import type { Task } from '../../types'
import { PriorityBadge } from '../shared/PriorityBadge'
import { ListGroup } from './ListGroup'

type Props = {
    api: TasksApi
    onOpenTask: (taskId: string) => void
    onAddTask: (sectionId: string) => void
    /** View-level filter predicate from the toolbar. */
    matches?: (task: Task) => boolean
}

/**
 * Grouped, drag-and-drop list. Reuses the board's DnD hook (containers per
 * section) so rows reorder within a group and move across groups — column
 * reordering simply never triggers here (group headers carry no drag handle).
 */
export function ListView({ api, onOpenTask, onAddTask, matches = () => true }: Props) {
    const dnd = useBoardDnd(api)

    const taskById = useMemo(
        () => new Map(api.project.tasks.map((task) => [task.id, task])),
        [api.project.tasks],
    )
    const sectionById = useMemo(
        () => new Map(api.project.sections.map((section) => [section.id, section])),
        [api.project.sections],
    )

    return (
        <DndContext
            sensors={dnd.sensors}
            collisionDetection={dnd.collisionDetection}
            modifiers={[restrictToVerticalAxis]}
            onDragStart={dnd.onDragStart}
            onDragOver={dnd.onDragOver}
            onDragEnd={dnd.onDragEnd}
            onDragCancel={dnd.onDragCancel}
        >
            <div className="flex flex-col gap-3">
                {dnd.columnOrder.map((sectionId) => {
                    const section = sectionById.get(sectionId)
                    if (!section) return null
                    const tasks = (dnd.containers[sectionId] ?? [])
                        .map((id) => taskById.get(id))
                        .filter((task): task is NonNullable<typeof task> => Boolean(task))
                        .filter(matches)
                    return (
                        <ListGroup
                            key={sectionId}
                            section={section}
                            tasks={tasks}
                            onOpenTask={onOpenTask}
                            onToggleComplete={api.toggleComplete}
                            onRename={(taskId, title) => api.updateTask(taskId, { title })}
                            onAddTask={onAddTask}
                        />
                    )
                })}
            </div>

            <DragOverlay>
                {dnd.activeTask ? (
                    <div className="flex items-center gap-2 rounded-lg border border-brand/30 bg-(--color-surface) px-3 py-2 shadow-xl">
                        <PriorityBadge priority={dnd.activeTask.priority} />
                        <span className="truncate text-sm font-medium text-(--color-text)">
                            {dnd.activeTask.title}
                        </span>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    )
}
