import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import AdminPanel from '../pages/AdminPanel'
import InputCatalog from '../pages/playground/InputCatalog'
import ButtonCatalog from '../pages/playground/ButtonCatalog'
import TableCatalog from '../pages/playground/TableCatalog'
import Playground from '../pages/playground/Playground'
import GanttCatalog from '../pages/playground/GanttCatalog'
import GanttStandalone from '../pages/gantt/GanttStandalone'
import FormsCatalog from '../pages/playground/FormsCatalog'
import MainContentSP from '../pages/superuser/MainContentSP'
import Login from '../pages/login/Login'
import PopUpCatalog from '../pages/playground/PopUpCatalog'

type UserRole = 'admin' | 'organizer' | 'analyst' | 'viewer'

type CurrentUser = {
  id: string
  name: string
  email: string
  roles: UserRole[]
}

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

export function AppRoutes({
  currentRole,
  currentUser,
  isAuthenticated,
  isDarkMode,
  onToggleTheme,
  onLogin,
}: AppRoutesProps) {
  return (
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
              organization="CRM Tournaments - Panel Central"
              identifier={currentUser.id}
              location="MATRIZ - Bogota"
            />
          }
        />
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

      <Route path="/super" element={<MainContentSP />} />
      <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
    </Routes>
  )
}
