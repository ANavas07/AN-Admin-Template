import { useState } from 'react'
import Navbar from '../components/common/navbar/Navbar'
import { useTheme } from '../context/ThemeContext'
import { AppRoutes } from '../routes/AppRoutes'

type UserRole = 'admin' | 'organizer' | 'analyst' | 'viewer'

type CurrentUser = {
  id: string
  name: string
  email: string
  roles: UserRole[]
}

function App() {
  const { isDarkMode, toggleTheme } = useTheme()
  const [currentRole, setCurrentRole] = useState<UserRole>('admin')
  const [currentUser] = useState<CurrentUser>({
    id: '1',
    name: 'Juan García',
    email: 'juan@tournaments.com',
    roles: ['admin', 'organizer', 'analyst'],
  })

  // TODO: reemplazar con estado real de autenticación (ej: useAuthContext)
  const isAuthenticated = true

  return (
    <div className="min-h-screen bg-(--color-bg) text-(--color-text) transition-colors duration-300">
      <Navbar
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        currentUser={currentUser}
        currentRole={currentRole}
        onChangeRole={setCurrentRole}
      />
      <AppRoutes
        currentRole={currentRole}
        currentUser={currentUser}
        isAuthenticated={isAuthenticated}
      />
    </div>
  )
}

export default App
