import { useState } from 'react'
import { paletteCategories } from '../bpmnCatalog'
import type { PaletteItem } from '../bpmnCatalog'
import { ChevronIcon } from '../../../icons/icons'
import BpmnGlyph from './BpmnGlyph'

type PalettePanelProps = {
    onAdd: (item: PaletteItem) => void
}

type HelpState = {
    item: PaletteItem
    /** Viewport coordinates of the hovered row, for the fixed-position popover */
    top: number
    left: number
}

/**
 * BPMN palette grouped by category. Hovering an element shows contextual help
 * ("¿Qué hace?" + example) so non-BPMN users learn while modelling.
 */
export default function PalettePanel({ onAdd }: PalettePanelProps) {
    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
    const [help, setHelp] = useState<HelpState | null>(null)

    function toggleCategory(id: string) {
        setCollapsed((current) => ({ ...current, [id]: !current[id] }))
    }

    function showHelp(item: PaletteItem, element: HTMLElement) {
        const rect = element.getBoundingClientRect()
        setHelp({ item, top: rect.top, left: rect.right + 10 })
    }

    return (
        <>
            <div
                onPointerDown={(event) => event.stopPropagation()}
                className="absolute bottom-16 left-3 top-3 z-30 flex w-48 flex-col overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface)/95 shadow-lg backdrop-blur"
                role="toolbar"
                aria-label="Paleta de elementos BPMN"
            >
                <div className="border-b border-(--color-border) px-3.5 py-2.5">
                    <p className="text-xs font-bold uppercase tracking-wide text-(--color-text)">Paleta BPMN</p>
                    <p className="text-[10px] text-(--color-text-muted)">Clic para agregar al lienzo</p>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto p-1.5" onScroll={() => setHelp(null)}>
                    {paletteCategories.map((category) => {
                        const isCollapsed = collapsed[category.id]
                        return (
                            <div key={category.id} className="mb-1">
                                <button
                                    type="button"
                                    onClick={() => toggleCategory(category.id)}
                                    className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-(--color-text-muted) transition-colors hover:bg-(--color-bg-soft)"
                                    aria-expanded={!isCollapsed}
                                >
                                    {category.label}
                                    <ChevronIcon
                                        className={`size-3.5 transition-transform ${isCollapsed ? '-rotate-90' : ''}`}
                                    />
                                </button>
                                {!isCollapsed
                                    ? category.items.map((item) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => onAdd(item)}
                                            onMouseEnter={(event) => showHelp(item, event.currentTarget)}
                                            onMouseLeave={() => setHelp(null)}
                                            onFocus={(event) => showHelp(item, event.currentTarget)}
                                            onBlur={() => setHelp(null)}
                                            className="flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-left text-xs font-medium text-(--color-text) transition-colors hover:bg-brand-soft hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                                            aria-label={`Agregar ${item.label}`}
                                        >
                                            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-(--color-border) bg-(--color-surface)">
                                                <BpmnGlyph kind={item.kind} bpmnType={item.bpmnType} className="size-4.5" />
                                            </span>
                                            <span className="truncate">{item.label}</span>
                                        </button>
                                    ))
                                    : null}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Contextual BPMN help popover */}
            {help ? (
                <div
                    className="pointer-events-none fixed z-50 w-64 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-xl"
                    style={{ top: Math.min(help.top, window.innerHeight - 190), left: help.left }}
                    role="tooltip"
                >
                    <div className="flex items-center gap-2">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-soft text-brand">
                            <BpmnGlyph kind={help.item.kind} bpmnType={help.item.bpmnType} className="size-5" />
                        </span>
                        <p className="text-sm font-bold text-(--color-text)">{help.item.label}</p>
                    </div>
                    <p className="mt-2 text-[11px] font-bold uppercase tracking-wide text-(--color-text-muted)">
                        ¿Qué hace?
                    </p>
                    <p className="mt-0.5 text-xs leading-5 text-(--color-text)">{help.item.help.what}</p>
                    <p className="mt-2 text-[11px] font-bold uppercase tracking-wide text-(--color-text-muted)">
                        Ejemplo
                    </p>
                    <p className="mt-0.5 text-xs leading-5 text-(--color-text-muted)">{help.item.help.example}</p>
                </div>
            ) : null}
        </>
    )
}
