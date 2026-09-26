import ModuleHeader from '../../../components/common/page/ModuleHeader'
import PageContainer from '../../../components/common/page/PageContainer'
import ButtonComponent from '../../../components/ui/buttons/ButtonComponent'
import KnowledgeBaseBrowser from './components/KnowledgeBaseBrowser'

/** Help › Knowledge base. */
export default function KnowledgeBasePage() {
    return (
        <PageContainer>
            <ModuleHeader
                eyebrow="Ayuda"
                title="Base de conocimiento"
                description="Guías de uso, respuestas frecuentes y buenas prácticas de la plataforma."
                actions={
                    <ButtonComponent variant="outline" to="/support/new">
                        Contactar a soporte
                    </ButtonComponent>
                }
            />
            <KnowledgeBaseBrowser />
        </PageContainer>
    )
}
