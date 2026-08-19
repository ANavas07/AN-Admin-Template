import { useCallback, useMemo, useState } from 'react'
import { mockProject } from '../data/mock-data'
import type { Priority, Project, Section, Task } from '../types'

// Single access point to task data. Components NEVER import mock-data directly;
// they consume this hook. When the real backend arrives, only this file changes:
// swap the local state for API calls and keep the same returned surface.

let seq = 1000
const nextId = (prefix: string) => `${prefix}${seq++}`

/** Deep clone so the exported mock module stays immutable across remounts. */
function cloneProject(source: Project): Project {
    return structuredClone(source)
}

export interface TasksApi {
    project: Project
    /** Tasks of a section, sorted by their `order`. */
    tasksBySection: (sectionId: string) => Task[]
    sortedSections: Section[]

    // Mutators (optimistic in local state). Each marks its future API call.
    moveTask: (taskId: string, toSectionId: string, toIndex: number) => void
    reorderSections: (fromId: string, toId: string) => void
    toggleComplete: (taskId: string) => void
    toggleSubtask: (taskId: string, subtaskId: string) => void
    createTask: (sectionId: string, title: string, patch?: Partial<Task>) => void
    updateTask: (taskId: string, patch: Partial<Task>) => void
    setTaskDates: (taskId: string, dueDate: string | null, startDate?: string | null) => void
}

export function useTasksMock(): TasksApi {
    const [project, setProject] = useState<Project>(() => cloneProject(mockProject))

    const sortedSections = useMemo(
        () => [...project.sections].sort((a, b) => a.order - b.order),
        [project.sections],
    )

    const tasksBySection = useCallback(
        (sectionId: string) =>
            project.tasks
                .filter((task) => task.sectionId === sectionId)
                .sort((a, b) => a.order - b.order),
        [project.tasks],
    )

    const moveTask = useCallback((taskId: string, toSectionId: string, toIndex: number) => {
        // TODO: sync with API — PATCH /tasks/:id { sectionId, order } + reindex siblings
        setProject((prev) => {
            const moving = prev.tasks.find((t) => t.id === taskId)
            if (!moving) return prev

            const fromSectionId = moving.sectionId
            const remaining = prev.tasks
                .filter((t) => t.sectionId === toSectionId && t.id !== taskId)
                .sort((a, b) => a.order - b.order)

            const clampedIndex = Math.max(0, Math.min(toIndex, remaining.length))
            const target = { ...moving, sectionId: toSectionId }
            remaining.splice(clampedIndex, 0, target)

            const reindexedTarget = remaining.map((t, i) => ({ ...t, order: i }))
            const reindexedSource =
                fromSectionId === toSectionId
                    ? []
                    : prev.tasks
                          .filter((t) => t.sectionId === fromSectionId && t.id !== taskId)
                          .sort((a, b) => a.order - b.order)
                          .map((t, i) => ({ ...t, order: i }))

            const touchedIds = new Set([
                ...reindexedTarget.map((t) => t.id),
                ...reindexedSource.map((t) => t.id),
            ])
            const byId = new Map([...reindexedTarget, ...reindexedSource].map((t) => [t.id, t]))

            return {
                ...prev,
                tasks: prev.tasks.map((t) => (touchedIds.has(t.id) ? byId.get(t.id)! : t)),
            }
        })
    }, [])

    const reorderSections = useCallback((fromId: string, toId: string) => {
        // TODO: sync with API — PATCH /sections order
        setProject((prev) => {
            const ordered = [...prev.sections].sort((a, b) => a.order - b.order)
            const fromIndex = ordered.findIndex((s) => s.id === fromId)
            const toIndex = ordered.findIndex((s) => s.id === toId)
            if (fromIndex === -1 || toIndex === -1) return prev

            const [moved] = ordered.splice(fromIndex, 1)
            ordered.splice(toIndex, 0, moved)
            const reindexed = ordered.map((s, i) => ({ ...s, order: i }))
            const byId = new Map(reindexed.map((s) => [s.id, s]))
            return { ...prev, sections: prev.sections.map((s) => byId.get(s.id) ?? s) }
        })
    }, [])

    const toggleComplete = useCallback((taskId: string) => {
        // TODO: sync with API — PATCH /tasks/:id { completed }
        setProject((prev) => ({
            ...prev,
            tasks: prev.tasks.map((t) =>
                t.id === taskId ? { ...t, completed: !t.completed } : t,
            ),
        }))
    }, [])

    const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
        // TODO: sync with API — PATCH /tasks/:id/subtasks/:subId { completed }
        setProject((prev) => ({
            ...prev,
            tasks: prev.tasks.map((t) =>
                t.id !== taskId
                    ? t
                    : {
                          ...t,
                          subtasks: t.subtasks.map((s) =>
                              s.id === subtaskId ? { ...s, completed: !s.completed } : s,
                          ),
                      },
            ),
        }))
    }, [])

    const createTask = useCallback(
        (sectionId: string, title: string, patch: Partial<Task> = {}) => {
            // TODO: sync with API — POST /tasks
            setProject((prev) => {
                const order = prev.tasks.filter((t) => t.sectionId === sectionId).length
                const priority: Priority = patch.priority ?? 'medium'
                const task: Task = {
                    id: nextId('nk'),
                    sectionId,
                    title: title.trim() || 'Tarea sin título',
                    description: '',
                    completed: false,
                    priority,
                    dueDate: null,
                    startDate: null,
                    assignees: [],
                    tags: [],
                    subtasks: [],
                    dependsOn: [],
                    comments: [],
                    order,
                    ...patch,
                }
                return { ...prev, tasks: [...prev.tasks, task] }
            })
        },
        [],
    )

    const updateTask = useCallback((taskId: string, patch: Partial<Task>) => {
        // TODO: sync with API — PATCH /tasks/:id
        setProject((prev) => ({
            ...prev,
            tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t)),
        }))
    }, [])

    const setTaskDates = useCallback(
        (taskId: string, dueDate: string | null, startDate?: string | null) => {
            // TODO: sync with API — PATCH /tasks/:id { dueDate, startDate }
            setProject((prev) => ({
                ...prev,
                tasks: prev.tasks.map((t) =>
                    t.id === taskId
                        ? { ...t, dueDate, ...(startDate !== undefined ? { startDate } : {}) }
                        : t,
                ),
            }))
        },
        [],
    )

    return {
        project,
        tasksBySection,
        sortedSections,
        moveTask,
        reorderSections,
        toggleComplete,
        toggleSubtask,
        createTask,
        updateTask,
        setTaskDates,
    }
}
