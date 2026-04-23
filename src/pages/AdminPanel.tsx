import { useState } from 'react'
import MainPanel from '../components/admin-panel/MainPanel'
import { MODULE_CATEGORIES } from '../components/admin-panel/data/modules'

type AdminPanelProps = {
    userRole: string
    userName: string
    userEmail: string
    organization: string
    identifier: string
    location: string
}

export default function AdminPanel({
    userRole,
    userName,
    userEmail,
    organization,
    identifier,
    location,
}: AdminPanelProps) {
    const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null)

    const handleModuleClick = (moduleId: string) => {
        setSelectedModuleId(moduleId)
        console.log(`Módulo seleccionado: ${moduleId}`)
        // Aquí puedes agregar lógica para navegar a un modal, página detallada, etc.
    }

    return (
        <>
            <MainPanel
                categories={MODULE_CATEGORIES}
                userRole={userRole}
                userName={userName}
                userEmail={userEmail}
                organization={organization}
                identifier={identifier}
                location={location}
                onModuleClick={handleModuleClick}
            />

            {selectedModuleId ? (
                <span className="sr-only">Selected module: {selectedModuleId}</span>
            ) : null}
        </>
    )
}
