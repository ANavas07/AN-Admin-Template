import { useMemo } from 'react'
import { DndContext, DragOverlay } from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { restrictToWindowEdges } from '@dnd-kit/modifiers'
import type { TasksApi } from '../../hooks/useTasksMock'
import { useBoardDnd } from '../../hooks/useBoardDnd'
import type { Task } from '../../types'
import { AddColumnButton } from './AddColumnButton'
import { BoardColumn } from './BoardColumn'
import { TaskCardContent } from './TaskCard'

type Props = {
    api: TasksApi
    onOpenTask: (taskId: string) => void
    onAddTask: (sectionId: string) => void
    onAddSection: () => void
    /** View-level filter predicate from the toolbar. */
    matches?: (task: Task) => boolean
}

export function BoardView({ api, onOpenTask, onAddTask, onAddSection, matches = () => true }: Props) {
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
            modifiers={[restrictToWindowEdges]}
            onDragStart={dnd.onDragStart}
            onDragOver={dnd.onDragOver}
            onDragEnd={dnd.onDragEnd}
            onDragCancel={dnd.onDragCancel}
        >
            <div className="flex gap-3 overflow-x-auto pb-4 [scroll-snap-type:x_proximity]">
                <SortableContext items={dnd.columnOrder} strategy={horizontalListSortingStrategy}>
                    {dnd.columnOrder.map((sectionId) => {
                        const section = sectionById.get(sectionId)
                        if (!section) return null
                        const tasks = (dnd.containers[sectionId] ?? [])
                            .map((id) => taskById.get(id))
                            .filter((task): task is NonNullable<typeof task> => Boolean(task))
                            .filter(matches)
                        return (
                            <BoardColumn
                                key={sectionId}
                                section={section}
                                tasks={tasks}
                                onOpenTask={onOpenTask}
                                onToggleComplete={api.toggleComplete}
                                onAddTask={onAddTask}
                            />
                        )
                    })}
                </SortableContext>

                <AddColumnButton onClick={onAddSection} />
            </div>

            <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
                {dnd.activeTask ? (
                    <div className="w-72">
                        <TaskCardContent
                            task={dnd.activeTask}
                            onOpen={() => {}}
                            onToggleComplete={() => {}}
                            overlay
                        />
                    </div>
                ) : dnd.activeColumnId ? (
                    <div className="w-72 rounded-2xl border border-brand/30 bg-(--color-bg-soft) opacity-90 shadow-xl">
                        <div className="px-3 py-2.5 text-sm font-semibold text-(--color-text)">
                            {sectionById.get(dnd.activeColumnId)?.name}
                        </div>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    )
}
