import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent, ReactNode } from 'react'
import ButtonComponent from '../../ui/buttons/ButtonComponent'
import DataList from '../../ui/inputs/DataList'

type FieldType =
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'date'
    | 'textarea'
    | 'select'
    | 'checkbox'
    | 'radio'
    | 'file'
    | 'datalist'

type Option = {
    label: string
    value: string | number | boolean
    description?: string
}

export type FormValues = Record<string, string | number | boolean | File | null>

export type FormField = {
    name: string
    label: string
    type?: FieldType
    placeholder?: string
    helperText?: string
    defaultValue?: FormValues[string]
    options?: Option[]
    required?: boolean
    disabled?: boolean
    readOnly?: boolean
    min?: number | string
    max?: number | string
    step?: number | string
    rows?: number
    className?: string
    autoComplete?: string
    emptyText?: string
    isLoading?: boolean
    clearable?: boolean
    visibleWhen?: (values: FormValues) => boolean
    validate?: (value: FormValues[string], values: FormValues) => string | undefined
}

export type FormConfig = {
    title?: string
    description?: string
    fields: FormField[]
    columns?: 1 | 2 | 3
    submitLabel?: string
    resetLabel?: string
    showReset?: boolean
    actions?: ReactNode
}

type FormRenderProps = {
    config: FormConfig
    initialValues?: FormValues
    isSubmitting?: boolean
    onChange?: (values: FormValues) => void
    onSubmit: (values: FormValues) => void | Promise<void>
}

function cn(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(' ')
}

function getInitialValues(config: FormConfig, initialValues: FormValues = {}) {
    return config.fields.reduce<FormValues>((values, field) => {
        values[field.name] =
            initialValues[field.name] ??
            field.defaultValue ??
            (field.type === 'checkbox' ? false : '')

        return values
    }, {})
}

function getColumnsClass(columns: FormConfig['columns']) {
    if (columns === 3) return 'lg:grid-cols-3'
    if (columns === 2) return 'md:grid-cols-2'
    return 'grid-cols-1'
}

export default function FormRender({
    config,
    initialValues,
    isSubmitting = false,
    onChange,
    onSubmit,
}: FormRenderProps) {
    const [values, setValues] = useState<FormValues>(() =>
        getInitialValues(config, initialValues)
    )
    const [errors, setErrors] = useState<Record<string, string>>({})

    const visibleFields = useMemo(
        () => config.fields.filter((field) => field.visibleWhen?.(values) ?? true),
        [config.fields, values]
    )

    useEffect(() => {
        setValues((currentValues) => getInitialValues(config, currentValues))
        setErrors({})
    }, [config])

    function updateValue(name: string, value: FormValues[string]) {
        const nextValues = { ...values, [name]: value }

        setValues(nextValues)
        onChange?.(nextValues)

        if (errors[name]) {
            setErrors((currentErrors) => {
                const nextErrors = { ...currentErrors }
                delete nextErrors[name]
                return nextErrors
            })
        }
    }

    function validateForm() {
        const nextErrors: Record<string, string> = {}

        visibleFields.forEach((field) => {
            const value = values[field.name]
            const isEmpty = value === '' || value === null || value === undefined

            if (field.required && isEmpty) {
                // Gender-neutral so it reads correctly for any field label (the app UI is in Spanish).
                nextErrors[field.name] = 'Este campo es obligatorio.'
                return
            }

            const customError = field.validate?.(value, values)

            if (customError) {
                nextErrors[field.name] = customError
            }
        })

        setErrors(nextErrors)
        return Object.keys(nextErrors).length === 0
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        if (!validateForm()) return

        await onSubmit(values)
    }

    function handleReset() {
        const nextValues = getInitialValues(config, initialValues)

        setValues(nextValues)
        setErrors({})
        onChange?.(nextValues)
    }

    function renderField(field: FormField) {
        const value = values[field.name]
        const error = errors[field.name]
        const fieldId = `form-field-${field.name}`
        const describedBy = [
            field.helperText ? `${fieldId}-helper` : undefined,
            error ? `${fieldId}-error` : undefined,
        ]
            .filter(Boolean)
            .join(' ')

        const baseInputClass = cn(
            'min-h-11 w-full rounded-lg border bg-(--color-surface) px-3 py-2 text-sm text-(--color-text)',
            'placeholder:text-(--color-text-muted)',
            'focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15',
            'disabled:cursor-not-allowed disabled:opacity-60',
            error ? 'border-red-500' : 'border-(--color-border)'
        )

        if (field.type === 'textarea') {
            return (
                <textarea
                    id={fieldId}
                    name={field.name}
                    value={String(value ?? '')}
                    rows={field.rows ?? 4}
                    placeholder={field.placeholder}
                    disabled={field.disabled}
                    readOnly={field.readOnly}
                    required={field.required}
                    aria-invalid={Boolean(error)}
                    aria-describedby={describedBy || undefined}
                    className={baseInputClass}
                    onChange={(event) => updateValue(field.name, event.target.value)}
                />
            )
        }

        if (field.type === 'select') {
            return (
                <select
                    id={fieldId}
                    name={field.name}
                    value={String(value ?? '')}
                    disabled={field.disabled}
                    required={field.required}
                    aria-invalid={Boolean(error)}
                    aria-describedby={describedBy || undefined}
                    className={baseInputClass}
                    onChange={(event) => updateValue(field.name, event.target.value)}
                >
                    <option value="">Selecciona una opcion</option>
                    {field.options?.map((option) => (
                        <option key={String(option.value)} value={String(option.value)}>
                            {option.label}
                        </option>
                    ))}
                </select>
            )
        }

        if (field.type === 'datalist') {
            return (
                <DataList<Option>
                    id={fieldId}
                    label={field.label}
                    options={field.options ?? []}
                    placeholder={field.placeholder}
                    value={String(value ?? '')}
                    disabled={field.disabled}
                    opKey="value"
                    opValue="label"
                    optionP="description"
                    hint={field.helperText}
                    error={error}
                    requiredMark={field.required}
                    emptyText={field.emptyText}
                    isLoading={field.isLoading}
                    clearable={field.clearable}
                    onSelect={(event) => updateValue(field.name, event.target.value)}
                />
            )
        }

        if (field.type === 'radio') {
            return (
                <div className="grid gap-2" role="radiogroup" aria-describedby={describedBy || undefined}>
                    {field.options?.map((option) => (
                        <label
                            key={String(option.value)}
                            className="flex min-h-10 items-center gap-3 rounded-lg border border-(--color-border) px-3 text-sm text-(--color-text)"
                        >
                            <input
                                type="radio"
                                name={field.name}
                                value={String(option.value)}
                                checked={String(value) === String(option.value)}
                                disabled={field.disabled}
                                required={field.required}
                                className="size-4 accent-brand"
                                onChange={() => updateValue(field.name, option.value)}
                            />
                            {option.label}
                        </label>
                    ))}
                </div>
            )
        }

        if (field.type === 'checkbox') {
            return (
                <label className="flex min-h-11 items-center gap-3 rounded-lg border border-(--color-border) px-3 text-sm text-(--color-text)">
                    <input
                        id={fieldId}
                        name={field.name}
                        type="checkbox"
                        checked={Boolean(value)}
                        disabled={field.disabled}
                        required={field.required}
                        aria-invalid={Boolean(error)}
                        aria-describedby={describedBy || undefined}
                        className="size-4 accent-brand"
                        onChange={(event) => updateValue(field.name, event.target.checked)}
                    />
                    {field.placeholder ?? field.label}
                </label>
            )
        }

        if (field.type === 'file') {
            return (
                <input
                    id={fieldId}
                    name={field.name}
                    type="file"
                    disabled={field.disabled}
                    required={field.required}
                    aria-invalid={Boolean(error)}
                    aria-describedby={describedBy || undefined}
                    className={cn(baseInputClass, 'file:mr-3 file:rounded-md file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white')}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        updateValue(field.name, event.target.files?.[0] ?? null)
                    }
                />
            )
        }

        return (
            <input
                id={fieldId}
                name={field.name}
                type={field.type ?? 'text'}
                value={String(value ?? '')}
                min={field.min}
                max={field.max}
                step={field.step}
                placeholder={field.placeholder}
                disabled={field.disabled}
                readOnly={field.readOnly}
                required={field.required}
                autoComplete={field.autoComplete}
                aria-invalid={Boolean(error)}
                aria-describedby={describedBy || undefined}
                className={baseInputClass}
                onChange={(event) =>
                    updateValue(
                        field.name,
                        field.type === 'number' && event.target.value !== ''
                            ? Number(event.target.value)
                            : event.target.value
                    )
                }
            />
        )
    }

    return (
        <form
            className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-sm"
            onSubmit={handleSubmit}
            noValidate
        >
            {(config.title || config.description) && (
                <header className="mb-5">
                    {config.title && (
                        <h2 className="text-lg font-semibold text-(--color-text)">
                            {config.title}
                        </h2>
                    )}
                    {config.description && (
                        <p className="mt-1 text-sm text-(--color-text-muted)">
                            {config.description}
                        </p>
                    )}
                </header>
            )}

            <div className={cn('grid gap-4', getColumnsClass(config.columns))}>
                {visibleFields.map((field) => {
                    const fieldId = `form-field-${field.name}`
                    const error = errors[field.name]

                    return (
                        <div key={field.name} className={cn('grid gap-1.5', field.className)}>
                            {field.type !== 'checkbox' && field.type !== 'datalist' && (
                                <label
                                    htmlFor={fieldId}
                                    className="text-sm font-semibold text-(--color-text)"
                                >
                                    {field.label}
                                    {field.required && <span className="text-red-500"> *</span>}
                                </label>
                            )}

                            {renderField(field)}

                            {field.type !== 'datalist' && field.helperText && !error && (
                                <p
                                    id={`${fieldId}-helper`}
                                    className="text-xs text-(--color-text-muted)"
                                >
                                    {field.helperText}
                                </p>
                            )}

                            {field.type !== 'datalist' && error && (
                                <p id={`${fieldId}-error`} className="text-xs font-medium text-red-600">
                                    {error}
                                </p>
                            )}
                        </div>
                    )
                })}
            </div>

            <footer className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                {config.actions}

                {config.showReset && (
                    <ButtonComponent type="button" variant="outline" onClick={handleReset}>
                        {config.resetLabel ?? 'Limpiar'}
                    </ButtonComponent>
                )}

                <ButtonComponent type="submit" isLoading={isSubmitting} loadingText="Guardando...">
                    {config.submitLabel ?? 'Guardar'}
                </ButtonComponent>
            </footer>
        </form>
    )
}
