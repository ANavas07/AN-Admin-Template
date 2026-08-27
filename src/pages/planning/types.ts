/**
 * Modelo de datos del módulo de Planificación (formato Ministerio de Educación
 * del Ecuador — "CONECTA, NIVELA Y CREA").
 *
 * Dos piezas independientes y versionadas:
 *   1. TemplateDefinition   → describe la grilla (secciones, celdas combinadas,
 *                             estilos, celdas editables). NO contiene datos.
 *   2. PlanificacionInstance → los valores capturados por celda. NO conoce la
 *                             maquetación; se une al template por `fieldId`.
 *
 * Regla central: el tipo de recurso (texto / ícono / imagen) es una propiedad
 * de la CELDA, no de la posición ni de la sección. Cualquier celda editable
 * puede declararse `icon` o `image` en cualquier punto de la grilla.
 */

// ── Estilo de celda ───────────────────────────────────────────────────────────
// Colores concretos (hex) para que viajen igual a pantalla, PDF, Word y Excel.

export type CellAlign = 'left' | 'center' | 'right'
export type CellVAlign = 'top' | 'middle' | 'bottom'

export interface CellStyle {
  /** Color de fondo de la banda (hex). Ej: encabezados azules del formato. */
  bg?: string
  align?: CellAlign
  valign?: CellVAlign
  bold?: boolean
  italic?: boolean
  uppercase?: boolean
  /** Tamaño de fuente en px (base 12). */
  fontSize?: number
  /** Color de texto (hex). */
  color?: string
}

// ── Tamaño de recurso visual ──────────────────────────────────────────────────
// En px lógicos. Los exportadores lo reutilizan para que el ícono/imagen mida
// igual en los cuatro entornos.

export interface VisualSize {
  width: number
  height: number
}

// ── Tipos de celda ─────────────────────────────────────────────────────────────

export type CellType = 'label' | 'field' | 'icon' | 'image'

interface CellBase {
  /** Id único de la celda dentro del template. */
  id: string
  /** Posición 1-based en la grilla. */
  row: number
  col: number
  /** Celdas combinadas (merge). Por defecto 1. */
  rowSpan?: number
  colSpan?: number
  style?: CellStyle
  /** Sección lógica a la que pertenece (solo agrupa/estiliza, no cambia comportamiento). */
  sectionId?: string
}

/** Texto fijo definido en la plantilla (títulos, encabezados). No editable. */
export interface LabelCell extends CellBase {
  type: 'label'
  text: string
}

/** Texto capturado por el usuario. */
export interface FieldCell extends CellBase {
  type: 'field'
  fieldId: string
  editable?: boolean
  placeholder?: string
  multiline?: boolean
}

/** Ícono elegido del catálogo (manifest). */
export interface IconCell extends CellBase {
  type: 'icon'
  fieldId: string
  editable?: boolean
  size: VisualSize
  /** Ícono por defecto (id del manifest) si aún no se captura valor. */
  defaultIconId?: string
}

/** Imagen: puede elegirse del catálogo y —si `allowUpload`— subirse propia. */
export interface ImageCell extends CellBase {
  type: 'image'
  fieldId: string
  editable?: boolean
  size: VisualSize
  /** Permite subir una imagen propia además de elegir del catálogo. */
  allowUpload?: boolean
}

export type TemplateCell = LabelCell | FieldCell | IconCell | ImageCell

/** Celdas que capturan un valor (tienen `fieldId`). */
export type EditableCell = FieldCell | IconCell | ImageCell

export function isEditableCell(cell: TemplateCell): cell is EditableCell {
  return cell.type !== 'label'
}

export function isVisualCell(cell: TemplateCell): cell is IconCell | ImageCell {
  return cell.type === 'icon' || cell.type === 'image'
}

// ── Definición de plantilla ─────────────────────────────────────────────────────

export interface TemplateColumn {
  /** Peso relativo de ancho de columna (fracción del total). */
  weight: number
}

export interface TemplateSection {
  id: string
  title?: string
}

export interface TemplateDefinition {
  id: string
  /** Versión del esquema de la plantilla (para migraciones). */
  version: number
  name: string
  description?: string
  columns: TemplateColumn[]
  /** Alto mínimo por fila (px), opcional. Clave = número de fila 1-based. */
  rowHeights?: Record<number, number>
  sections: TemplateSection[]
  cells: TemplateCell[]
}

// ── Valores capturados ──────────────────────────────────────────────────────────

export type CapturedKind = 'text' | 'icon' | 'image'

/** Referencia a una imagen subida por la institución/usuario. */
export interface UploadedAssetRef {
  assetId: string
  /** URL de acceso (object URL en el mock; URL del backend después). */
  url: string
  fileName: string
  mimeType: string
  width?: number
  height?: number
  /** Ámbito de propiedad: institución/usuario. Usado para validar acceso. */
  ownerId: string
}

export type CapturedValue =
  | { kind: 'text'; value: string }
  | { kind: 'icon'; iconId: string }
  | { kind: 'image'; asset: UploadedAssetRef }

export interface PlanificacionInstance {
  id: string
  templateId: string
  templateVersion: number
  title: string
  /** fieldId → valor capturado. */
  values: Record<string, CapturedValue>
  updatedAt: string
}

// ── Catálogo de íconos (manifest servido por GET /icons) ─────────────────────────

export interface IconManifestEntry {
  id: string
  label: string
  tags: string[]
  svgPath: string
  pngPath: string
}

export interface IconManifest {
  version: number
  icons: IconManifestEntry[]
}
