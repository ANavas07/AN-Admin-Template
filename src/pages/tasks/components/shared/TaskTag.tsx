import { accentStyles } from '../../constants'
import type { Tag } from '../../types'

export function TaskTag({ tag }: { tag: Tag }) {
    return (
        <span
            className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${accentStyles[tag.color]}`}
        >
            {tag.label}
        </span>
    )
}
