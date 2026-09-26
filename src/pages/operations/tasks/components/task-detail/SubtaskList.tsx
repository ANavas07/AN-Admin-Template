import { useState } from 'react'
import type { Subtask } from '../../types'
import { CompletionCheck } from '../shared/CompletionCheck'

type Props = {
    subtasks: Subtask[]
    onToggle: (subtaskId: string) => void
    onAdd: (title: string) => void
}

export function SubtaskList({ subtasks, onToggle, onAdd }: Props) {
    const [draft, setDraft] = useState('')
    const done = subtasks.filter((subtask) => subtask.completed).length

    function submit() {
        const title = draft.trim()
        if (!title) return
        onAdd(title)
        setDraft('')
    }

    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-fg">Subtareas</h3>
                {subtasks.length > 0 ? (
                    <span className="text-xs font-medium text-fg-muted">
                        {done}/{subtasks.length}
                    </span>
                ) : null}
            </div>

            <ul className="flex flex-col">
                {subtasks.map((subtask) => (
                    <li key={subtask.id} className="flex items-center gap-2.5 py-1.5">
                        <CompletionCheck
                            completed={subtask.completed}
                            onToggle={() => onToggle(subtask.id)}
                            label={`Completar subtarea ${subtask.title}`}
                            size="sm"
                        />
                        <span
                            className={`text-sm ${subtask.completed ? 'text-fg-muted line-through' : 'text-fg'}`}
                        >
                            {subtask.title}
                        </span>
                    </li>
                ))}
            </ul>

            <div className="mt-1 flex items-center gap-2">
                <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-line" aria-hidden="true" />
                <input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') submit()
                    }}
                    placeholder="Añadir subtarea…"
                    className="w-full bg-transparent text-sm text-fg placeholder:text-fg-muted focus:outline-none"
                />
            </div>
        </div>
    )
}
