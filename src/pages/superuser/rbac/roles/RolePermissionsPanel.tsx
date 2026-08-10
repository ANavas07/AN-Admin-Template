import { useEffect, useMemo, useState } from 'react'
import PopUp from '../../../../components/common/pop-up/PopUp'
import ButtonComponent from '../../../../components/ui/buttons/ButtonComponent'
import { rolesService } from '../../../../services/rbac/roles.service'
import { permissionsService } from '../../../../services/rbac/permissions.service'
import type { Permission, Role } from '../types'

interface RolePermissionsPanelProps {
  isOpen: boolean
  role: Role
  onClose: () => void
  onSaved: () => void
}

function groupByResource(permissions: Permission[]): Record<string, Permission[]> {
  return permissions.reduce<Record<string, Permission[]>>((acc, p) => {
    ;(acc[p.resource] ??= []).push(p)
    return acc
  }, {})
}

export default function RolePermissionsPanel({
  isOpen,
  role,
  onClose,
  onSaved,
}: RolePermissionsPanelProps) {
  const [allPerms, setAllPerms] = useState<Permission[]>([])
  const [assignedIds, setAssignedIds] = useState<Set<string>>(new Set())
  const [inheritedIds, setInheritedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const controller = new AbortController()
    setLoading(true)

    Promise.all([
      permissionsService.getAll({ signal: controller.signal }),
      rolesService.getPermissions(role.id, controller.signal),
      role.parentRoleId
        ? rolesService.getPermissions(role.parentRoleId, controller.signal)
        : Promise.resolve([]),
    ])
      .then(([allRes, rolePerms, parentPerms]) => {
        setAllPerms(allRes.data)
        setAssignedIds(new Set(rolePerms.map((p) => p.id)))
        setInheritedIds(new Set(parentPerms.map((p) => p.id)))
      })
      .catch(() => {})
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [isOpen, role.id, role.parentRoleId])

  function toggle(permId: string) {
    if (inheritedIds.has(permId)) return
    setAssignedIds((prev) => {
      const next = new Set(prev)
      next.has(permId) ? next.delete(permId) : next.add(permId)
      return next
    })
  }

  async function handleSave() {
    setIsSaving(true)
    try {
      const directIds = [...assignedIds].filter((id) => !inheritedIds.has(id))
      await rolesService.updatePermissions(role.id, directIds)
      onSaved()
      onClose()
    } catch {
      // propagate via parent toast
    } finally {
      setIsSaving(false)
    }
  }

  const grouped = useMemo(() => groupByResource(allPerms), [allPerms])

  return (
    <PopUp
      isOpen={isOpen}
      onClose={onClose}
      title={`Permisos: ${role.name}`}
      description="Marca los permisos directos del rol. Los heredados del rol padre no se pueden desmarcar."
      size="xl"
      footer={
        <>
          <ButtonComponent variant="outline" onClick={onClose}>
            Cancelar
          </ButtonComponent>
          <ButtonComponent
            isLoading={isSaving}
            loadingText="Guardando..."
            disabled={role.isSystem}
            onClick={handleSave}
          >
            Guardar cambios
          </ButtonComponent>
        </>
      }
    >
      {role.isSystem && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800/50 dark:bg-amber-950/50 dark:text-amber-300">
          🔒 Este es un rol de sistema. Sus permisos no se pueden modificar.
        </div>
      )}

      {loading ? (
        <p className="text-sm text-(--color-text-muted) py-4 text-center">Cargando permisos...</p>
      ) : (
        <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
          {Object.entries(grouped).map(([resource, perms]) => (
            <div key={resource}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-(--color-text-muted)">
                {resource}
              </p>
              <div className="grid gap-1.5 sm:grid-cols-2">
                {perms.map((perm) => {
                  const isInherited = inheritedIds.has(perm.id)
                  const isChecked = assignedIds.has(perm.id) || isInherited

                  return (
                    <label
                      key={perm.id}
                      className={`flex items-start gap-2.5 rounded-lg border px-3 py-2 text-sm cursor-pointer transition-colors ${
                        isChecked
                          ? 'border-brand/40 bg-brand/5'
                          : 'border-(--color-border) hover:bg-(--color-bg-soft)'
                      } ${isInherited || role.isSystem ? 'opacity-70 cursor-default' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={isInherited || role.isSystem}
                        onChange={() => toggle(perm.id)}
                        className="mt-0.5 size-4 accent-brand shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="font-mono text-xs text-(--color-text)">{perm.code}</span>
                        {perm.description && (
                          <p className="text-xs text-(--color-text-muted) truncate">{perm.description}</p>
                        )}
                        {isInherited && (
                          <p className="text-xs text-brand/70 font-medium">
                            Heredado de {role.parentRole?.name ?? 'rol padre'}
                          </p>
                        )}
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>
          ))}

          {Object.keys(grouped).length === 0 && (
            <p className="text-sm text-(--color-text-muted) text-center py-4">
              No hay permisos disponibles.
            </p>
          )}
        </div>
      )}
    </PopUp>
  )
}
