import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from '../components/common/navbar/Navbar'
import AppShell from '../components/common/layout/AppShell'
import { CommandPaletteProvider } from '../components/common/command-palette/CommandPaletteProvider'
import { WorkspaceProvider } from '../context/WorkspaceContext'
import { AccountProvider } from '../context/AccountContext'
import MaintenancePage from '../pages/system/MaintenancePage'
import { AppErrorBoundary } from './AppErrorBoundary'
import { useTheme } from '../context/theme-context'
import { AppRoutes } from '../routes/AppRoutes'
import { appConfig, DEMO_USER } from '../config/app.config'
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

  // Profile details saved in Account › Profile override the session defaults
  function handleProfileChange(profile: Partial<CurrentUser>) {
    const defined = Object.fromEntries(Object.entries(profile).filter(([, value]) => value !== undefined && value !== ''))
    setCurrentUser((current) => ({ ...current, ...defined }))
  }

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

  const routes = (
    <AppRoutes
      currentRole={currentRole}
      currentUser={currentUser}
      isAuthenticated={isAuthenticated}
      isDarkMode={isDarkMode}
      onToggleTheme={toggleTheme}
      onLogin={handleLogin}
    />
  )

  // Maintenance mode replaces the whole application (see appConfig.maintenance)
  if (appConfig.maintenance.enabled) return <MaintenancePage />

  return (
    <div className="min-h-screen bg-canvas text-fg transition-colors duration-300">
      {shouldShowNavbar ? (
        // Account, workspace (favorites, history) and command palette only exist in a session
        <AccountProvider userId={currentUser.id} onProfileChange={handleProfileChange}>
          <WorkspaceProvider user={currentUser} role={currentRole}>
            <CommandPaletteProvider>
              <AppShell
                renderNavbar={(onToggleSidebar) => (
                  <Navbar
                    isDarkMode={isDarkMode}
                    onToggleTheme={toggleTheme}
                    currentUser={currentUser}
                    currentRole={currentRole}
                    onChangeRole={setCurrentRole}
                    onToggleSidebar={onToggleSidebar}
                  />
                )}
              >
                <AppErrorBoundary resetKey={location.pathname}>{routes}</AppErrorBoundary>
              </AppShell>
            </CommandPaletteProvider>
          </WorkspaceProvider>
        </AccountProvider>
      ) : (
        routes
      )}
    </div>
  )
}

export default App
