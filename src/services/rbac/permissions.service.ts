import { http } from '../http'
import { sanitize } from '../sanitize'
import type { Permission, PaginatedResponse } from '../../pages/superuser/rbac/types'

interface ListPermissionsParams {
  page?: number
  pageSize?: number
  resource?: string
  action?: string
  signal?: AbortSignal
}

export interface CreatePermissionDto {
  resource: string
  action: string
  description?: string
}

export const permissionsService = {
  getAll: ({ page = 1, pageSize = 200, resource, action, signal }: ListPermissionsParams = {}) => {
    const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
    if (resource) query.set('resource', resource)
    if (action) query.set('action', action)
    return http.get<PaginatedResponse<Permission>>(`/permissions?${query}`, { signal })
  },

  create: (data: CreatePermissionDto) =>
    http.post<Permission>('/permissions', sanitize(data)),

  update: (id: string, data: Partial<CreatePermissionDto>) =>
    http.patch<Permission>(`/permissions/${id}`, sanitize(data)),

  remove: (id: string) =>
    http.delete<void>(`/permissions/${id}`),
}
