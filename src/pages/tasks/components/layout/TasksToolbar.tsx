import ButtonComponent from '../../../../components/ui/buttons/ButtonComponent'
import InputComponent from '../../../../components/ui/inputs/InputComponent'
import DataList from '../../../../components/ui/inputs/DataList'
import { SearchIcon, PlusIcon } from '../../../../icons/icons'
import { priorityLabels, priorityOrder } from '../../constants'
import type { Assignee, Priority } from '../../types'

export type TaskFilter = {
    search: string
    priority: Priority | 'all'
    assigneeId: string | 'all'
}

type Props = {
    filter: TaskFilter
    onFilterChange: (filter: TaskFilter) => void
    assignees: Assignee[]
    onNewTask: () => void
}

export function TasksToolbar({ filter, onFilterChange, assignees, onNewTask }: Props) {
    const priorityOptions = [
        { value: 'all', label: 'Toda prioridad' },
        ...priorityOrder.map((value) => ({ value, label: priorityLabels[value] })),
    ]
    const assigneeOptions = [
        { value: 'all', label: 'Todos los asignados' },
        ...assignees.map((assignee) => ({ value: assignee.id, label: assignee.name })),
    ]

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-wrap items-center gap-2">
                <div className="w-full max-w-xs">
                    <InputComponent
                        value={filter.search}
                        onChange={(event) => onFilterChange({ ...filter, search: event.target.value })}
                        placeholder="Buscar tareas…"
                        leftIcon={<SearchIcon />}
                        iconPosition="left"
                        size="sm"
                        fullWidth
                    />
                </div>
                <div className="w-44">
                    <DataList
                        options={priorityOptions}
                        opKey="value"
                        opValue="label"
                        value={filter.priority}
                        clearable={false}
                        onSelect={(event) =>
                            onFilterChange({ ...filter, priority: (event.target.value || 'all') as Priority | 'all' })
                        }
                    />
                </div>
                <div className="w-52">
                    <DataList
                        options={assigneeOptions}
                        opKey="value"
                        opValue="label"
                        value={filter.assigneeId}
                        clearable={false}
                        onSelect={(event) =>
                            onFilterChange({ ...filter, assigneeId: event.target.value || 'all' })
                        }
                    />
                </div>
            </div>

            <ButtonComponent onClick={onNewTask} leftIcon={<PlusIcon />} size="sm" className="shrink-0">
                Nueva tarea
            </ButtonComponent>
        </div>
    )
}
