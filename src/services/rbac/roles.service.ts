import { http } from '../http'
import { sanitize } from '../sanitize'
import type { Role, Permission, PaginatedResponse } from '../../pages/superuser/rbac/types'

interface ListRolesParams {
  page?: number
  pageSize?: number
  search?: string
  signal?: AbortSignal
}

export interface CreateRoleDto {
  code: string
  name: string
  description?: string
  parentRoleId?: string
}

export const rolesService = {
  getAll: ({ page = 1, pageSize = 100, search, signal }: ListRolesParams = {}) => {
    const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
    if (search) query.set('search', search)
    return http.get<PaginatedResponse<Role>>(`/roles?${query}`, { signal })
  },

  getById: (id: string) =>
    http.get<Role>(`/roles/${id}`),

  create: (data: CreateRoleDto) =>
    http.post<Role>('/roles', sanitize(data)),

  update: (id: string, data: Partial<Omit<CreateRoleDto, 'code'>>) =>
    http.patch<Role>(`/roles/${id}`, sanitize(data)),

  remove: (id: string) =>
    http.delete<void>(`/roles/${id}`),

  getPermissions: (id: string, signal?: AbortSignal) =>
    http.get<Permission[]>(`/roles/${id}/permissions`, { signal }),

  updatePermissions: (id: string, permissionIds: string[]) =>
    http.put<void>(`/roles/${id}/permissions`, { permissionIds }),
}
