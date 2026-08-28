import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, KeyboardEventHandler, ReactNode } from 'react'
import { ChevronIcon, ClearIcon, SearchIcon } from '../../../icons/icons'

type OptionValue = string | number | boolean

type DataListProps<T> = {
    id?: string
    label?: string
    options: Partial<T>[]
    placeholder?: string
    className?: string
    containerClassName?: string
    disabled?: boolean
    value?: string
    defaultValue?: string
    onSelect: (e: ChangeEvent<HTMLInputElement>) => void
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


const DataList = <T,>({
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
    emptyText = 'Sin resultados',
    isLoading = false,
    clearable = true,
    leftIcon,
}: DataListProps<T>) => {
    const fallbackId = useId()
    const inputId = id ?? fallbackId
    const listId = `${inputId}-listbox`
    const isControlled = value !== undefined
    const helpText = error ?? hint
    const describedBy = helpText ? `${inputId}-description` : undefined

    const getTextByKey = useCallback(
        (key?: string) => {
            if (!key) return ''
            const option = options.find((item) => String(item[opKey]) === String(key))
            return String(option?.[opValue] ?? '')
        },
        [opKey, options, opValue]
    )

    const [inputValue, setInputValue] = useState(
        isControlled ? getTextByKey(value) : getTextByKey(defaultValue)
    )
    const [open, setOpen] = useState(false)
    const [activeIndex, setActiveIndex] = useState(-1)
    const wrapperRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const controlledText = useMemo(
        () => (isControlled ? getTextByKey(value) : ''),
        [getTextByKey, isControlled, value]
    )

    const filteredOptions = useMemo(() => {
        const query = inputValue.trim().toLowerCase()

        if (!query) return options

        return options.filter((option) => {
            const mainText = String(option[opValue] ?? '').toLowerCase()
            const secondaryText = optionP ? String(option[optionP] ?? '').toLowerCase() : ''

            return mainText.includes(query) || secondaryText.includes(query)
        })
    }, [inputValue, optionP, options, opValue])

    const selectedKey = isControlled ? value : undefined
    const activeOptionId =
        open && activeIndex >= 0 ? `${inputId}-option-${activeIndex}` : undefined

    // Sincronizar con el valor controlado durante el render en lugar de en un
    // efecto evita un render extra con el texto desactualizado.
    // https://react.dev/learn/you-might-not-need-an-effect
    const [syncedText, setSyncedText] = useState(controlledText)
    if (isControlled && syncedText !== controlledText) {
        setSyncedText(controlledText)
        setInputValue(controlledText)
    }

    useEffect(() => {
        if (!open) return

        const handlePointerDown = (event: MouseEvent) => {
            if (!wrapperRef.current?.contains(event.target as Node)) {
                setOpen(false)
                setActiveIndex(-1)
            }
        }

        document.addEventListener('mousedown', handlePointerDown)

        return () => document.removeEventListener('mousedown', handlePointerDown)
    }, [open])

    function emitSelection(selectedValue: OptionValue | '') {
        const syntheticEvent = {
            target: {
                id: inputId,
                name: inputId,
                value: String(selectedValue),
            },
            currentTarget: {
                id: inputId,
                name: inputId,
                value: String(selectedValue),
            },
        } as ChangeEvent<HTMLInputElement>

        onSelect(syntheticEvent)
    }

    function commitSelection(option: Partial<T>) {
        const nextKey = String(option[opKey] ?? '')
        const nextText = String(option[opValue] ?? '')

        if (!isControlled) {
            setInputValue(nextText)
        }

        emitSelection(nextKey)
        setOpen(false)
        setActiveIndex(-1)
        inputRef.current?.focus()
    }

    function clearSelection() {
        if (!isControlled) {
            setInputValue('')
        }

        emitSelection('')
        setOpen(false)
        setActiveIndex(-1)
        inputRef.current?.focus()
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        setInputValue(event.target.value)
        setOpen(true)
        setActiveIndex(0)

        if (!event.target.value) {
            emitSelection('')
        }
    }

    const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
        if (event.key === 'ArrowDown') {
            event.preventDefault()
            setOpen(true)
            setActiveIndex((currentIndex) =>
                filteredOptions.length === 0
                    ? -1
                    : Math.min(currentIndex + 1, filteredOptions.length - 1)
            )
            return
        }

        if (event.key === 'ArrowUp') {
            event.preventDefault()
            setOpen(true)
            setActiveIndex((currentIndex) =>
                filteredOptions.length === 0 ? -1 : Math.max(currentIndex - 1, 0)
            )
            return
        }

        if (event.key === 'Enter' && open && activeIndex >= 0) {
            event.preventDefault()
            const selectedOption = filteredOptions[activeIndex]

            if (selectedOption) {
                commitSelection(selectedOption)
            }
            return
        }

        if (event.key === 'Escape') {
            event.preventDefault()
            setOpen(false)
            setActiveIndex(-1)
        }
    }

    return (
        <div className={cn('w-full', containerClassName)}>
            {label ? (
                <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-(--color-text)">
                    {label}
                    {requiredMark ? <span className="ml-1 text-red-500">*</span> : null}
                </label>
            ) : null}

            <div ref={wrapperRef} className={cn('relative', className)}>
                <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-(--color-text-muted)">
                    {leftIcon ?? <SearchIcon />}
                </span>

                <input
                    ref={inputRef}
                    id={inputId}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (!disabled) {
                            setOpen(true)
                            setActiveIndex(filteredOptions.length > 0 ? 0 : -1)
                        }
                    }}
                    placeholder={placeholder}
                    disabled={disabled}
                    autoComplete="off"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-controls={listId}
                    aria-expanded={open}
                    aria-activedescendant={activeOptionId}
                    aria-invalid={Boolean(error)}
                    aria-describedby={describedBy}
                    className={cn(
                        'h-11 w-full rounded-xl border bg-(--color-surface) py-2.5 pl-10 pr-20 text-sm text-(--color-text)',
                        'placeholder:text-(--color-text-muted) transition-all duration-200',
                        'focus:outline-none focus:ring-2 focus:ring-highlight/25',
                        'disabled:cursor-not-allowed disabled:opacity-60',
                        error
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                            : 'border-(--color-border) focus:border-highlight'
                    )}
                />

                <div className="absolute inset-y-0 right-2 flex items-center gap-1 text-(--color-text-muted)">
                    {clearable && inputValue && !disabled ? (
                        <button
                            type="button"
                            className="inline-flex size-8 items-center justify-center rounded-lg hover:bg-(--color-bg-soft) hover:text-(--color-text)"
                            aria-label="Limpiar seleccion"
                            onClick={clearSelection}
                        >
                            <ClearIcon />
                        </button>
                    ) : null}

                    <button
                        type="button"
                        className="inline-flex size-8 items-center justify-center rounded-lg hover:bg-(--color-bg-soft) hover:text-(--color-text) disabled:pointer-events-none disabled:opacity-50"
                        aria-label={open ? 'Cerrar opciones' : 'Abrir opciones'}
                        disabled={disabled}
                        onClick={() => {
                            setOpen((currentOpen) => !currentOpen)
                            inputRef.current?.focus()
                        }}
                    >
                        <ChevronIcon/>
                    </button>
                </div>

                {open ? (
                    <div
                        id={listId}
                        role="listbox"
                        className="absolute left-0 top-full z-40 mt-2 max-h-64 w-full overflow-hidden rounded-xl border border-(--color-border) bg-(--color-surface) shadow-lg"
                    >
                        {isLoading ? (
                            <div className="px-3 py-3 text-sm text-(--color-text-muted)">
                                Cargando opciones...
                            </div>
                        ) : filteredOptions.length > 0 ? (
                            <ul className="max-h-64 overflow-y-auto py-1">
                                {filteredOptions.map((option, index) => {
                                    const key = String(option[opKey] ?? index)
                                    const text = String(option[opValue] ?? '')
                                    const extra = optionP ? String(option[optionP] ?? '') : ''
                                    const active = index === activeIndex
                                    const selected = selectedKey !== undefined && String(selectedKey) === key

                                    return (
                                        <li
                                            id={`${inputId}-option-${index}`}
                                            key={key}
                                            role="option"
                                            aria-selected={selected}
                                            className={cn(
                                                'cursor-pointer px-3 py-2.5 transition-colors',
                                                active && 'bg-(--color-bg-soft)',
                                                selected && 'text-highlight'
                                            )}
                                            onMouseEnter={() => setActiveIndex(index)}
                                            onMouseDown={(event) => event.preventDefault()}
                                            onClick={() => commitSelection(option)}
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="truncate text-sm font-medium text-(--color-text)">
                                                    {text}
                                                </span>
                                                {selected ? (
                                                    <span className="text-xs font-semibold text-highlight">
                                                        Seleccionado
                                                    </span>
                                                ) : null}
                                            </div>

                                            {optionP && extra ? (
                                                <p className="mt-0.5 truncate text-xs text-(--color-text-muted)">
                                                    {extra}
                                                </p>
                                            ) : null}
                                        </li>
                                    )
                                })}
                            </ul>
                        ) : (
                            <div className="px-3 py-3 text-sm text-(--color-text-muted)">
                                {emptyText}
                            </div>
                        )}
                    </div>
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

export default DataList
