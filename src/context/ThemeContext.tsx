import { useEffect, useState, type ReactNode } from 'react'
import { ThemeContext } from './theme-context'

// Se resuelve una sola vez, en el inicializador perezoso de useState, para no
// arrancar en claro y corregir despues (evita el parpadeo y el setState
// sincrono dentro de un efecto).
function getInitialTheme(): boolean {
    const savedTheme = window.localStorage.getItem('theme')

    if (savedTheme === 'dark') return true
    if (savedTheme === 'light') return false

    return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [isDarkMode, setIsDarkMode] = useState(getInitialTheme)

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDarkMode)
        window.localStorage.setItem('theme', isDarkMode ? 'dark' : 'light')
    }, [isDarkMode])

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme: () => setIsDarkMode((prev) => !prev) }}>
            {children}
        </ThemeContext.Provider>
    )
}
