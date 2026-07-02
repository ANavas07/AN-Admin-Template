import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import TableTS, { ActionCell, StatusBadge } from '../../components/ui/table/TableTs'
import PopUp from '../../components/common/pop-up/PopUp'
import ButtonComponent from '../../components/ui/buttons/ButtonComponent'
import ModuleHeader from '../../components/common/page/ModuleHeader'
import type { FormConfig, FormValues } from '../../components/common/forms/FormRender'
import { PlusIcon, UsersIcon, CheckIcon, ShieldIcon } from '../../icons/icons'

type UserStatus = 'active' | 'pending' | 'inactive'
type UserRole = 'Administrator' | 'Organizer' | 'Analyst' | 'Viewer'

type AppUser = {
    id: string
    name: string
    email: string
    role: UserRole
    status: UserStatus
    joinDate: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const initialUsers: AppUser[] = [
    { id: 'u-01', name: 'Juan Garcia', email: 'juan@tournaments.com', role: 'Administrator', status: 'active', joinDate: '2025-01-15' },
    { id: 'u-02', name: 'Maria Lopez', email: 'maria@tournaments.com', role: 'Organizer', status: 'active', joinDate: '2025-02-03' },
    { id: 'u-03', name: 'Carlos Ruiz', email: 'carlos@tournaments.com', role: 'Analyst', status: 'pending', joinDate: '2025-03-22' },
    { id: 'u-04', name: 'Ana Martinez', email: 'ana@tournaments.com', role: 'Organizer', status: 'active', joinDate: '2025-04-10' },
    { id: 'u-05', name: 'Diego Fernandez', email: 'diego@tournaments.com', role: 'Viewer', status: 'inactive', joinDate: '2025-05-08' },
    { id: 'u-06', name: 'Lucia Herrera', email: 'lucia@tournaments.com', role: 'Analyst', status: 'active', joinDate: '2025-06-01' },
    { id: 'u-07', name: 'Pedro Sanchez', email: 'pedro@tournaments.com', role: 'Viewer', status: 'pending', joinDate: '2025-06-18' },
    { id: 'u-08', name: 'Sofia Torres', email: 'sofia@tournaments.com', role: 'Organizer', status: 'active', joinDate: '2025-06-27' },
]

const avatarPalette = [
    'bg-emerald-600',
    'bg-sky-600',
    'bg-violet-600',
    'bg-amber-600',
    'bg-rose-600',
    'bg-teal-600',
]

function avatarColor(name: string) {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return avatarPalette[hash % avatarPalette.length]
}

function initials(name: string) {
    return name
        .split(' ')
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('')
}

function formatDate(isoDate: string) {
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(`${isoDate}T00:00:00`))
}

function StatTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
    return (
        <div className="flex items-center gap-4 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand">
                {icon}
            </span>
            <div>
                <p className="text-2xl font-bold leading-7 text-(--color-text)">{value}</p>
                <p className="text-xs font-medium uppercase tracking-wide text-(--color-text-muted)">{label}</p>
            </div>
        </div>
    )
}

export default function UserManagement() {
    const [users, setUsers] = useState<AppUser[]>(initialUsers)
    const [editingUser, setEditingUser] = useState<AppUser | null>(null)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [userToDelete, setUserToDelete] = useState<AppUser | null>(null)

    const activeCount = users.filter((user) => user.status === 'active').length
    const adminCount = users.filter((user) => user.role === 'Administrator').length

    const formConfig: FormConfig = useMemo(
        () => ({
            description: editingUser
                ? 'Update the member details below.'
                : 'Fill in the details to invite a new member to the panel.',
            columns: 2,
            submitLabel: editingUser ? 'Save changes' : 'Create user',
            fields: [
                {
                    name: 'name',
                    label: 'Full name',
                    type: 'text',
                    placeholder: 'e.g. Laura Jimenez',
                    required: true,
                    validate: (value) =>
                        typeof value === 'string' && value.trim().length > 0 && value.trim().length < 3
                            ? 'Full name must be at least 3 characters.'
                            : undefined,
                },
                {
                    name: 'email',
                    label: 'Email address',
                    type: 'email',
                    placeholder: 'name@tournaments.com',
                    required: true,
                    validate: (value) =>
                        typeof value === 'string' && value.length > 0 && !EMAIL_PATTERN.test(value)
                            ? 'Enter a valid email address.'
                            : undefined,
                },
                {
                    name: 'role',
                    label: 'Role',
                    type: 'select',
                    required: true,
                    options: [
                        { label: 'Administrator', value: 'Administrator' },
                        { label: 'Organizer', value: 'Organizer' },
                        { label: 'Analyst', value: 'Analyst' },
                        { label: 'Viewer', value: 'Viewer' },
                    ],
                },
                {
                    name: 'status',
                    label: 'Status',
                    type: 'select',
                    required: true,
                    options: [
                        { label: 'Active', value: 'active' },
                        { label: 'Pending', value: 'pending' },
                        { label: 'Inactive', value: 'inactive' },
                    ],
                },
            ],
        }),
        [editingUser]
    )

    function openCreateForm() {
        setEditingUser(null)
        setIsFormOpen(true)
    }

    function openEditForm(user: AppUser) {
        setEditingUser(user)
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
            setUsers((currentUsers) =>
                currentUsers.map((user) =>
                    user.id === editingUser.id ? { ...user, ...payload } : user
                )
            )
        } else {
            setUsers((currentUsers) => [
                ...currentUsers,
                {
                    id: `u-${String(currentUsers.length + 1).padStart(2, '0')}-${payload.email}`,
                    joinDate: new Date().toISOString().slice(0, 10),
                    ...payload,
                },
            ])
        }

        closeForm()
    }

    function confirmDelete() {
        if (!userToDelete) return
        setUsers((currentUsers) => currentUsers.filter((user) => user.id !== userToDelete.id))
        setUserToDelete(null)
    }

    const columns: ColumnDef<AppUser>[] = useMemo(
        () => [
            {
                accessorKey: 'name',
                header: 'User',
                cell: ({ row }) => (
                    <div className="flex items-center gap-3">
                        <span
                            className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${avatarColor(row.original.name)}`}
                        >
                            {initials(row.original.name)}
                        </span>
                        <div className="min-w-0">
                            <p className="font-semibold text-(--color-text)">{row.original.name}</p>
                            <p className="text-xs text-(--color-text-muted)">{row.original.email}</p>
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: 'role',
                header: 'Role',
                cell: ({ getValue }) => (
                    <span className="inline-flex items-center rounded-full border border-(--color-border) bg-(--color-bg-soft) px-3 py-1 text-xs font-semibold text-(--color-text)">
                        {getValue<string>()}
                    </span>
                ),
            },
            {
                accessorKey: 'status',
                header: 'Status',
                cell: ({ getValue }) => <StatusBadge value={getValue<string>()} />,
            },
            {
                accessorKey: 'joinDate',
                header: 'Joined',
                cell: ({ getValue }) => (
                    <span className="text-(--color-text-muted)">{formatDate(getValue<string>())}</span>
                ),
            },
            {
                id: 'actions',
                header: 'Actions',
                enableSorting: false,
                cell: ({ row }) => (
                    <ActionCell
                        onEdit={() => openEditForm(row.original)}
                        onDelete={() => setUserToDelete(row.original)}
                    />
                ),
            },
        ],
        []
    )

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-(--color-bg)">
            <div className="mx-auto max-w-350 space-y-6 px-4 py-8 sm:px-6 lg:px-8">
                <ModuleHeader
                    eyebrow="Users module"
                    title="User management"
                    description="Create, edit and remove panel members. Changes are stored locally in this demo — no backend calls are made."
                    actions={
                        <ButtonComponent
                            variant="primary"
                            leftIcon={<PlusIcon className="size-5" />}
                            onClick={openCreateForm}
                        >
                            Add user
                        </ButtonComponent>
                    }
                />

                {/* Summary tiles */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <StatTile icon={<UsersIcon className="size-5" />} label="Total members" value={users.length} />
                    <StatTile icon={<CheckIcon className="size-5" />} label="Active" value={activeCount} />
                    <StatTile icon={<ShieldIcon className="size-5" />} label="Administrators" value={adminCount} />
                </div>

                {/* Users table */}
                <TableTS<AppUser>
                    data={users}
                    columns={columns}
                    enableSorting
                    enableFiltering
                    enablePagination
                    pageSize={6}
                    existBtn={false}
                    emptyMessage="No users match your search. Try a different name or email."
                />
            </div>

            {/* Create / edit modal */}
            <PopUp
                isOpen={isFormOpen}
                onClose={closeForm}
                title={editingUser ? `Edit ${editingUser.name}` : 'Add user'}
                size="lg"
                formConfig={formConfig}
                initialValues={
                    editingUser
                        ? {
                            name: editingUser.name,
                            email: editingUser.email,
                            role: editingUser.role,
                            status: editingUser.status,
                        }
                        : { role: 'Viewer', status: 'pending' }
                }
                onSubmit={handleSubmit}
            />

            {/* Delete confirmation */}
            <PopUp
                isOpen={Boolean(userToDelete)}
                onClose={() => setUserToDelete(null)}
                title="Remove user"
                description="This only removes the user from the local list."
                size="sm"
                footer={
                    <>
                        <ButtonComponent variant="outline" onClick={() => setUserToDelete(null)}>
                            Cancel
                        </ButtonComponent>
                        <ButtonComponent variant="danger" onClick={confirmDelete}>
                            Remove user
                        </ButtonComponent>
                    </>
                }
            >
                <p>
                    You are about to remove{' '}
                    <span className="font-semibold">{userToDelete?.name}</span> (
                    {userToDelete?.email}). This action cannot be undone.
                </p>
            </PopUp>
        </div>
    )
}
