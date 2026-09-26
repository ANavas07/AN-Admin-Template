import { useNavigate } from 'react-router-dom'
import ModuleHeader from '../../../components/common/page/ModuleHeader'
import PageContainer from '../../../components/common/page/PageContainer'
import { useWorkspace } from '../../../context/workspace-context'
import { getCatalogCategories } from '../../../navigation/navigation'
import ModuleCatalog from '../components/ModuleCatalog'
import { useWorkspaceInsights } from '../hooks/useWorkspaceInsights'

/** Workspace › Modules: every module the role can open, with favorites. */
export default function ModulesPage() {
    const navigate = useNavigate()
    const { role } = useWorkspace()
    const { usageOf } = useWorkspaceInsights()

    return (
        <PageContainer>
            <ModuleHeader
                eyebrow="Espacio de trabajo"
                title="Módulos"
                description="Abre cualquier módulo disponible para tu rol y marca con la estrella los que usas a diario."
            />
            <ModuleCatalog categories={getCatalogCategories(role)} usageOf={usageOf} onOpen={navigate} />
        </PageContainer>
    )
}
