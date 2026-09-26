import Badge from '../../../../components/ui/badge/Badge'
import EmptyState from '../../../../components/ui/empty-state/EmptyState'
import { ActivityIcon } from '../../../../icons/icons'
import type { ApiKeyAuditEvent } from '../../../../services/api-keys/apiKeys.service'
import { formatDateTime } from '../../../../utils/format'
import { formatRelativeTime } from '../../../../utils/relativeTime'
import { AUDIT_META } from '../apiKeyPresentation'

type ApiKeyAuditTrailProps = {
    events: ApiKeyAuditEvent[]
    /** Hides the key name (inside the detail of a single key) */
    compact?: boolean
    limit?: number
}

/** Who did what to which key, newest first. */
export default function ApiKeyAuditTrail({ events, compact = false, limit }: ApiKeyAuditTrailProps) {
    const visible = limit ? events.slice(0, limit) : events
    if (visible.length === 0) {
        return <EmptyState icon={<ActivityIcon className="size-5" />} title="Sin eventos" description="Las acciones sobre las claves aparecerán aquí." />
    }
    return (
        <ol className="divide-y divide-line">
            {visible.map((event) => {
                const meta = AUDIT_META[event.action]
                return (
                    <li key={event.id} className="flex items-start gap-3 py-2.5">
                        <Badge tone={meta.tone} size="sm" className="mt-0.5 w-22 justify-center">
                            {meta.label}
                        </Badge>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm text-fg">
                                {compact ? null : <span className="font-medium">{event.keyName} · </span>}
                                <span className="text-fg-muted">por {event.actor}</span>
                            </p>
                            {event.detail ? <p className="text-xs text-fg-muted">{event.detail}</p> : null}
                        </div>
                        <time dateTime={event.at} title={formatDateTime(event.at)} className="shrink-0 text-xs text-fg-subtle">
                            {formatRelativeTime(new Date(event.at).getTime())}
                        </time>
                    </li>
                )
            })}
        </ol>
    )
}
