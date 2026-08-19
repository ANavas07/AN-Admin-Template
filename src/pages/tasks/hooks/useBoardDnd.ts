import { useCallback, useEffect, useRef, useState } from 'react'
import {
    KeyboardSensor,
    PointerSensor,
    closestCorners,
    useSensor,
    useSensors,
    type DragCancelEvent,
    type DragEndEvent,
    type DragOverEvent,
    type DragStartEvent,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import type { Task } from '../types'
import type { TasksApi } from './useTasksMock'

export type DragItemType = 'task' | 'column'

/** Local board mirror = ordered task ids per section. Drives live gaps during a drag. */
type ContainerMap = Record<string, string[]>

function buildContainers(api: TasksApi): ContainerMap {
    const map: ContainerMap = {}
    for (const section of api.sortedSections) {
        map[section.id] = api.tasksBySection(section.id).map((task) => task.id)
    }
    return map
}

/**
 * Encapsulates all @dnd-kit wiring for the Kanban board: sensors (pointer +
 * keyboard), collision strategy, cross-column moves (live, in onDragOver) and
 * commit-to-store on drop. Same-column reordering animates natively; column
 * reordering is handled on drop.
 */
export function useBoardDnd(api: TasksApi) {
    const sensors = useSensors(
        // Small activation distance so clicks still open the detail panel.
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    )

    const [containers, setContainers] = useState<ContainerMap>(() => buildContainers(api))
    const [columnOrder, setColumnOrder] = useState<string[]>(() =>
        api.sortedSections.map((s) => s.id),
    )
    const [activeTask, setActiveTask] = useState<Task | null>(null)
    const [activeColumnId, setActiveColumnId] = useState<string | null>(null)

    const isDragging = useRef(false)

    // Re-sync the local mirror from the store whenever data changes and we are
    // not mid-drag (so a drop commit or an external edit is reflected).
    useEffect(() => {
        if (isDragging.current) return
        setContainers(buildContainers(api))
        setColumnOrder(api.sortedSections.map((s) => s.id))
    }, [api])

    const findColumn = useCallback(
        (id: string | undefined): string | undefined => {
            if (!id) return undefined
            if (id in containers) return id
            return Object.keys(containers).find((sectionId) => containers[sectionId].includes(id))
        },
        [containers],
    )

    const onDragStart = useCallback(
        (event: DragStartEvent) => {
            isDragging.current = true
            const type = event.active.data.current?.type as DragItemType | undefined
            if (type === 'column') {
                setActiveColumnId(String(event.active.id))
                return
            }
            const task = api.project.tasks.find((t) => t.id === event.active.id) ?? null
            setActiveTask(task)
        },
        [api.project.tasks],
    )

    const onDragOver = useCallback(
        (event: DragOverEvent) => {
            const { active, over } = event
            if (!over) return
            if (active.data.current?.type === 'column') return

            const activeId = String(active.id)
            const overId = String(over.id)
            const activeCol = findColumn(activeId)
            const overCol = findColumn(overId)
            if (!activeCol || !overCol || activeCol === overCol) return

            // Cross-column: physically move the id so the ghost gap appears in
            // the destination column while dragging.
            setContainers((prev) => {
                const activeItems = prev[activeCol]
                const overItems = prev[overCol]
                const activeIndex = activeItems.indexOf(activeId)
                if (activeIndex === -1) return prev

                const overIsColumn = overId === overCol
                const overIndex = overItems.indexOf(overId)

                let insertIndex: number
                if (overIsColumn || overIndex === -1) {
                    insertIndex = overItems.length
                } else {
                    const isBelow =
                        over.rect.top + over.rect.height / 2 <
                        (active.rect.current.translated?.top ?? 0)
                    insertIndex = overIndex + (isBelow ? 1 : 0)
                }

                return {
                    ...prev,
                    [activeCol]: activeItems.filter((id) => id !== activeId),
                    [overCol]: [
                        ...overItems.slice(0, insertIndex),
                        activeId,
                        ...overItems.slice(insertIndex),
                    ],
                }
            })
        },
        [findColumn],
    )

    const endDrag = useCallback(() => {
        isDragging.current = false
        setActiveTask(null)
        setActiveColumnId(null)
    }, [])

    const onDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event

            // Column reordering.
            if (active.data.current?.type === 'column') {
                if (over && active.id !== over.id) {
                    setColumnOrder((prev) => {
                        const from = prev.indexOf(String(active.id))
                        const to = prev.indexOf(String(over.id))
                        if (from === -1 || to === -1) return prev
                        return arrayMove(prev, from, to)
                    })
                    // TODO: sync with API — persist new section order
                    api.reorderSections(String(active.id), String(over.id))
                }
                endDrag()
                return
            }

            if (!over) {
                endDrag()
                return
            }

            const activeId = String(active.id)
            const overId = String(over.id)
            const activeCol = findColumn(activeId)
            const overCol = findColumn(overId)

            if (activeCol && overCol) {
                let finalItems = containers[overCol]
                if (activeCol === overCol) {
                    // Same-column reorder: apply arrayMove to the live mirror.
                    const oldIndex = finalItems.indexOf(activeId)
                    const overIndex =
                        overId === overCol ? finalItems.length - 1 : finalItems.indexOf(overId)
                    if (oldIndex !== -1 && overIndex !== -1 && oldIndex !== overIndex) {
                        finalItems = arrayMove(finalItems, oldIndex, overIndex)
                        setContainers((prev) => ({ ...prev, [overCol]: finalItems }))
                    }
                }
                const finalIndex = finalItems.indexOf(activeId)
                // TODO: sync with API — persist the card's new section + position
                api.moveTask(activeId, overCol, finalIndex === -1 ? finalItems.length : finalIndex)
            }

            endDrag()
        },
        [api, containers, findColumn, endDrag],
    )

    const onDragCancel = useCallback(
        (_event: DragCancelEvent) => {
            // Discard the live mirror edits by re-syncing from the store.
            setContainers(buildContainers(api))
            setColumnOrder(api.sortedSections.map((s) => s.id))
            endDrag()
        },
        [api, endDrag],
    )

    return {
        sensors,
        collisionDetection: closestCorners,
        containers,
        columnOrder,
        activeTask,
        activeColumnId,
        onDragStart,
        onDragOver,
        onDragEnd,
        onDragCancel,
    }
}
