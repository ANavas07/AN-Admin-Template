import { http } from '../http'
import type { AuditLog, PaginatedResponse } from '../../pages/superuser/rbac/types'

export const AUDIT_EVENT_TYPES = [
  'ROLE_ASSIGNED',
  'ROLE_REVOKED',
  'PII_ACCESSED',
  'BATCH_PII_EXPORT',
  'USER_CREATED',
  'PERMISSION_CHANGED',
  'GROUP_MEMBER_ADDED',
  'GROUP_MEMBER_REMOVED',
  'LOGIN_FAILED',
] as const

export type AuditEventType = typeof AUDIT_EVENT_TYPES[number]

interface ListAuditLogsParams {
  page?: number
  pageSize?: number
  eventTypes?: string[]
  actorUsername?: string
  dateFrom?: string
  dateTo?: string
  signal?: AbortSignal
}

export const auditService = {
  getAll: ({
    page = 1,
    pageSize = 20,
    eventTypes,
    actorUsername,
    dateFrom,
    dateTo,
    signal,
  }: ListAuditLogsParams = {}) => {
    const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
    if (eventTypes?.length) query.set('eventTypes', eventTypes.join(','))
    if (actorUsername) query.set('actorUsername', actorUsername)
    if (dateFrom) query.set('dateFrom', dateFrom)
    if (dateTo) query.set('dateTo', dateTo)
    return http.get<PaginatedResponse<AuditLog>>(`/audit-logs?${query}`, { signal })
  },
}
