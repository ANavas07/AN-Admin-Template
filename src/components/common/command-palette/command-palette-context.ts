import { createContext, useContext } from 'react'

export type CommandPaletteContextType = {
    isOpen: boolean
    open: () => void
    close: () => void
}

export const CommandPaletteContext = createContext<CommandPaletteContextType | undefined>(undefined)

export function useCommandPalette() {
    const context = useContext(CommandPaletteContext)
    if (context === undefined) {
        throw new Error('useCommandPalette debe ser usado dentro de CommandPaletteProvider')
    }
    return context
}
