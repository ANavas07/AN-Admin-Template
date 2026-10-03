import { Outlet } from 'react-router-dom'
import SectionTabs from '../../../../components/common/navigation/SectionTabs'
import PageContainer from '../../../../components/common/page/PageContainer'
import { useWorkspace } from '../../../../context/workspace-context'
import { getModuleById, hasModuleAccess } from '../../../../navigation/navigation'

/**
 * Frame of Roles, Permissions, Groups, User assignment and Audit: one row of
 * tabs (like Account and Support) instead of a second sidebar. Tabs come from
 * the navigation registry and respect the active role.
 */
export default function RbacLayout() {
  const { role } = useWorkspace()
  const rbac = getModuleById('rbac')
  const audit = getModuleById('audit')
  const tabs = [
    ...(rbac && hasModuleAccess(rbac, role) ? (rbac.children ?? []) : []).map((page) => ({ label: page.title, to: page.url })),
    ...(audit?.url && hasModuleAccess(audit, role) ? [{ label: 'Auditoría', to: audit.url }] : []),
  ]

  return (
    <PageContainer>
      <SectionTabs tabs={tabs} label="Secciones de roles y permisos" />
      <Outlet />
    </PageContainer>
  )
}
