import type { FormConfig, FormValues } from '../../../components/common/forms/FormRender'
import FormRender from '../../../components/common/forms/FormRender'
import { CatalogHeader } from './components/CatalogLayout'

export default function FormsCatalog() {

    const config: FormConfig = {
        title: 'Crear usuario',
        description: 'Completa la informacion principal del usuario.',
        columns: 2,
        submitLabel: 'Guardar usuario',
        showReset: true,
        fields: [
            {
                name: 'name',
                label: 'Nombre',
                type: 'text',
                required: true,
                placeholder: 'Ej: John Doe',
            },
            {
                name: 'email',
                label: 'Correo',
                type: 'email',
                required: true,
                placeholder: 'correo@dominio.com',
            },
            {
                name: 'role',
                label: 'Rol',
                type: 'select',
                required: true,
                options: [
                    { label: 'Administrador', value: 'admin' },
                    { label: 'Usuario', value: 'user' },
                ],
            },
            {
                name: 'department',
                label: 'Departamento',
                type: 'datalist',
                required: true,
                placeholder: 'Busca un departamento',
                helperText: 'El formulario guarda el codigo del departamento seleccionado.',
                options: [
                    {
                        label: 'Tecnologia',
                        value: 'tech',
                        description: 'Soporte, infraestructura y desarrollo',
                    },
                    {
                        label: 'Talento Humano',
                        value: 'hr',
                        description: 'Contratacion y bienestar',
                    },
                    {
                        label: 'Finanzas',
                        value: 'finance',
                        description: 'Presupuesto, pagos y control',
                    },
                    {
                        label: 'Operaciones',
                        value: 'ops',
                        description: 'Gestion diaria y coordinacion',
                    },
                ],
            },
            {
                name: 'reason',
                label: 'Motivo de administrador',
                type: 'textarea',
                visibleWhen: (values) => values.role === 'admin',
                validate: (value) =>
                    !value ? 'Explica por que este usuario sera administrador.' : undefined,
            },
        ],
    }

    function handleSubmit(values: FormValues) {
        console.log(values)
    }

    return (
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <CatalogHeader
                title="Catalogo de formulario reutilizables"
                description="Guia visual para usar formulario reutilizables del panel"
            />

            <section className="mt-8">
                <FormRender config={config} onSubmit={handleSubmit} />
            </section>
        </main>
    )
}
