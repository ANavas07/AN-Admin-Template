import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, ElementType, ReactNode } from 'react'
import { Link, type To } from 'react-router-dom'
import { cn } from '../../../utils/cn'

export type ButtonVariant =
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'danger'
    | 'success'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'
export type IconPosition = 'left' | 'right'

export type ButtonComponentProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant
    size?: ButtonSize
    leftIcon?: ReactNode
    rightIcon?: ReactNode
    startIcon?: ReactNode
    endIcon?: ReactNode
    icon?: ReactNode
    iconPosition?: IconPosition
    fullWidth?: boolean
    isLoading?: boolean
    loadingText?: string
    type?: 'button' | 'submit' | 'reset',
    //Props para navegación
    as?: ElementType // Permite renderizar el botón como otro elemento (ej: Link)
    to?: To;               // Para Link de React Router
    href?: string;         // Para anchor normal
    onClick?: () => void;  // Para botones normales
}

const variantClasses: Record<ButtonVariant, string> = {
    primary: 'border-transparent bg-brand-solid text-on-solid shadow-xs hover:bg-brand-solid/90 focus-visible:ring-brand/30',
    secondary:
        'border-line bg-canvas-subtle text-fg hover:border-line-strong hover:bg-canvas-subtle/70 focus-visible:ring-brand/25',
    outline:
        'border-line bg-surface text-fg shadow-xs hover:border-line-strong hover:bg-canvas-subtle/60 focus-visible:ring-brand/25',
    ghost: 'border-transparent bg-transparent text-fg-muted hover:bg-canvas-subtle hover:text-fg focus-visible:ring-brand/25',
    danger: 'border-transparent bg-danger-solid text-on-solid shadow-xs hover:bg-danger-solid/90 focus-visible:ring-danger/30',
    success: 'border-transparent bg-success-solid text-on-solid shadow-xs hover:bg-success-solid/90 focus-visible:ring-success/30',
}

const sizeClasses: Record<ButtonSize, string> = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-9 px-3.5 text-sm',
    lg: 'h-11 px-5 text-sm',
    icon: 'h-9 w-9 p-0 text-sm',
}

const spinnerSizeClasses: Record<ButtonSize, string> = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
    icon: 'h-4 w-4',
}

const ButtonComponent = forwardRef<HTMLButtonElement, ButtonComponentProps>(
    (
        {
            children,
            className,
            variant = 'primary',
            size = 'md',
            leftIcon,
            rightIcon,
            startIcon,
            endIcon,
            icon,
            iconPosition = 'left',
            fullWidth = false,
            isLoading = false,
            loadingText,
            disabled = false,
            type = 'button',
            as: Component = 'button',
            to,
            href,
            ...rest
        },
        ref
    ) => {
        const resolvedLeftIcon =
            leftIcon ?? startIcon ?? (iconPosition === 'left' ? icon : undefined)
        const resolvedRightIcon =
            rightIcon ?? endIcon ?? (iconPosition === 'right' ? icon : undefined)
        const isIconOnly = size === 'icon'
        const isDisabled = disabled || isLoading

        //Determinar el tipo de componente a renderizar (button, Link, a)
        const getFinalComponent = () => {
            // Si se especificó 'as', usamos ese
            if (Component !== 'button') return Component;
            // Si tiene 'to', es un Link de React Router
            if (to) return Link;
            // Si tiene 'href', es un anchor
            if (href) return 'a';
            // Por defecto, botón
            return 'button';
        }

        const FinalComponent = getFinalComponent() as ElementType

        const isNativeButton = FinalComponent === 'button'
        const linkProps = to ? { to } : href ? { href } : {}

        return (
            <FinalComponent
                ref={ref}
                {...(isNativeButton ? { type, disabled: isDisabled } : { 'aria-disabled': isDisabled })}
                {...linkProps}
                aria-busy={isLoading}
                className={cn(
                    'inline-flex items-center justify-center gap-2 rounded-md border font-medium',
                    'transition-colors',
                    'focus-visible:outline-none focus-visible:ring-3',
                    'disabled:cursor-not-allowed disabled:opacity-55',
                    // Icon-only buttons are square: their width comes from sizeClasses.icon
                    fullWidth ? 'w-full' : !isIconOnly && 'w-auto',
                    sizeClasses[size],
                    variantClasses[variant],
                    className
                )}
                {...rest}
            >
                {isLoading ? (
                    <span
                        className={cn(
                            'inline-block animate-spin rounded-full border-2 border-current border-r-transparent',
                            spinnerSizeClasses[size]
                        )}
                        aria-hidden="true"
                    />
                ) : null}

                {!isLoading && resolvedLeftIcon ? (
                    <span className="inline-flex shrink-0 items-center" aria-hidden="true">
                        {resolvedLeftIcon}
                    </span>
                ) : null}

                {isIconOnly
                    ? resolvedLeftIcon ?? children
                    : isLoading && loadingText
                        ? loadingText
                        : children}

                {!isLoading && resolvedRightIcon ? (
                    <span className="inline-flex shrink-0 items-center" aria-hidden="true">
                        {resolvedRightIcon}
                    </span>
                ) : null}
            </FinalComponent>
        )
    }
)

ButtonComponent.displayName = 'ButtonComponent'

export default ButtonComponent
