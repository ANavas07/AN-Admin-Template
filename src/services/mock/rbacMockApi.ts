// In-browser stand-in for the RBAC REST API (roles, permissions, groups,
// user roles, audit log). `http.ts` routes requests here while
// appConfig.mockApi is on, so the RBAC screens work without a backend and
// the services keep calling the real endpoints unchanged.
import type { AuditLog, EffectivePermission, Group, GroupMember, Permission, Role, UserRoleAssignment } from '../../pages/administration/rbac/types'
import { createId, createLocalStore, isRecord } from '../storage/localStore'

type RoleRecord = Omit<Role, 'parentRole' | 'permissionCount'> & { permissionIds: string[] }
type GroupRecord = Omit<Group, 'parentGroup' | 'memberCount' | 'roleCount'> & { members: GroupMember[]; roleIds: string[] }
type UserRecord = { id: string; username: string; roles: Omit<UserRoleAssignment, 'role'>[] }

type RbacState = {
    version: 1
    roles: RoleRecord[]
    permissions: Permission[]
    groups: GroupRecord[]
    users: UserRecord[]
    audit: AuditLog[]
}

export class MockHttpError extends Error {
    readonly status: number
    constructor(status: number, message: string) {
        super(message)
        this.status = status
    }
}

const DAY_MS = 24 * 60 * 60 * 1000
const RESOURCES = ['usuarios', 'roles', 'procesos', 'tareas', 'documentos', 'reportes']
const ACTIONS = ['read', 'create', 'update', 'delete']
const ACTION_LABELS: Record<string, string> = { read: 'Consultar', create: 'Crear', update: 'Editar', delete: 'Eliminar' }

function seed(): RbacState {
    const now = Date.now()
    const iso = (daysAgo: number) => new Date(now - daysAgo * DAY_MS).toISOString()
    const permissions: Permission[] = RESOURCES.flatMap((resource) =>
        ACTIONS.map((action) => ({
            id: `perm-${resource}-${action}`,
            code: `${resource}:${action}`,
            resource,
            action,
            description: `${ACTION_LABELS[action]} ${resource}`,
        }))
    )
    const pick = (filter: (permission: Permission) => boolean) => permissions.filter(filter).map((permission) => permission.id)

    const roles: RoleRecord[] = [
        { id: 'role-admin', code: 'ADMIN', name: 'Administrador', description: 'Acceso total a la plataforma', parentRoleId: null, isSystem: true, createdAt: iso(400), permissionIds: pick(() => true) },
        { id: 'role-organizer', code: 'ORGANIZER', name: 'Organizador', description: 'Gestiona procesos, tareas y documentos', parentRoleId: 'role-admin', isSystem: false, createdAt: iso(380), permissionIds: pick((permission) => ['procesos', 'tareas', 'documentos'].includes(permission.resource)) },
        { id: 'role-analyst', code: 'ANALYST', name: 'Analista', description: 'Consulta información y reportes', parentRoleId: 'role-organizer', isSystem: false, createdAt: iso(300), permissionIds: pick((permission) => permission.action === 'read') },
        { id: 'role-viewer', code: 'VIEWER', name: 'Lector', description: 'Solo lectura de documentos', parentRoleId: 'role-analyst', isSystem: true, createdAt: iso(300), permissionIds: pick((permission) => permission.resource === 'documentos' && permission.action === 'read') },
    ]

    const users: UserRecord[] = [
        ['juan.garcia', 'role-admin'],
        ['maria.lopez', 'role-organizer'],
        ['carlos.ruiz', 'role-analyst'],
        ['ana.martinez', 'role-organizer'],
        ['diego.fernandez', 'role-viewer'],
        ['lucia.herrera', 'role-analyst'],
    ].map(([username, roleId], index) => ({
        id: `user-${index + 1}`,
        username,
        roles: [{ id: `ura-${index + 1}`, roleId, assignedAt: iso(200 - index * 20), validUntil: null }],
    }))

    const member = (userId: string, daysAgo: number): GroupMember => ({
        userId,
        username: users.find((user) => user.id === userId)!.username,
        assignedAt: iso(daysAgo),
        validUntil: null,
    })
    const groups: GroupRecord[] = [
        { id: 'group-direccion', name: 'Dirección', description: 'Equipo directivo', parentGroupId: null, members: [member('user-1', 120), member('user-2', 90)], roleIds: ['role-organizer'] },
        { id: 'group-docentes', name: 'Docentes', description: 'Planificación y seguimiento académico', parentGroupId: 'group-direccion', members: [member('user-4', 60), member('user-6', 40)], roleIds: ['role-analyst'] },
        { id: 'group-finanzas', name: 'Finanzas', description: 'Presupuesto y reportes', parentGroupId: null, members: [member('user-3', 30)], roleIds: ['role-analyst'] },
    ]

    const event = (eventType: string, actor: string, entityType: string, daysAgo: number, newValue?: unknown): AuditLog => ({
        id: createId('aud'),
        eventType,
        actor: { username: actor },
        entityType,
        newValue,
        createdAt: iso(daysAgo),
    })
    const audit: AuditLog[] = [
        event('ROLE_ASSIGNED', 'juan.garcia', 'user_role', 0.1, { usuario: 'lucia.herrera', rol: 'Analista' }),
        event('LOGIN_FAILED', 'diego.fernandez', 'session', 0.4),
        event('PERMISSION_CHANGED', 'juan.garcia', 'role', 1, { rol: 'Organizador', permisos: 12 }),
        event('GROUP_MEMBER_ADDED', 'maria.lopez', 'group', 2, { grupo: 'Docentes', usuario: 'lucia.herrera' }),
        event('PII_ACCESSED', 'carlos.ruiz', 'user', 3, { registro: 'ana.martinez' }),
        event('USER_CREATED', 'juan.garcia', 'user', 5, { usuario: 'lucia.herrera' }),
        event('ROLE_REVOKED', 'juan.garcia', 'user_role', 8, { usuario: 'diego.fernandez', rol: 'Analista' }),
        event('BATCH_PII_EXPORT', 'maria.lopez', 'report', 12, { registros: 240 }),
        event('GROUP_MEMBER_REMOVED', 'juan.garcia', 'group', 15, { grupo: 'Finanzas', usuario: 'diego.fernandez' }),
    ]

    return { version: 1, roles, permissions, groups, users, audit }
}

function parse(raw: unknown): RbacState | null {
    if (!isRecord(raw) || raw.version !== 1) return null
    const keys = ['roles', 'permissions', 'groups', 'users', 'audit'] as const
    return keys.every((key) => Array.isArray(raw[key])) ? (raw as RbacState) : null
}

const store = createLocalStore<RbacState>({ namespace: 'rbac-mock:v1', seed, parse })

// ----- Helpers ---------------------------------------------------------------

const ACTOR = 'usuario.demo'

function paginate<T>(items: T[], params: URLSearchParams) {
    const page = Math.max(Number(params.get('page')) || 1, 1)
    const pageSize = Math.max(Number(params.get('pageSize')) || 20, 1)
    return { data: items.slice((page - 1) * pageSize, page * pageSize), total: items.length, page, pageSize }
}

const matches = (text: string | null | undefined, query: string | null) => !query || (text ?? '').toLowerCase().includes(query.toLowerCase())

function toRole(record: RoleRecord, state: RbacState): Role {
    const { permissionIds, ...role } = record
    const parent = state.roles.find((item) => item.id === record.parentRoleId)
    return { ...role, parentRole: parent ? { id: parent.id, name: parent.name } : null, permissionCount: permissionIds.length }
}

function toGroup(record: GroupRecord, state: RbacState): Group {
    const { members, roleIds, ...group } = record
    const parent = state.groups.find((item) => item.id === record.parentGroupId)
    return { ...group, parentGroup: parent ? { id: parent.id, name: parent.name } : null, memberCount: members.length, roleCount: roleIds.length }
}

const roleRef = (state: RbacState, roleId: string) => {
    const role = state.roles.find((item) => item.id === roleId)
    return { id: roleId, code: role?.code ?? '', name: role?.name ?? 'Rol eliminado' }
}

function withAudit(state: RbacState, eventType: string, entityType: string, newValue?: unknown): RbacState {
    const entry: AuditLog = { id: createId('aud'), eventType, actor: { username: ACTOR }, entityType, newValue, createdAt: new Date().toISOString() }
    return { ...state, audit: [entry, ...state.audit].slice(0, 300) }
}

function notFound(what: string): never {
    throw new MockHttpError(404, `${what} no existe.`)
}

/** Effective permissions of a user: direct roles, group roles and inherited parents. */
function effectivePermissions(state: RbacState, userId: string): EffectivePermission[] {
    const user = state.users.find((item) => item.id === userId) ?? notFound('El usuario')
    const result = new Map<string, EffectivePermission>()
    const visit = (roleId: string, source: EffectivePermission['source'], label: string, depth = 0) => {
        const role = state.roles.find((item) => item.id === roleId)
        if (!role || depth > 10) return
        for (const permissionId of role.permissionIds) {
            const permission = state.permissions.find((item) => item.id === permissionId)
            if (permission && !result.has(permission.id)) result.set(permission.id, { ...permission, source: depth ? 'inherited' : source, sourceLabel: label })
        }
        // A role also grants what its child roles grant (hierarchy goes from general to specific)
        for (const child of state.roles.filter((item) => item.parentRoleId === roleId)) visit(child.id, source, `${label} › ${child.name}`, depth + 1)
    }
    for (const assignment of user.roles) visit(assignment.roleId, 'direct', roleRef(state, assignment.roleId).name)
    for (const group of state.groups.filter((item) => item.members.some((memberItem) => memberItem.userId === userId))) {
        for (const roleId of group.roleIds) visit(roleId, 'group', `Grupo ${group.name}`)
    }
    return [...result.values()]
}

// ----- Router ----------------------------------------------------------------

type Handler = (args: { params: string[]; query: URLSearchParams; body: Record<string, unknown> }) => unknown

type Route = { method: string; pattern: RegExp; handler: Handler }

const routes: Route[] = []
const on = (method: string, path: string, handler: Handler) => routes.push({ method, pattern: new RegExp(`^${path.replace(/:\w+/g, '([^/]+)')}$`), handler })
const mutate = (change: (state: RbacState) => RbacState) => store.update(change)

// Roles
on('GET', '/roles', ({ query }) => {
    const state = store.read()
    const search = query.get('search')
    return paginate(state.roles.filter((role) => matches(role.name, search) || matches(role.code, search)).map((role) => toRole(role, state)), query)
})
on('GET', '/roles/:id', ({ params }) => {
    const state = store.read()
    return toRole(state.roles.find((role) => role.id === params[0]) ?? notFound('El rol'), state)
})
on('POST', '/roles', ({ body }) => {
    const code = String(body.code ?? '').toUpperCase()
    if (store.read().roles.some((role) => role.code === code)) throw new MockHttpError(409, `Ya existe un rol con el código ${code}.`)
    const role: RoleRecord = {
        id: createId('role'),
        code,
        name: String(body.name ?? ''),
        description: (body.description as string) ?? null,
        parentRoleId: (body.parentRoleId as string) ?? null,
        isSystem: false,
        createdAt: new Date().toISOString(),
        permissionIds: [],
    }
    const state = mutate((current) => withAudit({ ...current, roles: [...current.roles, role] }, 'PERMISSION_CHANGED', 'role', { rol: role.name, accion: 'creado' }))
    return toRole(role, state)
})
on('PATCH', '/roles/:id', ({ params, body }) => {
    const state = mutate((current) => ({
        ...current,
        roles: current.roles.map((role) => (role.id === params[0] ? { ...role, ...body, parentRoleId: (body.parentRoleId as string) ?? null } : role)),
    }))
    return toRole(state.roles.find((role) => role.id === params[0]) ?? notFound('El rol'), state)
})
on('DELETE', '/roles/:id', ({ params }) => {
    const role = store.read().roles.find((item) => item.id === params[0]) ?? notFound('El rol')
    if (role.isSystem) throw new MockHttpError(409, 'Los roles del sistema no se pueden eliminar.')
    mutate((current) =>
        withAudit(
            {
                ...current,
                roles: current.roles.filter((item) => item.id !== role.id).map((item) => (item.parentRoleId === role.id ? { ...item, parentRoleId: role.parentRoleId } : item)),
                users: current.users.map((user) => ({ ...user, roles: user.roles.filter((assignment) => assignment.roleId !== role.id) })),
                groups: current.groups.map((group) => ({ ...group, roleIds: group.roleIds.filter((id) => id !== role.id) })),
            },
            'PERMISSION_CHANGED',
            'role',
            { rol: role.name, accion: 'eliminado' }
        )
    )
})
on('GET', '/roles/:id/permissions', ({ params }) => {
    const state = store.read()
    const role = state.roles.find((item) => item.id === params[0]) ?? notFound('El rol')
    return state.permissions.filter((permission) => role.permissionIds.includes(permission.id))
})
on('PUT', '/roles/:id/permissions', ({ params, body }) => {
    const permissionIds = Array.isArray(body.permissionIds) ? (body.permissionIds as string[]) : []
    mutate((current) =>
        withAudit(
            { ...current, roles: current.roles.map((role) => (role.id === params[0] ? { ...role, permissionIds } : role)) },
            'PERMISSION_CHANGED',
            'role',
            { rol: roleRef(current, params[0]).name, permisos: permissionIds.length }
        )
    )
})

// Permissions
on('GET', '/permissions', ({ query }) => {
    const resource = query.get('resource')
    const action = query.get('action')
    return paginate(
        store.read().permissions.filter((permission) => (!resource || permission.resource === resource) && (!action || permission.action === action)),
        query
    )
})
on('POST', '/permissions', ({ body }) => {
    const resource = String(body.resource ?? '').toLowerCase()
    const action = String(body.action ?? '').toLowerCase()
    const code = `${resource}:${action}`
    if (store.read().permissions.some((permission) => permission.code === code)) throw new MockHttpError(409, `El permiso ${code} ya existe.`)
    const permission: Permission = { id: createId('perm'), code, resource, action, description: (body.description as string) ?? null }
    mutate((current) => ({ ...current, permissions: [...current.permissions, permission] }))
    return permission
})
on('PATCH', '/permissions/:id', ({ params, body }) => {
    const state = mutate((current) => ({
        ...current,
        permissions: current.permissions.map((permission) => {
            if (permission.id !== params[0]) return permission
            const next = { ...permission, ...body } as Permission
            return { ...next, code: `${next.resource}:${next.action}` }
        }),
    }))
    return state.permissions.find((permission) => permission.id === params[0]) ?? notFound('El permiso')
})
on('DELETE', '/permissions/:id', ({ params }) => {
    mutate((current) => ({
        ...current,
        permissions: current.permissions.filter((permission) => permission.id !== params[0]),
        roles: current.roles.map((role) => ({ ...role, permissionIds: role.permissionIds.filter((id) => id !== params[0]) })),
    }))
})

// Groups
on('GET', '/groups', ({ query }) => {
    const state = store.read()
    const search = query.get('search')
    return paginate(state.groups.filter((group) => matches(group.name, search)).map((group) => toGroup(group, state)), query)
})
on('POST', '/groups', ({ body }) => {
    const group: GroupRecord = {
        id: createId('group'),
        name: String(body.name ?? ''),
        description: (body.description as string) ?? null,
        parentGroupId: (body.parentGroupId as string) ?? null,
        members: [],
        roleIds: [],
    }
    const state = mutate((current) => ({ ...current, groups: [...current.groups, group] }))
    return toGroup(group, state)
})
on('PATCH', '/groups/:id', ({ params, body }) => {
    const state = mutate((current) => ({
        ...current,
        groups: current.groups.map((group) => (group.id === params[0] ? { ...group, ...body, parentGroupId: (body.parentGroupId as string) ?? null } : group)),
    }))
    return toGroup(state.groups.find((group) => group.id === params[0]) ?? notFound('El grupo'), state)
})
on('DELETE', '/groups/:id', ({ params }) => {
    mutate((current) => ({ ...current, groups: current.groups.filter((group) => group.id !== params[0]) }))
})
on('GET', '/groups/:id/members', ({ params }) => (store.read().groups.find((group) => group.id === params[0]) ?? notFound('El grupo')).members)
on('POST', '/groups/:id/members', ({ params, body }) => {
    const state = store.read()
    const user = state.users.find((item) => item.id === body.userId) ?? notFound('El usuario')
    const group = state.groups.find((item) => item.id === params[0]) ?? notFound('El grupo')
    if (group.members.some((member) => member.userId === user.id)) throw new MockHttpError(409, `${user.username} ya pertenece al grupo.`)
    const member: GroupMember = { userId: user.id, username: user.username, assignedAt: new Date().toISOString(), validUntil: (body.validUntil as string) ?? null }
    mutate((current) =>
        withAudit(
            { ...current, groups: current.groups.map((item) => (item.id === group.id ? { ...item, members: [...item.members, member] } : item)) },
            'GROUP_MEMBER_ADDED',
            'group',
            { grupo: group.name, usuario: user.username }
        )
    )
})
on('DELETE', '/groups/:id/members/:userId', ({ params }) => {
    mutate((current) => {
        const group = current.groups.find((item) => item.id === params[0]) ?? notFound('El grupo')
        const member = group.members.find((item) => item.userId === params[1])
        return withAudit(
            { ...current, groups: current.groups.map((item) => (item.id === group.id ? { ...item, members: item.members.filter((entry) => entry.userId !== params[1]) } : item)) },
            'GROUP_MEMBER_REMOVED',
            'group',
            { grupo: group.name, usuario: member?.username }
        )
    })
})
on('GET', '/groups/:id/roles', ({ params }) => {
    const state = store.read()
    const group = state.groups.find((item) => item.id === params[0]) ?? notFound('El grupo')
    return group.roleIds.map((roleId) => ({ roleId, role: roleRef(state, roleId) }))
})
on('POST', '/groups/:id/roles', ({ params, body }) => {
    mutate((current) => ({
        ...current,
        groups: current.groups.map((group) =>
            group.id === params[0] && !group.roleIds.includes(String(body.roleId)) ? { ...group, roleIds: [...group.roleIds, String(body.roleId)] } : group
        ),
    }))
})
on('DELETE', '/groups/:id/roles/:roleId', ({ params }) => {
    mutate((current) => ({
        ...current,
        groups: current.groups.map((group) => (group.id === params[0] ? { ...group, roleIds: group.roleIds.filter((id) => id !== params[1]) } : group)),
    }))
})

// Users and their roles
on('GET', '/users/search', ({ query }) =>
    store
        .read()
        .users.filter((user) => matches(user.username, query.get('q')))
        .map(({ id, username }) => ({ id, username }))
)
on('GET', '/users/:id/roles', ({ params }) => {
    const state = store.read()
    const user = state.users.find((item) => item.id === params[0]) ?? notFound('El usuario')
    return user.roles.map((assignment) => ({ ...assignment, role: roleRef(state, assignment.roleId) }))
})
on('POST', '/users/:id/roles', ({ params, body }) => {
    const roleId = String(body.roleId ?? '')
    const state = store.read()
    const user = state.users.find((item) => item.id === params[0]) ?? notFound('El usuario')
    if (user.roles.some((assignment) => assignment.roleId === roleId)) throw new MockHttpError(409, 'El usuario ya tiene ese rol.')
    const assignment = { id: createId('ura'), roleId, assignedAt: new Date().toISOString(), validUntil: (body.validUntil as string) ?? null }
    mutate((current) =>
        withAudit(
            { ...current, users: current.users.map((item) => (item.id === user.id ? { ...item, roles: [...item.roles, assignment] } : item)) },
            'ROLE_ASSIGNED',
            'user_role',
            { usuario: user.username, rol: roleRef(current, roleId).name }
        )
    )
    return { ...assignment, role: roleRef(state, roleId) }
})
on('DELETE', '/users/:id/roles/:roleId', ({ params }) => {
    mutate((current) => {
        const user = current.users.find((item) => item.id === params[0]) ?? notFound('El usuario')
        return withAudit(
            { ...current, users: current.users.map((item) => (item.id === user.id ? { ...item, roles: item.roles.filter((assignment) => assignment.roleId !== params[1]) } : item)) },
            'ROLE_REVOKED',
            'user_role',
            { usuario: user.username, rol: roleRef(current, params[1]).name }
        )
    })
})
on('GET', '/users/:id/group-roles', ({ params }) => {
    const state = store.read()
    return state.groups
        .filter((group) => group.members.some((member) => member.userId === params[0]))
        .flatMap((group) => group.roleIds.map((roleId) => ({ roleId, role: roleRef(state, roleId), groupId: group.id, groupName: group.name })))
})
on('GET', '/users/:id/effective-permissions', ({ params }) => effectivePermissions(store.read(), params[0]))

// Audit log
on('GET', '/audit-logs', ({ query }) => {
    const eventTypes = query.get('eventTypes')?.split(',').filter(Boolean)
    const actor = query.get('actorUsername')
    const from = query.get('dateFrom')
    const to = query.get('dateTo')
    const logs = store
        .read()
        .audit.filter((log) => !eventTypes?.length || eventTypes.includes(log.eventType))
        .filter((log) => matches(log.actor?.username, actor))
        .filter((log) => !from || log.createdAt.slice(0, 10) >= from)
        .filter((log) => !to || log.createdAt.slice(0, 10) <= to)
    return paginate(logs, query)
})

/** Answers a request when a mock route matches; returns `undefined` when none does. */
export function findMockRoute(method: string, path: string) {
    const [pathname, search = ''] = path.split('?')
    for (const route of routes) {
        const match = route.method === method ? route.pattern.exec(pathname) : null
        if (match) {
            return (body: unknown) =>
                route.handler({ params: match.slice(1).map(decodeURIComponent), query: new URLSearchParams(search), body: isRecord(body) ? body : {} })
        }
    }
    return undefined
}
