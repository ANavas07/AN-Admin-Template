import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'
import ButtonComponent from '../../ui/buttons/ButtonComponent'
import FormRender from '../forms/FormRender'
import type { FormConfig, FormValues } from '../forms/FormRender'

export type PopUpSize = 'sm' | 'md' | 'lg' | 'xl'

export type PopUpProps = {
    isOpen: boolean
    onClose: () => void
    title?: string
    description?: string
    size?: PopUpSize
    closeOnOverlay?: boolean
    // Form mode
    formConfig?: FormConfig
    initialValues?: FormValues
    isSubmitting?: boolean
    onSubmit?: (values: FormValues) => void | Promise<void>
    onChange?: (values: FormValues) => void
    // Custom content mode
    children?: ReactNode
    footer?: ReactNode
}

function cn(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(' ')
}

const sizeClasses: Record<PopUpSize, string> = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
}

function CloseIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
        </svg>
    )
}

export default function PopUp({
    isOpen,
    onClose,
    title,
    description,
    size = 'md',
    closeOnOverlay = true,
    formConfig,
    initialValues,
    isSubmitting,
    onSubmit,
    onChange,
    children,
    footer,
}: PopUpProps) {
    useEffect(() => {
        if (!isOpen) return

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') onClose()
        }

        document.addEventListener('keydown', handleKeyDown)
        document.body.style.overflow = 'hidden'

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = ''
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    const hasHeader = title || description
    const isFormMode = Boolean(formConfig && onSubmit)

    return createPortal(
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'popup-title' : undefined}
            aria-describedby={description ? 'popup-description' : undefined}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={closeOnOverlay ? onClose : undefined}
                aria-hidden="true"
            />

            {/* Dialog */}
            <div
                className={cn(
                    'relative z-10 w-full rounded-2xl border border-(--color-border)',
                    'bg-(--color-surface) shadow-2xl',
                    sizeClasses[size]
                )}
            >
                {/* Header */}
                {hasHeader && (
                    <div className="flex items-start justify-between gap-3 border-b border-(--color-border) px-6 py-4">
                        <div className="min-w-0">
                            {title && (
                                <h2
                                    id="popup-title"
                                    className="text-base font-semibold text-(--color-text)"
                                >
                                    {title}
                                </h2>
                            )}
                            {description && (
                                <p
                                    id="popup-description"
                                    className="mt-1 text-sm text-(--color-text-muted)"
                                >
                                    {description}
                                </p>
                            )}
                        </div>
                        <ButtonComponent
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            aria-label="Cerrar"
                            className="shrink-0"
                        >
                            <CloseIcon />
                        </ButtonComponent>
                    </div>
                )}

                {/* Close button when there's no header */}
                {!hasHeader && (
                    <ButtonComponent
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        aria-label="Cerrar"
                        className="absolute right-3 top-3 z-10"
                    >
                        <CloseIcon />
                    </ButtonComponent>
                )}

                {/* Body */}
                {isFormMode ? (
                    /* Form mode: FormRender ocupa todo el cuerpo, su card ES el body */
                    <div className="[&>form]:rounded-t-none [&>form]:border-0 [&>form]:shadow-none [&>form]:bg-transparent">
                        <FormRender
                            config={formConfig!}
                            initialValues={initialValues}
                            isSubmitting={isSubmitting}
                            onChange={onChange}
                            onSubmit={onSubmit!}
                        />
                    </div>
                ) : (
                    <>
                        {/* Custom content mode */}
                        <div className="px-6 py-5 text-sm text-(--color-text)">
                            {children}
                        </div>

                        {footer && (
                            <div className="flex items-center justify-end gap-3 border-t border-(--color-border) px-6 py-4">
                                {footer}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>,
        document.body
    )
}
