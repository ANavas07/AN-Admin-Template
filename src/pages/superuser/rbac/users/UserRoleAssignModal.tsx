import { useEffect, useMemo, useState } from 'react'
import PopUp from '../../../../components/common/pop-up/PopUp'
import type { FormConfig, FormValues } from '../../../../components/common/forms/FormRender'
import { usersRolesService } from '../../../../services/rbac/users-roles.service'
import { rolesService } from '../../../../services/rbac/roles.service'
import type { RbacUser, Role } from '../types'

interface UserRoleAssignModalProps {
  isOpen: boolean
  user: RbacUser
  existingRoleIds: string[]
  onClose: () => void
  onAssigned: () => void
}

export default function UserRoleAssignModal({
  isOpen,
  user,
  existingRoleIds,
  onClose,
  onAssigned,
}: UserRoleAssignModalProps) {
  const [allRoles, setAllRoles] = useState<Role[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const controller = new AbortController()
    rolesService.getAll({ signal: controller.signal })
      .then((res) => setAllRoles(res.data))
      .catch(() => {})
    return () => controller.abort()
  }, [isOpen])

  const existingSet = useMemo(() => new Set(existingRoleIds), [existingRoleIds])

  const roleOptions = useMemo(
    () =>
      allRoles
        .filter((r) => !existingSet.has(r.id))
        .map((r) => ({ label: r.name, value: r.id, description: r.code })),
    [allRoles, existingSet]
  )

  const formConfig: FormConfig = useMemo(
    () => ({
      columns: 1,
      submitLabel: 'Asignar rol',
      fields: [
        {
          name: 'username',
          label: 'Usuario',
          readOnly: true,
          defaultValue: user.username,
          helperText: 'El rol se asignará a este usuario.',
        },
        {
          name: 'roleId',
          label: 'Rol',
          type: 'datalist',
          required: true,
          placeholder: 'Busca y selecciona un rol',
          options: roleOptions,
          emptyText: roleOptions.length === 0 ? 'Todos los roles ya están asignados.' : 'Sin resultados',
          validate: (value) => (!value ? 'Selecciona un rol.' : undefined),
        },
        {
          name: 'validUntil',
          label: 'Vigencia',
          type: 'date',
          helperText: 'Opcional. Dejar vacío para asignación indefinida.',
        },
      ],
    }),
    [user.username, roleOptions]
  )

  const initialValues: FormValues = useMemo(
    () => ({ username: user.username, roleId: '', validUntil: '' }),
    [user.username]
  )

  async function handleSubmit(values: FormValues) {
    setIsSubmitting(true)
    try {
      await usersRolesService.assignRole(user.id, {
        roleId: String(values.roleId),
        validUntil: values.validUntil ? String(values.validUntil) : undefined,
      })
      onAssigned()
    } catch {
      // handled by caller
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PopUp
      isOpen={isOpen}
      onClose={onClose}
      title={`Asignar rol a ${user.username}`}
      size="md"
      formConfig={formConfig}
      initialValues={initialValues}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
    />
  )
}
