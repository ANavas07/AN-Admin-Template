import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import TableTS, { ActionCell, StatusBadge } from '../../../../components/ui/table/TableTs'
import ButtonComponent from '../../../../components/ui/buttons/ButtonComponent'
import PopUp from '../../../../components/common/pop-up/PopUp'
import ModuleHeader from '../../../../components/common/page/ModuleHeader'
import { ShieldIcon, ChartIcon } from '../../../../icons/icons'
import RoleFormModal from './RoleFormModal'
import RolePermissionsPanel from './RolePermissionsPanel'
import RoleHierarchyTree from './RoleHierarchyTree'
import { rolesService } from '../../../../services/rbac/roles.service'
import { sileo } from 'sileo'
import type { Role } from '../types'

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)

  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Role | null>(null)

  const [permPanelOpen, setPermPanelOpen] = useState(false)
  const [permTarget, setPermTarget] = useState<Role | null>(null)

  const [hierarchyOpen, setHierarchyOpen] = useState(false)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // `loading` arranca en true, por eso el fetch inicial no necesita activarlo.
  // Mantener los setState dentro de callbacks de la promesa evita el
  // setState sincrono dentro del efecto.
  const fetchRoles = useCallback((signal?: AbortSignal) => {
    rolesService.getAll({ signal })
      .then((res) => setRoles(res.data))
      .catch((err) => {
        if (err.name !== 'AbortError') sileo.error({ title: 'Error al cargar los roles.' })
      })
      .finally(() => setLoading(false))
  }, [])

  // Recarga disparada por el usuario (crear / editar / eliminar).
  const reload = useCallback(() => {
    setLoading(true)
    fetchRoles()
  }, [fetchRoles])

  useEffect(() => {
    const controller = new AbortController()
    fetchRoles(controller.signal)
    return () => controller.abort()
  }, [fetchRoles])

  function openCreate() {
    setEditTarget(null)
    setFormOpen(true)
  }

  function openEdit(role: Role) {
    setEditTarget(role)
    setFormOpen(true)
  }

  function openPermissions(role: Role) {
    setPermTarget(role)
    setPermPanelOpen(true)
  }

  function openDelete(role: Role) {
    setDeleteTarget(role)
    setDeleteOpen(true)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await rolesService.remove(deleteTarget.id)
      setDeleteOpen(false)
      setDeleteTarget(null)
      sileo.success({ title: `Rol "${deleteTarget.name}" eliminado.` })
      reload()
    } catch {
      sileo.error({ title: 'No se pudo eliminar el rol.' })
    } finally {
      setIsDeleting(false)
    }
  }

  function handleSaved() {
    setFormOpen(false)
    sileo.success({ title: editTarget ? 'Rol actualizado correctamente.' : 'Rol creado correctamente.' })
    reload()
  }

  const columns: ColumnDef<Role>[] = useMemo(() => [
    {
      accessorKey: 'code',
      header: 'Código',
      cell: (info) => (
        <span className="font-mono text-xs bg-(--color-bg-soft) px-2 py-0.5 rounded">
          {info.getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Nombre',
      cell: (info) => <span className="font-medium">{info.getValue() as string}</span>,
    },
    {
      id: 'parentRole',
      header: 'Rol padre',
      cell: ({ row }) =>
        row.original.parentRole
          ? <span className="text-sm">{row.original.parentRole.name}</span>
          : <span className="text-(--color-text-muted)">—</span>,
    },
    {
      accessorKey: 'isSystem',
      header: 'Sistema',
      cell: (info) =>
        info.getValue()
          ? <StatusBadge value="Sistema" />
          : <span className="text-(--color-text-muted) text-xs">—</span>,
    },
    {
      accessorKey: 'createdAt',
      header: 'Creado',
      cell: (info) => new Date(info.getValue() as string).toLocaleDateString('es-CO'),
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        const role = row.original
        return (
          <div className="flex items-center gap-1">
            <ActionCell
              onEdit={role.isSystem ? undefined : () => openEdit(role)}
              onDelete={role.isSystem ? undefined : () => openDelete(role)}
              onAdditional={() => openPermissions(role)}
            />
            {role.isSystem && (
              <span
                title="Rol protegido del sistema"
                className="ml-1 text-xs text-(--color-text-muted)"
              >
                🔒
              </span>
            )}
          </div>
        )
      },
    },
  ], [])

  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="RBAC"
        title="Roles"
        description="Administra los roles del sistema, su jerarquía y los permisos asociados."
        actions={
          <>
            <ButtonComponent
              variant="outline"
              leftIcon={<ChartIcon />}
              onClick={() => setHierarchyOpen(true)}
            >
              Ver jerarquía
            </ButtonComponent>
            <ButtonComponent leftIcon={<ShieldIcon />} onClick={openCreate}>
              Crear rol
            </ButtonComponent>
          </>
        }
      />

      <TableTS
        data={roles}
        columns={columns}
        loading={loading}
        enableSorting
        enableFiltering
        enablePagination
        pageSize={10}
        existBtn={false}
        emptyMessage="No hay roles registrados."
      />

      <RoleFormModal
        isOpen={formOpen}
        role={editTarget}
        allRoles={roles}
        onClose={() => setFormOpen(false)}
        onSaved={handleSaved}
      />

      {permTarget && (
        <RolePermissionsPanel
          isOpen={permPanelOpen}
          role={permTarget}
          onClose={() => setPermPanelOpen(false)}
          onSaved={() => sileo.success({ title: 'Permisos actualizados.' })}
        />
      )}

      <RoleHierarchyTree
        isOpen={hierarchyOpen}
        roles={roles}
        onClose={() => setHierarchyOpen(false)}
      />

      {/* Confirmación de eliminación */}
      <PopUp
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Eliminar rol"
        description="Esta acción no se puede deshacer."
        size="sm"
        footer={
          <>
            <ButtonComponent variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancelar
            </ButtonComponent>
            <ButtonComponent
              variant="danger"
              isLoading={isDeleting}
              loadingText="Eliminando..."
              onClick={handleDelete}
            >
              Eliminar
            </ButtonComponent>
          </>
        }
      >
        <p className="text-sm text-(--color-text-muted)">
          Se eliminará el rol{' '}
          <span className="font-semibold text-(--color-text)">{deleteTarget?.name}</span>
          {' '}(código:{' '}
          <span className="font-mono text-xs">{deleteTarget?.code}</span>
          ). Los usuarios y grupos que lo tenían asignado perderán este rol.
        </p>
      </PopUp>

    </div>
  )
}
