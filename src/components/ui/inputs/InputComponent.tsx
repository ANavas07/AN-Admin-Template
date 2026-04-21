import { forwardRef, useId } from 'react'
import type { ChangeEvent, InputHTMLAttributes, ReactNode } from 'react'

type InputSize = 'sm' | 'md' | 'lg'
type InputVariant = 'default' | 'search' | 'rounded'
type InputPosition = 'relative' | 'absolute' | 'fixed'
type IconPosition = 'left' | 'right'

type InputComponentProps = Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'size' | 'onChange' | 'placeholder'
> & {
    inpPlaceHolder?: string
    placeholder?: string
    value: string
    onChange: (e: ChangeEvent<HTMLInputElement>) => void
    label?: string
    hint?: string
    error?: string
    requiredMark?: boolean
    className?: string
    containerClassName?: string
    size?: InputSize
    variant?: InputVariant
    position?: InputPosition
    showSearchIcon?: boolean
    leftIcon?: ReactNode
    rightIcon?: ReactNode
    iconPosition?: IconPosition
    fullWidth?: boolean
}

function cn(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(' ')
}

const InputComponent = forwardRef<HTMLInputElement, InputComponentProps>(
    (
        {
            inpPlaceHolder,
            placeholder,
            value,
            onChange,
            label,
            hint,
            error,
            requiredMark = false,
            className,
            containerClassName,
            size = 'md',
            variant = 'default',
            position = 'relative',
            showSearchIcon = false,
            leftIcon,
            rightIcon,
            iconPosition = 'right',
            fullWidth = true,
            disabled = false,
            id,
            ...rest
        },
        ref
    ) => {
        const fallbackId = useId()
        const inputId = id ?? fallbackId
        const helpText = error ?? hint
        const describedBy = helpText ? `${inputId}-description` : undefined

        const sizeClasses: Record<InputSize, string> = {
            sm: 'h-9 px-3 text-xs',
            md: 'h-11 px-4 text-sm',
            lg: 'h-12 px-4 text-base',
        }

        const variantClasses: Record<InputVariant, string> = {
            default:
                'rounded-xl border border-(--color-border) bg-(--color-surface) text-(--color-text)',
            search:
                'rounded-2xl border-2 border-(--color-border) bg-(--color-surface) text-(--color-text)',
            rounded:
                'rounded-full border border-(--color-border) bg-(--color-surface) text-(--color-text)',
        }

        const positionClasses: Record<InputPosition, string> = {
            relative: 'relative',
            absolute: 'absolute',
            fixed: 'fixed',
        }

        const hasLeftIcon = Boolean(leftIcon) || (showSearchIcon && iconPosition === 'left')
        const hasRightIcon = Boolean(rightIcon) || (showSearchIcon && iconPosition === 'right')

        return (
            <div
                className={cn(
                    positionClasses[position],
                    fullWidth ? 'w-full' : 'w-auto',
                    containerClassName
                )}
            >
                {label ? (
                    <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-(--color-text)">
                        {label}
                        {requiredMark ? <span className="ml-1 text-red-500">*</span> : null}
                    </label>
                ) : null}

                <div className="relative">
                    {hasLeftIcon ? (
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base text-(--color-text-muted)">
                            {leftIcon ?? '🔍'}
                        </span>
                    ) : null}

                    <input
                        ref={ref}
                        id={inputId}
                        placeholder={placeholder ?? inpPlaceHolder}
                        value={value}
                        onChange={onChange}
                        disabled={disabled}
                        aria-invalid={Boolean(error)}
                        aria-describedby={describedBy}
                        className={cn(
                            'w-full placeholder:text-(--color-text-muted) transition-all duration-200',
                            'focus:outline-none focus:ring-2 focus:ring-highlight/25',
                            'disabled:cursor-not-allowed disabled:opacity-60',
                            sizeClasses[size],
                            variantClasses[variant],
                            hasLeftIcon ? 'pl-10' : '',
                            hasRightIcon ? 'pr-10' : '',
                            error
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                : 'focus:border-highlight',
                            className
                        )}
                        {...rest}
                    />

                    {hasRightIcon ? (
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-base text-(--color-text-muted)">
                            {rightIcon ?? '🔍'}
                        </span>
                    ) : null}
                </div>

                {helpText ? (
                    <p
                        id={`${inputId}-description`}
                        className={cn(
                            'mt-1 text-xs',
                            error ? 'text-red-600 dark:text-red-400' : 'text-(--color-text-muted)'
                        )}
                    >
                        {helpText}
                    </p>
                ) : null}
            </div>
        )
    }
)

InputComponent.displayName = 'InputComponent'

export default InputComponent