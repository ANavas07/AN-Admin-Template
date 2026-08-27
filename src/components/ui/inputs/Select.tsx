import { useId, useMemo, useState } from 'react'
import type { ChangeEvent, ReactNode } from 'react'
import { ChevronIcon, ClearIcon } from '../../../icons/icons'

type OptionValue = string | number | boolean

type SelectProps<T> = {
    id?: string
    label?: string
    options: Partial<T>[]
    placeholder?: string
    className?: string
    containerClassName?: string
    disabled?: boolean
    value?: string
    defaultValue?: string
    onSelect: (e: ChangeEvent<HTMLSelectElement>) => void
    opKey: keyof T
    opValue: keyof T
    optionP?: keyof T
    hint?: string
    error?: string
    requiredMark?: boolean
    emptyText?: string
    isLoading?: boolean
    clearable?: boolean
    leftIcon?: ReactNode
}

function cn(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(' ')
}

const Select = <T,>({
    id,
    label,
    options,
    placeholder = 'Seleccione una opcion',
    className,
    containerClassName,
    disabled = false,
    value,
    defaultValue,
    onSelect,
    opKey,
    opValue,
    optionP,
    hint,
    error,
    requiredMark = false,
    emptyText = 'Sin opciones',
    isLoading = false,
    clearable = true,
    leftIcon,
}: SelectProps<T>) => {
    const fallbackId = useId()
    const selectId = id ?? fallbackId
    const isControlled = value !== undefined
    const helpText = error ?? hint
    const describedBy = helpText ? `${selectId}-description` : undefined
    const [internalValue, setInternalValue] = useState(defaultValue ?? '')

    const selectedValue = isControlled ? value ?? '' : internalValue
    const hasOptions = options.length > 0
    const selectDisabled = disabled || isLoading || !hasOptions

    const optionItems = useMemo(
        () =>
            options.map((option, index) => {
                const key = String(option[opKey] ?? index)
                const valueText = String(option[opValue] ?? '')
                const detailText = optionP ? String(option[optionP] ?? '') : ''

                return {
                    key,
                    value: key,
                    label: detailText ? `${valueText} - ${detailText}` : valueText,
                }
            }),
        [opKey, optionP, options, opValue]
    )

    function handleChange(event: ChangeEvent<HTMLSelectElement>) {
        if (!isControlled) {
            setInternalValue(event.target.value)
        }

        onSelect(event)
    }

    function emitSelection(nextValue: OptionValue | '') {
        const syntheticEvent = {
            target: {
                id: selectId,
                name: selectId,
                value: String(nextValue),
            },
            currentTarget: {
                id: selectId,
                name: selectId,
                value: String(nextValue),
            },
        } as ChangeEvent<HTMLSelectElement>

        onSelect(syntheticEvent)
    }

    function clearSelection() {
        if (!isControlled) {
            setInternalValue('')
        }

        emitSelection('')
    }

    return (
        <div className={cn('w-full', containerClassName)}>
            {label ? (
                <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-(--color-text)">
                    {label}
                    {requiredMark ? <span className="ml-1 text-red-500">*</span> : null}
                </label>
            ) : null}

            <div className={cn('relative', className)}>
                {leftIcon ? (
                    <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-(--color-text-muted)">
                        {leftIcon}
                    </span>
                ) : null}

                <select
                    id={selectId}
                    value={selectedValue}
                    onChange={handleChange}
                    disabled={selectDisabled}
                    aria-invalid={Boolean(error)}
                    aria-describedby={describedBy}
                    className={cn(
                        'h-11 w-full appearance-none rounded-xl border bg-(--color-surface) py-2.5 text-sm text-(--color-text)',
                        leftIcon ? 'pl-10' : 'pl-3',
                        clearable && selectedValue && !selectDisabled ? 'pr-20' : 'pr-11',
                        'transition-all duration-200',
                        'focus:outline-none focus:ring-2 focus:ring-highlight/25',
                        'disabled:cursor-not-allowed disabled:opacity-60',
                        error
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                            : 'border-(--color-border) focus:border-highlight'
                    )}
                >
                    <option value="" disabled={requiredMark}>
                        {isLoading ? 'Cargando opciones...' : hasOptions ? placeholder : emptyText}
                    </option>

                    {optionItems.map((option) => (
                        <option key={option.key} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                <div className="absolute inset-y-0 right-2 flex items-center gap-1 text-(--color-text-muted)">
                    {clearable && selectedValue && !selectDisabled ? (
                        <button
                            type="button"
                            className="inline-flex size-8 items-center justify-center rounded-lg hover:bg-(--color-bg-soft) hover:text-(--color-text)"
                            aria-label="Limpiar seleccion"
                            onClick={clearSelection}
                        >
                            <ClearIcon />
                        </button>
                    ) : null}

                    <span className="pointer-events-none inline-flex size-8 items-center justify-center">
                        <ChevronIcon />
                    </span>
                </div>
            </div>

            {helpText ? (
                <p
                    id={`${selectId}-description`}
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

export default Select
