export interface Role {
  id: string
  code: string
  name: string
  description?: string | null
  parentRoleId?: string | null
  parentRole?: Pick<Role, 'id' | 'name'> | null
  isSystem: boolean
  createdAt: string
  permissionCount?: number
}

export interface Permission {
  id: string
  code: string
  resource: string
  action: string
  description?: string | null
}

export interface Group {
  id: string
  name: string
  description?: string | null
  parentGroupId?: string | null
  parentGroup?: Pick<Group, 'id' | 'name'> | null
  memberCount?: number
  roleCount?: number
}

export interface GroupMember {
  userId: string
  username: string
  assignedAt: string
  validUntil?: string | null
}

export interface GroupRole {
  roleId: string
  role: Pick<Role, 'id' | 'code' | 'name'>
}

export interface UserRoleAssignment {
  id: string
  roleId: string
  role: Pick<Role, 'id' | 'code' | 'name'>
  assignedAt: string
  validUntil?: string | null
}

export interface UserGroupRole {
  roleId: string
  role: Pick<Role, 'id' | 'code' | 'name'>
  groupId: string
  groupName: string
}

export interface EffectivePermission extends Permission {
  source: 'direct' | 'group' | 'inherited'
  sourceLabel?: string
}

export interface AuditLog {
  id: string
  eventType: string
  actor?: { username: string } | null
  entityType: string
  oldValue?: unknown
  newValue?: unknown
  createdAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

export interface RbacUser {
  id: string
  username: string
}

export type ToastState = {
  type: 'success' | 'error'
  message: string
}
