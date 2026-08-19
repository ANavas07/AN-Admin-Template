import { priorityDot, priorityLabels, priorityStyles } from '../../constants'
import type { Priority } from '../../types'

export function PriorityBadge({ priority }: { priority: Priority }) {
    return (
        <span
            className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${priorityStyles[priority]}`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${priorityDot[priority]}`} aria-hidden="true" />
            {priorityLabels[priority]}
        </span>
    )
}
