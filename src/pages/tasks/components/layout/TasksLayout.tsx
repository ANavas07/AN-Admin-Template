import { useMemo, useState } from 'react'
import ButtonComponent from '../../../../components/ui/buttons/ButtonComponent'
import InputComponent from '../../../../components/ui/inputs/InputComponent'
import DataList from '../../../../components/ui/inputs/DataList'
import ModuleHeader from '../../../../components/common/page/ModuleHeader'
import PopUp from '../../../../components/common/pop-up/PopUp'
import { useTasksMock } from '../../hooks/useTasksMock'
import { priorityLabels, priorityOrder } from '../../constants'
import type { Priority, Task, TaskView } from '../../types'
import { BoardView } from '../board/BoardView'
import { ListView } from '../list/ListView'
import { TimelineView } from '../timeline/TimelineView'
import { CalendarView } from '../calendar/CalendarView'
import { TaskDetailPanel } from '../task-detail/TaskDetailPanel'
import { ViewSwitcher } from './ViewSwitcher'
import { TasksToolbar, type TaskFilter } from './TasksToolbar'

const emptyFilter: TaskFilter = { search: '', priority: 'all', assigneeId: 'all' }

export default function TasksLayout() {
    const api = useTasksMock()
    const [view, setView] = useState<TaskView>('board')
    const [openTaskId, setOpenTaskId] = useState<string | null>(null)
    const [filter, setFilter] = useState<TaskFilter>(emptyFilter)

    // New-task modal state.
    const [creating, setCreating] = useState(false)
    const [newTitle, setNewTitle] = useState('')
    const [newSection, setNewSection] = useState(api.sortedSections[0]?.id ?? '')
    const [newPriority, setNewPriority] = useState<Priority>('medium')

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

    function openNewTask(sectionId?: string) {
        setNewSection(sectionId ?? api.sortedSections[0]?.id ?? '')
        setNewTitle('')
        setNewPriority('medium')
        setCreating(true)
    }

    function submitNewTask() {
        if (!newTitle.trim() || !newSection) return
        api.createTask(newSection, newTitle, { priority: newPriority })
        setCreating(false)
    }

    const sectionOptions = api.sortedSections.map((section) => ({ value: section.id, label: section.name }))
    const priorityOptions = priorityOrder.map((value) => ({ value, label: priorityLabels[value] }))

    return (
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
                    onNewTask={() => openNewTask()}
                />
            </div>

            <div className="mt-5">
                {view === 'board' && (
                    <BoardView
                        api={api}
                        matches={matches}
                        onOpenTask={setOpenTaskId}
                        onAddTask={openNewTask}
                        onAddSection={() => openNewTask()}
                    />
                )}
                {view === 'list' && (
                    <ListView api={api} matches={matches} onOpenTask={setOpenTaskId} onAddTask={openNewTask} />
                )}
                {view === 'timeline' && <TimelineView project={api.project} />}
                {view === 'calendar' && <CalendarView api={api} onOpenTask={setOpenTaskId} />}
            </div>

            <TaskDetailPanel taskId={openTaskId} api={api} onClose={() => setOpenTaskId(null)} />

            <PopUp
                isOpen={creating}
                onClose={() => setCreating(false)}
                title="Nueva tarea"
                description="Crea una tarea en el proyecto (mock)."
                size="md"
                footer={
                    <>
                        <ButtonComponent variant="ghost" onClick={() => setCreating(false)}>
                            Cancelar
                        </ButtonComponent>
                        <ButtonComponent onClick={submitNewTask} disabled={!newTitle.trim()}>
                            Crear tarea
                        </ButtonComponent>
                    </>
                }
            >
                <div className="flex flex-col gap-4">
                    <InputComponent
                        label="Título"
                        value={newTitle}
                        onChange={(event) => setNewTitle(event.target.value)}
                        placeholder="¿Qué hay que hacer?"
                        requiredMark
                        autoFocus
                    />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <DataList
                            label="Sección"
                            options={sectionOptions}
                            opKey="value"
                            opValue="label"
                            value={newSection}
                            clearable={false}
                            onSelect={(event) => setNewSection(event.target.value)}
                        />
                        <DataList
                            label="Prioridad"
                            options={priorityOptions}
                            opKey="value"
                            opValue="label"
                            value={newPriority}
                            clearable={false}
                            onSelect={(event) => setNewPriority((event.target.value || 'medium') as Priority)}
                        />
                    </div>
                </div>
            </PopUp>
        </main>
    )
}
