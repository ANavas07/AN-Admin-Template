import { http } from '../http'
import { sanitize } from '../sanitize'
import type { Group, GroupMember, GroupRole, PaginatedResponse } from '../../pages/superuser/rbac/types'

interface ListGroupsParams {
  page?: number
  pageSize?: number
  search?: string
  signal?: AbortSignal
}

export interface CreateGroupDto {
  name: string
  description?: string
  parentGroupId?: string
}

export const groupsService = {
  getAll: ({ page = 1, pageSize = 100, search, signal }: ListGroupsParams = {}) => {
    const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
    if (search) query.set('search', search)
    return http.get<PaginatedResponse<Group>>(`/groups?${query}`, { signal })
  },

  create: (data: CreateGroupDto) =>
    http.post<Group>('/groups', sanitize(data)),

  update: (id: string, data: Partial<CreateGroupDto>) =>
    http.patch<Group>(`/groups/${id}`, sanitize(data)),

  remove: (id: string) =>
    http.delete<void>(`/groups/${id}`),

  getMembers: (id: string, signal?: AbortSignal) =>
    http.get<GroupMember[]>(`/groups/${id}/members`, { signal }),

  addMember: (id: string, userId: string, validUntil?: string) =>
    http.post<void>(`/groups/${id}/members`, sanitize({ userId, validUntil })),

  removeMember: (id: string, userId: string) =>
    http.delete<void>(`/groups/${id}/members/${userId}`),

  getRoles: (id: string, signal?: AbortSignal) =>
    http.get<GroupRole[]>(`/groups/${id}/roles`, { signal }),

  addRole: (id: string, roleId: string) =>
    http.post<void>(`/groups/${id}/roles`, { roleId }),

  removeRole: (id: string, roleId: string) =>
    http.delete<void>(`/groups/${id}/roles/${roleId}`),
}
