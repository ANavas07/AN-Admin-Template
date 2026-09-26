import type { ReactNode } from 'react'
import { cn } from '../../../utils/cn'

/** Keyboard key hint, e.g. <Kbd>Ctrl</Kbd><Kbd>K</Kbd>. */
export default function Kbd({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <kbd
            className={cn(
                'inline-flex h-5 min-w-5 items-center justify-center rounded-sm border border-line bg-surface-muted px-1 font-sans text-3xs font-medium text-fg-muted',
                className
            )}
        >
            {children}
        </kbd>
    )
}
