import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, ElementType, ReactNode } from 'react'
import { Link, type To } from 'react-router-dom'

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

function cn(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(' ')
}

const variantClasses: Record<ButtonVariant, string> = {
    primary:
        'border-transparent bg-brand text-white shadow-sm hover:bg-brand/90 focus-visible:ring-brand/30',
    secondary:
        'border-transparent bg-highlight text-white shadow-sm hover:bg-highlight/90 focus-visible:ring-highlight/30',
    outline:
        'border-(--color-border) bg-(--color-surface) text-(--color-text) hover:border-brand hover:text-brand focus-visible:ring-brand/25',
    ghost:
        'border-transparent bg-transparent text-(--color-text) hover:bg-(--color-bg-soft) hover:text-brand focus-visible:ring-brand/25',
    danger:
        'border-transparent bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-red-500/30 dark:bg-red-500 dark:hover:bg-red-600',
    success:
        'border-transparent bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 focus-visible:ring-emerald-500/30 dark:bg-emerald-500 dark:hover:bg-emerald-600',
}

const sizeClasses: Record<ButtonSize, string> = {
    sm: 'h-9 px-3 text-xs',
    md: 'h-11 px-4 text-sm',
    lg: 'h-12 px-5 text-base',
    icon: 'h-10 w-10 p-0 text-sm',
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
                    'inline-flex items-center justify-center gap-2 rounded-xl border font-semibold',
                    'transition-all duration-200 ease-out',
                    'focus-visible:outline-none focus-visible:ring-4',
                    'disabled:cursor-not-allowed disabled:opacity-60',
                    'active:scale-[0.98]',
                    fullWidth ? 'w-full' : 'w-auto',
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
