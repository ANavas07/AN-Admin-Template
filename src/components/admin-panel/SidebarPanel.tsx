import ButtonComponent from '../ui/buttons/ButtonComponent'
import Avatar from '../ui/avatar/Avatar'
import { UploadIcon, UserIcon } from '../../icons/icons'

type SidebarPanelProps = {
    userName: string
    userEmail: string
    userImage?: string
    organization: string
    identifier: string
    location: string
    onUploadPhoto?: () => void
    onIdentification?: () => void
}

export default function SidebarPanel({
    userName,
    userEmail,
    userImage,
    organization,
    identifier,
    location,
    onUploadPhoto,
    onIdentification,
}: SidebarPanelProps) {
    const details = [
        { label: 'Organización', value: organization },
        { label: 'Identificación', value: identifier, mono: true },
        { label: 'Sede', value: location },
    ]

    return (
        <div className="sticky top-[calc(var(--layout-navbar-height)+1.5rem)] space-y-4">
            {/* User card */}
            <div className="card p-5">
                <div className="flex items-center gap-3.5">
                    {userImage ? (
                        <img src={userImage} alt={userName} className="size-14 shrink-0 rounded-full object-cover" />
                    ) : (
                        <Avatar name={userName} tone="brand" size="lg" className="size-14 text-base" />
                    )}
                    <div className="min-w-0">
                        <h2 className="truncate text-base font-semibold text-fg">{userName}</h2>
                        <p className="truncate text-xs text-fg-muted">{userEmail}</p>
                    </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2">
                    <ButtonComponent
                        size="sm"
                        variant="outline"
                        leftIcon={<UploadIcon className="size-4" />}
                        onClick={onUploadPhoto}
                    >
                        Subir foto
                    </ButtonComponent>
                    <ButtonComponent
                        size="sm"
                        variant="outline"
                        leftIcon={<UserIcon className="size-4" />}
                        onClick={onIdentification}
                    >
                        Identificación
                    </ButtonComponent>
                </div>
            </div>

            {/* Organization details */}
            <dl className="card divide-y divide-line">
                {details.map((item) => (
                    <div key={item.label} className="px-5 py-3">
                        <dt className="eyebrow">{item.label}</dt>
                        <dd className={item.mono ? 'mt-1 font-mono text-sm text-fg' : 'mt-1 text-sm font-medium text-fg'}>
                            {item.value}
                        </dd>
                    </div>
                ))}
            </dl>
        </div>
    )
}
