import type { ComponentType, SVGProps } from 'react'
import {
    ChartIcon,
    ClipboardIcon,
    ClockIcon,
    FlowIcon,
    FolderIcon,
    GridIcon,
    HomeIcon,
    LayersIcon,
    ListChecksIcon,
    LockIcon,
    ShieldIcon,
    SparkIcon,
    StarIcon,
    TimelineIcon,
    UserIcon,
    UsersIcon,
} from '../../../icons/icons'
import { cn } from '../../../utils/cn'

/** Icon keys available to `ModuleDefinition.icon` and `ModuleCategory.icon`. */
const MODULE_ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
    tasks: ListChecksIcon,
    planning: GridIcon,
    process: FlowIcon,
    files: FolderIcon,
    users: UsersIcon,
    rbac: LockIcon,
    audit: ClipboardIcon,
    gantt: TimelineIcon,
    playground: SparkIcon,
    operation: LayersIcon,
    administration: ShieldIcon,
    tools: ChartIcon,
    home: HomeIcon,
    user: UserIcon,
    star: StarIcon,
    recent: ClockIcon,
}

type ModuleIconProps = {
    /** A key of MODULE_ICONS. Any other string (e.g. an emoji) is rendered as-is for compatibility. */
    name: string
    className?: string
}

export default function ModuleIcon({ name, className }: ModuleIconProps) {
    const Icon = MODULE_ICONS[name]
    if (Icon) return <Icon className={cn('size-5', className)} />
    return (
        <span className={cn('text-lg leading-none', className)} aria-hidden="true">
            {name}
        </span>
    )
}
