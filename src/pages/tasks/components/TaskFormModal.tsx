import { useMemo, useState } from 'react'
import PopUp from '../../../components/common/pop-up/PopUp'
import type { FormConfig, FormValues } from '../../../components/common/forms/FormRender'
import { priorityLabels, priorityOrder } from '../constants'
import type { TasksApi } from '../hooks/useTasksMock'
import type { Priority, Task } from '../types'

interface TaskFormModalProps {
    isOpen: boolean
    /** null → crear; una tarea → editar (misma dualidad que RoleFormModal con `role`). */
    task: Task | null
    /** Sección preseleccionada al crear desde una columna del tablero. */
    defaultSectionId?: string
    /** Único punto de acceso a datos del módulo (opciones + mutadores). */
    api: TasksApi
    onClose: () => void
    onSaved: () => void
}

export default function TaskFormModal({
    isOpen,
    task,
    defaultSectionId,
    api,
    onClose,
    onSaved,
}: TaskFormModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const isEdit = Boolean(task)

    // Opciones derivadas del proyecto (secciones y asignados), como parentOptions en RoleFormModal.
    const sectionOptions = useMemo(
        () => api.sortedSections.map((section) => ({ label: section.name, value: section.id })),
        [api.sortedSections],
    )
    const assigneeOptions = useMemo(
        () => api.project.assignees.map((person) => ({ label: person.name, value: person.id })),
        [api.project.assignees],
    )
    const priorityOptions = useMemo(
        () => priorityOrder.map((value) => ({ label: priorityLabels[value], value })),
        [],
    )

    const formConfig: FormConfig = useMemo(
        () => ({
            columns: 2,
            submitLabel: isEdit ? 'Guardar cambios' : 'Crear tarea',
            fields: [
                {
                    name: 'title',
                    label: 'Título',
                    required: true,
                    placeholder: '¿Qué hay que hacer?',
                    className: 'md:col-span-2',
                    validate: (value) => {
                        if (!value) return 'El título es requerido.'
                        if (String(value).length > 140) return 'Máximo 140 caracteres.'
                    },
                },
                {
                    name: 'sectionId',
                    label: 'Sección',
                    type: 'datalist',
                    required: true,
                    placeholder: 'Selecciona una sección',
                    options: sectionOptions,
                    clearable: false,
                },
                {
                    name: 'priority',
                    label: 'Prioridad',
                    type: 'select',
                    required: true,
                    options: priorityOptions,
                },
                {
                    name: 'startDate',
                    label: 'Inicio',
                    type: 'date',
                    helperText: 'Necesario para ubicarla en el Cronograma.',
                },
                {
                    name: 'dueDate',
                    label: 'Vencimiento',
                    type: 'date',
                },
                {
                    name: 'assigneeId',
                    label: 'Asignado',
                    type: 'datalist',
                    placeholder: 'Busca un responsable (opcional)',
                    options: assigneeOptions,
                    clearable: true,
                    className: 'md:col-span-2',
                },
                {
                    name: 'location',
                    label: 'Ubicación',
                    placeholder: 'Sede, aula o dirección (opcional)',
                    className: 'md:col-span-2',
                },
                {
                    name: 'description',
                    label: 'Descripción',
                    type: 'textarea',
                    rows: 3,
                    placeholder: 'Añade más detalle...',
                    className: 'md:col-span-2',
                },
            ],
        }),
        [isEdit, sectionOptions, priorityOptions, assigneeOptions],
    )

    const initialValues: FormValues = useMemo(
        () => ({
            title: task?.title ?? '',
            // Al crear no se predetermina la sección: se hereda solo si el usuario
            // abrió el formulario desde una columna concreta (defaultSectionId).
            sectionId: task?.sectionId ?? defaultSectionId ?? '',
            // Sin prioridad preseleccionada al crear; en edición se conserva la de la tarea.
            priority: task?.priority ?? '',
            startDate: task?.startDate ?? '',
            dueDate: task?.dueDate ?? '',
            assigneeId: task?.assignees[0]?.id ?? '',
            location: task?.location ?? '',
            description: task?.description ?? '',
        }),
        [task, defaultSectionId],
    )

    async function handleSubmit(values: FormValues) {
        setIsSubmitting(true)
        try {
            // Traduce valores de formulario → contrato del modelo (como RoleFormModal → service).
            const assignee = api.project.assignees.find((person) => person.id === values.assigneeId)
            const shared = {
                priority: values.priority as Priority,
                startDate: values.startDate ? String(values.startDate) : null,
                dueDate: values.dueDate ? String(values.dueDate) : null,
                description: values.description ? String(values.description) : '',
                location: values.location ? String(values.location) : null,
                assignees: assignee ? [assignee] : [],
            }

            if (isEdit && task) {
                // TODO: sync with API — PATCH /tasks/:id
                api.updateTask(task.id, {
                    title: String(values.title),
                    sectionId: String(values.sectionId),
                    ...shared,
                })
            } else {
                // TODO: sync with API — POST /tasks
                api.createTask(String(values.sectionId), String(values.title), shared)
            }
            onSaved()
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <PopUp
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? `Editar tarea: ${task?.title}` : 'Nueva tarea'}
            size="lg"
            formConfig={formConfig}
            initialValues={initialValues}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
        />
    )
}
