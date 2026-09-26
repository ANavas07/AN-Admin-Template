import { useEffect, useState, type ReactNode } from 'react'
import CommandPalette from './CommandPalette'
import { CommandPaletteContext } from './command-palette-context'

/**
 * Makes the command palette available from any page: Ctrl + K (⌘ + K on
 * macOS) toggles it, and `useCommandPalette().open()` opens it from buttons.
 */
export function CommandPaletteProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === 'k') {
                event.preventDefault()
                setIsOpen((current) => !current)
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    const open = () => setIsOpen(true)
    const close = () => setIsOpen(false)

    return (
        <CommandPaletteContext.Provider value={{ isOpen, open, close }}>
            {children}
            {isOpen ? <CommandPalette onClose={close} /> : null}
        </CommandPaletteContext.Provider>
    )
}
