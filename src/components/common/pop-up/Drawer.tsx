import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'
import { CloseIcon } from '../../../icons/icons'
import ButtonComponent from '../../ui/buttons/ButtonComponent'
import { cn } from '../../../utils/cn'

type DrawerProps = {
    isOpen: boolean
    onClose: () => void
    title: ReactNode
    description?: ReactNode
    /** Extra content in the header, below the title (badges, meta) */
    meta?: ReactNode
    footer?: ReactNode
    children: ReactNode
    size?: 'md' | 'lg'
}

const sizeClasses = {
    md: 'sm:max-w-md',
    lg: 'sm:max-w-xl',
}

/**
 * Side sheet for record details (API keys, tickets). Keeps the list visible
 * behind it; full width on phones. Closes with Escape or the overlay.
 */
export default function Drawer({ isOpen, onClose, title, description, meta, footer, children, size = 'lg' }: DrawerProps) {
    const titleId = useId()
    const panelRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!isOpen) return
        const previousFocus = document.activeElement as HTMLElement | null
        panelRef.current?.focus()

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handleKeyDown)
        document.body.style.overflow = 'hidden'
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = ''
            previousFocus?.focus()
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    return createPortal(
        <div className="fixed inset-0 z-(--z-modal) flex justify-end" role="dialog" aria-modal="true" aria-labelledby={titleId}>
            <div className="absolute inset-0 bg-overlay" onClick={onClose} aria-hidden="true" />
            <div
                ref={panelRef}
                tabIndex={-1}
                className={cn(
                    'relative flex h-full w-full flex-col border-l border-line bg-surface shadow-2xl focus:outline-none',
                    sizeClasses[size]
                )}
            >
                <header className="flex shrink-0 items-start justify-between gap-3 border-b border-line px-5 py-4">
                    <div className="min-w-0">
                        <h2 id={titleId} className="truncate text-base font-semibold text-fg">
                            {title}
                        </h2>
                        {description ? <p className="mt-0.5 text-sm text-fg-muted">{description}</p> : null}
                        {meta ? <div className="mt-2 flex flex-wrap items-center gap-2">{meta}</div> : null}
                    </div>
                    <ButtonComponent variant="ghost" size="icon" onClick={onClose} aria-label="Cerrar" className="shrink-0">
                        <CloseIcon className="size-4" />
                    </ButtonComponent>
                </header>
                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
                {footer ? (
                    <footer className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-line bg-surface-muted px-5 py-3">
                        {footer}
                    </footer>
                ) : null}
            </div>
        </div>,
        document.body
    )
}
