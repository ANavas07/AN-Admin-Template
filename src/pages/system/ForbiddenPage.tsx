import { useNavigate } from 'react-router-dom'
import ButtonComponent from '../../components/ui/buttons/ButtonComponent'
import Badge from '../../components/ui/badge/Badge'
import { ROLE_LABELS } from '../../config/app.config'
import type { UserRole } from '../../config/app.config'
import { ArrowLeftIcon, HomeIcon, LockIcon, SupportIcon } from '../../icons/icons'
import { HOME_PATH } from '../../navigation/navigation'
import { supportTicketUrl } from './errorReference'
import StatusPageLayout from './StatusPageLayout'

type ForbiddenPageProps = {
    /** Module the user tried to open */
    moduleTitle?: string
    currentRole?: UserRole
    requiredRoles?: string[]
}

function roleLabel(role: string) {
    return ROLE_LABELS[role as UserRole] ?? role
}

/** 403: the route exists but the active role cannot open it. */
export default function ForbiddenPage({ moduleTitle, currentRole, requiredRoles }: ForbiddenPageProps) {
    const navigate = useNavigate()
    const target = moduleTitle ?? 'esta sección'

    return (
        <StatusPageLayout
            code="Error 403"
            title="No tienes acceso a esta sección"
            description={`Tu rol actual no tiene permisos para abrir ${target}. Si lo necesitas para tu trabajo, solicita el acceso a soporte o a un administrador.`}
            icon={<LockIcon className="size-6" />}
            tone="warning"
            actions={
                <>
                    <ButtonComponent leftIcon={<HomeIcon className="size-4" />} onClick={() => navigate(HOME_PATH)}>
                        Volver al inicio
                    </ButtonComponent>
                    <ButtonComponent
                        variant="outline"
                        leftIcon={<SupportIcon className="size-4" />}
                        onClick={() => navigate(supportTicketUrl({ subject: `Solicitud de acceso: ${target}`, category: 'access' }))}
                    >
                        Contactar soporte
                    </ButtonComponent>
                    <ButtonComponent variant="ghost" leftIcon={<ArrowLeftIcon className="size-4" />} onClick={() => navigate(-1)}>
                        Atrás
                    </ButtonComponent>
                </>
            }
        >
            {currentRole || requiredRoles?.length ? (
                <dl className="grid gap-3 rounded-lg border border-line p-4 text-sm sm:grid-cols-2">
                    {currentRole ? (
                        <div>
                            <dt className="text-xs text-fg-muted">Tu rol</dt>
                            <dd className="mt-1">
                                <Badge>{roleLabel(currentRole)}</Badge>
                            </dd>
                        </div>
                    ) : null}
                    {requiredRoles?.length ? (
                        <div>
                            <dt className="text-xs text-fg-muted">Roles con acceso</dt>
                            <dd className="mt-1 flex flex-wrap gap-1">
                                {requiredRoles.map((role) => (
                                    <Badge key={role} tone="brand">
                                        {roleLabel(role)}
                                    </Badge>
                                ))}
                            </dd>
                        </div>
                    ) : null}
                </dl>
            ) : null}
        </StatusPageLayout>
    )
}
