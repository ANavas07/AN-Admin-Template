import { http } from '../http'
import { sanitize } from '../sanitize'
import type {
  UserRoleAssignment,
  UserGroupRole,
  EffectivePermission,
  RbacUser,
} from '../../pages/superuser/rbac/types'

export interface AssignRoleDto {
  roleId: string
  validUntil?: string
}

export const usersRolesService = {
  searchUsers: (q: string, signal?: AbortSignal) =>
    http.get<RbacUser[]>(`/users/search?q=${encodeURIComponent(q)}`, { signal }),

  getDirectRoles: (userId: string, signal?: AbortSignal) =>
    http.get<UserRoleAssignment[]>(`/users/${userId}/roles`, { signal }),

  assignRole: (userId: string, data: AssignRoleDto) =>
    http.post<UserRoleAssignment>(`/users/${userId}/roles`, sanitize(data)),

  removeRole: (userId: string, roleId: string) =>
    http.delete<void>(`/users/${userId}/roles/${roleId}`),

  getGroupRoles: (userId: string, signal?: AbortSignal) =>
    http.get<UserGroupRole[]>(`/users/${userId}/group-roles`, { signal }),

  getEffectivePermissions: (userId: string, signal?: AbortSignal) =>
    http.get<EffectivePermission[]>(`/users/${userId}/effective-permissions`, { signal }),
}
