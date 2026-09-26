import { forwardRef, useId } from 'react'
import type { ChangeEvent, InputHTMLAttributes, ReactNode } from 'react'
import { SearchIcon } from '../../../icons/icons'
import { cn } from '../../../utils/cn'
import { FieldLabel, FieldMessage } from './field'
import { fieldControlClass } from './fieldStyles'

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
            sm: 'h-8 px-2.5 text-xs',
            md: 'h-9 px-3 text-sm',
            lg: 'h-11 px-3.5 text-sm',
        }

        // Only the corner shape changes between variants; colors come from fieldControlClass
        const variantClasses: Record<InputVariant, string> = {
            default: '',
            search: '',
            rounded: 'rounded-full',
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
                    <FieldLabel htmlFor={inputId} required={requiredMark}>
                        {label}
                    </FieldLabel>
                ) : null}

                <div className="relative">
                    {hasLeftIcon ? (
                        <span className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 text-fg-subtle">
                            {leftIcon ?? <SearchIcon className="size-4" />}
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
                            fieldControlClass(Boolean(error)),
                            sizeClasses[size],
                            variantClasses[variant],
                            hasLeftIcon ? 'pl-9' : '',
                            hasRightIcon ? 'pr-9' : '',
                            className
                        )}
                        {...rest}
                    />

                    {hasRightIcon ? (
                        <span className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 text-fg-subtle">
                            {rightIcon ?? <SearchIcon className="size-4" />}
                        </span>
                    ) : null}
                </div>

                <FieldMessage id={`${inputId}-description`} error={error} hint={hint} />
            </div>
        )
    }
)

InputComponent.displayName = 'InputComponent'

export default InputComponent