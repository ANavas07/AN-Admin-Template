import { useEffect, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import AppSidebar from '../sidebar/AppSidebar'
import { ShellContext } from './shell-context'

const COLLAPSED_STORAGE_KEY = 'sidebar:collapsed'
/** Same breakpoint as Tailwind's `lg`, where the sidebar stops being a drawer */
const DESKTOP_QUERY = '(min-width: 64rem)'

function readCollapsed() {
    try {
        return localStorage.getItem(COLLAPSED_STORAGE_KEY) === 'true'
    } catch {
        return false
    }
}

type AppShellProps = {
    /** Renders the top bar; receives the sidebar toggle */
    renderNavbar: (onToggleSidebar: () => void) => ReactNode
    children: ReactNode
}

/**
 * Authenticated layout: top navbar, collapsible sidebar and the page. The
 * collapsed state is a per-viewer preference kept in localStorage.
 */
export default function AppShell({ renderNavbar, children }: AppShellProps) {
    const [isCollapsed, setIsCollapsed] = useState(readCollapsed)
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const { pathname } = useLocation()

    // A new page starts at the top (the browser keeps the previous scroll otherwise)
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [pathname])

    function setCollapsed(next: boolean) {
        setIsCollapsed(next)
        try {
            localStorage.setItem(COLLAPSED_STORAGE_KEY, String(next))
        } catch {
            // Preference simply not remembered
        }
    }

    function toggleCollapsed() {
        setCollapsed(!isCollapsed)
    }

    function toggleSidebar() {
        if (window.matchMedia(DESKTOP_QUERY).matches) toggleCollapsed()
        else setIsMobileOpen((current) => !current)
    }

    return (
        <ShellContext.Provider value={{ isSidebarCollapsed: isCollapsed, setSidebarCollapsed: setCollapsed }}>
            {/* First tab stop: jump over the navbar and the sidebar */}
            <a
                href="#contenido"
                className="sr-only rounded-md bg-brand-solid px-3 py-2 text-sm font-medium text-on-solid focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-(--z-toast)"
            >
                Saltar al contenido
            </a>
            {renderNavbar(toggleSidebar)}
            <div className="flex">
                <AppSidebar
                    isCollapsed={isCollapsed}
                    onToggleCollapsed={toggleCollapsed}
                    isMobileOpen={isMobileOpen}
                    onCloseMobile={() => setIsMobileOpen(false)}
                />
                <div id="contenido" tabIndex={-1} className="min-w-0 flex-1 focus:outline-none">
                    {children}
                </div>
            </div>
        </ShellContext.Provider>
    )
}
