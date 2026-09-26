import { useNavigate } from 'react-router-dom'
import ModuleHeader from '../../../components/common/page/ModuleHeader'
import PageContainer from '../../../components/common/page/PageContainer'
import { useWorkspace } from '../../../context/workspace-context'
import { getCatalogCategories } from '../../../navigation/navigation'
import FavoritesPanel from '../components/FavoritesPanel'
import ModuleCatalog from '../components/ModuleCatalog'
import { useWorkspaceInsights } from '../hooks/useWorkspaceInsights'

/** Workspace › Favorites: the pinned modules and the full catalog to pin more. */
export default function FavoritesPage() {
    const navigate = useNavigate()
    const { role } = useWorkspace()
    const insights = useWorkspaceInsights()

    return (
        <PageContainer>
            <ModuleHeader
                eyebrow="Espacio de trabajo"
                title="Favoritos"
                description="Tus módulos fijados aparecen primero en el inicio, en la barra lateral y en la paleta de comandos."
            />
            <FavoritesPanel favorites={insights.favoriteModules} suggestions={insights.suggestions} usageOf={insights.usageOf} />
            <ModuleCatalog title="Agregar favoritos" categories={getCatalogCategories(role)} usageOf={insights.usageOf} onOpen={navigate} />
        </PageContainer>
    )
}
