import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import TableTS, { ActionCell } from '../../../../components/ui/table/TableTs'
import ButtonComponent from '../../../../components/ui/buttons/ButtonComponent'
import ConfirmDialog from '../../../../components/common/pop-up/ConfirmDialog'
import EmptyState from '../../../../components/ui/empty-state/EmptyState'
import InputComponent from '../../../../components/ui/inputs/InputComponent'
import ModuleHeader from '../../../../components/common/page/ModuleHeader'
import Badge from '../../../../components/ui/badge/Badge'
import { EyeIcon, UserIcon, UsersIcon } from '../../../../icons/icons'
import UserRoleAssignModal from './UserRoleAssignModal'
import UserEffectivePermissionsPanel from './UserEffectivePermissionsPanel'
import { usersRolesService } from '../../../../services/rbac/users-roles.service'
import { sileo } from 'sileo'
import type { RbacUser, UserRoleAssignment, UserGroupRole } from '../types'
import Avatar from '../../../../components/ui/avatar/Avatar'
import { cn } from '../../../../utils/cn'

/**
 * Roles › User assignment as master-detail: the people are listed from the
 * start (recognition over recall); choosing one shows their direct and
 * inherited roles.
 */
export default function UserRolesPage() {
  const [users, setUsers] = useState<RbacUser[] | null>(null)
  const [filter, setFilter] = useState('')
  const [selectedUser, setSelectedUser] = useState<RbacUser | null>(null)

  const [directRoles, setDirectRoles] = useState<UserRoleAssignment[]>([])
  const [groupRoles, setGroupRoles] = useState<UserGroupRole[]>([])
  const [loadingRoles, setLoadingRoles] = useState(false)

  const [assignOpen, setAssignOpen] = useState(false)
  const [permsOpen, setPermsOpen] = useState(false)
  const [toRevoke, setToRevoke] = useState<{ roleId: string; roleName: string } | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    usersRolesService
      .searchUsers('', controller.signal)
      .then(setUsers)
      .catch((error) => {
        if (error.name !== 'AbortError') setUsers([])
      })
    return () => controller.abort()
  }, [])

  const loadUserRoles = useCallback((user: RbacUser, signal?: AbortSignal) => {
    setLoadingRoles(true)
    Promise.all([
      usersRolesService.getDirectRoles(user.id, signal),
      usersRolesService.getGroupRoles(user.id, signal),
    ])
      .then(([direct, group]) => {
        setDirectRoles(direct)
        setGroupRoles(group)
      })
      .catch(() => {})
      .finally(() => setLoadingRoles(false))
  }, [])

  function selectUser(user: RbacUser) {
    setSelectedUser(user)
    loadUserRoles(user)
  }

  async function confirmRevoke() {
    if (!selectedUser || !toRevoke) return
    try {
      await usersRolesService.removeRole(selectedUser.id, toRevoke.roleId)
      sileo.success({ title: `Rol «${toRevoke.roleName}» revocado` })
      loadUserRoles(selectedUser)
    } catch {
      sileo.error({ title: 'No se pudo revocar el rol.' })
    }
    setToRevoke(null)
  }

  function handleAssigned() {
    setAssignOpen(false)
    sileo.success({ title: 'Rol asignado' })
    if (selectedUser) loadUserRoles(selectedUser)
  }

  const directColumns: ColumnDef<UserRoleAssignment>[] = useMemo(() => [
    {
      id: 'roleName',
      header: 'Rol',
      cell: ({ row }) => <span className="font-medium">{row.original.role.name}</span>,
    },
    {
      id: 'roleCode',
      header: 'Código',
      cell: ({ row }) => (
        <span className="font-mono text-xs bg-canvas-subtle px-2 py-0.5 rounded">
          {row.original.role.code}
        </span>
      ),
    },
    {
      accessorKey: 'validUntil',
      header: 'Vigencia',
      cell: (info) => {
        const val = info.getValue() as string | null
        return val
          ? new Date(val).toLocaleDateString('es-CO')
          : <span className="text-fg-muted">Indefinida</span>
      },
    },
    {
      accessorKey: 'assignedAt',
      header: 'Asignado',
      cell: (info) => new Date(info.getValue() as string).toLocaleDateString('es-CO'),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <ActionCell
          onDelete={() => setToRevoke({ roleId: row.original.roleId, roleName: row.original.role.name })}
        />
      ),
    },
  ], [])

  const groupColumns: ColumnDef<UserGroupRole>[] = useMemo(() => [
    {
      id: 'roleName',
      header: 'Rol',
      cell: ({ row }) => <span className="font-medium">{row.original.role.name}</span>,
    },
    {
      id: 'roleCode',
      header: 'Código',
      cell: ({ row }) => (
        <span className="font-mono text-xs bg-canvas-subtle px-2 py-0.5 rounded">
          {row.original.role.code}
        </span>
      ),
    },
    {
      accessorKey: 'groupName',
      header: 'Grupo de origen',
      cell: (info) => (
        <Badge tone="success">
          <UsersIcon className="size-3.5" />
          {info.getValue() as string}
        </Badge>
      ),
    },
  ], [])

  const visibleUsers = (users ?? []).filter((user) => user.username.toLowerCase().includes(filter.trim().toLowerCase()))

  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="Roles y permisos"
        title="Asignación de usuarios"
        description="Elige a una persona para ver sus roles, asignarle uno nuevo o revisar sus permisos efectivos."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* People */}
        <section className="card flex flex-col overflow-hidden lg:col-span-4" aria-label="Usuarios">
          <div className="border-b border-line p-3">
            <InputComponent
              placeholder="Filtrar por nombre de usuario"
              aria-label="Filtrar usuarios"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              showSearchIcon
              iconPosition="left"
              size="sm"
            />
          </div>
          {users === null ? (
            <p className="p-4 text-sm text-fg-muted">Cargando usuarios…</p>
          ) : visibleUsers.length === 0 ? (
            <p className="p-4 text-sm text-fg-muted">Ningún usuario coincide con «{filter}».</p>
          ) : (
            <ul className="max-h-120 divide-y divide-line overflow-y-auto">
              {visibleUsers.map((user) => {
                const isSelected = selectedUser?.id === user.id
                return (
                  <li key={user.id}>
                    <button
                      type="button"
                      onClick={() => selectUser(user)}
                      aria-pressed={isSelected}
                      className={cn(
                        'flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors',
                        isSelected ? 'bg-brand-soft font-semibold text-brand-strong' : 'text-fg hover:bg-canvas-subtle'
                      )}
                    >
                      <Avatar name={user.username.replace('.', ' ')} size="sm" />
                      <span className="truncate">{user.username}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        {/* Selected person */}
        <section className="space-y-5 lg:col-span-8" aria-label="Roles del usuario">
          {selectedUser ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar name={selectedUser.username.replace('.', ' ')} size="md" />
                  <div>
                    <h2 className="text-lg font-semibold text-fg">{selectedUser.username}</h2>
                    <p className="text-xs text-fg-muted">{directRoles.length} {directRoles.length === 1 ? 'rol directo' : 'roles directos'} · {groupRoles.length} {groupRoles.length === 1 ? 'heredado' : 'heredados'} de grupos</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <ButtonComponent variant="outline" leftIcon={<EyeIcon className="size-4" />} onClick={() => setPermsOpen(true)}>
                    Permisos efectivos
                  </ButtonComponent>
                  <ButtonComponent onClick={() => setAssignOpen(true)}>Asignar rol</ButtonComponent>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-fg">Roles directos</h3>
                <TableTS
                  data={directRoles}
                  columns={directColumns}
                  loading={loadingRoles}
                  enableSorting
                  existBtn={false}
                  emptyMessage="Sin roles directos. Usa «Asignar rol» para darle uno."
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-fg">Roles por grupo</h3>
                  <span className="text-xs text-fg-muted">Solo lectura: se administran desde Grupos</span>
                </div>
                <TableTS
                  data={groupRoles}
                  columns={groupColumns}
                  loading={loadingRoles}
                  existBtn={false}
                  emptyMessage="No hereda roles de ningún grupo."
                />
              </div>
            </>
          ) : (
            <div className="card">
              <EmptyState
                icon={<UserIcon className="size-5" />}
                title="Elige a una persona"
                description="Selecciónala en la lista para ver sus roles directos, los heredados de grupos y sus permisos efectivos."
              />
            </div>
          )}
        </section>
      </div>

      {selectedUser && (
        <UserRoleAssignModal
          isOpen={assignOpen}
          user={selectedUser}
          existingRoleIds={directRoles.map((r) => r.roleId)}
          onClose={() => setAssignOpen(false)}
          onAssigned={handleAssigned}
        />
      )}

      {selectedUser && (
        <UserEffectivePermissionsPanel
          isOpen={permsOpen}
          user={selectedUser}
          onClose={() => setPermsOpen(false)}
        />
      )}

      <ConfirmDialog
        isOpen={toRevoke !== null}
        title="Revocar rol"
        description={toRevoke && selectedUser ? `${selectedUser.username} perderá los permisos del rol «${toRevoke.roleName}».` : undefined}
        confirmLabel="Revocar rol"
        onConfirm={confirmRevoke}
        onCancel={() => setToRevoke(null)}
      />
    </div>
  )
}
