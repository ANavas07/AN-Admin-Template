import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../../utils/cn'
import { toneSoft, toneSolid } from '../tone'
import type { Tone } from '../tone'

export type BadgeSize = 'sm' | 'md'

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
    tone?: Tone
    size?: BadgeSize
    /** Shows a small solid dot before the label (status indicators) */
    dot?: boolean
    /** Uppercase, tracked label (for workflow states such as "Borrador") */
    caps?: boolean
    children: ReactNode
}

const sizeClasses: Record<BadgeSize, string> = {
    sm: 'px-1.5 py-px text-2xs',
    md: 'px-2 py-0.5 text-xs',
}

/** Compact status / category label. Colors come from the shared tone system. */
export default function Badge({
    tone = 'neutral',
    size = 'md',
    dot = false,
    caps = false,
    className,
    children,
    ...rest
}: BadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-medium ring-1 ring-inset',
                sizeClasses[size],
                caps && 'font-semibold uppercase tracking-caps',
                toneSoft[tone],
                className
            )}
            {...rest}
        >
            {dot ? <span className={cn('size-1.5 shrink-0 rounded-full', toneSolid[tone])} aria-hidden="true" /> : null}
            {children}
        </span>
    )
}
