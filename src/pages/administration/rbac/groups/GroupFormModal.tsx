import { useMemo, useState } from 'react'
import PopUp from '../../../../components/common/pop-up/PopUp'
import type { FormConfig, FormValues } from '../../../../components/common/forms/FormRender'
import { groupsService } from '../../../../services/rbac/groups.service'
import type { Group } from '../types'

interface GroupFormModalProps {
  isOpen: boolean
  group: Group | null
  allGroups: Group[]
  onClose: () => void
  onSaved: () => void
}

function getDescendantIds(groupId: string, groups: Group[]): Set<string> {
  const ids = new Set<string>()
  const queue = [groupId]
  while (queue.length) {
    const current = queue.shift()!
    groups.forEach((g) => {
      if (g.parentGroupId === current && !ids.has(g.id)) {
        ids.add(g.id)
        queue.push(g.id)
      }
    })
  }
  return ids
}

export default function GroupFormModal({
  isOpen,
  group,
  allGroups,
  onClose,
  onSaved,
}: GroupFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEdit = Boolean(group)

  const parentOptions = useMemo(() => {
    if (!group) return allGroups.map((g) => ({ label: g.name, value: g.id, description: g.description ?? '' }))
    const excluded = new Set([group.id, ...getDescendantIds(group.id, allGroups)])
    return allGroups
      .filter((g) => !excluded.has(g.id))
      .map((g) => ({ label: g.name, value: g.id, description: g.description ?? '' }))
  }, [allGroups, group])

  const formConfig: FormConfig = useMemo(
    () => ({
      columns: 1,
      submitLabel: isEdit ? 'Guardar cambios' : 'Crear grupo',
      fields: [
        {
          name: 'name',
          label: 'Nombre',
          required: true,
          placeholder: 'Ej: Docentes de Matemáticas',
          validate: (value) => (!value ? 'El nombre es requerido.' : undefined),
        },
        {
          name: 'description',
          label: 'Descripción',
          type: 'textarea',
          rows: 3,
          placeholder: 'Describe el propósito del grupo...',
        },
        {
          name: 'parentGroupId',
          label: 'Grupo padre',
          type: 'datalist',
          placeholder: 'Busca un grupo padre (opcional)',
          helperText: 'Opcional. No puede ser el mismo grupo ni un descendiente.',
          options: parentOptions,
          clearable: true,
        },
      ],
    }),
    [isEdit, parentOptions]
  )

  const initialValues: FormValues = useMemo(
    () => ({
      name: group?.name ?? '',
      description: group?.description ?? '',
      parentGroupId: group?.parentGroupId ?? '',
    }),
    [group]
  )

  async function handleSubmit(values: FormValues) {
    setIsSubmitting(true)
    try {
      const data = {
        name: String(values.name),
        description: values.description ? String(values.description) : undefined,
        parentGroupId: values.parentGroupId ? String(values.parentGroupId) : undefined,
      }
      if (isEdit && group) {
        await groupsService.update(group.id, data)
      } else {
        await groupsService.create(data)
      }
      onSaved()
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
      title={isEdit ? `Editar grupo: ${group?.name}` : 'Crear nuevo grupo'}
      size="md"
      formConfig={formConfig}
      initialValues={initialValues}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
    />
  )
}
