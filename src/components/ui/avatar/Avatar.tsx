import { cn } from '../../../utils/cn'
import { getInitials } from '../../../utils/initials'
import { toneFromString, toneTint } from '../tone'
import type { Tone } from '../tone'

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

type AvatarProps = {
    name: string
    /** Defaults to a stable tone derived from the name */
    tone?: Tone
    size?: AvatarSize
    /** Adds a ring in the surface color, for overlapping stacks */
    ringed?: boolean
    className?: string
}

const sizeClasses: Record<AvatarSize, string> = {
    xs: 'size-6 text-3xs',
    sm: 'size-7 text-2xs',
    md: 'size-9 text-xs',
    lg: 'size-12 text-sm',
    xl: 'size-20 text-2xl',
}

/** Circular initials avatar. Tinted (not solid) so it stays legible in both themes. */
export default function Avatar({ name, tone, size = 'md', ringed = false, className }: AvatarProps) {
    return (
        <span
            title={name}
            aria-label={name}
            role="img"
            className={cn(
                'inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold',
                sizeClasses[size],
                toneTint[tone ?? toneFromString(name)],
                ringed && 'ring-2 ring-surface',
                className
            )}
        >
            {getInitials(name)}
        </span>
    )
}
