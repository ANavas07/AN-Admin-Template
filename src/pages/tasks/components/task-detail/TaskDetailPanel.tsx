import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import ButtonComponent from '../../../../components/ui/buttons/ButtonComponent'
import type { TasksApi } from '../../hooks/useTasksMock'
import { formatLongDate } from '../../utils'
import { CompletionCheck } from '../shared/CompletionCheck'
import { AssigneeAvatar } from '../shared/AssigneeAvatar'
import { SubtaskList } from './SubtaskList'
import { TaskMetaFields } from './TaskMetaFields'
import type { Priority, TaskComment } from '../../types'

type Props = {
    taskId: string | null
    api: TasksApi
    onClose: () => void
}

// Visual-only "current user" for the mock comment composer.
const currentUser = { id: 'me', name: 'Tú', color: 'sky' as const }
const genId = () => `x${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

export function TaskDetailPanel({ taskId, api, onClose }: Props) {
    const task = useMemo(
        () => api.project.tasks.find((item) => item.id === taskId) ?? null,
        [api.project.tasks, taskId],
    )
    const section = useMemo(
        () => api.project.sections.find((item) => item.id === task?.sectionId),
        [api.project.sections, task?.sectionId],
    )

    const [visible, setVisible] = useState(false)
    const [editingTitle, setEditingTitle] = useState(false)
    const [titleDraft, setTitleDraft] = useState('')
    const [comment, setComment] = useState('')
    const titleRef = useRef<HTMLTextAreaElement>(null)

    // Slide-in on mount; close on Escape.
    useEffect(() => {
        if (!taskId) return
        const raf = requestAnimationFrame(() => setVisible(true))
        function onKey(event: KeyboardEvent) {
            if (event.key === 'Escape') requestClose()
        }
        document.addEventListener('keydown', onKey)
        document.body.style.overflow = 'hidden'
        return () => {
            cancelAnimationFrame(raf)
            document.removeEventListener('keydown', onKey)
            document.body.style.overflow = ''
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [taskId])

    if (!taskId || !task) return null

    function requestClose() {
        setVisible(false)
        // Let the slide-out transition play before unmounting.
        window.setTimeout(onClose, 220)
    }

    function commitTitle() {
        const next = titleDraft.trim()
        if (next && next !== task!.title) api.updateTask(task!.id, { title: next })
        setEditingTitle(false)
    }

    function addSubtask(title: string) {
        api.updateTask(task!.id, {
            subtasks: [...task!.subtasks, { id: genId(), title, completed: false }],
        })
    }

    function toggleSubtask(subtaskId: string) {
        api.toggleSubtask(task!.id, subtaskId)
    }

    function changePriority(priority: Priority) {
        api.updateTask(task!.id, { priority })
    }

    function changeLocation(location: string) {
        api.updateTask(task!.id, { location: location.trim() || null })
    }

    function addComment() {
        const body = comment.trim()
        if (!body) return
        const entry: TaskComment = {
            id: genId(),
            author: currentUser,
            body,
            createdAt: new Date().toISOString(),
        }
        api.updateTask(task!.id, { comments: [...task!.comments, entry] })
        setComment('')
    }

    return createPortal(
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
                onClick={requestClose}
                aria-hidden="true"
            />

            {/* Sliding panel */}
            <aside
                role="dialog"
                aria-modal="true"
                aria-label={`Detalle de la tarea ${task.title}`}
                className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-(--color-border) bg-(--color-surface) shadow-2xl transition-transform duration-200 ease-out ${
                    visible ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between gap-3 border-b border-(--color-border) px-4 py-3">
                    <div className="flex items-center gap-2 text-xs text-(--color-text-muted)">
                        <span className="rounded-full border border-(--color-border) px-2 py-0.5 font-medium">
                            {section?.name ?? '—'}
                        </span>
                    </div>
                    <ButtonComponent variant="ghost" size="icon" onClick={requestClose} aria-label="Cerrar panel">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4" aria-hidden="true">
                            <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                    </ButtonComponent>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-4 py-4">
                    {/* Title + complete */}
                    <div className="flex items-start gap-3">
                        <div className="pt-1">
                            <CompletionCheck
                                completed={task.completed}
                                onToggle={() => api.toggleComplete(task.id)}
                                label={`Marcar "${task.title}" como completada`}
                            />
                        </div>
                        {editingTitle ? (
                            <textarea
                                ref={titleRef}
                                value={titleDraft}
                                autoFocus
                                rows={2}
                                onChange={(event) => setTitleDraft(event.target.value)}
                                onBlur={commitTitle}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        event.preventDefault()
                                        commitTitle()
                                    }
                                }}
                                className="w-full resize-none rounded-lg border border-highlight bg-(--color-surface) px-2 py-1 text-lg font-semibold text-(--color-text) focus:outline-none focus:ring-2 focus:ring-highlight/25"
                            />
                        ) : (
                            <h2
                                onClick={() => {
                                    setTitleDraft(task.title)
                                    setEditingTitle(true)
                                }}
                                className={`cursor-text text-lg font-semibold leading-snug text-(--color-text) ${task.completed ? 'text-(--color-text-muted) line-through' : ''}`}
                            >
                                {task.title}
                            </h2>
                        )}
                    </div>

                    {/* Meta fields */}
                    <div className="mt-4">
                        <TaskMetaFields
                            task={task}
                            tagCatalog={api.project.tags}
                            onChangePriority={changePriority}
                            onChangeLocation={changeLocation}
                            onSetTags={(tags) => api.updateTask(task.id, { tags })}
                            onCreateTag={api.createTag}
                        />
                    </div>

                    {/* Description */}
                    <div className="mt-4">
                        <h3 className="mb-1.5 text-sm font-semibold text-(--color-text)">Descripción</h3>
                        <textarea
                            defaultValue={task.description}
                            key={task.id}
                            rows={3}
                            placeholder="Añade más detalle…"
                            onBlur={(event) => api.updateTask(task.id, { description: event.target.value })}
                            className="w-full resize-none rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-text) placeholder:text-(--color-text-muted) focus:border-highlight focus:outline-none focus:ring-2 focus:ring-highlight/25"
                        />
                    </div>

                    {/* Subtasks */}
                    <div className="mt-5 border-t border-(--color-border) pt-4">
                        <SubtaskList subtasks={task.subtasks} onToggle={toggleSubtask} onAdd={addSubtask} />
                    </div>

                    {/* Comments (visual mock) */}
                    <div className="mt-5 border-t border-(--color-border) pt-4">
                        <h3 className="mb-3 text-sm font-semibold text-(--color-text)">Comentarios</h3>
                        <ul className="flex flex-col gap-3">
                            {task.comments.map((entry) => (
                                <li key={entry.id} className="flex gap-2.5">
                                    <AssigneeAvatar assignee={entry.author} size="md" />
                                    <div className="min-w-0 flex-1 rounded-lg border border-(--color-border) bg-(--color-bg-soft)/50 px-3 py-2">
                                        <div className="flex items-baseline justify-between gap-2">
                                            <span className="text-xs font-semibold text-(--color-text)">{entry.author.name}</span>
                                            <span className="text-[11px] text-(--color-text-muted)">
                                                {formatLongDate(entry.createdAt)}
                                            </span>
                                        </div>
                                        <p className="mt-0.5 text-sm text-(--color-text)">{entry.body}</p>
                                    </div>
                                </li>
                            ))}
                            {task.comments.length === 0 ? (
                                <li className="text-sm text-(--color-text-muted)">Aún no hay comentarios.</li>
                            ) : null}
                        </ul>

                        <div className="mt-3 flex gap-2.5">
                            <AssigneeAvatar assignee={currentUser} size="md" />
                            <div className="flex-1">
                                <textarea
                                    value={comment}
                                    onChange={(event) => setComment(event.target.value)}
                                    rows={2}
                                    placeholder="Escribe un comentario…"
                                    className="w-full resize-none rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-text) placeholder:text-(--color-text-muted) focus:border-highlight focus:outline-none focus:ring-2 focus:ring-highlight/25"
                                />
                                <div className="mt-2 flex justify-end">
                                    <ButtonComponent size="sm" onClick={addComment} disabled={!comment.trim()}>
                                        Comentar
                                    </ButtonComponent>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </div>,
        document.body,
    )
}
