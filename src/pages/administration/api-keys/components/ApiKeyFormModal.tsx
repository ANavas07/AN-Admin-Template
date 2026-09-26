import { useState } from 'react'
import type { FormEvent } from 'react'
import PopUp from '../../../../components/common/pop-up/PopUp'
import Alert from '../../../../components/ui/alert/Alert'
import ButtonComponent from '../../../../components/ui/buttons/ButtonComponent'
import InputComponent from '../../../../components/ui/inputs/InputComponent'
import { FieldLabel } from '../../../../components/ui/inputs/field'
import { fieldInputClass, fieldSelectClass, fieldTextareaClass } from '../../../../components/ui/inputs/fieldStyles'
import SegmentedControl from '../../../../components/ui/segmented/SegmentedControl'
import { ShieldIcon } from '../../../../icons/icons'
import type { ApiKey, ApiKeyInput, KeyEnvironment } from '../../../../services/api-keys/apiKeys.service'
import { ENVIRONMENT_META, ENVIRONMENTS, EXPIRY_PRESETS, resolveExpiry, toDateInputValue } from '../apiKeyPresentation'
import type { ExpiryPreset } from '../apiKeyPresentation'
import ScopePicker from './ScopePicker'

export type ApiKeyFormMode = 'generate' | 'register' | 'edit'

type ApiKeyFormModalProps = {
    isOpen: boolean
    mode: ApiKeyFormMode
    /** Key being edited (edit mode) */
    apiKey?: ApiKey
    onClose: () => void
    /** Returns true when the key was saved, so the modal can close */
    onSubmit: (input: ApiKeyInput, secret: string) => Promise<boolean>
}

const MODE_COPY: Record<ApiKeyFormMode, { title: string; description: string; submit: string }> = {
    generate: {
        title: 'Generar API key',
        description: 'La clave se mostrará una sola vez al terminar.',
        submit: 'Generar clave',
    },
    register: {
        title: 'Registrar API key existente',
        description: 'Para claves emitidas por otro sistema. Solo se guarda su huella (hash).',
        submit: 'Registrar clave',
    },
    edit: {
        title: 'Editar API key',
        description: 'El valor de la clave no cambia. Para emitir uno nuevo usa «Rotar».',
        submit: 'Guardar cambios',
    },
}

function initialState(apiKey?: ApiKey) {
    return {
        name: apiKey?.name ?? '',
        description: apiKey?.description ?? '',
        environment: apiKey?.environment ?? ('production' as KeyEnvironment),
        scopes: apiKey?.scopes ?? ['reports:read'],
        expiryPreset: (apiKey ? (apiKey.expiresAt ? 'custom' : 'never') : '90') as ExpiryPreset,
        customDate: toDateInputValue(apiKey?.expiresAt ?? null),
        secret: '',
    }
}

/** Generate, register or edit a key. Mount it with a `key` so each opening starts clean. */
export default function ApiKeyFormModal({ isOpen, mode, apiKey, onClose, onSubmit }: ApiKeyFormModalProps) {
    const [form, setForm] = useState(() => initialState(apiKey))
    const [isSaving, setIsSaving] = useState(false)
    const [showErrors, setShowErrors] = useState(false)
    const [tomorrow] = useState(() => toDateInputValue(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()))
    const copy = MODE_COPY[mode]

    const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((current) => ({ ...current, [key]: value }))

    const errors = {
        name: form.name.trim() ? undefined : 'Ingresa un nombre.',
        scopes: form.scopes.length ? undefined : 'Selecciona al menos un permiso.',
        customDate: form.expiryPreset === 'custom' && !form.customDate ? 'Elige la fecha de expiración.' : undefined,
        secret: mode === 'register' && form.secret.trim().length < 20 ? 'Pega la clave completa (mínimo 20 caracteres).' : undefined,
    }
    const isValid = Object.values(errors).every((error) => !error)
    const hasSensitiveProductionScope = form.environment === 'production' && form.scopes.includes('admin:full')

    async function handleSubmit(event: FormEvent) {
        event.preventDefault()
        setShowErrors(true)
        if (!isValid) return
        setIsSaving(true)
        const saved = await onSubmit(
            {
                name: form.name,
                description: form.description,
                environment: form.environment,
                scopes: form.scopes,
                expiresAt: resolveExpiry(form.expiryPreset, form.customDate),
            },
            form.secret
        )
        setIsSaving(false)
        // The pasted secret must not outlive the form
        if (saved) {
            set('secret', '')
            onClose()
        }
    }

    const visibleError = (key: keyof typeof errors) => (showErrors ? errors[key] : undefined)

    return (
        <PopUp
            isOpen={isOpen}
            onClose={onClose}
            title={copy.title}
            description={copy.description}
            size="lg"
            closeOnOverlay={false}
            footer={
                <>
                    <ButtonComponent variant="outline" onClick={onClose} disabled={isSaving}>
                        Cancelar
                    </ButtonComponent>
                    <ButtonComponent type="submit" form="api-key-form" isLoading={isSaving}>
                        {copy.submit}
                    </ButtonComponent>
                </>
            }
        >
            <form id="api-key-form" className="space-y-5" onSubmit={handleSubmit} noValidate>
                <div className="grid gap-4 sm:grid-cols-2">
                    <InputComponent
                        label="Nombre"
                        requiredMark
                        value={form.name}
                        onChange={(event) => set('name', event.target.value)}
                        placeholder="p. ej. Integración ERP"
                        error={visibleError('name')}
                        maxLength={60}
                        containerClassName="sm:col-span-2"
                    />
                    <div className="sm:col-span-2">
                        <FieldLabel htmlFor="api-key-description">Descripción</FieldLabel>
                        <textarea
                            id="api-key-description"
                            rows={2}
                            className={fieldTextareaClass}
                            value={form.description}
                            onChange={(event) => set('description', event.target.value)}
                            placeholder="Qué sistema la usa y para qué"
                            maxLength={200}
                        />
                    </div>

                    <div>
                        <p className="mb-1.5 text-sm font-medium text-fg">Entorno</p>
                        {mode === 'edit' ? (
                            <p className="text-sm text-fg-muted">{ENVIRONMENT_META[form.environment].label} (no editable)</p>
                        ) : (
                            <SegmentedControl
                                label="Entorno"
                                value={form.environment}
                                onChange={(value) => set('environment', value)}
                                options={ENVIRONMENTS.map((environment) => ({ value: environment, label: ENVIRONMENT_META[environment].label }))}
                            />
                        )}
                    </div>

                    <div>
                        <FieldLabel htmlFor="api-key-expiry">Expiración</FieldLabel>
                        <div className="flex gap-2">
                            <select
                                id="api-key-expiry"
                                className={fieldSelectClass}
                                value={form.expiryPreset}
                                onChange={(event) => set('expiryPreset', event.target.value as ExpiryPreset)}
                            >
                                {EXPIRY_PRESETS.map((preset) => (
                                    <option key={preset.value} value={preset.value}>
                                        {preset.label}
                                    </option>
                                ))}
                            </select>
                            {form.expiryPreset === 'custom' ? (
                                <input
                                    type="date"
                                    aria-label="Fecha de expiración"
                                    className={fieldInputClass}
                                    min={tomorrow}
                                    value={form.customDate}
                                    onChange={(event) => set('customDate', event.target.value)}
                                />
                            ) : null}
                        </div>
                        {visibleError('customDate') ? <p className="mt-1.5 text-xs font-medium text-danger">{errors.customDate}</p> : null}
                    </div>

                    {mode === 'register' ? (
                        <InputComponent
                            label="Clave existente"
                            requiredMark
                            type="password"
                            autoComplete="off"
                            spellCheck={false}
                            value={form.secret}
                            onChange={(event) => set('secret', event.target.value)}
                            placeholder="Pega la clave completa"
                            hint="Se calcula su hash SHA-256 en el navegador; el valor no se almacena."
                            error={visibleError('secret')}
                            containerClassName="sm:col-span-2"
                            className="font-mono"
                        />
                    ) : null}
                </div>

                <div>
                    <p className="mb-2 text-sm font-medium text-fg">
                        Permisos <span className="font-normal text-fg-muted">({form.scopes.length} seleccionados)</span>
                    </p>
                    <ScopePicker value={form.scopes} onChange={(scopes) => set('scopes', scopes)} />
                    {visibleError('scopes') ? <p className="mt-2 text-xs font-medium text-danger">{errors.scopes}</p> : null}
                </div>

                {hasSensitiveProductionScope ? (
                    <Alert tone="warning" icon={<ShieldIcon className="size-4" />} title="Acceso total en producción">
                        Concede solo los permisos que la integración necesita. Una clave con administración total expuesta compromete toda la
                        organización.
                    </Alert>
                ) : null}
            </form>
        </PopUp>
    )
}
