import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import TableTS, { ActionCell } from '../../../../components/ui/table/TableTs'
import ButtonComponent from '../../../../components/ui/buttons/ButtonComponent'
import PopUp from '../../../../components/common/pop-up/PopUp'
import ModuleHeader from '../../../../components/common/page/ModuleHeader'
import { PlusIcon, UsersIcon } from '../../../../icons/icons'
import GroupFormModal from './GroupFormModal'
import GroupMembersPanel from './GroupMembersPanel'
import GroupRolesPanel from './GroupRolesPanel'
import { groupsService } from '../../../../services/rbac/groups.service'
import { sileo } from 'sileo'
import type { Group } from '../types'

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)

  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Group | null>(null)

  const [membersOpen, setMembersOpen] = useState(false)
  const [membersTarget, setMembersTarget] = useState<Group | null>(null)

  const [rolesOpen, setRolesOpen] = useState(false)
  const [rolesTarget, setRolesTarget] = useState<Group | null>(null)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Group | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const load = useCallback((signal?: AbortSignal) => {
    setLoading(true)
    groupsService.getAll({ signal })
      .then((res) => setGroups(res.data))
      .catch((err) => {
        if (err.name !== 'AbortError') sileo.error({ title: 'Error al cargar los grupos.' })
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
    return () => controller.abort()
  }, [load])

  function openCreate() {
    setEditTarget(null)
    setFormOpen(true)
  }

  function openEdit(g: Group) {
    setEditTarget(g)
    setFormOpen(true)
  }

  function openMembers(g: Group) {
    setMembersTarget(g)
    setMembersOpen(true)
  }

  function openRoles(g: Group) {
    setRolesTarget(g)
    setRolesOpen(true)
  }

  function openDelete(g: Group) {
    setDeleteTarget(g)
    setDeleteOpen(true)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await groupsService.remove(deleteTarget.id)
      setDeleteOpen(false)
      setDeleteTarget(null)
      sileo.success({ title: `Grupo "${deleteTarget.name}" eliminado.` })
      load()
    } catch {
      sileo.error({ title: 'No se pudo eliminar el grupo.' })
    } finally {
      setIsDeleting(false)
    }
  }

  function handleSaved() {
    setFormOpen(false)
    sileo.success({ title: editTarget ? 'Grupo actualizado.' : 'Grupo creado correctamente.' })
    load()
  }

  const columns: ColumnDef<Group>[] = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Nombre',
      cell: (info) => <span className="font-medium">{info.getValue() as string}</span>,
    },
    {
      accessorKey: 'description',
      header: 'Descripción',
      cell: (info) => {
        const val = info.getValue() as string | null
        if (!val) return <span className="text-(--color-text-muted)">—</span>
        return (
          <span className="text-sm text-(--color-text-muted)">
            {val.length > 80 ? `${val.slice(0, 80)}…` : val}
          </span>
        )
      },
    },
    {
      id: 'parentGroup',
      header: 'Grupo padre',
      cell: ({ row }) =>
        row.original.parentGroup
          ? <span className="text-sm">{row.original.parentGroup.name}</span>
          : <span className="text-(--color-text-muted)">—</span>,
    },
    {
      accessorKey: 'memberCount',
      header: 'Miembros',
      cell: (info) => (
        <span className="inline-flex items-center gap-1 text-sm">
          <UsersIcon className="size-3.5 opacity-60" aria-hidden="true" />
          {(info.getValue() as number | undefined) ?? 0}
        </span>
      ),
    },
    {
      accessorKey: 'roleCount',
      header: 'Roles',
      cell: (info) => (
        <span className="text-sm">{(info.getValue() as number | undefined) ?? 0}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        const group = row.original
        return (
          <div className="flex items-center gap-1">
            <ActionCell
              onEdit={() => openEdit(group)}
              onDelete={() => openDelete(group)}
              onAdditional={() => openMembers(group)}
            />
            <ButtonComponent
              size="icon"
              variant="ghost"
              onClick={() => openRoles(group)}
              aria-label="Gestionar roles"
              title="Gestionar roles"
            >
              🔐
            </ButtonComponent>
          </div>
        )
      },
    },
  ], [])

  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="RBAC"
        title="Grupos"
        description="Organiza usuarios en grupos y asigna roles colectivos."
        actions={
          <ButtonComponent leftIcon={<PlusIcon />} onClick={openCreate}>
            Crear grupo
          </ButtonComponent>
        }
      />

      <TableTS
        data={groups}
        columns={columns}
        loading={loading}
        enableSorting
        enableFiltering
        enablePagination
        pageSize={10}
        existBtn={false}
        emptyMessage="No hay grupos registrados."
      />

      <GroupFormModal
        isOpen={formOpen}
        group={editTarget}
        allGroups={groups}
        onClose={() => setFormOpen(false)}
        onSaved={handleSaved}
      />

      {membersTarget && (
        <GroupMembersPanel
          isOpen={membersOpen}
          group={membersTarget}
          onClose={() => setMembersOpen(false)}
          onChanged={() => {
            sileo.success({ title: 'Miembros del grupo actualizados.' })
            load()
          }}
        />
      )}

      {rolesTarget && (
        <GroupRolesPanel
          isOpen={rolesOpen}
          group={rolesTarget}
          onClose={() => setRolesOpen(false)}
          onChanged={() => {
            sileo.success({ title: 'Roles del grupo actualizados.' })
            load()
          }}
        />
      )}

      <PopUp
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Eliminar grupo"
        description="Los miembros del grupo perderán los roles asignados a través de él."
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
          Se eliminará el grupo{' '}
          <span className="font-semibold text-(--color-text)">{deleteTarget?.name}</span>
          . Esta acción no se puede deshacer.
        </p>
      </PopUp>

    </div>
  )
}
