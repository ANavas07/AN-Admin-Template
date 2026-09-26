import { useEffect, useState } from 'react'
import { appConfig, ROLE_LABELS } from '../../../config/app.config'
import { useWorkspace } from '../../../context/workspace-context'
import { processStatusLabels, processStatusTones } from '../../operations/process/types'
import type { ProcessStatus, ProcessSummary } from '../../operations/process/types'
import { processService } from '../../../services/process/process.service'
import { formatRelativeTime } from '../../../utils/relativeTime'
import Badge from '../../../components/ui/badge/Badge'
import Panel from '../../../components/ui/panel/Panel'

const STATUS_ORDER: ProcessStatus[] = ['draft', 'review', 'approved', 'published']

/** Context for the session and live figures from the process repository. */
export default function SystemInfoPanel({ lastVisitAt, className }: { lastVisitAt: number | null; className?: string }) {
    const { user, role } = useWorkspace()
    const [processes, setProcesses] = useState<ProcessSummary[] | null>(null)

    useEffect(() => {
        let cancelled = false
        processService.list().then((list) => {
            if (!cancelled) setProcesses(list)
        })
        return () => {
            cancelled = true
        }
    }, [])

    const rows = [
        { label: 'Organización', value: appConfig.organization },
        { label: 'Sede', value: appConfig.location },
        { label: 'Rol activo', value: ROLE_LABELS[role] },
        { label: 'Roles asignados', value: String(user.roles.length) },
        { label: 'Última actividad', value: lastVisitAt ? formatRelativeTime(lastVisitAt) : 'Sin registros' },
    ]

    return (
        <Panel title="Información del sistema" description={appConfig.name} headingId="home-system" className={className}>
            <dl className="divide-y divide-line text-sm">
                {rows.map((row) => (
                    <div key={row.label} className="flex items-center justify-between gap-3 py-2 first:pt-0">
                        <dt className="shrink-0 text-fg-muted">{row.label}</dt>
                        <dd className="min-w-0 truncate text-right font-medium text-fg">{row.value}</dd>
                    </div>
                ))}
            </dl>

            <div className="mt-4 border-t border-line pt-4">
                <p className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="text-fg-muted">Procesos en el repositorio</span>
                    <span className="font-semibold tabular-nums text-fg">{processes ? processes.length : '—'}</span>
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                    {STATUS_ORDER.map((status) => {
                        const count = processes?.filter((process) => process.status === status).length ?? 0
                        return (
                            <Badge key={status} tone={processStatusTones[status]} size="sm">
                                {processStatusLabels[status]} · {count}
                            </Badge>
                        )
                    })}
                </div>
            </div>
        </Panel>
    )
}
