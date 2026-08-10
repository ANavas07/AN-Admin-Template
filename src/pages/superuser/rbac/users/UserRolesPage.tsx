import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import TableTS, { ActionCell } from '../../../../components/ui/table/TableTs'
import ButtonComponent from '../../../../components/ui/buttons/ButtonComponent'
import InputComponent from '../../../../components/ui/inputs/InputComponent'
import ModuleHeader from '../../../../components/common/page/ModuleHeader'
import { SearchIcon, EyeIcon } from '../../../../icons/icons'
import RbacToast from '../components/RbacToast'
import UserRoleAssignModal from './UserRoleAssignModal'
import UserEffectivePermissionsPanel from './UserEffectivePermissionsPanel'
import { usersRolesService } from '../../../../services/rbac/users-roles.service'
import type { RbacUser, UserRoleAssignment, UserGroupRole, ToastState } from '../types'

export default function UserRolesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<RbacUser[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedUser, setSelectedUser] = useState<RbacUser | null>(null)

  const [directRoles, setDirectRoles] = useState<UserRoleAssignment[]>([])
  const [groupRoles, setGroupRoles] = useState<UserGroupRole[]>([])
  const [loadingRoles, setLoadingRoles] = useState(false)

  const [assignOpen, setAssignOpen] = useState(false)
  const [permsOpen, setPermsOpen] = useState(false)

  const [toast, setToast] = useState<ToastState | null>(null)

  function handleSearch() {
    if (!searchQuery.trim() || searchQuery.length < 2) return
    const controller = new AbortController()
    setIsSearching(true)
    setSelectedUser(null)
    setDirectRoles([])
    setGroupRoles([])
    usersRolesService
      .searchUsers(searchQuery, controller.signal)
      .then(setSearchResults)
      .catch(() => {})
      .finally(() => setIsSearching(false))
  }

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
    setSearchResults([])
    setSearchQuery(user.username)
    loadUserRoles(user)
  }

  async function handleRemoveRole(roleId: string, roleName: string) {
    if (!selectedUser || !confirm(`¿Revocar el rol "${roleName}" de ${selectedUser.username}?`)) return
    try {
      await usersRolesService.removeRole(selectedUser.id, roleId)
      setToast({ type: 'success', message: `Rol "${roleName}" revocado.` })
      loadUserRoles(selectedUser)
    } catch {
      setToast({ type: 'error', message: 'No se pudo revocar el rol.' })
    }
  }

  function handleAssigned() {
    setAssignOpen(false)
    setToast({ type: 'success', message: 'Rol asignado correctamente.' })
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
        <span className="font-mono text-xs bg-(--color-bg-soft) px-2 py-0.5 rounded">
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
          : <span className="text-(--color-text-muted)">Indefinida</span>
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
          onDelete={() => handleRemoveRole(row.original.roleId, row.original.role.name)}
        />
      ),
    },
  ], [selectedUser])

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
        <span className="font-mono text-xs bg-(--color-bg-soft) px-2 py-0.5 rounded">
          {row.original.role.code}
        </span>
      ),
    },
    {
      accessorKey: 'groupName',
      header: 'Grupo de origen',
      cell: (info) => (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-800/50">
          👥 {info.getValue() as string}
        </span>
      ),
    },
  ], [])

  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="RBAC"
        title="Asignación de Usuarios"
        description="Asigna y revoca roles directos a usuarios individuales."
      />

      {/* Buscador de usuario */}
      <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-sm">
        <p className="mb-3 text-sm font-semibold text-(--color-text)">Seleccionar usuario</p>
        <div className="flex gap-2">
          <div className="flex-1">
            <InputComponent
              placeholder="Busca por username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              showSearchIcon
              iconPosition="left"
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch() }}
            />
          </div>
          <ButtonComponent
            variant="outline"
            leftIcon={<SearchIcon />}
            isLoading={isSearching}
            loadingText="Buscando..."
            onClick={handleSearch}
            disabled={searchQuery.trim().length < 2}
          >
            Buscar
          </ButtonComponent>
        </div>

        {/* Resultados de búsqueda */}
        {searchResults.length > 0 && (
          <div className="mt-3 rounded-xl border border-(--color-border) overflow-hidden">
            {searchResults.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => selectUser(user)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm hover:bg-(--color-bg-soft) transition-colors border-b border-(--color-border) last:border-b-0"
              >
                <span className="text-base">👤</span>
                <span className="font-medium text-(--color-text)">{user.username}</span>
              </button>
            ))}
          </div>
        )}

        {searchResults.length === 0 && isSearching === false && searchQuery.length >= 2 && !selectedUser && (
          <p className="mt-2 text-sm text-(--color-text-muted)">Sin resultados para "{searchQuery}".</p>
        )}
      </div>

      {/* Panel del usuario seleccionado */}
      {selectedUser && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-(--color-text)">
                {selectedUser.username}
              </h2>
              <p className="text-sm text-(--color-text-muted)">ID: {selectedUser.id}</p>
            </div>
            <div className="flex gap-2">
              <ButtonComponent
                variant="outline"
                leftIcon={<EyeIcon />}
                onClick={() => setPermsOpen(true)}
              >
                Ver permisos efectivos
              </ButtonComponent>
              <ButtonComponent onClick={() => setAssignOpen(true)}>
                Asignar rol
              </ButtonComponent>
            </div>
          </div>

          {/* Roles directos */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-(--color-text)">Roles directos</h3>
            <TableTS
              data={directRoles}
              columns={directColumns}
              loading={loadingRoles}
              enableSorting
              existBtn={false}
              emptyMessage="No tiene roles directos asignados."
            />
          </div>

          {/* Roles por grupo */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-(--color-text)">Roles por grupo</h3>
              <span className="text-xs text-(--color-text-muted)">(solo lectura — administra desde Grupos)</span>
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
      )}

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

      <RbacToast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}
