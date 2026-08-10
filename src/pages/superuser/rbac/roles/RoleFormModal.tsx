import { useMemo, useState } from 'react'
import PopUp from '../../../../components/common/pop-up/PopUp'
import type { FormConfig, FormValues } from '../../../../components/common/forms/FormRender'
import { rolesService } from '../../../../services/rbac/roles.service'
import type { Role } from '../types'

interface RoleFormModalProps {
  isOpen: boolean
  role: Role | null
  allRoles: Role[]
  onClose: () => void
  onSaved: () => void
}

export default function RoleFormModal({
  isOpen,
  role,
  allRoles,
  onClose,
  onSaved,
}: RoleFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEdit = Boolean(role)

  const parentOptions = useMemo(
    () =>
      allRoles
        .filter((r) => r.id !== role?.id)
        .map((r) => ({ label: r.name, value: r.id, description: r.code })),
    [allRoles, role]
  )

  const formConfig: FormConfig = useMemo(
    () => ({
      columns: 2,
      submitLabel: isEdit ? 'Guardar cambios' : 'Crear rol',
      fields: [
        {
          name: 'code',
          label: 'Código',
          required: true,
          readOnly: isEdit,
          placeholder: 'ADMIN_USERS',
          helperText: 'Solo mayúsculas, números y guion bajo. Ej: ADMIN_USERS',
          validate: (value) => {
            if (!value) return 'El código es requerido.'
            if (String(value).length > 60) return 'Máximo 60 caracteres.'
            if (!/^[A-Z][A-Z0-9_]*$/.test(String(value)))
              return 'Formato inválido. Usa mayúsculas, números y guion bajo.'
          },
        },
        {
          name: 'name',
          label: 'Nombre',
          required: true,
          placeholder: 'Administrador de usuarios',
          validate: (value) => {
            if (!value) return 'El nombre es requerido.'
            if (String(value).length > 100) return 'Máximo 100 caracteres.'
          },
        },
        {
          name: 'description',
          label: 'Descripción',
          type: 'textarea',
          rows: 3,
          placeholder: 'Describe el propósito de este rol...',
          className: 'md:col-span-2',
        },
        {
          name: 'parentRoleId',
          label: 'Rol padre',
          type: 'datalist',
          placeholder: 'Busca un rol padre (opcional)',
          helperText: 'Dejarlo vacío crea un rol raíz.',
          options: parentOptions,
          clearable: true,
          className: 'md:col-span-2',
        },
      ],
    }),
    [isEdit, parentOptions]
  )

  const initialValues: FormValues = useMemo(
    () => ({
      code: role?.code ?? '',
      name: role?.name ?? '',
      description: role?.description ?? '',
      parentRoleId: role?.parentRoleId ?? '',
    }),
    [role]
  )

  async function handleSubmit(values: FormValues) {
    setIsSubmitting(true)
    try {
      if (isEdit && role) {
        await rolesService.update(role.id, {
          name: String(values.name),
          description: values.description ? String(values.description) : undefined,
          parentRoleId: values.parentRoleId ? String(values.parentRoleId) : undefined,
        })
      } else {
        await rolesService.create({
          code: String(values.code),
          name: String(values.name),
          description: values.description ? String(values.description) : undefined,
          parentRoleId: values.parentRoleId ? String(values.parentRoleId) : undefined,
        })
      }
      onSaved()
    } catch {
      // error handled by caller via toast
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PopUp
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Editar rol: ${role?.name}` : 'Crear nuevo rol'}
      size="lg"
      formConfig={formConfig}
      initialValues={initialValues}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
    />
  )
}
