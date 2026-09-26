import type { ReactNode } from 'react'
import { cn } from '../../../utils/cn'

type PaneLayoutProps = {
    /** Secondary navigation: folders, conversations, sections */
    aside: ReactNode
    asideLabel: string
    /** Tablet / mobile: the aside is a drawer over the content */
    isAsideOpen: boolean
    onCloseAside: () => void
    children: ReactNode
    asideClassName?: string
}

/**
 * Full-height two-pane layout for workspace-style modules (Mail, AI Assistant).
 * The aside is part of the layout from lg up and a drawer below it.
 */
export default function PaneLayout({ aside, asideLabel, isAsideOpen, onCloseAside, children, asideClassName }: PaneLayoutProps) {
    return (
        <div className="relative flex h-[calc(100vh-var(--layout-navbar-height))] min-h-0 bg-canvas">
            <div
                className={cn(
                    'absolute inset-0 z-(--z-dropdown) bg-overlay transition-opacity duration-(--duration-base) lg:hidden',
                    isAsideOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
                )}
                onClick={onCloseAside}
                aria-hidden="true"
            />
            <aside
                aria-label={asideLabel}
                className={cn(
                    'absolute inset-y-0 left-0 z-(--z-dropdown) flex w-72 shrink-0 flex-col border-r border-line bg-surface transition-transform duration-(--duration-slow) ease-emphasized',
                    isAsideOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full',
                    'lg:static lg:translate-x-0 lg:shadow-none',
                    asideClassName
                )}
            >
                {aside}
            </aside>
            <div className="flex min-w-0 flex-1 flex-col">{children}</div>
        </div>
    )
}
