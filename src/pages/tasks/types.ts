// Visual data model for the Tasks module (Asana-style). Pure view types with
// mock data — the real API layer will map onto these interfaces later.

export type Priority = 'urgent' | 'high' | 'normal' | 'low'

/** Semantic color slots that map to Tailwind token palettes in `constants.ts`. */
export type AccentColor = 'sky' | 'violet' | 'amber' | 'rose' | 'emerald' | 'slate' | 'indigo'

export type TaskView = 'board' | 'list' | 'timeline' | 'calendar'

export interface Assignee {
    id: string
    name: string
    color: AccentColor
}

export interface Tag {
    id: string
    label: string
    color: AccentColor
}

export interface Subtask {
    id: string
    title: string
    completed: boolean
}

export interface TaskComment {
    id: string
    author: Assignee
    body: string
    createdAt: string // ISO
}

export interface Task {
    id: string
    sectionId: string
    title: string
    description: string
    completed: boolean
    priority: Priority
    /** ISO date or null when unscheduled. Red in the UI when overdue. */
    dueDate: string | null
    /** ISO date — needed to place the task on the Timeline (Gantt). */
    startDate: string | null
    assignees: Assignee[]
    tags: Tag[]
    subtasks: Subtask[]
    /** Task ids this task depends on → rendered as arrows on the Timeline. */
    dependsOn: string[]
    comments: TaskComment[]
    /** Additional field: physical place the task points to (e.g. "Sede Norte, Aula 204"). */
    location?: string | null
    /** Position within its section (Kanban column / List group). */
    order: number
}

export interface Section {
    id: string
    name: string
    color: AccentColor
    order: number
}

export interface Project {
    id: string
    name: string
    description: string
    /** Team this project belongs to (see `Team`). */
    teamId: string
    sections: Section[]
    tasks: Task[]
    assignees: Assignee[]
    /** Reusable label catalog for this project (custom tags). */
    tags: Tag[]
}

/** A team groups people and the projects they work on (ClickUp-style spaces). */
export interface Team {
    id: string
    name: string
    color: AccentColor
    memberIds: string[]
}
