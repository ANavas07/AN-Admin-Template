import { useMemo, useState } from 'react'
import ModuleHeader from '../../../../components/common/page/ModuleHeader'
import { useTasksMock } from '../../hooks/useTasksMock'
import type { Task, TaskView } from '../../types'
import { BoardView } from '../board/BoardView'
import { ListView } from '../list/ListView'
import { TimelineView } from '../timeline/TimelineView'
import { CalendarView } from '../calendar/CalendarView'
import { TaskDetailPanel } from '../task-detail/TaskDetailPanel'
import TaskFormModal from '../TaskFormModal'
import MembersModal from '../MembersModal'
import { ViewSwitcher } from './ViewSwitcher'
import { TasksToolbar, type TaskFilter } from './TasksToolbar'
import { TasksSidebar, type MembersTarget } from './TasksSidebar'

const emptyFilter: TaskFilter = { search: '', priority: 'all', assigneeId: 'all' }

export default function TasksLayout() {
    const api = useTasksMock()
    const [view, setView] = useState<TaskView>('board')
    const [openTaskId, setOpenTaskId] = useState<string | null>(null)
    const [filter, setFilter] = useState<TaskFilter>(emptyFilter)

    // Create/edit form modal state (mirrors the RoleFormModal flow: null task = create).
    const [formOpen, setFormOpen] = useState(false)
    const [formTask, setFormTask] = useState<Task | null>(null)
    const [formSectionId, setFormSectionId] = useState<string | undefined>(undefined)

    // Members (invite / add) modal state.
    const [membersOpen, setMembersOpen] = useState(false)
    const [membersTarget, setMembersTarget] = useState<MembersTarget>({})
    const [membersMode, setMembersMode] = useState<'invite' | 'add'>('invite')

    function openMembers(target: MembersTarget, mode: 'invite' | 'add') {
        setMembersTarget(target)
        setMembersMode(mode)
        setMembersOpen(true)
    }

    const matches = useMemo(() => {
        const query = filter.search.trim().toLowerCase()
        return (task: Task) => {
            if (filter.priority !== 'all' && task.priority !== filter.priority) return false
            if (filter.assigneeId !== 'all' && !task.assignees.some((a) => a.id === filter.assigneeId)) return false
            if (!query) return true
            const haystack = [task.title, ...task.tags.map((t) => t.label), ...task.assignees.map((a) => a.name)]
                .join(' ')
                .toLowerCase()
            return haystack.includes(query)
        }
    }, [filter])

    function openCreate(sectionId?: string) {
        setFormTask(null)
        setFormSectionId(sectionId)
        setFormOpen(true)
    }

    return (
        <div className="flex items-start">
            <TasksSidebar
                teams={api.teams}
                projects={api.projects}
                members={api.members}
                activeProjectId={api.activeProjectId}
                onSelectProject={api.selectProject}
                onManageMembers={openMembers}
                onNewProject={(teamId) => {
                    if (teamId) api.createProject(teamId)
                }}
            />

            <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
                <ModuleHeader
                    eyebrow="Gestión de tareas"
                    title={api.project.name}
                    description={api.project.description}
                    actions={<ViewSwitcher active={view} onChange={setView} />}
                />

                <div className="mt-6">
                    <TasksToolbar
                        filter={filter}
                        onFilterChange={setFilter}
                        assignees={api.project.assignees}
                        onNewTask={() => openCreate()}
                        onInvite={() => openMembers({ projectId: api.activeProjectId }, 'invite')}
                    />
                </div>

                <div className="mt-5">
                    {view === 'board' && (
                        <BoardView
                            api={api}
                            matches={matches}
                            onOpenTask={setOpenTaskId}
                            onAddTask={openCreate}
                            onAddSection={() => openCreate()}
                        />
                    )}
                    {view === 'list' && (
                        <ListView api={api} matches={matches} onOpenTask={setOpenTaskId} onAddTask={openCreate} />
                    )}
                    {view === 'timeline' && <TimelineView project={api.project} />}
                    {view === 'calendar' && <CalendarView api={api} onOpenTask={setOpenTaskId} />}
                </div>
            </main>

            <TaskDetailPanel taskId={openTaskId} api={api} onClose={() => setOpenTaskId(null)} />

            <TaskFormModal
                isOpen={formOpen}
                task={formTask}
                defaultSectionId={formSectionId}
                api={api}
                onClose={() => setFormOpen(false)}
                onSaved={() => setFormOpen(false)}
            />

            <MembersModal
                isOpen={membersOpen}
                target={membersTarget}
                initialMode={membersMode}
                teams={api.teams}
                projects={api.projects}
                members={api.members}
                onInvite={api.inviteMember}
                onAddMember={(target, memberId) => {
                    if (target.teamId) api.addMemberToTeam(target.teamId, memberId)
                    if (target.projectId) api.addMemberToProject(target.projectId, memberId)
                }}
                onClose={() => setMembersOpen(false)}
            />
        </div>
    )
}
