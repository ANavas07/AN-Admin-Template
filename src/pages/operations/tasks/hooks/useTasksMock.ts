import { useCallback, useMemo, useState } from 'react'
import { mockMembers, mockProjects, mockTeams } from '../data/mock-data'
import type { AccentColor, Assignee, Priority, Project, Section, Tag, Task, Team } from '../types'

// Single access point to task data. Components NEVER import mock-data directly;
// they consume this hook. When the real backend arrives, only this file changes:
// swap the local state for API calls and keep the same returned surface.

let seq = 1000
const nextId = (prefix: string) => `${prefix}${seq++}`

// Cycles accent colors for auto-created members/tags.
const memberPalette: AccentColor[] = ['sky', 'violet', 'emerald', 'amber', 'rose', 'indigo', 'slate']

/** Deep clone so the exported mock module stays immutable across remounts. */
function cloneProject(source: Project): Project {
    return structuredClone(source)
}

export interface TasksApi {
    /** Active project (the one the views render). */
    project: Project
    /** All projects in the workspace, for the left navigator. */
    projects: Project[]
    activeProjectId: string
    selectProject: (projectId: string) => void

    /** Teams grouping people + their projects, and the workspace member pool. */
    teams: Team[]
    members: Assignee[]

    /** Tasks of a section, sorted by their `order`. */
    tasksBySection: (sectionId: string) => Task[]
    sortedSections: Section[]

    // Mutators (optimistic in local state, scoped to the active project).
    moveTask: (taskId: string, toSectionId: string, toIndex: number) => void
    reorderSections: (fromId: string, toId: string) => void
    toggleComplete: (taskId: string) => void
    toggleSubtask: (taskId: string, subtaskId: string) => void
    createTask: (sectionId: string, title: string, patch?: Partial<Task>) => void
    updateTask: (taskId: string, patch: Partial<Task>) => void
    setTaskDates: (taskId: string, dueDate: string | null, startDate?: string | null) => void

    // Custom tags (label catalog of the active project).
    createTag: (label: string, color: AccentColor) => Tag

    // People management (teams + projects).
    inviteMember: (email: string, target?: { teamId?: string; projectId?: string }) => void
    addMemberToTeam: (teamId: string, memberId: string) => void
    addMemberToProject: (projectId: string, memberId: string) => void

    /** Creates an empty project under a team and makes it active. */
    createProject: (teamId: string, name?: string) => void
}

export function useTasksMock(): TasksApi {
    const [projects, setProjects] = useState<Project[]>(() => mockProjects.map(cloneProject))
    const [teams, setTeams] = useState<Team[]>(() => structuredClone(mockTeams))
    const [members, setMembers] = useState<Assignee[]>(() => structuredClone(mockMembers))
    const [activeProjectId, setActiveProjectId] = useState<string>(() => mockProjects[0].id)

    const project = useMemo(
        () => projects.find((p) => p.id === activeProjectId) ?? projects[0],
        [projects, activeProjectId],
    )

    // Every mutator runs through here: it only transforms the active project.
    const updateActive = useCallback(
        (updater: (current: Project) => Project) => {
            setProjects((prev) => prev.map((p) => (p.id === activeProjectId ? updater(p) : p)))
        },
        [activeProjectId],
    )

    const selectProject = useCallback((projectId: string) => {
        // TODO: sync with API — load the selected project's board
        setActiveProjectId(projectId)
    }, [])

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

    const moveTask = useCallback(
        (taskId: string, toSectionId: string, toIndex: number) => {
            // TODO: sync with API — PATCH /tasks/:id { sectionId, order } + reindex siblings
            updateActive((prev) => {
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
        },
        [updateActive],
    )

    const reorderSections = useCallback(
        (fromId: string, toId: string) => {
            // TODO: sync with API — PATCH /sections order
            updateActive((prev) => {
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
        },
        [updateActive],
    )

    const toggleComplete = useCallback(
        (taskId: string) => {
            // TODO: sync with API — PATCH /tasks/:id { completed }
            updateActive((prev) => ({
                ...prev,
                tasks: prev.tasks.map((t) =>
                    t.id === taskId ? { ...t, completed: !t.completed } : t,
                ),
            }))
        },
        [updateActive],
    )

    const toggleSubtask = useCallback(
        (taskId: string, subtaskId: string) => {
            // TODO: sync with API — PATCH /tasks/:id/subtasks/:subId { completed }
            updateActive((prev) => ({
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
        },
        [updateActive],
    )

    const createTask = useCallback(
        (sectionId: string, title: string, patch: Partial<Task> = {}) => {
            // TODO: sync with API — POST /tasks
            updateActive((prev) => {
                const order = prev.tasks.filter((t) => t.sectionId === sectionId).length
                const priority: Priority = patch.priority ?? 'normal'
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
        [updateActive],
    )

    const updateTask = useCallback(
        (taskId: string, patch: Partial<Task>) => {
            // TODO: sync with API — PATCH /tasks/:id
            updateActive((prev) => ({
                ...prev,
                tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t)),
            }))
        },
        [updateActive],
    )

    const setTaskDates = useCallback(
        (taskId: string, dueDate: string | null, startDate?: string | null) => {
            // TODO: sync with API — PATCH /tasks/:id { dueDate, startDate }
            updateActive((prev) => ({
                ...prev,
                tasks: prev.tasks.map((t) =>
                    t.id === taskId
                        ? { ...t, dueDate, ...(startDate !== undefined ? { startDate } : {}) }
                        : t,
                ),
            }))
        },
        [updateActive],
    )

    const createTag = useCallback(
        (label: string, color: AccentColor): Tag => {
            // TODO: sync with API — POST /projects/:id/tags
            const tag: Tag = { id: nextId('tag'), label: label.trim() || 'Etiqueta', color }
            updateActive((prev) => ({ ...prev, tags: [...prev.tags, tag] }))
            return tag
        },
        [updateActive],
    )

    const inviteMember = useCallback(
        (email: string, target?: { teamId?: string; projectId?: string }) => {
            // TODO: sync with API — POST /invitations { email, teamId?, projectId? }
            const clean = email.trim()
            if (!clean) return
            const name = clean.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
            const member: Assignee = {
                id: nextId('u'),
                name: name || clean,
                color: memberPalette[seq % memberPalette.length],
            }
            setMembers((prev) => [...prev, member])
            if (target?.teamId) {
                setTeams((prev) =>
                    prev.map((t) =>
                        t.id === target.teamId ? { ...t, memberIds: [...t.memberIds, member.id] } : t,
                    ),
                )
            }
            if (target?.projectId) {
                setProjects((prev) =>
                    prev.map((p) =>
                        p.id === target.projectId ? { ...p, assignees: [...p.assignees, member] } : p,
                    ),
                )
            }
        },
        [],
    )

    const addMemberToTeam = useCallback((teamId: string, memberId: string) => {
        // TODO: sync with API — POST /teams/:id/members
        setTeams((prev) =>
            prev.map((t) =>
                t.id === teamId && !t.memberIds.includes(memberId)
                    ? { ...t, memberIds: [...t.memberIds, memberId] }
                    : t,
            ),
        )
    }, [])

    const addMemberToProject = useCallback(
        (projectId: string, memberId: string) => {
            // TODO: sync with API — POST /projects/:id/members
            const member = members.find((m) => m.id === memberId)
            if (!member) return
            setProjects((prev) =>
                prev.map((p) =>
                    p.id === projectId && !p.assignees.some((a) => a.id === memberId)
                        ? { ...p, assignees: [...p.assignees, member] }
                        : p,
                ),
            )
        },
        [members],
    )

    const createProject = useCallback(
        (teamId: string, name?: string) => {
            // TODO: sync with API — POST /projects
            const team = teams.find((t) => t.id === teamId)
            const id = nextId('proj')
            const teamMembers = members.filter((m) => team?.memberIds.includes(m.id))
            const project: Project = {
                id,
                name: name?.trim() || 'Nuevo proyecto',
                description: '',
                teamId,
                sections: [
                    { id: `${id}-s1`, name: 'Por hacer', color: 'slate', order: 0 },
                    { id: `${id}-s2`, name: 'En progreso', color: 'sky', order: 1 },
                    { id: `${id}-s3`, name: 'Completado', color: 'emerald', order: 2 },
                ],
                tasks: [],
                assignees: teamMembers,
                tags: [],
            }
            setProjects((prev) => [...prev, project])
            setActiveProjectId(id)
        },
        [teams, members],
    )

    return {
        project,
        projects,
        activeProjectId,
        selectProject,
        teams,
        members,
        tasksBySection,
        sortedSections,
        moveTask,
        reorderSections,
        toggleComplete,
        toggleSubtask,
        createTask,
        updateTask,
        setTaskDates,
        createTag,
        inviteMember,
        addMemberToTeam,
        addMemberToProject,
        createProject,
    }
}
