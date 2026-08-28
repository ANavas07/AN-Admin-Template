import { useState } from 'react'
import { accentAvatar, accentDot } from '../../constants'
import type { Assignee, Project, Team } from '../../types'
import { AssigneeStack } from '../shared/AssigneeAvatar'

export type MembersTarget = { teamId?: string; projectId?: string }

type Props = {
    teams: Team[]
    projects: Project[]
    members: Assignee[]
    activeProjectId: string
    onSelectProject: (projectId: string) => void
    /** Opens the members modal (invite by email or add existing). */
    onManageMembers: (target: MembersTarget, mode: 'invite' | 'add') => void
    onNewProject: (teamId?: string) => void
}

function initials(name: string) {
    const words = name.replace(/[^\p{L}\p{N} ]/gu, '').trim().split(/\s+/)
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
    return (words[0][0] + words[1][0]).toUpperCase()
}

function ChevronLeft() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
        </svg>
    )
}

function DotsMenuIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
            <circle cx="5" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="19" cy="12" r="1.8" />
        </svg>
    )
}

export function TasksSidebar({
    teams,
    projects,
    members,
    activeProjectId,
    onSelectProject,
    onManageMembers,
    onNewProject,
}: Props) {
    const [collapsed, setCollapsed] = useState(false)
    const [closedTeams, setClosedTeams] = useState<Set<string>>(new Set())
    const [menuTeamId, setMenuTeamId] = useState<string | null>(null)

    const isTeamOpen = (teamId: string) => !closedTeams.has(teamId)
    const toggleTeam = (teamId: string) =>
        setClosedTeams((prev) => {
            const next = new Set(prev)
            if (next.has(teamId)) {
                next.delete(teamId)
            } else {
                next.add(teamId)
            }
            return next
        })

    const membersOf = (team: Team) => members.filter((m) => team.memberIds.includes(m.id))

    return (
        <aside
            aria-label="Navegador de equipos y proyectos"
            className={`sticky top-16 flex h-[calc(100vh-4rem)] shrink-0 flex-col border-r border-(--color-border) bg-(--color-surface) ${
                collapsed ? 'w-16' : 'w-72'
            }`}
        >
            {/* Header */}
            <div className={`flex items-center gap-2 border-b border-(--color-border) px-3 py-3 ${collapsed ? 'justify-center' : 'justify-between'}`}>
                {!collapsed ? (
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-(--color-text-muted)">
                        Espacio de trabajo
                    </span>
                ) : null}
                <button
                    type="button"
                    onClick={() => setCollapsed((value) => !value)}
                    aria-label={collapsed ? 'Expandir panel' : 'Colapsar panel'}
                    aria-expanded={!collapsed}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-(--color-text-muted) transition-colors hover:bg-(--color-bg-soft) hover:text-(--color-text)"
                >
                    <span className={`transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}>
                        <ChevronLeft />
                    </span>
                </button>
            </div>

            {/* Collapsed: flat project initials only */}
            {collapsed ? (
                <nav className="flex-1 overflow-y-auto p-2">
                    <ul className="flex flex-col gap-1">
                        {projects.map((project) => {
                            const team = teams.find((t) => t.id === project.teamId)
                            const active = project.id === activeProjectId
                            return (
                                <li key={project.id}>
                                    <button
                                        type="button"
                                        onClick={() => onSelectProject(project.id)}
                                        title={project.name}
                                        aria-current={active ? 'page' : undefined}
                                        className={`flex w-full justify-center rounded-lg p-1 ${active ? 'bg-brand/10 ring-1 ring-inset ring-brand/30' : 'hover:bg-(--color-bg-soft)'}`}
                                    >
                                        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${accentAvatar[team?.color ?? 'slate']}`}>
                                            {initials(project.name)}
                                        </span>
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                </nav>
            ) : (
                /* Expanded: teams → projects hierarchy */
                <nav className="flex-1 overflow-y-auto p-2">
                    <ul className="flex flex-col gap-3">
                        {teams.map((team) => {
                            const teamProjects = projects.filter((p) => p.teamId === team.id)
                            const open = isTeamOpen(team.id)
                            return (
                                <li key={team.id}>
                                    {/* Team header */}
                                    <div className="group/team flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => toggleTeam(team.id)}
                                            aria-expanded={open}
                                            className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-1.5 py-1 text-left hover:bg-(--color-bg-soft)"
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`h-3 w-3 shrink-0 text-(--color-text-muted) transition-transform ${open ? 'rotate-90' : ''}`} aria-hidden="true">
                                                <path d="m9 18 6-6-6-6" />
                                            </svg>
                                            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${accentDot[team.color]}`} aria-hidden="true" />
                                            <span className="truncate text-sm font-semibold text-(--color-text)">{team.name}</span>
                                        </button>

                                        {/* Members preview */}
                                        <span className="hidden shrink-0 sm:block">
                                            <AssigneeStack assignees={membersOf(team)} max={3} />
                                        </span>

                                        {/* Team options menu */}
                                        <div className="relative shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => setMenuTeamId((id) => (id === team.id ? null : team.id))}
                                                aria-label={`Opciones de ${team.name}`}
                                                aria-haspopup="menu"
                                                aria-expanded={menuTeamId === team.id}
                                                className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-(--color-text-muted) opacity-0 transition-colors hover:bg-(--color-bg-soft) hover:text-(--color-text) focus-visible:opacity-100 group-hover/team:opacity-100"
                                            >
                                                <DotsMenuIcon />
                                            </button>

                                            {menuTeamId === team.id ? (
                                                <>
                                                    {/* click-away backdrop */}
                                                    <button
                                                        type="button"
                                                        aria-hidden="true"
                                                        tabIndex={-1}
                                                        className="fixed inset-0 z-40 cursor-default"
                                                        onClick={() => setMenuTeamId(null)}
                                                    />
                                                    <div
                                                        role="menu"
                                                        className="absolute right-0 top-8 z-50 w-52 overflow-hidden rounded-xl border border-(--color-border) bg-(--color-surface) py-1 shadow-lg"
                                                    >
                                                        <MenuItem
                                                            label="Invitar usuario…"
                                                            onClick={() => { setMenuTeamId(null); onManageMembers({ teamId: team.id }, 'invite') }}
                                                        />
                                                        <MenuItem
                                                            label="Agregar miembro"
                                                            onClick={() => { setMenuTeamId(null); onManageMembers({ teamId: team.id }, 'add') }}
                                                        />
                                                        <div className="my-1 h-px bg-(--color-border)" />
                                                        <MenuItem
                                                            label="Nuevo proyecto"
                                                            onClick={() => { setMenuTeamId(null); onNewProject(team.id) }}
                                                        />
                                                    </div>
                                                </>
                                            ) : null}
                                        </div>
                                    </div>

                                    {/* Team projects */}
                                    {open ? (
                                        <ul className="mt-1 flex flex-col gap-0.5 pl-3">
                                            {teamProjects.map((project) => {
                                                const active = project.id === activeProjectId
                                                const done = project.tasks.filter((t) => t.completed).length
                                                return (
                                                    <li key={project.id}>
                                                        <button
                                                            type="button"
                                                            onClick={() => onSelectProject(project.id)}
                                                            aria-current={active ? 'page' : undefined}
                                                            className={`flex w-full items-center gap-2.5 rounded-lg p-1.5 text-left transition-colors ${
                                                                active ? 'bg-brand/10 ring-1 ring-inset ring-brand/30' : 'hover:bg-(--color-bg-soft)'
                                                            }`}
                                                        >
                                                            <span className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold ${accentAvatar[team.color]}`}>
                                                                {initials(project.name)}
                                                            </span>
                                                            <span className="min-w-0 flex-1">
                                                                <span className={`block truncate text-sm font-medium ${active ? 'text-brand' : 'text-(--color-text)'}`}>
                                                                    {project.name}
                                                                </span>
                                                                <span className="block truncate text-[11px] text-(--color-text-muted)">
                                                                    {done}/{project.tasks.length} tareas
                                                                </span>
                                                            </span>
                                                        </button>
                                                    </li>
                                                )
                                            })}

                                            <li>
                                                <button
                                                    type="button"
                                                    onClick={() => onNewProject(team.id)}
                                                    className="flex w-full items-center gap-2 rounded-lg px-1.5 py-1.5 text-xs font-medium text-(--color-text-muted) transition-colors hover:bg-(--color-bg-soft) hover:text-brand"
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5" aria-hidden="true">
                                                        <path d="M12 5v14M5 12h14" />
                                                    </svg>
                                                    Nuevo proyecto
                                                </button>
                                            </li>
                                        </ul>
                                    ) : null}
                                </li>
                            )
                        })}
                    </ul>
                </nav>
            )}

            {/* Footer: workspace-level invite */}
            <div className="border-t border-(--color-border) p-2">
                <button
                    type="button"
                    onClick={() => onManageMembers({}, 'invite')}
                    title="Invitar usuarios"
                    className={`flex w-full items-center gap-2.5 rounded-lg p-1.5 text-sm font-medium text-(--color-text-muted) transition-colors hover:bg-(--color-bg-soft) hover:text-brand ${collapsed ? 'justify-center' : ''}`}
                >
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-dashed border-(--color-border)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4" aria-hidden="true">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M19 8v6M22 11h-6" />
                        </svg>
                    </span>
                    {!collapsed ? <span>Invitar usuarios</span> : null}
                </button>
            </div>
        </aside>
    )
}

function MenuItem({ label, onClick }: { label: string; onClick: () => void }) {
    return (
        <button
            type="button"
            role="menuitem"
            onClick={onClick}
            className="flex w-full items-center px-3 py-2 text-left text-sm text-(--color-text) transition-colors hover:bg-(--color-bg-soft)"
        >
            {label}
        </button>
    )
}
