import { NavLink } from 'react-router-dom'
import { cn } from '../../../utils/cn'

export type SectionTab = {
    label: string
    to: string
    /** Only active on the exact route (use for the index tab) */
    end?: boolean
    count?: number
}

/** Route-based tabs for the sections of a module (Support, Account…). */
export default function SectionTabs({ tabs, label }: { tabs: SectionTab[]; label: string }) {
    return (
        <nav aria-label={label} className="-mb-px flex gap-1 overflow-x-auto border-b border-line">
            {tabs.map((tab) => (
                <NavLink
                    key={tab.to}
                    to={tab.to}
                    end={tab.end}
                    className={({ isActive }) =>
                        cn(
                            'relative inline-flex h-10 shrink-0 items-center gap-2 px-3 text-sm font-medium transition-colors',
                            'after:absolute after:inset-x-2 after:-bottom-px after:h-0.5 after:rounded-full',
                            isActive ? 'text-fg after:bg-brand' : 'text-fg-muted hover:text-fg after:bg-transparent'
                        )
                    }
                >
                    {tab.label}
                    {tab.count !== undefined ? (
                        <span className="rounded-full bg-canvas-subtle px-1.5 py-px text-2xs tabular-nums text-fg-muted">{tab.count}</span>
                    ) : null}
                </NavLink>
            ))}
        </nav>
    )
}
