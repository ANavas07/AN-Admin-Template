import DataList from '../../../../components/ui/inputs/DataList'
import { priorityLabels, priorityOrder } from '../../constants'
import { formatLongDate } from '../../utils'
import type { AccentColor, Priority, Tag, Task } from '../../types'
import { AssigneeAvatar } from '../shared/AssigneeAvatar'
import { PriorityBadge } from '../shared/PriorityBadge'
import { TagPicker } from './TagPicker'

type Props = {
    task: Task
    /** Project tag catalog for the picker. */
    tagCatalog: Tag[]
    onChangePriority: (priority: Priority) => void
    onChangeLocation: (location: string) => void
    onSetTags: (tags: Tag[]) => void
    onCreateTag: (label: string, color: AccentColor) => Tag
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

function LocationIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 shrink-0 text-(--color-text-muted)" aria-hidden="true">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
        </svg>
    )
}

export function TaskMetaFields({ task, tagCatalog, onChangePriority, onChangeLocation, onSetTags, onCreateTag }: Props) {
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

            <Field label="Ubicación">
                <div className="flex items-center gap-2 rounded-lg border border-(--color-border) bg-(--color-surface) px-2.5 focus-within:border-highlight focus-within:ring-2 focus-within:ring-highlight/25">
                    <LocationIcon />
                    <input
                        key={task.id}
                        defaultValue={task.location ?? ''}
                        placeholder="Añade un lugar (sede, aula, dirección…)"
                        onBlur={(event) => onChangeLocation(event.target.value)}
                        className="w-full bg-transparent py-2 text-sm text-(--color-text) placeholder:text-(--color-text-muted) focus:outline-none"
                    />
                </div>
            </Field>

            <Field label="Etiquetas">
                <TagPicker
                    appliedTags={task.tags}
                    catalog={tagCatalog}
                    onSetTags={onSetTags}
                    onCreateTag={onCreateTag}
                />
            </Field>
        </div>
    )
}
