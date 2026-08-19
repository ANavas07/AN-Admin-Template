import DataList from '../../../../components/ui/inputs/DataList'
import { priorityLabels, priorityOrder } from '../../constants'
import { formatLongDate } from '../../utils'
import type { Priority, Task } from '../../types'
import { AssigneeAvatar } from '../shared/AssigneeAvatar'
import { PriorityBadge } from '../shared/PriorityBadge'
import { TaskTag } from '../shared/TaskTag'

type Props = {
    task: Task
    onChangePriority: (priority: Priority) => void
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="grid grid-cols-[7rem_1fr] items-start gap-2 py-2">
            <span className="pt-1 text-xs font-medium uppercase tracking-wide text-(--color-text-muted)">
                {label}
            </span>
            <div className="min-w-0">{children}</div>
        </div>
    )
}

export function TaskMetaFields({ task, onChangePriority }: Props) {
    const priorityOptions = priorityOrder.map((value) => ({ value, label: priorityLabels[value] }))

    return (
        <div className="divide-y divide-(--color-border)">
            <Field label="Asignados">
                {task.assignees.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-2">
                        {task.assignees.map((assignee) => (
                            <span key={assignee.id} className="inline-flex items-center gap-1.5 rounded-full border border-(--color-border) py-0.5 pl-0.5 pr-2 text-xs text-(--color-text)">
                                <AssigneeAvatar assignee={assignee} size="sm" />
                                {assignee.name}
                            </span>
                        ))}
                    </div>
                ) : (
                    <span className="text-sm text-(--color-text-muted)">Sin asignar</span>
                )}
            </Field>

            <Field label="Vencimiento">
                <span className="text-sm text-(--color-text)">
                    {formatLongDate(task.dueDate) ?? 'Sin fecha'}
                </span>
            </Field>

            <Field label="Prioridad">
                <div className="flex items-center gap-3">
                    <PriorityBadge priority={task.priority} />
                    <div className="w-40">
                        <DataList
                            options={priorityOptions}
                            opKey="value"
                            opValue="label"
                            value={task.priority}
                            clearable={false}
                            onSelect={(event) => {
                                const next = event.target.value as Priority
                                if (next) onChangePriority(next)
                            }}
                        />
                    </div>
                </div>
            </Field>

            <Field label="Etiquetas">
                {task.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                        {task.tags.map((tag) => (
                            <TaskTag key={tag.id} tag={tag} />
                        ))}
                    </div>
                ) : (
                    <span className="text-sm text-(--color-text-muted)">Sin etiquetas</span>
                )}
            </Field>
        </div>
    )
}
