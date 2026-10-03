import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { sileo } from 'sileo'
import TableTS, { ActionCell, StatusBadge } from '../../../components/ui/table/TableTs'
import PopUp from '../../../components/common/pop-up/PopUp'
import ConfirmDialog from '../../../components/common/pop-up/ConfirmDialog'
import ButtonComponent from '../../../components/ui/buttons/ButtonComponent'
import ModuleHeader from '../../../components/common/page/ModuleHeader'
import PageContainer from '../../../components/common/page/PageContainer'
import Badge from '../../../components/ui/badge/Badge'
import SegmentedControl from '../../../components/ui/segmented/SegmentedControl'
import type { Tone } from '../../../components/ui/tone'
import type { FormConfig, FormValues } from '../../../components/common/forms/FormRender'
import { PlusIcon, UsersIcon, CheckIcon, ShieldIcon, ClockIcon } from '../../../icons/icons'
import Avatar from '../../../components/ui/avatar/Avatar'
import { ROLE_LABELS } from '../../../config/app.config'
import type { UserRole } from '../../../config/app.config'

type UserStatus = 'active' | 'pending' | 'inactive'

type AppUser = {
    id: string
    name: string
    email: string
    role: UserRole
    status: UserStatus
    joinDate: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const ROLE_TONES: Record<UserRole, Tone> = {
    admin: 'brand',
    organizer: 'violet',
    analyst: 'teal',
    viewer: 'neutral',
}

const STATUS_OPTIONS: { value: UserStatus; label: string }[] = [
    { value: 'active', label: 'Activo' },
    { value: 'pending', label: 'Pendiente' },
    { value: 'inactive', label: 'Inactivo' },
]

const initialUsers: AppUser[] = [
    { id: 'u-01', name: 'Juan García', email: 'juan.garcia@example.com', role: 'admin', status: 'active', joinDate: '2025-01-15' },
    { id: 'u-02', name: 'María López', email: 'maria.lopez@example.com', role: 'organizer', status: 'active', joinDate: '2025-02-03' },
    { id: 'u-03', name: 'Carlos Ruiz', email: 'carlos.ruiz@example.com', role: 'analyst', status: 'pending', joinDate: '2025-03-22' },
    { id: 'u-04', name: 'Ana Martínez', email: 'ana.martinez@example.com', role: 'organizer', status: 'active', joinDate: '2025-04-10' },
    { id: 'u-05', name: 'Diego Fernández', email: 'diego.fernandez@example.com', role: 'viewer', status: 'inactive', joinDate: '2025-05-08' },
    { id: 'u-06', name: 'Lucía Herrera', email: 'lucia.herrera@example.com', role: 'analyst', status: 'active', joinDate: '2025-06-01' },
    { id: 'u-07', name: 'Pedro Sánchez', email: 'pedro.sanchez@example.com', role: 'viewer', status: 'pending', joinDate: '2025-06-18' },
    { id: 'u-08', name: 'Sofía Torres', email: 'sofia.torres@example.com', role: 'organizer', status: 'active', joinDate: '2025-06-27' },
]

const dateFormatter = new Intl.DateTimeFormat('es', { dateStyle: 'medium' })
const formatDate = (isoDate: string) => dateFormatter.format(new Date(`${isoDate}T00:00:00`))

type SummaryFilter = 'all' | UserStatus | 'admin'

function SummaryTile({ icon, label, value, isActive, onClick }: { icon: React.ReactNode; label: string; value: number; isActive: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={isActive}
            className={`card-interactive flex items-center gap-3 p-4 text-left ${isActive ? 'border-brand ring-1 ring-brand' : ''}`}
        >
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-strong">{icon}</span>
            <span>
                <span className="block text-2xl font-semibold leading-7 text-fg tabular-nums">{value}</span>
                <span className="block text-xs text-fg-muted">{label}</span>
            </span>
        </button>
    )
}

/** Administration › Users: members of the organization, their role and access status. */
export default function UserManagement() {
    const [users, setUsers] = useState<AppUser[]>(initialUsers)
    const [editingUser, setEditingUser] = useState<AppUser | null>(null)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [userToDelete, setUserToDelete] = useState<AppUser | null>(null)
    const [summary, setSummary] = useState<SummaryFilter>('all')
    const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')

    const count = (status: UserStatus) => users.filter((user) => user.status === status).length
    const adminCount = users.filter((user) => user.role === 'admin').length

    const visibleUsers = users.filter((user) => {
        if (roleFilter !== 'all' && user.role !== roleFilter) return false
        if (summary === 'admin') return user.role === 'admin'
        return summary === 'all' || user.status === summary
    })

    const formConfig: FormConfig = useMemo(
        () => ({
            description: editingUser ? 'Actualiza los datos y el acceso de la persona.' : 'La persona recibirá una invitación para activar su cuenta.',
            columns: 2,
            submitLabel: editingUser ? 'Guardar cambios' : 'Invitar usuario',
            fields: [
                {
                    name: 'name',
                    label: 'Nombre completo',
                    type: 'text',
                    placeholder: 'p. ej. Laura Jiménez',
                    required: true,
                    validate: (value) =>
                        typeof value === 'string' && value.trim().length > 0 && value.trim().length < 3 ? 'Escribe al menos 3 caracteres.' : undefined,
                },
                {
                    name: 'email',
                    label: 'Correo electrónico',
                    type: 'email',
                    placeholder: 'nombre@empresa.com',
                    required: true,
                    validate: (value) =>
                        typeof value === 'string' && value.length > 0 && !EMAIL_PATTERN.test(value) ? 'Escribe un correo válido, p. ej. nombre@empresa.com.' : undefined,
                },
                {
                    name: 'role',
                    label: 'Rol',
                    type: 'select',
                    required: true,
                    options: (Object.keys(ROLE_LABELS) as UserRole[]).map((role) => ({ label: ROLE_LABELS[role], value: role })),
                },
                {
                    name: 'status',
                    label: 'Estado',
                    type: 'select',
                    required: true,
                    options: STATUS_OPTIONS,
                },
            ],
        }),
        [editingUser]
    )

    function openCreateForm() {
        setEditingUser(null)
        setIsFormOpen(true)
    }

    function closeForm() {
        setIsFormOpen(false)
        setEditingUser(null)
    }

    function handleSubmit(values: FormValues) {
        const payload = {
            name: String(values.name ?? '').trim(),
            email: String(values.email ?? '').trim(),
            role: values.role as UserRole,
            status: values.status as UserStatus,
        }

        if (editingUser) {
            setUsers((currentUsers) => currentUsers.map((user) => (user.id === editingUser.id ? { ...user, ...payload } : user)))
            sileo.success({ title: 'Cambios guardados' })
        } else {
            setUsers((currentUsers) => [
                ...currentUsers,
                { id: `u-${Date.now().toString(36)}`, joinDate: new Date().toISOString().slice(0, 10), ...payload },
            ])
            sileo.success({ title: `Invitación enviada a ${payload.email}` })
        }
        closeForm()
    }

    function confirmDelete() {
        if (!userToDelete) return
        setUsers((currentUsers) => currentUsers.filter((user) => user.id !== userToDelete.id))
        sileo.success({ title: `${userToDelete.name} ya no tiene acceso` })
        setUserToDelete(null)
    }

    const columns: ColumnDef<AppUser>[] = useMemo(
        () => [
            {
                accessorKey: 'name',
                header: 'Usuario',
                cell: ({ row }) => (
                    <div className="flex items-center gap-3">
                        <Avatar name={row.original.name} />
                        <div className="min-w-0">
                            <p className="font-semibold text-fg">{row.original.name}</p>
                            <p className="text-xs text-fg-muted">{row.original.email}</p>
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: 'role',
                header: 'Rol',
                cell: ({ getValue }) => {
                    const role = getValue<UserRole>()
                    return <Badge tone={ROLE_TONES[role]}>{ROLE_LABELS[role]}</Badge>
                },
            },
            {
                accessorKey: 'status',
                header: 'Estado',
                cell: ({ getValue }) => <StatusBadge value={getValue<string>()} />,
            },
            {
                accessorKey: 'joinDate',
                header: 'Alta',
                cell: ({ getValue }) => <span className="text-fg-muted">{formatDate(getValue<string>())}</span>,
            },
            {
                id: 'actions',
                header: () => <span className="sr-only">Acciones</span>,
                enableSorting: false,
                cell: ({ row }) => (
                    <ActionCell
                        onEdit={() => {
                            setEditingUser(row.original)
                            setIsFormOpen(true)
                        }}
                        onDelete={() => setUserToDelete(row.original)}
                    />
                ),
            },
        ],
        []
    )

    const toggleSummary = (value: SummaryFilter) => setSummary((current) => (current === value ? 'all' : value))

    return (
        <PageContainer>
            <ModuleHeader
                eyebrow="Administración"
                title="Usuarios"
                description="Personas con acceso a la plataforma, su rol y el estado de su cuenta."
                actions={
                    <ButtonComponent leftIcon={<PlusIcon className="size-4" />} onClick={openCreateForm}>
                        Invitar usuario
                    </ButtonComponent>
                }
            />

            {/* The tiles double as quick filters */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <SummaryTile icon={<UsersIcon className="size-5" />} label="Todos" value={users.length} isActive={summary === 'all'} onClick={() => setSummary('all')} />
                <SummaryTile icon={<CheckIcon className="size-5" />} label="Activos" value={count('active')} isActive={summary === 'active'} onClick={() => toggleSummary('active')} />
                <SummaryTile icon={<ClockIcon className="size-5" />} label="Invitación pendiente" value={count('pending')} isActive={summary === 'pending'} onClick={() => toggleSummary('pending')} />
                <SummaryTile icon={<ShieldIcon className="size-5" />} label="Administradores" value={adminCount} isActive={summary === 'admin'} onClick={() => toggleSummary('admin')} />
            </div>

            <TableTS<AppUser>
                    toolbar={
                        <SegmentedControl
                            label="Filtrar por rol"
                            size="sm"
                            value={roleFilter}
                            onChange={setRoleFilter}
                            options={[
                                { value: 'all', label: 'Todos los roles' },
                                ...(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => ({ value: role, label: ROLE_LABELS[role] })),
                            ]}
                        />
                    }
                    data={visibleUsers}
                    columns={columns}
                    enableSorting
                    enableFiltering
                    enablePagination
                    pageSize={8}
                    existBtn={false}
                    searchPlaceholder="Buscar por nombre o correo"
                    emptyMessage="Ningún usuario coincide. Prueba con otro nombre, correo o quita los filtros."
                />

            <PopUp
                key={editingUser?.id ?? 'new'}
                isOpen={isFormOpen}
                onClose={closeForm}
                title={editingUser ? `Editar a ${editingUser.name}` : 'Invitar usuario'}
                size="lg"
                formConfig={formConfig}
                initialValues={
                    editingUser
                        ? { name: editingUser.name, email: editingUser.email, role: editingUser.role, status: editingUser.status }
                        : { role: 'viewer', status: 'pending' }
                }
                onSubmit={handleSubmit}
            />

            <ConfirmDialog
                isOpen={Boolean(userToDelete)}
                title="Quitar acceso"
                description={userToDelete ? `${userToDelete.name} (${userToDelete.email}) dejará de poder iniciar sesión.` : undefined}
                confirmLabel="Quitar acceso"
                onConfirm={confirmDelete}
                onCancel={() => setUserToDelete(null)}
            />
        </PageContainer>
    )
}
