import { useEffect, useMemo, useState } from 'react'
import PopUp from '../../../../components/common/pop-up/PopUp'
import ButtonComponent from '../../../../components/ui/buttons/ButtonComponent'
import { usersRolesService } from '../../../../services/rbac/users-roles.service'
import type { EffectivePermission, RbacUser } from '../types'

interface UserEffectivePermissionsPanelProps {
  isOpen: boolean
  user: RbacUser
  onClose: () => void
}

const SOURCE_BADGE: Record<
  EffectivePermission['source'],
  { label: string; className: string }
> = {
  direct: {
    label: 'Directo',
    className:
      'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-950 dark:text-sky-300 dark:ring-sky-800/50',
  },
  group: {
    label: 'Grupo',
    className:
      'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-800/50',
  },
  inherited: {
    label: 'Heredado',
    className:
      'bg-slate-100 text-slate-700 ring-slate-500/20 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700/50',
  },
}

function groupByResource(
  perms: EffectivePermission[]
): Record<string, EffectivePermission[]> {
  return perms.reduce<Record<string, EffectivePermission[]>>((acc, p) => {
    ;(acc[p.resource] ??= []).push(p)
    return acc
  }, {})
}

export default function UserEffectivePermissionsPanel({
  isOpen,
  user,
  onClose,
}: UserEffectivePermissionsPanelProps) {
  const [permissions, setPermissions] = useState<EffectivePermission[]>([])
  // `loading` se deriva del usuario cargado en vez de activarse dentro del
  // efecto: evita el setState sincrono y descarta los permisos del usuario
  // anterior al cambiar de usuario.
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null)
  const loading = loadedUserId !== user.id

  useEffect(() => {
    if (!isOpen) return
    const controller = new AbortController()
    usersRolesService
      .getEffectivePermissions(user.id, controller.signal)
      .then(setPermissions)
      .catch(() => {})
      .finally(() => {
        if (!controller.signal.aborted) setLoadedUserId(user.id)
      })
    return () => controller.abort()
  }, [isOpen, user.id])

  const grouped = useMemo(() => groupByResource(permissions), [permissions])

  return (
    <PopUp
      isOpen={isOpen}
      onClose={onClose}
      title={`Permisos efectivos de ${user.username}`}
      description={`${permissions.length} permiso${permissions.length !== 1 ? 's' : ''} en total (combinando todas las fuentes).`}
      size="xl"
      footer={<ButtonComponent onClick={onClose}>Cerrar</ButtonComponent>}
    >
      {/* Leyenda */}
      <div className="mb-4 flex flex-wrap gap-2">
        {Object.entries(SOURCE_BADGE).map(([source, { label, className }]) => (
          <span
            key={source}
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${className}`}
          >
            {label}
          </span>
        ))}
        <span className="text-xs text-(--color-text-muted) self-center">
          Origen del permiso
        </span>
      </div>

      {loading ? (
        <p className="text-sm text-(--color-text-muted) text-center py-6">
          Resolviendo permisos...
        </p>
      ) : permissions.length === 0 ? (
        <p className="text-sm text-(--color-text-muted) text-center py-6">
          Este usuario no tiene permisos efectivos.
        </p>
      ) : (
        <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
          {Object.entries(grouped).map(([resource, perms]) => (
            <div key={resource}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-(--color-text-muted)">
                {resource}
              </p>
              <div className="grid gap-1.5 sm:grid-cols-2">
                {perms.map((perm) => {
                  const badge = SOURCE_BADGE[perm.source]
                  const sourceText =
                    perm.source === 'group' && perm.sourceLabel
                      ? `Grupo: ${perm.sourceLabel}`
                      : perm.source === 'inherited' && perm.sourceLabel
                      ? `Heredado: ${perm.sourceLabel}`
                      : badge.label

                  return (
                    <div
                      key={`${perm.id}-${perm.source}`}
                      className="flex items-start justify-between gap-2 rounded-lg border border-(--color-border) px-3 py-2"
                    >
                      <div className="min-w-0">
                        <span className="font-mono text-xs text-(--color-text)">{perm.code}</span>
                        {perm.description && (
                          <p className="text-xs text-(--color-text-muted) truncate">{perm.description}</p>
                        )}
                      </div>
                      <span
                        className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${badge.className}`}
                        title={sourceText}
                      >
                        {sourceText}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </PopUp>
  )
}
