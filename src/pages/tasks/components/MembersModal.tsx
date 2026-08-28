import { useMemo, useState } from 'react'
import PopUp from '../../../components/common/pop-up/PopUp'
import ButtonComponent from '../../../components/ui/buttons/ButtonComponent'
import InputComponent from '../../../components/ui/inputs/InputComponent'
import type { Assignee, Project, Team } from '../types'
import type { MembersTarget } from './layout/TasksSidebar'
import { AssigneeAvatar } from './shared/AssigneeAvatar'

type Props = {
    isOpen: boolean
    target: MembersTarget
    initialMode: 'invite' | 'add'
    teams: Team[]
    projects: Project[]
    members: Assignee[]
    onInvite: (email: string, target: MembersTarget) => void
    onAddMember: (target: MembersTarget, memberId: string) => void
    onClose: () => void
}

export default function MembersModal({
    isOpen,
    target,
    initialMode,
    teams,
    projects,
    members,
    onInvite,
    onAddMember,
    onClose,
}: Props) {
    const team = target.teamId ? teams.find((t) => t.id === target.teamId) : undefined
    const project = target.projectId ? projects.find((p) => p.id === target.projectId) : undefined
    const targetLabel = team?.name ?? project?.name ?? 'el espacio de trabajo'
    // "Add existing" only makes sense for a specific team/project.
    const canAdd = Boolean(team || project)

    const [mode, setMode] = useState<'invite' | 'add'>(initialMode)
    const [email, setEmail] = useState('')
    const [sent, setSent] = useState<string[]>([])

    // Reset al abrir. Se ajusta durante el render en lugar de en un efecto
    // para no encadenar un render extra con el estado anterior.
    // https://react.dev/learn/you-might-not-need-an-effect
    const [wasOpen, setWasOpen] = useState(isOpen)
    if (wasOpen !== isOpen) {
        setWasOpen(isOpen)
        if (isOpen) {
            setMode(canAdd ? initialMode : 'invite')
            setEmail('')
            setSent([])
        }
    }

    // Members already in the target vs. candidates to add.
    const currentIds = useMemo(() => {
        if (team) return new Set(team.memberIds)
        if (project) return new Set(project.assignees.map((a) => a.id))
        return new Set(members.map((m) => m.id))
    }, [team, project, members])

    const candidates = useMemo(
        () => members.filter((m) => !currentIds.has(m.id)),
        [members, currentIds],
    )

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

    function submitInvite() {
        if (!emailValid) return
        onInvite(email.trim(), target)
        setSent((prev) => [...prev, email.trim()])
        setEmail('')
    }

    return (
        <PopUp
            isOpen={isOpen}
            onClose={onClose}
            title={`Miembros · ${targetLabel}`}
            description="Invita por correo o agrega personas existentes (mock)."
            size="md"
            footer={
                <ButtonComponent variant="outline" onClick={onClose}>
                    Cerrar
                </ButtonComponent>
            }
        >
            <div className="flex flex-col gap-4">
                {/* Mode tabs */}
                <div className="inline-flex w-full rounded-xl border border-(--color-border) bg-(--color-bg-soft)/50 p-1">
                    <button
                        type="button"
                        onClick={() => setMode('invite')}
                        className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                            mode === 'invite' ? 'bg-(--color-surface) text-(--color-text) shadow-sm' : 'text-(--color-text-muted)'
                        }`}
                    >
                        Invitar por correo
                    </button>
                    <button
                        type="button"
                        disabled={!canAdd}
                        onClick={() => setMode('add')}
                        className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-40 ${
                            mode === 'add' ? 'bg-(--color-surface) text-(--color-text) shadow-sm' : 'text-(--color-text-muted)'
                        }`}
                    >
                        Agregar existentes
                    </button>
                </div>

                {mode === 'invite' ? (
                    <div className="flex flex-col gap-3">
                        <div className="flex items-end gap-2">
                            <div className="flex-1">
                                <InputComponent
                                    label="Correo electrónico"
                                    type="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter') submitInvite()
                                    }}
                                    placeholder="persona@institucion.edu"
                                />
                            </div>
                            <ButtonComponent onClick={submitInvite} disabled={!emailValid} className="mb-[1px]">
                                Invitar
                            </ButtonComponent>
                        </div>
                        {sent.length > 0 ? (
                            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300">
                                Invitación enviada a {sent.join(', ')} para {targetLabel}.
                            </div>
                        ) : null}
                    </div>
                ) : (
                    <div className="flex flex-col gap-1.5">
                        {candidates.length === 0 ? (
                            <p className="py-4 text-center text-sm text-(--color-text-muted)">
                                Todas las personas ya pertenecen a {targetLabel}.
                            </p>
                        ) : (
                            candidates.map((member) => (
                                <MemberRow
                                    key={member.id}
                                    member={member}
                                    onAdd={() => onAddMember(target, member.id)}
                                />
                            ))
                        )}
                    </div>
                )}
            </div>
        </PopUp>
    )
}

function MemberRow({ member, onAdd }: { member: Assignee; onAdd: () => void }) {
    const [added, setAdded] = useState(false)
    return (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-(--color-border) px-3 py-2">
            <span className="flex items-center gap-2.5">
                <AssigneeAvatar assignee={member} size="md" />
                <span className="text-sm font-medium text-(--color-text)">{member.name}</span>
            </span>
            <ButtonComponent
                size="sm"
                variant={added ? 'ghost' : 'outline'}
                disabled={added}
                onClick={() => {
                    onAdd()
                    setAdded(true)
                }}
            >
                {added ? 'Agregado ✓' : 'Agregar'}
            </ButtonComponent>
        </div>
    )
}
