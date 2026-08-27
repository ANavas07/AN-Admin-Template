import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { sileo } from 'sileo'
import PopUp from '../../../../components/common/pop-up/PopUp'
import TemplateCell from './TemplateCell'
import IconPicker from '../picker/IconPicker'
import { useIconCatalog } from '../../hooks/useIconCatalog'
import { validateCapturedValue } from '../../validation'
import type {
  CapturedValue,
  TemplateCell as Cell,
  TemplateDefinition,
  UploadedAssetRef,
} from '../../types'

// Dibuja la grilla completa desde el TemplateDefinition y coordina el selector
// de recursos visuales (IconPicker) para las celdas icon/image.

export interface TemplateGridProps {
  template: TemplateDefinition
  mode: 'read' | 'edit'
  ownerId: string
  getValue: (fieldId: string) => CapturedValue | undefined
  setText: (fieldId: string, value: string) => void
  setIcon: (fieldId: string, iconId: string) => void
  setImage: (fieldId: string, asset: UploadedAssetRef) => void
  clearValue: (fieldId: string) => void
  uploadImage: (file: File) => Promise<UploadedAssetRef>
}

const DEFAULT_ROW_H = 32

export default function TemplateGrid({
  template,
  mode,
  ownerId,
  getValue,
  setText,
  setIcon,
  setImage,
  clearValue,
  uploadImage,
}: TemplateGridProps) {
  const catalog = useIconCatalog()
  const [editingCell, setEditingCell] = useState<Cell | null>(null)

  const { gridTemplateColumns, gridTemplateRows } = useMemo(() => {
    const totalRows = template.cells.reduce(
      (max, c) => Math.max(max, c.row + (c.rowSpan ?? 1) - 1),
      0,
    )
    const cols = template.columns.map((c) => `${c.weight}fr`).join(' ')
    const rows = Array.from(
      { length: totalRows },
      (_, i) => `minmax(${template.rowHeights?.[i + 1] ?? DEFAULT_ROW_H}px, auto)`,
    ).join(' ')
    return { gridTemplateColumns: cols, gridTemplateRows: rows }
  }, [template])

  const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns,
    gridTemplateRows,
    gap: '1px',
    background: 'var(--color-border)',
    border: '1px solid var(--color-border)',
  }

  function commitValue(cell: Cell, value: CapturedValue) {
    const error = validateCapturedValue(cell, value, { manifest: catalog.manifest, ownerId })
    if (error) {
      sileo.error({ title: error })
      return
    }
    if (value.kind === 'icon') setIcon((cell as Extract<Cell, { fieldId: string }>).fieldId, value.iconId)
    else if (value.kind === 'image') setImage((cell as Extract<Cell, { fieldId: string }>).fieldId, value.asset)
    setEditingCell(null)
  }

  const editingFieldId =
    editingCell && 'fieldId' in editingCell ? editingCell.fieldId : undefined
  const editingValue = editingFieldId ? getValue(editingFieldId) : undefined
  const allowUpload = editingCell?.type === 'image' && editingCell.allowUpload === true

  return (
    <>
      <div className="w-full overflow-x-auto">
        <div style={gridStyle} className="min-w-[900px] rounded-lg">
          {template.cells.map((cell) => (
            <div
              key={cell.id}
              style={{
                gridColumn: `${cell.col} / span ${cell.colSpan ?? 1}`,
                gridRow: `${cell.row} / span ${cell.rowSpan ?? 1}`,
                background: 'var(--color-surface)',
              }}
            >
              <TemplateCell
                cell={cell}
                value={'fieldId' in cell ? getValue(cell.fieldId) : undefined}
                mode={mode}
                catalog={catalog}
                onCommitText={setText}
                onOpenPicker={setEditingCell}
              />
            </div>
          ))}
        </div>
      </div>

      <PopUp
        isOpen={editingCell !== null}
        onClose={() => setEditingCell(null)}
        title={editingCell?.type === 'image' ? 'Elegir imagen o ícono' : 'Elegir ícono'}
        description="Selecciona del catálogo o busca por nombre/etiqueta."
        size="lg"
      >
        {editingCell && (
          <IconPicker
            catalog={catalog}
            allowUpload={allowUpload}
            selectedIconId={editingValue?.kind === 'icon' ? editingValue.iconId : undefined}
            onSelectIcon={(iconId) => commitValue(editingCell, { kind: 'icon', iconId })}
            onSelectImage={(asset) => commitValue(editingCell, { kind: 'image', asset })}
            uploadImage={uploadImage}
            onClear={
              editingFieldId
                ? () => {
                    clearValue(editingFieldId)
                    setEditingCell(null)
                  }
                : undefined
            }
          />
        )}
      </PopUp>
    </>
  )
}
