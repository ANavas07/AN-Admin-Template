import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import AdminPanel from '../features/admin-panel/AdminPanel'
import InputCatalog from '../pages/playground/InputCatalog'
import ButtonCatalog from '../pages/playground/ButtonCatalog'
import TableCatalog from '../pages/playground/TableCatalog'
import Playground from '../pages/playground/Playground'
import GanttCatalog from '../pages/playground/GanttCatalog'
import GanttStandalone from '../pages/gantt/GanttStandalone'
import FormsCatalog from '../pages/playground/FormsCatalog'
import MainContentSP from '../pages/superuser/MainContentSP'

type UserRole = 'admin' | 'organizer' | 'analyst' | 'viewer'

type CurrentUser = {
  id: string
  name: string
  email: string
  roles: UserRole[]
}

type AppRoutesProps = {
  currentRole: UserRole
  currentUser: CurrentUser
  isAuthenticated: boolean
}

export function AppRoutes({ currentRole, currentUser, isAuthenticated }: AppRoutesProps) {
  return (
    <Routes>
      <Route path="/login" element={<div>Login page</div>} />

      <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={
            <AdminPanel
              userRole={currentRole}
              userName={currentUser.name}
              userEmail={currentUser.email}
              organization="CRM Tournaments - Panel Central"
              identifier={currentUser.id}
              location="MATRIZ - Bogotá"
            />
          }
        />
      </Route>

      {/* COMPONENTES DE ESTILOS REUTILIZABLES */}
      <Route path="/gantt" element={<GanttStandalone />} />
      <Route path="/playground" element={<Playground />}>
        <Route index element={<Navigate to="/playground/inputs" replace />} />
        <Route path="inputs" element={<InputCatalog />} />
        <Route path="buttons" element={<ButtonCatalog />} />
        <Route path="tables" element={<TableCatalog />} />
        <Route path="gantt" element={<GanttCatalog />} />
        <Route path="forms" element={<FormsCatalog />} />
      </Route>

      {/*PANEL DE SUPERUSUARIO*/}
      <Route path="/super" element={<MainContentSP/>}>
          
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
