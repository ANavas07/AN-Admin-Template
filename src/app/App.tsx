import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from '../components/common/navbar/Navbar'
import { useTheme } from '../context/theme-context'
import { AppRoutes } from '../routes/AppRoutes'
import { DEMO_USER } from '../config/app.config'
import type { CurrentUser, UserRole } from '../config/app.config'

function App() {
  const { isDarkMode, toggleTheme } = useTheme()
  const location = useLocation()
  const [currentRole, setCurrentRole] = useState<UserRole>('admin')
  // PLANTILLA: sesion simulada. Reemplaza por la respuesta real de tu API.
  const [currentUser, setCurrentUser] = useState<CurrentUser>(DEMO_USER)
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem('token')))

  const shouldShowNavbar = useMemo(
    () => isAuthenticated && location.pathname !== '/login',
    [isAuthenticated, location.pathname]
  )

  async function handleLogin({ email }: { email: string; password: string }) {
    localStorage.setItem('token', 'demo-session-token')
    setCurrentUser((currentUserState) => ({
      ...currentUserState,
      email,
      name: email
        .split('@')[0]
        .replace(/[._-]+/g, ' ')
        .replace(/\b\w/g, (character) => character.toUpperCase()),
    }))
    setIsAuthenticated(true)
  }

  return (
    <div className="min-h-screen bg-(--color-bg) text-(--color-text) transition-colors duration-300">
      {shouldShowNavbar ? (
        <Navbar
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
          currentUser={currentUser}
          currentRole={currentRole}
          onChangeRole={setCurrentRole}
        />
      ) : null}

      <AppRoutes
        currentRole={currentRole}
        currentUser={currentUser}
        isAuthenticated={isAuthenticated}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        onLogin={handleLogin}
      />
    </div>
  )
}

export default App
