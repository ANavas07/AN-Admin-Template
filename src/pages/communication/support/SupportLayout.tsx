import { Outlet } from 'react-router-dom'
import ModuleHeader from '../../../components/common/page/ModuleHeader'
import PageContainer from '../../../components/common/page/PageContainer'
import SectionTabs from '../../../components/common/navigation/SectionTabs'
import ButtonComponent from '../../../components/ui/buttons/ButtonComponent'
import { PlusIcon } from '../../../icons/icons'

const SUPPORT_TABS = [
    { label: 'Mis tickets', to: '/support/tickets' },
    { label: 'Nuevo ticket', to: '/support/new' },
    { label: 'Base de conocimiento', to: '/support/knowledge-base' },
    { label: 'Contactar soporte', to: '/support/contact' },
]

/** Frame of the support center: header and section tabs. */
export default function SupportLayout() {
    return (
        <PageContainer>
            <ModuleHeader
                eyebrow="Comunicación"
                title="Centro de soporte"
                description="Crea solicitudes, sigue su estado y encuentra respuestas en la base de conocimiento."
                actions={
                    <ButtonComponent to="/support/new" leftIcon={<PlusIcon className="size-4" />}>
                        Nuevo ticket
                    </ButtonComponent>
                }
            />
            <SectionTabs tabs={SUPPORT_TABS} label="Secciones del centro de soporte" />
            <Outlet />
        </PageContainer>
    )
}
