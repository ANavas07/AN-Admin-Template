import { Outlet } from 'react-router-dom'
import ModuleHeader from '../../components/common/page/ModuleHeader'
import PageContainer from '../../components/common/page/PageContainer'
import SectionTabs from '../../components/common/navigation/SectionTabs'
import { getModuleById } from '../../navigation/navigation'

// Tabs come from the navigation registry, like the sidebar entries
const ACCOUNT_TABS = ['profile', 'preferences', 'security'].flatMap((id) => {
    const module = getModuleById(id)
    return module?.url ? [{ label: module.title, to: module.url }] : []
})

/** Frame shared by Profile, Preferences and Security. */
export default function AccountLayout() {
    return (
        <PageContainer width="narrow">
            <ModuleHeader
                eyebrow="Cuenta"
                title="Tu cuenta"
                description="Datos personales, preferencias de uso y seguridad de acceso."
            />
            <SectionTabs tabs={ACCOUNT_TABS} label="Secciones de la cuenta" />
            <Outlet />
        </PageContainer>
    )
}
