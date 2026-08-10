import { useCallback, useEffect, useMemo, useState } from 'react'
import PopUp from '../../../../components/common/pop-up/PopUp'
import ButtonComponent from '../../../../components/ui/buttons/ButtonComponent'
import DataList from '../../../../components/ui/inputs/DataList'
import { TrashBinIcon } from '../../../../icons/icons'
import { groupsService } from '../../../../services/rbac/groups.service'
import { rolesService } from '../../../../services/rbac/roles.service'
import type { Group, GroupRole, Role } from '../types'

interface GroupRolesPanelProps {
  isOpen: boolean
  group: Group
  onClose: () => void
  onChanged: () => void
}

export default function GroupRolesPanel({
  isOpen,
  group,
  onClose,
  onChanged,
}: GroupRolesPanelProps) {
  const [groupRoles, setGroupRoles] = useState<GroupRole[]>([])
  const [allRoles, setAllRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedRoleId, setSelectedRoleId] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)

  const loadData = useCallback(
    (signal?: AbortSignal) => {
      setLoading(true)
      Promise.all([
        groupsService.getRoles(group.id, signal),
        rolesService.getAll({ signal }),
      ])
        .then(([roles, allRes]) => {
          setGroupRoles(roles)
          setAllRoles(allRes.data)
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    },
    [group.id]
  )

  useEffect(() => {
    if (!isOpen) return
    const controller = new AbortController()
    loadData(controller.signal)
    return () => controller.abort()
  }, [isOpen, loadData])

  const assignedRoleIds = useMemo(() => new Set(groupRoles.map((gr) => gr.roleId)), [groupRoles])

  const availableRoleOptions = useMemo(
    () =>
      allRoles
        .filter((r) => !assignedRoleIds.has(r.id))
        .map((r) => ({ label: r.name, value: r.id, description: r.code })),
    [allRoles, assignedRoleIds]
  )

  async function handleAdd() {
    if (!selectedRoleId) return
    setIsAdding(true)
    try {
      await groupsService.addRole(group.id, selectedRoleId)
      setSelectedRoleId('')
      loadData()
      onChanged()
    } catch {
      // silently fail
    } finally {
      setIsAdding(false)
    }
  }

  async function handleRemove(roleId: string, roleName: string) {
    if (!confirm(`¿Remover el rol "${roleName}" del grupo?`)) return
    setRemovingId(roleId)
    try {
      await groupsService.removeRole(group.id, roleId)
      loadData()
      onChanged()
    } catch {
      // silently fail
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <PopUp
      isOpen={isOpen}
      onClose={onClose}
      title={`Roles: ${group.name}`}
      description="Los roles asignados aquí se aplican a todos los miembros del grupo."
      size="md"
      footer={<ButtonComponent variant="outline" onClick={onClose}>Cerrar</ButtonComponent>}
    >
      <div className="mb-4 rounded-lg border border-brand/20 bg-brand/5 px-3 py-2 text-xs text-brand dark:text-blue-300">
        ℹ️ Los roles asignados aquí se heredan automáticamente a todos los miembros del grupo.
      </div>

      {/* Agregar rol */}
      <div className="mb-5 rounded-xl border border-(--color-border) bg-(--color-bg-soft) p-4 space-y-3">
        <p className="text-sm font-semibold text-(--color-text)">Asignar rol al grupo</p>
        <div className="flex gap-2">
          <div className="flex-1">
            <DataList
              id="group-role-select"
              label="Rol"
              placeholder="Busca un rol para agregar"
              options={availableRoleOptions}
              value={selectedRoleId}
              opKey="value"
              opValue="label"
              optionP="description"
              emptyText={availableRoleOptions.length === 0 ? 'Todos los roles ya están asignados.' : 'Sin resultados'}
              onSelect={(e) => setSelectedRoleId(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <ButtonComponent
              size="sm"
              disabled={!selectedRoleId}
              isLoading={isAdding}
              loadingText="..."
              onClick={handleAdd}
            >
              Agregar
            </ButtonComponent>
          </div>
        </div>
      </div>

      {/* Roles actuales */}
      {loading ? (
        <p className="text-sm text-(--color-text-muted) text-center py-4">Cargando roles...</p>
      ) : groupRoles.length === 0 ? (
        <p className="text-sm text-(--color-text-muted) text-center py-4">
          No hay roles asignados a este grupo.
        </p>
      ) : (
        <div className="space-y-1.5">
          {groupRoles.map((gr) => (
            <div
              key={gr.roleId}
              className="flex items-center justify-between gap-2 rounded-lg border border-(--color-border) px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-(--color-text) truncate">{gr.role.name}</p>
                <p className="font-mono text-xs text-(--color-text-muted)">{gr.role.code}</p>
              </div>
              <ButtonComponent
                size="icon"
                variant="ghost"
                isLoading={removingId === gr.roleId}
                onClick={() => handleRemove(gr.roleId, gr.role.name)}
                aria-label={`Remover rol ${gr.role.name}`}
                title="Remover rol"
              >
                <TrashBinIcon className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              </ButtonComponent>
            </div>
          ))}
        </div>
      )}
    </PopUp>
  )
}
