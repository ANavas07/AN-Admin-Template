import { useMemo, useState } from 'react'
import PopUp from '../../../../components/common/pop-up/PopUp'
import type { FormConfig, FormValues } from '../../../../components/common/forms/FormRender'
import { permissionsService } from '../../../../services/rbac/permissions.service'
import type { Permission } from '../types'

const ACTION_OPTIONS = [
  { label: 'create', value: 'create' },
  { label: 'read', value: 'read' },
  { label: 'update', value: 'update' },
  { label: 'delete', value: 'delete' },
  { label: 'export', value: 'export' },
]

interface PermissionFormModalProps {
  isOpen: boolean
  permission: Permission | null
  existingPermissions: Permission[]
  onClose: () => void
  onSaved: () => void
}

export default function PermissionFormModal({
  isOpen,
  permission,
  existingPermissions,
  onClose,
  onSaved,
}: PermissionFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [codePreview, setCodePreview] = useState(permission?.code ?? '')
  const isEdit = Boolean(permission)

  const resourceOptions = useMemo(() => {
    const unique = [...new Set(existingPermissions.map((p) => p.resource))].sort()
    return unique.map((r) => ({ label: r, value: r }))
  }, [existingPermissions])

  const formConfig: FormConfig = useMemo(
    () => ({
      columns: 2,
      submitLabel: isEdit ? 'Guardar cambios' : 'Crear permiso',
      fields: [
        {
          name: 'resource',
          label: 'Recurso',
          type: 'datalist',
          required: true,
          placeholder: 'Ej: users, reports, invoices',
          helperText: 'Nombre del recurso. El código se genera como recurso:acción.',
          options: resourceOptions,
          validate: (value) => (!value ? 'El recurso es requerido.' : undefined),
        },
        {
          name: 'action',
          label: 'Acción',
          type: 'select',
          required: true,
          options: ACTION_OPTIONS,
          validate: (value, values) => {
            if (!value) return 'La acción es requerida.'
            if (!isEdit) {
              const exists = existingPermissions.some(
                (p) => p.resource === String(values.resource) && p.action === String(value)
              )
              if (exists) return 'Ya existe un permiso con este recurso y acción.'
            }
          },
        },
        {
          name: 'description',
          label: 'Descripción',
          type: 'textarea',
          rows: 2,
          placeholder: 'Describe brevemente este permiso...',
          className: 'md:col-span-2',
        },
      ],
    }),
    [isEdit, resourceOptions, existingPermissions]
  )

  const initialValues: FormValues = useMemo(
    () => ({
      resource: permission?.resource ?? '',
      action: permission?.action ?? '',
      description: permission?.description ?? '',
    }),
    [permission]
  )

  function handleChange(values: FormValues) {
    const r = String(values.resource ?? '')
    const a = String(values.action ?? '')
    setCodePreview(r && a ? `${r}:${a}` : '')
  }

  async function handleSubmit(values: FormValues) {
    setIsSubmitting(true)
    try {
      const data = {
        resource: String(values.resource),
        action: String(values.action),
        description: values.description ? String(values.description) : undefined,
      }
      if (isEdit && permission) {
        await permissionsService.update(permission.id, data)
      } else {
        await permissionsService.create(data)
      }
      onSaved()
    } catch {
      // handled by caller
    } finally {
      setIsSubmitting(false)
    }
  }

  const description = codePreview
    ? `Código generado: ${codePreview}`
    : 'El código se genera automáticamente como recurso:acción.'

  return (
    <PopUp
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Editar: ${permission?.code}` : 'Crear nuevo permiso'}
      description={description}
      size="md"
      formConfig={formConfig}
      initialValues={initialValues}
      isSubmitting={isSubmitting}
      onChange={handleChange}
      onSubmit={handleSubmit}
    />
  )
}
