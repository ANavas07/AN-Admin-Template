import ButtonComponent from '../../../../components/ui/buttons/ButtonComponent'
import InputComponent from '../../../../components/ui/inputs/InputComponent'
import DataList from '../../../../components/ui/inputs/DataList'
import { SearchIcon, PlusIcon } from '../../../../icons/icons'
import { priorityLabels, priorityOrder } from '../../constants'
import type { Assignee, Priority } from '../../types'
import Select from '../../../../components/ui/inputs/Select'

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
    onInvite: () => void
}

export function TasksToolbar({ filter, onFilterChange, assignees, onNewTask, onInvite }: Props) {
    const priorityOptions = [
        { value: 'all', label: 'Todas las prioridades' },
        ...priorityOrder.map((value) => ({ value, label: priorityLabels[value] })),
    ]
    const assigneeOptions = [
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
                <div className="w-65">
                    <Select
                        id="priority-select"
                        options={priorityOptions}
                        value={filter.priority}
                        opKey="value"
                        opValue="label"
                        placeholder="Seleccionar prioridad"
                        clearable={false}
                        onSelect={(event) =>
                            onFilterChange({ ...filter, priority: (event.target.value || 'all') as Priority | 'all' })
                        }
                    />
                </div>
                <div className="w-65">
                    <DataList
                        options={assigneeOptions}
                        opKey="value"
                        opValue="label"
                        placeholder='Buscar por asignado'
                        value={filter.assigneeId}
                        clearable={false}
                        onSelect={(event) =>
                            onFilterChange({ ...filter, assigneeId: event.target.value || 'all' })
                        }
                    />
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
                <ButtonComponent onClick={onInvite} variant="outline" size="sm">
                    Invitar
                </ButtonComponent>
                <ButtonComponent onClick={onNewTask} leftIcon={<PlusIcon />} size="sm">
                    Nueva tarea
                </ButtonComponent>
            </div>
        </div>
    )
}
