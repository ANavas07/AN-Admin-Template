import { useRef, useState } from 'react'
import { sileo } from 'sileo'
import InputComponent from '../../../../../components/ui/inputs/InputComponent'
import ButtonComponent from '../../../../../components/ui/buttons/ButtonComponent'
import { validateUploadFile } from '../../validation'
import { UPLOAD } from '../../constants'
import type { UploadedAssetRef } from '../../types'
import type { IconCatalog } from '../../hooks/useIconCatalog'
import { cn } from '../../../../../utils/cn'

// Selector reutilizable de recurso visual:
//  - pestaña "Catálogo": grid de íconos del manifest con buscador por texto/tags.
//  - pestaña "Subir imagen" (solo si allowUpload): valida tipo y tamaño.

export interface IconPickerProps {
  catalog: IconCatalog
  allowUpload?: boolean
  /** Id del ícono actualmente seleccionado (para resaltarlo). */
  selectedIconId?: string
  onSelectIcon: (iconId: string) => void
  onSelectImage: (asset: UploadedAssetRef) => void
  uploadImage: (file: File) => Promise<UploadedAssetRef>
  onClear?: () => void
}

type Tab = 'catalog' | 'upload'

export default function IconPicker({
  catalog,
  allowUpload = false,
  selectedIconId,
  onSelectIcon,
  onSelectImage,
  uploadImage,
  onClear,
}: IconPickerProps) {
  const [tab, setTab] = useState<Tab>('catalog')
  const [query, setQuery] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const results = catalog.search(query)

  async function handleFile(file: File | undefined) {
    if (!file) return
    const check = validateUploadFile(file)
    if (!check.ok) {
      sileo.error({ title: check.error ?? 'Archivo no válido.' })
      return
    }
    try {
      setUploading(true)
      const asset = await uploadImage(file)
      onSelectImage(asset)
      sileo.success({ title: 'Imagen subida.' })
    } catch {
      sileo.error({ title: 'No se pudo subir la imagen.' })
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Pestañas */}
      {allowUpload && (
        <div className="flex gap-1 rounded-xl bg-canvas-subtle p-1">
          <button
            type="button"
            onClick={() => setTab('catalog')}
            className={cn(
              'flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              tab === 'catalog'
                ? 'bg-surface text-fg shadow-sm'
                : 'text-fg-muted hover:text-fg',
            )}
          >
            Catálogo
          </button>
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={cn(
              'flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              tab === 'upload'
                ? 'bg-surface text-fg shadow-sm'
                : 'text-fg-muted hover:text-fg',
            )}
          >
            Subir imagen
          </button>
        </div>
      )}

      {tab === 'catalog' ? (
        <>
          <InputComponent
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre o etiqueta…"
            variant="search"
            showSearchIcon
            iconPosition="left"
            aria-label="Buscar íconos"
          />

          {catalog.loading ? (
            <p className="py-8 text-center text-sm text-fg-muted">Cargando catálogo…</p>
          ) : catalog.error ? (
            <p className="py-8 text-center text-sm text-danger">{catalog.error}</p>
          ) : results.length === 0 ? (
            <p className="py-8 text-center text-sm text-fg-muted">
              Sin resultados para “{query}”.
            </p>
          ) : (
            <div className="grid max-h-72 grid-cols-4 gap-2 overflow-y-auto pr-1 sm:grid-cols-6">
              {results.map((icon) => (
                <button
                  key={icon.id}
                  type="button"
                  title={icon.label}
                  onClick={() => onSelectIcon(icon.id)}
                  className={cn(
                    'flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border p-2 transition-all',
                    'hover:border-brand hover:bg-canvas-subtle active:scale-[0.97]',
                    selectedIconId === icon.id
                      ? 'border-brand bg-brand-soft'
                      : 'border-line bg-surface',
                  )}
                >
                  <img
                    src={icon.svgPath}
                    alt={icon.label}
                    className="h-7 w-7"
                    loading="lazy"
                  />
                  <span className="w-full truncate text-center text-3xs leading-tight text-fg-muted">
                    {icon.label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center gap-4 py-6">
          <input
            ref={fileRef}
            type="file"
            accept={UPLOAD.accept}
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <div
            className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-line bg-canvas-subtle px-6 py-10 text-center"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              handleFile(e.dataTransfer.files?.[0])
            }}
          >
            <p className="text-sm text-fg">Arrastra una imagen o selecciónala.</p>
            <p className="text-xs text-fg-muted">
              PNG, JPG, SVG o WebP · máx. {(UPLOAD.maxBytes / (1024 * 1024)).toFixed(0)} MB
            </p>
            <ButtonComponent
              variant="outline"
              size="sm"
              className="mt-2"
              isLoading={uploading}
              loadingText="Subiendo…"
              onClick={() => fileRef.current?.click()}
            >
              Elegir archivo
            </ButtonComponent>
          </div>
        </div>
      )}

      {onClear && (
        <div className="flex justify-end border-t border-line pt-3">
          <ButtonComponent variant="ghost" size="sm" onClick={onClear}>
            Quitar recurso
          </ButtonComponent>
        </div>
      )}
    </div>
  )
}
