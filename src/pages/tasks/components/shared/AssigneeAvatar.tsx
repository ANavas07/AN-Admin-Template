import { accentAvatar } from '../../constants'
import type { Assignee } from '../../types'

type Size = 'sm' | 'md'

const sizeClasses: Record<Size, string> = {
    sm: 'h-6 w-6 text-[10px]',
    md: 'h-8 w-8 text-xs',
}

function initials(name: string) {
    return name
        .split(' ')
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('')
}

export function AssigneeAvatar({ assignee, size = 'sm' }: { assignee: Assignee; size?: Size }) {
    return (
        <span
            title={assignee.name}
            aria-label={assignee.name}
            className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ring-2 ring-(--color-surface) ${sizeClasses[size]} ${accentAvatar[assignee.color]}`}
        >
            {initials(assignee.name)}
        </span>
    )
}

/** Overlapping stack of avatars (Asana-style), collapses the overflow into "+N". */
export function AssigneeStack({ assignees, size = 'sm', max = 3 }: { assignees: Assignee[]; size?: Size; max?: number }) {
    if (assignees.length === 0) return null
    const shown = assignees.slice(0, max)
    const rest = assignees.length - shown.length

    return (
        <div className="flex items-center -space-x-1.5">
            {shown.map((assignee) => (
                <AssigneeAvatar key={assignee.id} assignee={assignee} size={size} />
            ))}
            {rest > 0 ? (
                <span
                    className={`inline-flex items-center justify-center rounded-full bg-(--color-bg-soft) font-semibold text-(--color-text-muted) ring-2 ring-(--color-surface) ${sizeClasses[size]}`}
                >
                    +{rest}
                </span>
            ) : null}
        </div>
    )
}
