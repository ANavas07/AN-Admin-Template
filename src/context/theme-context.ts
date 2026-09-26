import { createContext, useContext } from 'react'

/** 'system' follows the operating system setting and updates when it changes. */
export type ThemePreference = 'light' | 'dark' | 'system'

export type ThemeContextType = {
    isDarkMode: boolean
    toggleTheme: () => void
    preference: ThemePreference
    setPreference: (preference: ThemePreference) => void
}

// El contexto y el hook viven aparte del provider para que el archivo del
// componente solo exporte componentes (requisito de react-refresh / HMR).
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error('useTheme debe ser usado dentro de ThemeProvider')
    }
    return context
}
