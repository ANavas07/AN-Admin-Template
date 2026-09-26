import { useState } from 'react'
import type { FormEvent } from 'react'
import { sileo } from 'sileo'
import ButtonComponent from '../../../components/ui/buttons/ButtonComponent'
import Avatar from '../../../components/ui/avatar/Avatar'
import Badge from '../../../components/ui/badge/Badge'
import InputComponent from '../../../components/ui/inputs/InputComponent'
import { FieldLabel } from '../../../components/ui/inputs/field'
import { fieldTextareaClass } from '../../../components/ui/inputs/fieldStyles'
import Panel from '../../../components/ui/panel/Panel'
import { appConfig, ROLE_LABELS } from '../../../config/app.config'
import { useAccount } from '../../../context/account-context'
import { useWorkspace } from '../../../context/workspace-context'

export default function ProfilePage() {
    const { user, role } = useWorkspace()
    const { account, updateProfile } = useAccount()
    const [form, setForm] = useState({
        name: user.name,
        jobTitle: user.jobTitle ?? '',
        department: user.department ?? '',
        phone: user.phone ?? '',
        bio: account?.profile.bio ?? '',
    })
    const [isSaving, setIsSaving] = useState(false)
    const nameError = form.name.trim() ? undefined : 'Ingresa tu nombre.'

    const field = (key: keyof typeof form) => ({
        value: form[key],
        onChange: (event: { target: { value: string } }) => setForm((current) => ({ ...current, [key]: event.target.value })),
    })

    async function handleSubmit(event: FormEvent) {
        event.preventDefault()
        if (nameError) return
        setIsSaving(true)
        await updateProfile({
            name: form.name.trim(),
            jobTitle: form.jobTitle.trim(),
            department: form.department.trim(),
            phone: form.phone.trim(),
            bio: form.bio.trim(),
        })
        setIsSaving(false)
        sileo.success({ title: 'Perfil actualizado' })
    }

    return (
        <div className="space-y-6">
            <Panel title="Resumen">
                <div className="flex flex-wrap items-center gap-4">
                    <Avatar name={user.name} tone="brand" size="xl" />
                    <div className="min-w-0">
                        <p className="text-lg font-semibold text-fg">{user.name}</p>
                        <p className="text-sm text-fg-muted">{user.email}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                            <Badge tone="brand">{ROLE_LABELS[role]}</Badge>
                            <Badge>{appConfig.organization}</Badge>
                            {user.department ? <Badge>{user.department}</Badge> : null}
                        </div>
                    </div>
                </div>
            </Panel>

            <Panel title="Información personal" description="Se muestra en la barra lateral y en tus mensajes.">
                <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit} noValidate>
                    <InputComponent label="Nombre completo" requiredMark error={nameError} {...field('name')} />
                    <InputComponent label="Correo" value={user.email} onChange={() => undefined} disabled hint="Lo gestiona el administrador." />
                    <InputComponent label="Cargo" placeholder="Ej. Analista de procesos" {...field('jobTitle')} />
                    <InputComponent label="Departamento" placeholder="Ej. Dirección de Tecnología" {...field('department')} />
                    <InputComponent label="Teléfono" type="tel" placeholder="+593 …" {...field('phone')} />
                    <div className="sm:col-span-2">
                        <FieldLabel htmlFor="profile-bio">Acerca de ti</FieldLabel>
                        <textarea id="profile-bio" rows={3} className={fieldTextareaClass} placeholder="Una línea sobre tu rol o responsabilidades" {...field('bio')} />
                    </div>
                    <div className="flex justify-end sm:col-span-2">
                        <ButtonComponent type="submit" isLoading={isSaving} loadingText="Guardando…" disabled={Boolean(nameError)}>
                            Guardar cambios
                        </ButtonComponent>
                    </div>
                </form>
            </Panel>
        </div>
    )
}
