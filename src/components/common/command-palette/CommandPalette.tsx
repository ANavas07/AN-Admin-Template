import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { useWorkspace } from '../../../context/workspace-context'
import { SearchIcon, StarIcon } from '../../../icons/icons'
import { cn } from '../../../utils/cn'
import { modifierKeyLabel } from '../../../utils/platform'
import Kbd from '../../ui/kbd/Kbd'
import { normalizeText, scoreFields } from './commandSearch'
import { COMMAND_GROUPS, useCommandItems } from './useCommandItems'
import type { CommandItem } from './useCommandItems'

const RESULT_LIMIT = 40

type CommandPaletteProps = {
    onClose: () => void
}

type Section = { group: string; items: CommandItem[] }

/** Filters and orders the items: grouped, best matches first inside each group. */
function buildSections(items: CommandItem[], rawQuery: string): Section[] {
    const query = normalizeText(rawQuery)
    const scored = items.flatMap((item) => {
        if (!query) return item.searchOnly ? [] : [{ item, score: 0 }]
        // Favorites and recents repeat modules; while searching, the module entry is enough
        if (item.group === 'Favoritos' || item.group === 'Recientes') return []
        const score = scoreFields(query, [
            [item.label, 1],
            ...(item.keywords ?? []).map((keyword): [string, number] => [keyword, 0.8]),
            [item.hint, 0.5],
        ])
        return score === null ? [] : [{ item, score }]
    })

    const limited = query ? [...scored].sort((a, b) => b.score - a.score).slice(0, RESULT_LIMIT) : scored
    const sections = COMMAND_GROUPS.map((group) => {
        const entries = limited.filter((entry) => entry.item.group === group).sort((a, b) => b.score - a.score)
        return { group, items: entries.map((entry) => entry.item), best: entries[0]?.score ?? 0 }
    }).filter((section) => section.items.length > 0)
    // While searching, the group holding the best match comes first
    if (query) sections.sort((a, b) => b.best - a.best)
    return sections
}

/**
 * Global command palette (Ctrl/⌘ + K): search modules, pages, routes and
 * actions, jump to favorites and recent history. Implements the ARIA combobox
 * pattern: focus stays in the input and the active option is announced.
 */
export default function CommandPalette({ onClose }: CommandPaletteProps) {
    const items = useCommandItems()
    const { isFavorite, toggleFavorite } = useWorkspace()
    const [query, setQuery] = useState('')
    const [activeIndex, setActiveIndex] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)
    const listRef = useRef<HTMLDivElement>(null)
    const listId = useId()
    const modifier = modifierKeyLabel()

    const sections = useMemo(() => buildSections(items, query), [items, query])
    const flatItems = useMemo(() => sections.flatMap((section) => section.items), [sections])
    const activeItem = flatItems[Math.min(activeIndex, flatItems.length - 1)] ?? null
    const optionId = (item: CommandItem) => `${listId}-${item.id}`

    // Focus the search on open and give the focus back to the page on close
    useEffect(() => {
        const previouslyFocused = document.activeElement as HTMLElement | null
        inputRef.current?.focus()
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = ''
            previouslyFocused?.focus?.()
        }
    }, [])

    // Keep the active option visible while moving with the keyboard
    useEffect(() => {
        if (!activeItem) return
        document.getElementById(optionId(activeItem))?.scrollIntoView({ block: 'nearest' })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeItem])

    function run(item: CommandItem) {
        onClose()
        item.perform()
    }

    function moveActive(delta: number) {
        if (flatItems.length === 0) return
        setActiveIndex((current) => (current + delta + flatItems.length) % flatItems.length)
    }

    function handleKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault()
                moveActive(1)
                break
            case 'ArrowUp':
                event.preventDefault()
                moveActive(-1)
                break
            case 'Home':
                if (event.ctrlKey) {
                    event.preventDefault()
                    setActiveIndex(0)
                }
                break
            case 'End':
                if (event.ctrlKey) {
                    event.preventDefault()
                    setActiveIndex(flatItems.length - 1)
                }
                break
            case 'Enter':
                event.preventDefault()
                if (activeItem) run(activeItem)
                break
            case 'Escape':
                event.preventDefault()
                onClose()
                break
            case 'Tab':
                // Focus is kept inside the dialog; Tab moves through results like the arrows
                event.preventDefault()
                moveActive(event.shiftKey ? -1 : 1)
                break
            default:
                // Ctrl/⌘ + D is always ours inside the palette (never the browser bookmark dialog)
                if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'd') {
                    event.preventDefault()
                    if (activeItem?.moduleId) toggleFavorite(activeItem.moduleId)
                }
        }
    }

    return createPortal(
        <div className="fixed inset-0 z-(--z-popover) flex items-start justify-center px-4 pt-[12vh]">
            <div className="absolute inset-0 bg-overlay" onClick={onClose} aria-hidden="true" />

            <div
                role="dialog"
                aria-modal="true"
                aria-label="Paleta de comandos"
                className="relative flex max-h-[70vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-2xl"
            >
                <div className="flex items-center gap-3 border-b border-line px-4">
                    <SearchIcon className="size-4.5 shrink-0 text-fg-subtle" />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(event) => {
                            setQuery(event.target.value)
                            setActiveIndex(0)
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Buscar módulos, páginas, rutas o acciones…"
                        className="h-13 w-full bg-transparent text-sm text-fg placeholder:text-fg-subtle focus:outline-none"
                        role="combobox"
                        aria-expanded="true"
                        aria-controls={listId}
                        aria-autocomplete="list"
                        aria-activedescendant={activeItem ? optionId(activeItem) : undefined}
                        spellCheck={false}
                        autoComplete="off"
                    />
                    <Kbd>Esc</Kbd>
                </div>

                <div ref={listRef} id={listId} role="listbox" aria-label="Resultados" className="min-h-0 flex-1 overflow-y-auto p-2">
                    {sections.length === 0 ? (
                        <p className="px-3 py-10 text-center text-sm text-fg-muted">
                            Sin resultados para «{query}»
                        </p>
                    ) : (
                        sections.map((section) => (
                            <div key={section.group} role="group" aria-labelledby={`${listId}-${section.group}`} className="mb-1.5 last:mb-0">
                                <p id={`${listId}-${section.group}`} className="eyebrow px-3 pb-1 pt-2 text-3xs" role="presentation">
                                    {section.group}
                                </p>
                                {section.items.map((item) => {
                                    const isActive = item === activeItem
                                    const starred = item.moduleId ? isFavorite(item.moduleId) : false
                                    return (
                                        <div
                                            key={item.id}
                                            id={optionId(item)}
                                            role="option"
                                            aria-selected={isActive}
                                            onMouseMove={() => setActiveIndex(flatItems.indexOf(item))}
                                            onClick={() => run(item)}
                                            className={cn(
                                                'group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2',
                                                isActive ? 'bg-canvas-subtle' : ''
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    'inline-flex size-8 shrink-0 items-center justify-center rounded-md border',
                                                    isActive ? 'border-brand/25 bg-brand-soft text-brand-strong' : 'border-line bg-surface text-fg-muted'
                                                )}
                                            >
                                                {item.icon}
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="block truncate text-sm font-medium text-fg">{item.label}</span>
                                                {item.hint ? (
                                                    <span className="block truncate text-xs text-fg-muted">{item.hint}</span>
                                                ) : null}
                                            </span>
                                            {item.moduleId ? (
                                                <button
                                                    type="button"
                                                    tabIndex={-1}
                                                    onClick={(event) => {
                                                        event.stopPropagation()
                                                        toggleFavorite(item.moduleId!)
                                                    }}
                                                    className={cn(
                                                        'inline-flex size-7 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-surface',
                                                        starred ? 'text-warning' : 'text-fg-subtle opacity-0 group-hover:opacity-100',
                                                        isActive && 'opacity-100'
                                                    )}
                                                    aria-label={starred ? `Quitar ${item.label} de favoritos` : `Agregar ${item.label} a favoritos`}
                                                    title={starred ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                                                >
                                                    <StarIcon className={cn('size-4', starred && 'fill-current')} />
                                                </button>
                                            ) : null}
                                        </div>
                                    )
                                })}
                            </div>
                        ))
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line bg-surface-muted px-4 py-2 text-2xs text-fg-muted">
                    <span className="inline-flex items-center gap-1">
                        <Kbd>↑</Kbd>
                        <Kbd>↓</Kbd>
                        navegar
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <Kbd>↵</Kbd>
                        abrir
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <Kbd>{modifier}</Kbd>
                        <Kbd>D</Kbd>
                        favorito
                    </span>
                    <span className="ml-auto inline-flex items-center gap-1">
                        <Kbd>{modifier}</Kbd>
                        <Kbd>K</Kbd>
                        abrir / cerrar
                    </span>
                </div>
                <p className="sr-only" aria-live="polite">
                    {flatItems.length} resultados
                </p>
            </div>
        </div>,
        document.body
    )
}
