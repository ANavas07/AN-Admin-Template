import { useState } from 'react'
import MainPanel from '../components/admin-panel/MainPanel'
import { MODULE_CATEGORIES } from '../components/admin-panel/data/modules'
import { useNavigate } from 'react-router-dom'

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
    const navigate = useNavigate()

    const handleModuleClick = (url: string) => {
        setSelectedModuleId(url)
        navigate(url)
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
