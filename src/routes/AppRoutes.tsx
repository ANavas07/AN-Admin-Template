import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { ModuleAccessGuard } from './ModuleAccessGuard'
import { appConfig } from '../config/app.config'
import type { CurrentUser, UserRole } from '../config/app.config'

// Rutas de entrada: se cargan con el bundle inicial porque son lo primero
// que ve el usuario (login -> dashboard) o las que responden a un error.
import Login from '../pages/auth/login/Login'
import AdminPanel from '../pages/workspace/dashboard/DashboardPage'
import NotFoundPage from '../pages/system/NotFoundPage'
import ForbiddenPage from '../pages/system/ForbiddenPage'
import ServerErrorPage from '../pages/system/ServerErrorPage'

// El resto de modulos se carga bajo demanda, agrupado como en la navegacion
// (src/navigation/modules.ts) y en src/pages/<seccion>/<modulo>.

// Espacio de trabajo
const ModulesPage = lazy(() => import('../pages/workspace/modules/ModulesPage'))
const FavoritesPage = lazy(() => import('../pages/workspace/favorites/FavoritesPage'))
const ActivityPage = lazy(() => import('../pages/workspace/activity/ActivityPage'))

// Operacion
const FileUploadCenter = lazy(() => import('../pages/operations/files/FileUploadCenter'))
const ProcessRepository = lazy(() => import('../pages/operations/process/ProcessRepository'))
const ProcessDesigner = lazy(() => import('../pages/operations/process/ProcessDesigner'))
const TasksLayout = lazy(() => import('../pages/operations/tasks/components/layout/TasksLayout'))
const PlanningLayout = lazy(() => import('../pages/operations/planning/components/layout/PlanningLayout'))
const GanttStandalone = lazy(() => import('../pages/operations/gantt/GanttStandalone'))

// Comunicacion
const MailPage = lazy(() => import('../pages/communication/mail/MailPage'))
const SupportLayout = lazy(() => import('../pages/communication/support/SupportLayout'))
const TicketsPage = lazy(() => import('../pages/communication/support/tickets/TicketsPage'))
const TicketDetailPage = lazy(() => import('../pages/communication/support/tickets/TicketDetailPage'))
const NewTicketPage = lazy(() => import('../pages/communication/support/new/NewTicketPage'))
const ContactPage = lazy(() => import('../pages/communication/support/contact/ContactPage'))

// Administracion
const ApiKeysPage = lazy(() => import('../pages/administration/api-keys/ApiKeysPage'))
const UserManagement = lazy(() => import('../pages/administration/users/UserManagement'))
const RbacLayout = lazy(() => import('../pages/administration/rbac/components/RbacLayout'))
const RolesPage = lazy(() => import('../pages/administration/rbac/roles/RolesPage'))
const PermissionsPage = lazy(() => import('../pages/administration/rbac/permissions/PermissionsPage'))
const GroupsPage = lazy(() => import('../pages/administration/rbac/groups/GroupsPage'))
const UserRolesPage = lazy(() => import('../pages/administration/rbac/users/UserRolesPage'))
const AuditLogPage = lazy(() => import('../pages/administration/rbac/audit/AuditLogPage'))

// Cuenta
const AccountLayout = lazy(() => import('../pages/account/AccountLayout'))
const ProfilePage = lazy(() => import('../pages/account/profile/ProfilePage'))
const PreferencesPage = lazy(() => import('../pages/account/preferences/PreferencesPage'))
const SecurityPage = lazy(() => import('../pages/account/security/SecurityPage'))

// Ayuda
const KnowledgeBasePage = lazy(() => import('../pages/help/knowledge-base/KnowledgeBasePage'))
const KnowledgeBaseBrowser = lazy(() => import('../pages/help/knowledge-base/components/KnowledgeBaseBrowser'))
const ArticlePage = lazy(() => import('../pages/help/knowledge-base/ArticlePage'))
const Playground = lazy(() => import('../pages/help/playground/Playground'))
const InputCatalog = lazy(() => import('../pages/help/playground/InputCatalog'))
const ButtonCatalog = lazy(() => import('../pages/help/playground/ButtonCatalog'))
const TableCatalog = lazy(() => import('../pages/help/playground/TableCatalog'))
const GanttCatalog = lazy(() => import('../pages/help/playground/GanttCatalog'))
const FormsCatalog = lazy(() => import('../pages/help/playground/FormsCatalog'))
const PopUpCatalog = lazy(() => import('../pages/help/playground/PopUpCatalog'))

// Sistema
const MaintenancePage = lazy(() => import('../pages/system/MaintenancePage'))

type LoginCredentials = {
  email: string
  password: string
}

type AppRoutesProps = {
  currentRole: UserRole
  currentUser: CurrentUser
  isAuthenticated: boolean
  isDarkMode: boolean
  onToggleTheme: () => void
  onLogin: (credentials: LoginCredentials) => Promise<void> | void
}

function RouteFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <span className="text-sm text-fg-muted">Cargando modulo...</span>
    </div>
  )
}

export function AppRoutes({
  currentRole,
  currentUser,
  isAuthenticated,
  isDarkMode,
  onToggleTheme,
  onLogin,
}: AppRoutesProps) {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login
                onLogin={onLogin}
                isDarkMode={isDarkMode}
                onToggleTheme={onToggleTheme}
              />
            )
          }
        />
        {/* Vista previa de la pantalla de mantenimiento (se activa con VITE_MAINTENANCE_MODE) */}
        <Route path="/maintenance" element={<MaintenancePage />} />

        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <AdminPanel
                userRole={currentRole}
                userName={currentUser.name}
                userEmail={currentUser.email}
                organization={appConfig.organization}
                identifier={currentUser.id}
                location={appConfig.location}
              />
            }
          />
          <Route path="/403" element={<ForbiddenPage currentRole={currentRole} />} />
          <Route path="/500" element={<ServerErrorPage />} />

          {/* Cada ruta de un modulo con requiredRoles responde 403 a los demas roles */}
          <Route element={<ModuleAccessGuard role={currentRole} />}>
            <Route path="/workspace" element={<Navigate to="/workspace/modules" replace />} />
            <Route path="/workspace/modules" element={<ModulesPage />} />
            <Route path="/workspace/favorites" element={<FavoritesPage />} />
            <Route path="/workspace/activity" element={<ActivityPage />} />

            <Route path="/files" element={<FileUploadCenter />} />
            <Route path="/process" element={<ProcessRepository />} />
            <Route path="/process/:id" element={<ProcessDesigner />} />
            <Route path="/tasks" element={<TasksLayout />} />
            <Route path="/planning" element={<PlanningLayout />} />

            <Route path="/mail" element={<Navigate to="/mail/inbox" replace />} />
            <Route path="/mail/:folder/:threadId?" element={<MailPage />} />

            <Route path="/support" element={<SupportLayout />}>
              <Route index element={<Navigate to="/support/tickets" replace />} />
              <Route path="tickets" element={<TicketsPage />} />
              <Route path="tickets/:ticketId" element={<TicketDetailPage />} />
              <Route path="new" element={<NewTicketPage />} />
              <Route path="knowledge-base" element={<KnowledgeBaseBrowser />} />
              <Route path="contact" element={<ContactPage />} />
            </Route>

            <Route path="/admin/api-keys" element={<ApiKeysPage />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/superuser/rbac" element={<RbacLayout />}>
              <Route index element={<Navigate to="/superuser/rbac/roles" replace />} />
              <Route path="roles" element={<RolesPage />} />
              <Route path="permissions" element={<PermissionsPage />} />
              <Route path="groups" element={<GroupsPage />} />
              <Route path="users" element={<UserRolesPage />} />
              <Route path="audit" element={<AuditLogPage />} />
            </Route>

            <Route path="/help/knowledge-base" element={<KnowledgeBasePage />} />
            <Route path="/help/knowledge-base/:slug" element={<ArticlePage />} />

            <Route path="/account" element={<AccountLayout />}>
              <Route index element={<Navigate to="/account/profile" replace />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="preferences" element={<PreferencesPage />} />
              <Route path="security" element={<SecurityPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Vistas publicas de demostracion */}
        <Route path="/gantt" element={<GanttStandalone />} />
        <Route path="/playground" element={<Playground />}>
          <Route index element={<Navigate to="/playground/inputs" replace />} />
          <Route path="inputs" element={<InputCatalog />} />
          <Route path="buttons" element={<ButtonCatalog />} />
          <Route path="tables" element={<TableCatalog />} />
          <Route path="gantt" element={<GanttCatalog />} />
          <Route path="forms" element={<FormsCatalog />} />
          <Route path="modals" element={<PopUpCatalog />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
