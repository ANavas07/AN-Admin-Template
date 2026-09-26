import ModuleHeader from '../../../components/common/page/ModuleHeader'
import PageContainer from '../../../components/common/page/PageContainer'
import ActivityMetrics from '../components/ActivityMetrics'
import RecentPanel from '../components/RecentPanel'
import VisitLog from '../components/VisitLog'
import { useWorkspaceInsights } from '../hooks/useWorkspaceInsights'

/** Workspace › Recent activity: navigation history, visit log and usage metrics. */
export default function ActivityPage() {
    const insights = useWorkspaceInsights()
    return (
        <PageContainer>
            <ModuleHeader
                eyebrow="Espacio de trabajo"
                title="Actividad reciente"
                description="Tu historial de navegación y cómo usas cada módulo."
            />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                <RecentPanel className="lg:col-span-5" />
                <VisitLog className="lg:col-span-7" />
            </div>
            <ActivityMetrics insights={insights} />
        </PageContainer>
    )
}
