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
    // Generar avatar con iniciales si no hay imagen
    const avatarInitial = userName
        .split(' ')
        .map((n) => n.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)

    return (
        <div className="sticky top-20 space-y-4">
            {/* Card principal del usuario */}
            <div className="overflow-hidden rounded-3xl border border-(--color-border) bg-linear-to-br from-brand/10 to-highlight/5 p-6 shadow-sm">
                {/* Avatar circular */}
                <div className="mx-auto mb-4 flex h-32 w-32 items-center justify-center rounded-full border-4 border-(--color-surface) bg-brand text-4xl font-bold text-white shadow-md">
                    {userImage ? (
                        <img
                            src={userImage}
                            alt={userName}
                            className="h-full w-full rounded-full object-cover"
                        />
                    ) : (
                        avatarInitial
                    )}
                </div>

                {/* Información usuario */}
                <h2 className="text-center text-lg font-bold text-(--color-text) line-clamp-2">
                    {userName}
                </h2>
                <p className="text-center text-xs text-(--color-text-muted) truncate">
                    {userEmail}
                </p>

                {/* Botones de acción */}
                <div className="mt-4 flex flex-col gap-2">
                    <button
                        type="button"
                        onClick={onUploadPhoto}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition-all hover:shadow-lg hover:scale-105 active:scale-95"
                    >
                        📷 Subir Foto
                    </button>
                    <button
                        type="button"
                        onClick={onIdentification}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-highlight px-4 py-2 text-sm font-semibold text-white transition-all hover:shadow-lg hover:scale-105 active:scale-95"
                    >
                        🪪 Identificación
                    </button>
                </div>
            </div>

            {/* Información del campeonato/organización */}
            <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 space-y-3">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-(--color-text-muted)">
                        Organización
                    </p>
                    <p className="mt-1 text-sm font-medium text-(--color-text)">
                        {organization}
                    </p>
                </div>

                <div className="border-t border-(--color-border) pt-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-(--color-text-muted)">
                        Identificación
                    </p>
                    <p className="mt-1 text-sm font-mono text-brand">
                        {identifier}
                    </p>
                </div>

                <div className="border-t border-(--color-border) pt-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-(--color-text-muted)">
                        Sede
                    </p>
                    <p className="mt-1 text-sm text-(--color-text)">
                        {location}
                    </p>
                </div>
            </div>
        </div>
    )
}
