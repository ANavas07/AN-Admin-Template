import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { appConfig } from '../config/app.config'
import type { CurrentUser, UserRole } from '../config/app.config'

// Rutas de entrada: se cargan con el bundle inicial porque son lo primero
// que ve el usuario (login -> dashboard).
import Login from '../pages/login/Login'
import AdminPanel from '../pages/AdminPanel'

// El resto de modulos se carga bajo demanda. Asi el home no arrastra el
// codigo de Gantt, BPMN, dnd-kit, tablas ni el playground.
const UserManagement = lazy(() => import('../pages/users/UserManagement'))
const FileUploadCenter = lazy(() => import('../pages/files/FileUploadCenter'))
const ProcessRepository = lazy(() => import('../pages/process/ProcessRepository'))
const ProcessDesigner = lazy(() => import('../pages/process/ProcessDesigner'))
const TasksLayout = lazy(() => import('../pages/tasks/components/layout/TasksLayout'))
const PlanningLayout = lazy(() => import('../pages/planning/components/layout/PlanningLayout'))
const GanttStandalone = lazy(() => import('../pages/gantt/GanttStandalone'))
const CvAnalyzer = lazy(() => import('../pages/cv_analyzer/CvAnalyzer'))

const RbacLayout = lazy(() => import('../pages/superuser/rbac/components/RbacLayout'))
const RolesPage = lazy(() => import('../pages/superuser/rbac/roles/RolesPage'))
const PermissionsPage = lazy(() => import('../pages/superuser/rbac/permissions/PermissionsPage'))
const GroupsPage = lazy(() => import('../pages/superuser/rbac/groups/GroupsPage'))
const UserRolesPage = lazy(() => import('../pages/superuser/rbac/users/UserRolesPage'))
const AuditLogPage = lazy(() => import('../pages/superuser/rbac/audit/AuditLogPage'))

const Playground = lazy(() => import('../pages/playground/Playground'))
const InputCatalog = lazy(() => import('../pages/playground/InputCatalog'))
const ButtonCatalog = lazy(() => import('../pages/playground/ButtonCatalog'))
const TableCatalog = lazy(() => import('../pages/playground/TableCatalog'))
const GanttCatalog = lazy(() => import('../pages/playground/GanttCatalog'))
const FormsCatalog = lazy(() => import('../pages/playground/FormsCatalog'))
const PopUpCatalog = lazy(() => import('../pages/playground/PopUpCatalog'))

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
      <span className="text-sm text-(--color-text-muted)">Cargando modulo...</span>
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

        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
          <Route
            path="/"
            element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
          />
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
          <Route path="/users" element={<UserManagement />} />
          <Route path="/files" element={<FileUploadCenter />} />
          <Route path="/process" element={<ProcessRepository />} />
          <Route path="/process/:id" element={<ProcessDesigner />} />
          <Route path="/tasks" element={<TasksLayout />} />
          <Route path="/planning" element={<PlanningLayout />} />
          <Route path="/cvanalyzer" element={<CvAnalyzer />} />

          <Route path="/superuser/rbac" element={<RbacLayout />}>
            <Route index element={<Navigate to="/superuser/rbac/roles" replace />} />
            <Route path="roles" element={<RolesPage />} />
            <Route path="permissions" element={<PermissionsPage />} />
            <Route path="groups" element={<GroupsPage />} />
            <Route path="users" element={<UserRolesPage />} />
            <Route path="audit" element={<AuditLogPage />} />
          </Route>
        </Route>

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
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
        />
      </Routes>
    </Suspense>
  )
}
