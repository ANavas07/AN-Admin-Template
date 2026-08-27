/**
 * Validaciones de valores capturados y de archivos subidos.
 * Espejo de lo que el backend deberá revalidar (nunca confiar solo en el cliente).
 */
import { UPLOAD } from './constants'
import type {
  CapturedValue,
  IconManifest,
  TemplateCell,
  UploadedAssetRef,
} from './types'

/** Un `iconId` es válido solo si existe en el manifest. */
export function isValidIconId(iconId: string, manifest: IconManifest | null): boolean {
  if (!manifest) return false
  return manifest.icons.some((icon) => icon.id === iconId)
}

/** Una imagen es válida solo si pertenece al ámbito (institución/usuario) actual. */
export function isValidImageAsset(asset: UploadedAssetRef, ownerId: string): boolean {
  return asset.ownerId === ownerId
}

export interface FileValidationResult {
  ok: boolean
  error?: string
}

/** Valida tipo y tamaño de un archivo antes de aceptarlo como imagen propia. */
export function validateUploadFile(file: File): FileValidationResult {
  if (!UPLOAD.acceptedTypes.includes(file.type)) {
    return { ok: false, error: 'Formato no permitido. Usa PNG, JPG, SVG o WebP.' }
  }
  if (file.size > UPLOAD.maxBytes) {
    const mb = (UPLOAD.maxBytes / (1024 * 1024)).toFixed(0)
    return { ok: false, error: `El archivo supera el máximo de ${mb} MB.` }
  }
  return { ok: true }
}

/**
 * Comprueba que un valor capturado sea coherente con el tipo de celda destino
 * y con las reglas de catálogo/propiedad. Devuelve null si es válido, o el
 * motivo del rechazo.
 */
export function validateCapturedValue(
  cell: TemplateCell,
  value: CapturedValue,
  ctx: { manifest: IconManifest | null; ownerId: string },
): string | null {
  switch (cell.type) {
    case 'label':
      return 'La celda no es editable.'
    case 'field':
      return value.kind === 'text' ? null : 'La celda solo acepta texto.'
    case 'icon':
      if (value.kind !== 'icon') return 'La celda solo acepta íconos.'
      return isValidIconId(value.iconId, ctx.manifest)
        ? null
        : 'El ícono no existe en el catálogo.'
    case 'image':
      if (value.kind === 'icon') {
        // Una celda `image` también admite elegir del catálogo de íconos.
        return isValidIconId(value.iconId, ctx.manifest)
          ? null
          : 'El ícono no existe en el catálogo.'
      }
      if (value.kind !== 'image') return 'La celda solo acepta imágenes o íconos.'
      return isValidImageAsset(value.asset, ctx.ownerId)
        ? null
        : 'La imagen no pertenece a esta institución.'
    default:
      return 'Tipo de celda desconocido.'
  }
}
