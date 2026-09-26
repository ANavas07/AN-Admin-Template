import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCommandPalette } from '../../components/common/command-palette/command-palette-context'
import ModuleIcon from '../../components/common/modules/ModuleIcon'
import ButtonComponent from '../../components/ui/buttons/ButtonComponent'
import Kbd from '../../components/ui/kbd/Kbd'
import { ArrowLeftIcon, HomeIcon, SearchIcon } from '../../icons/icons'
import { HOME_PATH } from '../../navigation/navigation'
import { modifierKeyLabel } from '../../utils/platform'
import StatusPageLayout from './StatusPageLayout'

const SUGGESTIONS = [
    { label: 'Todos los módulos', to: '/workspace/modules', icon: 'grid' },
    { label: 'Actividad reciente', to: '/workspace/activity', icon: 'activity' },
    { label: 'Centro de soporte', to: '/support', icon: 'support' },
]

/** 404: the route does not exist (or was moved). */
export default function NotFoundPage() {
    const { pathname } = useLocation()
    const navigate = useNavigate()
    const { open: openPalette } = useCommandPalette()

    return (
        <StatusPageLayout
            code="Error 404"
            title="No encontramos esta página"
            description={
                <>
                    La dirección <code className="rounded-sm bg-canvas-subtle px-1 py-0.5 font-mono text-xs text-fg">{pathname}</code>{' '}
                    no existe o fue movida. Revisa el enlace o busca el módulo que necesitas.
                </>
            }
            icon={<SearchIcon className="size-6" />}
            tone="info"
            actions={
                <>
                    <ButtonComponent leftIcon={<HomeIcon className="size-4" />} onClick={() => navigate(HOME_PATH)}>
                        Volver al inicio
                    </ButtonComponent>
                    <ButtonComponent variant="outline" leftIcon={<SearchIcon className="size-4" />} onClick={openPalette}>
                        Buscar módulos
                        <span className="ml-1 hidden gap-0.5 sm:flex">
                            <Kbd>{modifierKeyLabel()}</Kbd>
                            <Kbd>K</Kbd>
                        </span>
                    </ButtonComponent>
                    <ButtonComponent variant="ghost" leftIcon={<ArrowLeftIcon className="size-4" />} onClick={() => navigate(-1)}>
                        Atrás
                    </ButtonComponent>
                </>
            }
        >
            <p className="eyebrow mb-2 text-3xs">Quizás buscabas</p>
            <ul className="divide-y divide-line rounded-lg border border-line">
                {SUGGESTIONS.map((item) => (
                    <li key={item.to}>
                        <Link to={item.to} className="flex items-center gap-3 px-3 py-2.5 text-sm text-fg transition-colors hover:bg-canvas-subtle">
                            <ModuleIcon name={item.icon} className="size-4 text-fg-muted" />
                            {item.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </StatusPageLayout>
    )
}
