import type { FormConfig, FormValues } from '../../components/common/forms/FormRender'
import FormRender from '../../components/common/forms/FormRender'

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
                placeholder: 'Ej: Ariel Navas',
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
            <section className="relative overflow-hidden rounded-3xl border border-(--color-border) bg-(--color-surface) p-6 shadow-sm sm:p-10">
                <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-soft blur-3xl" />
                <div className="pointer-events-none absolute -bottom-20 left-10 h-56 w-56 rounded-full bg-highlight-soft blur-3xl" />

                <div className="relative max-w-3xl">
                    <p className="inline-flex rounded-full border border-(--color-border) bg-(--color-bg-soft) px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-(--color-text-muted)">
                        UI Catalog
                    </p>
                    <h1 className="mt-4 text-3xl font-bold tracking-tight text-(--color-text) sm:text-4xl">
                        Catalogo de formulario reutilizables
                    </h1>
                    <p className="mt-3 text-sm text-(--color-text-muted) sm:text-base">
                        Guia visual para usar formulario reutilizables del panel
                    </p>
                </div>
            </section>

            <section className="mt-8">
                <FormRender config={config} onSubmit={handleSubmit} />
            </section>
        </main>
    )
}
