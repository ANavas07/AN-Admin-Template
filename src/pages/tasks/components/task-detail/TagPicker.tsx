import { useState } from 'react'
import { accentDot, accentStyles } from '../../constants'
import type { AccentColor, Tag } from '../../types'

type Props = {
    appliedTags: Tag[]
    catalog: Tag[]
    onSetTags: (tags: Tag[]) => void
    onCreateTag: (label: string, color: AccentColor) => Tag
}

const colorChoices: AccentColor[] = ['sky', 'violet', 'amber', 'rose', 'emerald', 'slate', 'indigo']

export function TagPicker({ appliedTags, catalog, onSetTags, onCreateTag }: Props) {
    const [open, setOpen] = useState(false)
    const [draft, setDraft] = useState('')
    const [draftColor, setDraftColor] = useState<AccentColor>('sky')

    const appliedIds = new Set(appliedTags.map((t) => t.id))

    function toggle(tag: Tag) {
        if (appliedIds.has(tag.id)) onSetTags(appliedTags.filter((t) => t.id !== tag.id))
        else onSetTags([...appliedTags, tag])
    }

    function create() {
        const label = draft.trim()
        if (!label) return
        const tag = onCreateTag(label, draftColor)
        onSetTags([...appliedTags, tag])
        setDraft('')
    }

    return (
        <div className="relative">
            <div className="flex flex-wrap items-center gap-1.5">
                {appliedTags.map((tag) => (
                    <span key={tag.id} className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${accentStyles[tag.color]}`}>
                        {tag.label}
                        <button
                            type="button"
                            onClick={() => onSetTags(appliedTags.filter((t) => t.id !== tag.id))}
                            aria-label={`Quitar etiqueta ${tag.label}`}
                            className="opacity-70 hover:opacity-100"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-2.5 w-2.5" aria-hidden="true">
                                <path d="M18 6 6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </span>
                ))}
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    aria-haspopup="dialog"
                    aria-expanded={open}
                    className="inline-flex items-center gap-1 rounded-md border border-dashed border-(--color-border) px-1.5 py-0.5 text-[11px] font-medium text-(--color-text-muted) hover:border-brand hover:text-brand"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3 w-3" aria-hidden="true">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    Etiqueta
                </button>
            </div>

            {open ? (
                <>
                    <button type="button" aria-hidden="true" tabIndex={-1} className="fixed inset-0 z-40 cursor-default" onClick={() => setOpen(false)} />
                    <div role="dialog" className="absolute left-0 top-8 z-50 w-64 rounded-xl border border-(--color-border) bg-(--color-surface) p-2 shadow-lg">
                        <div className="max-h-40 overflow-y-auto">
                            {catalog.map((tag) => {
                                const applied = appliedIds.has(tag.id)
                                return (
                                    <button
                                        key={tag.id}
                                        type="button"
                                        onClick={() => toggle(tag)}
                                        className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-(--color-bg-soft)"
                                    >
                                        <span className="flex items-center gap-2">
                                            <span className={`h-2.5 w-2.5 rounded-full ${accentDot[tag.color]}`} aria-hidden="true" />
                                            <span className="text-sm text-(--color-text)">{tag.label}</span>
                                        </span>
                                        {applied ? (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4 text-brand" aria-hidden="true">
                                                <path d="M20 6 9 17l-5-5" />
                                            </svg>
                                        ) : null}
                                    </button>
                                )
                            })}
                        </div>

                        {/* Create new custom tag */}
                        <div className="mt-2 border-t border-(--color-border) pt-2">
                            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-(--color-text-muted)">Crear etiqueta</p>
                            <input
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') create() }}
                                placeholder="Nombre de la etiqueta"
                                className="mb-2 w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-2 py-1.5 text-sm text-(--color-text) placeholder:text-(--color-text-muted) focus:border-highlight focus:outline-none focus:ring-2 focus:ring-highlight/25"
                            />
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                    {colorChoices.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setDraftColor(color)}
                                            aria-label={`Color ${color}`}
                                            className={`h-5 w-5 rounded-full ${accentDot[color]} ${draftColor === color ? 'ring-2 ring-offset-1 ring-(--color-text) ring-offset-(--color-surface)' : ''}`}
                                        />
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={create}
                                    disabled={!draft.trim()}
                                    className="rounded-lg bg-brand px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-40"
                                >
                                    Crear
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            ) : null}
        </div>
    )
}
