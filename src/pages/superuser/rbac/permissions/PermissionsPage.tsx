import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import TableTS, { ActionCell } from '../../../../components/ui/table/TableTs'
import ButtonComponent from '../../../../components/ui/buttons/ButtonComponent'
import PopUp from '../../../../components/common/pop-up/PopUp'
import ModuleHeader from '../../../../components/common/page/ModuleHeader'
import { PlusIcon } from '../../../../icons/icons'
import PermissionFormModal from './PermissionFormModal'
import { permissionsService } from '../../../../services/rbac/permissions.service'
import { sileo } from 'sileo'
import type { Permission } from '../types'

const ACTIONS = ['create', 'read', 'update', 'delete', 'export'] as const

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)

  const [resourceFilter, setResourceFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Permission | null>(null)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Permission | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const load = useCallback((signal?: AbortSignal) => {
    setLoading(true)
    permissionsService.getAll({ signal })
      .then((res) => setPermissions(res.data))
      .catch((err) => {
        if (err.name !== 'AbortError') sileo.error({ title: 'Error al cargar los permisos.' })
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
    return () => controller.abort()
  }, [load])

  const uniqueResources = useMemo(
    () => [...new Set(permissions.map((p) => p.resource))].sort(),
    [permissions]
  )

  const filtered = useMemo(
    () =>
      permissions.filter(
        (p) =>
          (resourceFilter ? p.resource === resourceFilter : true) &&
          (actionFilter ? p.action === actionFilter : true)
      ),
    [permissions, resourceFilter, actionFilter]
  )

  function openCreate() {
    setEditTarget(null)
    setFormOpen(true)
  }

  function openEdit(p: Permission) {
    setEditTarget(p)
    setFormOpen(true)
  }

  function openDelete(p: Permission) {
    setDeleteTarget(p)
    setDeleteOpen(true)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await permissionsService.remove(deleteTarget.id)
      setDeleteOpen(false)
      setDeleteTarget(null)
      sileo.success({ title: `Permiso "${deleteTarget.code}" eliminado.` })
      load()
    } catch {
      sileo.error({ title: 'No se pudo eliminar el permiso.' })
    } finally {
      setIsDeleting(false)
    }
  }

  function handleSaved() {
    setFormOpen(false)
    sileo.success({ title: editTarget ? 'Permiso actualizado.' : 'Permiso creado correctamente.' })
    load()
  }

  const columns: ColumnDef<Permission>[] = useMemo(() => [
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
      accessorKey: 'resource',
      header: 'Recurso',
      cell: (info) => <span className="text-sm">{info.getValue() as string}</span>,
    },
    {
      accessorKey: 'action',
      header: 'Acción',
      cell: (info) => (
        <span className="inline-flex items-center rounded-full bg-(--color-bg-soft) px-2 py-0.5 text-xs font-medium text-(--color-text-muted) ring-1 ring-(--color-border)">
          {info.getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Descripción',
      cell: (info) => {
        const val = info.getValue() as string | null
        return val
          ? <span className="text-sm text-(--color-text-muted)">{val}</span>
          : <span className="text-(--color-text-muted)">—</span>
      },
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => (
        <ActionCell
          onEdit={() => openEdit(row.original)}
          onDelete={() => openDelete(row.original)}
        />
      ),
    },
  ], [])

  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="RBAC"
        title="Permisos"
        description="Define los permisos del sistema por recurso y acción."
        actions={
          <ButtonComponent leftIcon={<PlusIcon />} onClick={openCreate}>
            Crear permiso
          </ButtonComponent>
        }
      />

      {/* Filtros externos */}
      <div className="flex flex-wrap gap-3">
        <select
          value={resourceFilter}
          onChange={(e) => setResourceFilter(e.target.value)}
          className="min-h-9 rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-1.5 text-sm text-(--color-text) focus:border-brand focus:outline-none"
          aria-label="Filtrar por recurso"
        >
          <option value="">Todos los recursos</option>
          {uniqueResources.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="min-h-9 rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-1.5 text-sm text-(--color-text) focus:border-brand focus:outline-none"
          aria-label="Filtrar por acción"
        >
          <option value="">Todas las acciones</option>
          {ACTIONS.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        {(resourceFilter || actionFilter) && (
          <ButtonComponent
            variant="ghost"
            size="sm"
            onClick={() => { setResourceFilter(''); setActionFilter('') }}
          >
            Limpiar filtros
          </ButtonComponent>
        )}
      </div>

      <TableTS
        data={filtered}
        columns={columns}
        loading={loading}
        enableSorting
        enableFiltering
        enablePagination
        pageSize={15}
        existBtn={false}
        emptyMessage="No hay permisos con los filtros aplicados."
      />

      <PermissionFormModal
        isOpen={formOpen}
        permission={editTarget}
        existingPermissions={permissions}
        onClose={() => setFormOpen(false)}
        onSaved={handleSaved}
      />

      {/* Confirmación de eliminación */}
      <PopUp
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Eliminar permiso"
        description="Esta acción puede afectar a los roles que lo tenían asignado."
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
          Se eliminará el permiso{' '}
          <span className="font-mono text-xs font-semibold text-(--color-text)">
            {deleteTarget?.code}
          </span>
          . Los roles que lo tenían asignado perderán este permiso.
        </p>
      </PopUp>

    </div>
  )
}
