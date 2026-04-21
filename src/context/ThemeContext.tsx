import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type ThemeContextType = {
    isDarkMode: boolean
    toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [isDarkMode, setIsDarkMode] = useState(false)

    useEffect(() => {
        const savedTheme = window.localStorage.getItem('theme')

        if (savedTheme === 'dark') {
            setIsDarkMode(true)
            return
        }

        if (savedTheme === 'light') {
            setIsDarkMode(false)
            return
        }

        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        setIsDarkMode(prefersDark)
    }, [])

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

export function useTheme() {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error('useTheme debe ser usado dentro de ThemeProvider')
    }
    return context
}
