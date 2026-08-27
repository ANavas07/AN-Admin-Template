import { useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { CapturedValue, CellStyle, TemplateCell as Cell } from '../../types'
import type { IconCatalog } from '../../hooks/useIconCatalog'

// Dibuja UNA celda del template según su tipo (label/field/icon/image) y el modo.
// El comportamiento depende del TIPO de celda, no de su posición ni su sección.

export interface TemplateCellProps {
  cell: Cell
  value: CapturedValue | undefined
  mode: 'read' | 'edit'
  catalog: IconCatalog
  onCommitText: (fieldId: string, value: string) => void
  onOpenPicker: (cell: Cell) => void
}

function styleToCss(style?: CellStyle): CSSProperties {
  if (!style) return {}
  return {
    background: style.bg,
    color: style.color,
    fontWeight: style.bold ? 700 : undefined,
    fontStyle: style.italic ? 'italic' : undefined,
    textTransform: style.uppercase ? 'uppercase' : undefined,
    fontSize: style.fontSize ? `${style.fontSize}px` : undefined,
  }
}

const alignClass = (a?: string) =>
  a === 'center' ? 'text-center' : a === 'right' ? 'text-right' : 'text-left'
const justifyClass = (a?: string) =>
  a === 'center' ? 'justify-center' : a === 'right' ? 'justify-end' : 'justify-start'
const itemsClass = (v?: string) =>
  v === 'top' ? 'items-start' : v === 'bottom' ? 'items-end' : 'items-center'

/** Resuelve la fuente de imagen de un valor visual (ícono del catálogo o asset subido). */
function resolveVisualSrc(value: CapturedValue | undefined, catalog: IconCatalog): string | null {
  if (!value) return null
  if (value.kind === 'icon') return catalog.getById(value.iconId)?.svgPath ?? null
  if (value.kind === 'image') return value.asset.url
  return null
}

export default function TemplateCell({
  cell,
  value,
  mode,
  catalog,
  onCommitText,
  onOpenPicker,
}: TemplateCellProps) {
  const css = styleToCss(cell.style)
  const base = 'h-full w-full px-2 py-1.5 text-xs text-(--color-text)'

  // ── label ──────────────────────────────────────────────────────────────────
  if (cell.type === 'label') {
    return (
      <div
        style={css}
        className={`${base} flex ${itemsClass(cell.style?.valign)} ${alignClass(cell.style?.align)}`}
      >
        <span className="w-full">{cell.text}</span>
      </div>
    )
  }

  // ── icon / image ─────────────────────────────────────────────────────────────
  if (cell.type === 'icon' || cell.type === 'image') {
    const src = resolveVisualSrc(value, catalog)
    const editable = cell.editable !== false && mode === 'edit'
    const label =
      value?.kind === 'image'
        ? value.asset.fileName
        : value?.kind === 'icon'
          ? catalog.getById(value.iconId)?.label
          : undefined

    const content = src ? (
      <img
        src={src}
        alt={label ?? ''}
        style={{ width: cell.size.width, height: cell.size.height }}
        className="object-contain"
      />
    ) : (
      <span
        style={{ width: cell.size.width, height: cell.size.height }}
        className="flex items-center justify-center rounded-md border border-dashed border-(--color-border) text-[18px] leading-none text-(--color-text-muted)"
      >
        {cell.type === 'image' ? '🖼' : '＋'}
      </span>
    )

    return (
      <div
        style={css}
        className={`${base} flex ${itemsClass(cell.style?.valign ?? 'middle')} ${justifyClass(cell.style?.align ?? 'center')}`}
      >
        {editable ? (
          <button
            type="button"
            onClick={() => onOpenPicker(cell)}
            title={label ? `${label} — clic para cambiar` : 'Clic para elegir'}
            className="rounded-md p-0.5 transition-all hover:bg-(--color-bg-soft) hover:ring-2 hover:ring-brand/30 active:scale-[0.97]"
          >
            {content}
          </button>
        ) : (
          content
        )}
      </div>
    )
  }

  // ── field (texto editable) ────────────────────────────────────────────────────
  return (
    <FieldCellView
      cell={cell}
      value={value?.kind === 'text' ? value.value : ''}
      mode={mode}
      css={css}
      base={base}
      onCommitText={onCommitText}
    />
  )
}

function FieldCellView({
  cell,
  value,
  mode,
  css,
  base,
  onCommitText,
}: {
  cell: Extract<Cell, { type: 'field' }>
  value: string
  mode: 'read' | 'edit'
  css: CSSProperties
  base: string
  onCommitText: (fieldId: string, value: string) => void
}) {
  const [draft, setDraft] = useState(value)
  const [lastExternal, setLastExternal] = useState(value)
  const ref = useRef<HTMLTextAreaElement>(null)

  // Sincroniza el borrador si el valor externo cambia (reset/carga), ajustando
  // el estado durante el render en vez de en un efecto (patrón recomendado).
  if (value !== lastExternal) {
    setLastExternal(value)
    setDraft(value)
  }

  const editable = cell.editable !== false && mode === 'edit'
  const align = alignClass(cell.style?.align)

  if (!editable) {
    return (
      <div style={css} className={`${base} ${align} whitespace-pre-wrap break-words`}>
        {value}
      </div>
    )
  }

  return (
    <textarea
      ref={ref}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        if (draft !== value) onCommitText(cell.fieldId, draft)
      }}
      placeholder={cell.placeholder}
      rows={cell.multiline ? 2 : 1}
      style={css}
      className={`${base} ${align} resize-none whitespace-pre-wrap break-words bg-transparent outline-none placeholder:text-(--color-text-muted) focus:ring-2 focus:ring-highlight/25`}
    />
  )
}
