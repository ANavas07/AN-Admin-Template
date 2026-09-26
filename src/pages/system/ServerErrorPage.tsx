import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import ButtonComponent from '../../components/ui/buttons/ButtonComponent'
import CopyButton from '../../components/ui/copy-button/CopyButton'
import { AlertTriangleIcon, HomeIcon, RefreshIcon, SupportIcon } from '../../icons/icons'
import { HOME_PATH } from '../../navigation/navigation'
import { createErrorReference, supportTicketUrl } from './errorReference'
import StatusPageLayout from './StatusPageLayout'

type ServerErrorPageProps = {
    /** Reference logged with the error; the page creates one when missing */
    referenceId?: string
    /** Retries the failed view; reloads the page by default */
    onRetry?: () => void
}

/** 500: something failed on our side. Gives the user a reference to quote to support. */
export default function ServerErrorPage({ referenceId, onRetry }: ServerErrorPageProps) {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [reference] = useState(() => referenceId ?? searchParams.get('ref') ?? createErrorReference())

    return (
        <StatusPageLayout
            code="Error 500"
            title="Algo salió mal de nuestro lado"
            description="No pudimos completar la operación. No perdiste nada de lo que ya estaba guardado. Vuelve a intentarlo en unos segundos; si el problema continúa, comparte la referencia con soporte."
            icon={<AlertTriangleIcon className="size-6" />}
            tone="danger"
            actions={
                <>
                    <ButtonComponent leftIcon={<RefreshIcon className="size-4" />} onClick={onRetry ?? (() => window.location.reload())}>
                        Reintentar
                    </ButtonComponent>
                    <ButtonComponent variant="outline" leftIcon={<HomeIcon className="size-4" />} onClick={() => navigate(HOME_PATH)}>
                        Ir al inicio
                    </ButtonComponent>
                    <ButtonComponent
                        variant="ghost"
                        leftIcon={<SupportIcon className="size-4" />}
                        onClick={() =>
                            navigate(supportTicketUrl({ subject: `Error interno ${reference}`, category: 'incident', reference }))
                        }
                    >
                        Reportar a soporte
                    </ButtonComponent>
                </>
            }
        >
            <div className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface-muted px-4 py-3">
                <div className="min-w-0">
                    <p className="text-xs text-fg-muted">Referencia del error</p>
                    <p className="mt-0.5 truncate font-mono text-sm font-medium text-fg">{reference}</p>
                </div>
                <CopyButton value={reference} label="Copiar referencia" showLabel />
            </div>
        </StatusPageLayout>
    )
}
