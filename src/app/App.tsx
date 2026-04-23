import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
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
  const location = useLocation()
  const [currentRole, setCurrentRole] = useState<UserRole>('admin')
  const [currentUser, setCurrentUser] = useState<CurrentUser>({
    id: '1',
    name: 'Juan Garcia',
    email: 'juan@tournaments.com',
    roles: ['admin', 'organizer', 'analyst'],
  })
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
