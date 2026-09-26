import { useEffect, useState, type ReactNode } from 'react'
import { ThemeContext } from './theme-context'
import type { ThemePreference } from './theme-context'

const STORAGE_KEY = 'theme'
const DARK_QUERY = '(prefers-color-scheme: dark)'

// Se resuelve una sola vez, en el inicializador perezoso de useState, para no
// arrancar en claro y corregir despues (evita el parpadeo y el setState
// sincrono dentro de un efecto). Sin valor guardado se sigue al sistema.
function getInitialPreference(): ThemePreference {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    return saved === 'dark' || saved === 'light' || saved === 'system' ? saved : 'system'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [preference, setPreference] = useState<ThemePreference>(getInitialPreference)
    const [systemIsDark, setSystemIsDark] = useState(() => window.matchMedia(DARK_QUERY).matches)
    const isDarkMode = preference === 'system' ? systemIsDark : preference === 'dark'

    // Follow operating system changes while the preference is 'system'
    useEffect(() => {
        const media = window.matchMedia(DARK_QUERY)
        const handleChange = (event: MediaQueryListEvent) => setSystemIsDark(event.matches)
        media.addEventListener('change', handleChange)
        return () => media.removeEventListener('change', handleChange)
    }, [])

    useEffect(() => {
        const root = document.documentElement
        // Both hooks are supported by theme.css: the class (Tailwind `dark:`) and the attribute
        root.classList.toggle('dark', isDarkMode)
        root.dataset.theme = isDarkMode ? 'dark' : 'light'
    }, [isDarkMode])

    useEffect(() => {
        window.localStorage.setItem(STORAGE_KEY, preference)
    }, [preference])

    return (
        <ThemeContext.Provider
            value={{
                isDarkMode,
                // The quick toggle always sets an explicit theme, the opposite of the one shown
                toggleTheme: () => setPreference(isDarkMode ? 'light' : 'dark'),
                preference,
                setPreference,
            }}
        >
            {children}
        </ThemeContext.Provider>
    )
}
