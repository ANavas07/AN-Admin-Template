import { useState } from 'react'
import type { ReactNode } from 'react'
import PopUp from '../../components/common/pop-up/PopUp'
import type { FormConfig, FormValues } from '../../components/common/forms/FormRender'
import ButtonComponent from '../../components/ui/buttons/ButtonComponent'
import {
    PlusIcon,
    EditIcon,
    TrashBinIcon,
    ShieldIcon,
    CheckIcon,
    SparkIcon,
} from '../../icons/icons'

// ─── Catalog helpers ──────────────────────────────────────────────────────────

type CatalogSectionProps = {
    title: string
    description: string
    children: ReactNode
}

function CatalogSection({ title, description, children }: CatalogSectionProps) {
    return (
        <article className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-sm">
            <div className="mb-4">
                <h2 className="text-base font-semibold text-(--color-text)">{title}</h2>
                <p className="mt-1 text-sm text-(--color-text-muted)">{description}</p>
            </div>
            {children}
        </article>
    )
}

// ─── Form configs ─────────────────────────────────────────────────────────────

const createTournamentConfig: FormConfig = {
    title: 'Nuevo Torneo',
    description: 'Completa la informacion basica para crear el torneo.',
    columns: 2,
    submitLabel: 'Crear Torneo',
    showReset: true,
    fields: [
        {
            name: 'name',
            label: 'Nombre del torneo',
            required: true,
            placeholder: 'Ej: Copa Ciudad 2026',
        },
        {
            name: 'sport',
            label: 'Deporte',
            type: 'select',
            required: true,
            options: [
                { label: 'Futbol', value: 'football' },
                { label: 'Baloncesto', value: 'basketball' },
                { label: 'Voleibol', value: 'volleyball' },
                { label: 'Tenis', value: 'tennis' },
            ],
        },
        {
            name: 'startDate',
            label: 'Fecha de inicio',
            type: 'date',
            required: true,
        },
        {
            name: 'endDate',
            label: 'Fecha de cierre',
            type: 'date',
            required: true,
        },
        {
            name: 'maxTeams',
            label: 'Equipos maximos',
            type: 'number',
            min: 2,
            max: 64,
            placeholder: '8',
        },
        {
            name: 'format',
            label: 'Formato',
            type: 'select',
            options: [
                { label: 'Liga (todos vs todos)', value: 'league' },
                { label: 'Eliminacion directa', value: 'knockout' },
                { label: 'Grupos + Eliminacion', value: 'mixed' },
            ],
        },
        {
            name: 'description',
            label: 'Descripcion',
            type: 'textarea',
            placeholder: 'Agrega detalles del torneo...',
            rows: 3,
            className: 'md:col-span-2',
        },
    ],
}

const editUserConfig: FormConfig = {
    title: 'Editar usuario',
    description: 'Actualiza los datos del usuario seleccionado.',
    columns: 2,
    submitLabel: 'Guardar cambios',
    fields: [
        {
            name: 'firstName',
            label: 'Nombre',
            required: true,
            placeholder: 'Ariel',
        },
        {
            name: 'lastName',
            label: 'Apellido',
            required: true,
            placeholder: 'Navas',
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
                { label: 'Organizador', value: 'organizer' },
                { label: 'Analista', value: 'analyst' },
                { label: 'Visualizador', value: 'viewer' },
            ],
        },
        {
            name: 'reason',
            label: 'Razon del cambio de rol',
            type: 'textarea',
            placeholder: 'Indica el motivo...',
            visibleWhen: (values) => values.role === 'admin',
            validate: (value) =>
                !value ? 'Explica por que se otorga rol de administrador.' : undefined,
            className: 'md:col-span-2',
        },
    ],
}

const quickNoteConfig: FormConfig = {
    submitLabel: 'Agregar nota',
    fields: [
        {
            name: 'note',
            label: 'Nota',
            type: 'textarea',
            required: true,
            placeholder: 'Escribe tu nota aqui...',
            rows: 4,
        },
        {
            name: 'pinned',
            label: 'Fijar nota',
            type: 'checkbox',
            placeholder: 'Marcar como fijada',
        },
    ],
}

// ─── Catalog ──────────────────────────────────────────────────────────────────

export default function PopUpCatalog() {
    const [openPopUp, setOpenPopUp] = useState<string | null>(null)
    const [submittedValues, setSubmittedValues] = useState<FormValues | null>(null)

    const open = (id: string) => setOpenPopUp(id)
    const close = () => setOpenPopUp(null)

    function handleSubmit(values: FormValues) {
        setSubmittedValues(values)
        close()
    }

    return (
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Hero */}
            <section className="relative overflow-hidden rounded-3xl border border-(--color-border) bg-(--color-surface) p-6 shadow-sm sm:p-10">
                <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-soft blur-3xl" />
                <div className="pointer-events-none absolute -bottom-20 left-10 h-56 w-56 rounded-full bg-highlight-soft blur-3xl" />

                <div className="relative max-w-3xl">
                    <p className="inline-flex rounded-full border border-(--color-border) bg-(--color-bg-soft) px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-(--color-text-muted)">
                        UI Catalog
                    </p>
                    <h1 className="mt-4 text-3xl font-bold tracking-tight text-(--color-text) sm:text-4xl">
                        Catalogo de Pop-Ups
                    </h1>
                    <p className="mt-3 text-sm text-(--color-text-muted) sm:text-base">
                        Guia visual del componente PopUp: modo formulario automatico,
                        confirmaciones, alertas y contenido personalizado.
                    </p>
                </div>
            </section>

            <section className="mt-8 grid gap-5 xl:grid-cols-2">

                {/* Modo formulario — crear */}
                <CatalogSection
                    title="Modo formulario — Crear"
                    description="Pasa un formConfig y onSubmit. El PopUp renderiza el formulario completo con validaciones."
                >
                    <ButtonComponent leftIcon={<PlusIcon />} onClick={() => open('create-tournament')}>
                        Crear Torneo
                    </ButtonComponent>
                </CatalogSection>

                {/* Modo formulario — editar con campo condicional */}
                <CatalogSection
                    title="Modo formulario — Editar con campo condicional"
                    description="El campo 'Razon del cambio de rol' aparece solo cuando se selecciona Administrador."
                >
                    <ButtonComponent
                        variant="outline"
                        leftIcon={<EditIcon />}
                        onClick={() => open('edit-user')}
                    >
                        Editar Usuario
                    </ButtonComponent>
                </CatalogSection>

                {/* Confirmacion de peligro */}
                <CatalogSection
                    title="Confirmacion de peligro"
                    description="Usa children + footer para modales de confirmacion sin formulario."
                >
                    <ButtonComponent
                        variant="danger"
                        leftIcon={<TrashBinIcon />}
                        onClick={() => open('delete-confirm')}
                    >
                        Eliminar Torneo
                    </ButtonComponent>
                </CatalogSection>

                {/* Informacion / detalle */}
                <CatalogSection
                    title="Informacion / Detalle"
                    description="Contenido de solo lectura con accion de confirmacion simple."
                >
                    <ButtonComponent
                        variant="secondary"
                        leftIcon={<ShieldIcon />}
                        onClick={() => open('info-detail')}
                    >
                        Ver permisos del rol
                    </ButtonComponent>
                </CatalogSection>

                {/* Formulario minimo (sm) */}
                <CatalogSection
                    title="Formulario compacto — size sm"
                    description="Para acciones rapidas que solo necesitan uno o dos campos."
                >
                    <ButtonComponent
                        variant="ghost"
                        leftIcon={<SparkIcon />}
                        onClick={() => open('quick-note')}
                    >
                        Agregar nota rapida
                    </ButtonComponent>
                </CatalogSection>

                {/* Resultado del ultimo submit */}
                <CatalogSection
                    title="Ultimo formulario enviado"
                    description="Los valores del ultimo onSubmit aparecen aqui para verificar que funciona."
                >
                    {submittedValues ? (
                        <pre className="overflow-x-auto rounded-xl bg-(--color-bg-soft) p-4 text-xs text-(--color-text)">
                            {JSON.stringify(submittedValues, null, 2)}
                        </pre>
                    ) : (
                        <p className="rounded-xl bg-(--color-bg-soft) p-4 text-sm text-(--color-text-muted)">
                            Aun no se ha enviado ningun formulario.
                        </p>
                    )}
                </CatalogSection>
            </section>

            {/* ── PopUps ── */}

            {/* Crear torneo */}
            <PopUp
                isOpen={openPopUp === 'create-tournament'}
                onClose={close}
                title="Nuevo Torneo"
                size="lg"
                formConfig={createTournamentConfig}
                isSubmitting={false}
                onSubmit={handleSubmit}
            />

            {/* Editar usuario */}
            <PopUp
                isOpen={openPopUp === 'edit-user'}
                onClose={close}
                title="Editar Usuario"
                size="md"
                formConfig={editUserConfig}
                initialValues={{
                    firstName: 'Ariel',
                    lastName: 'Navas',
                    email: 'arielnavas05@gmail.com',
                    role: 'organizer',
                }}
                isSubmitting={false}
                onSubmit={handleSubmit}
            />

            {/* Confirmacion eliminar */}
            <PopUp
                isOpen={openPopUp === 'delete-confirm'}
                onClose={close}
                title="Eliminar torneo"
                description="Esta accion es permanente y no se puede deshacer."
                size="sm"
                footer={
                    <>
                        <ButtonComponent variant="outline" onClick={close}>
                            Cancelar
                        </ButtonComponent>
                        <ButtonComponent
                            variant="danger"
                            leftIcon={<TrashBinIcon />}
                            onClick={() => {
                                setSubmittedValues({ action: 'deleted', tournamentId: 42 })
                                close()
                            }}
                        >
                            Eliminar
                        </ButtonComponent>
                    </>
                }
            >
                <p className="text-sm text-(--color-text-muted)">
                    Se eliminara el torneo{' '}
                    <span className="font-semibold text-(--color-text)">Copa Ciudad 2026</span>{' '}
                    junto con todos sus partidos, equipos y estadisticas registradas.
                </p>
            </PopUp>

            {/* Informacion de rol */}
            <PopUp
                isOpen={openPopUp === 'info-detail'}
                onClose={close}
                title="Permisos del rol Administrador"
                description="Resumen de acciones disponibles para este nivel de acceso."
                size="md"
                footer={
                    <ButtonComponent leftIcon={<CheckIcon />} onClick={close}>
                        Entendido
                    </ButtonComponent>
                }
            >
                <ul className="grid gap-2 text-sm text-(--color-text)">
                    {[
                        'Crear y eliminar torneos',
                        'Gestionar equipos y jugadores',
                        'Publicar resultados y estadisticas',
                        'Configurar permisos de otros usuarios',
                        'Acceder a reportes y exportaciones',
                    ].map((permission) => (
                        <li key={permission} className="flex items-center gap-2">
                            <CheckIcon className="size-4 shrink-0 text-brand" />
                            {permission}
                        </li>
                    ))}
                </ul>
            </PopUp>

            {/* Nota rapida */}
            <PopUp
                isOpen={openPopUp === 'quick-note'}
                onClose={close}
                title="Agregar nota"
                size="sm"
                formConfig={quickNoteConfig}
                isSubmitting={false}
                onSubmit={handleSubmit}
            />
        </main>
    )
}
