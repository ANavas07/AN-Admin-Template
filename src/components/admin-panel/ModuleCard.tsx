import { ArrowRightIcon } from '../../icons/icons'
import ModuleIcon from './ModuleIcon'

type ModuleCardProps = {
    icon: string
    title: string
    description: string
    onClick?: () => void
    isAvailable?: boolean
}

export default function ModuleCard({ icon, title, description, onClick, isAvailable = true }: ModuleCardProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={!isAvailable}
            className="card-interactive group flex items-start gap-3.5 p-4 text-left focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand/25 disabled:cursor-not-allowed disabled:opacity-50"
        >
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-strong">
                <ModuleIcon name={icon} />
            </span>
            <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-fg">{title}</span>
                    <ArrowRightIcon className="size-4 shrink-0 text-fg-subtle opacity-0 transition-opacity group-hover:opacity-100" />
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-fg-muted">{description}</span>
            </span>
        </button>
    )
}
