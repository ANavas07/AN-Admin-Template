/**
 * TemplateDefinition del formato oficial "CONECTA, NIVELA Y CREA".
 * Derivado (no copiado campo a campo) de la plantilla de la U.E. "Alberto Guerra":
 * bandas azules de encabezado, datos informativos en pares etiqueta/valor,
 * tabla de adaptación y tabla de nivelación.
 *
 * Grilla base de 12 columnas → los merges (colSpan) definen el ancho visual.
 * Demuestra la regla "recurso visual en cualquier celda":
 *   - una celda `icon`  vive dentro de "ORIENTACIONES METODOLÓGICAS" (marca de fase).
 *   - una celda `image` vive dentro de "RECURSOS" de la tabla de adaptación.
 */
import { BAND } from '../constants'
import type {
  CellStyle,
  FieldCell,
  IconCell,
  ImageCell,
  LabelCell,
  TemplateCell,
  TemplateDefinition,
} from '../types'

// ── Fábricas cortas para mantener la grilla legible ──────────────────────────────

let auto = 0
const cid = () => `c${++auto}`

function label(
  row: number,
  col: number,
  colSpan: number,
  text: string,
  style?: CellStyle,
  extra?: Partial<LabelCell>,
): LabelCell {
  return { id: cid(), type: 'label', row, col, colSpan, text, style, ...extra }
}

function field(
  row: number,
  col: number,
  colSpan: number,
  fieldId: string,
  extra?: Partial<FieldCell>,
): FieldCell {
  return { id: cid(), type: 'field', row, col, colSpan, fieldId, editable: true, ...extra }
}

function icon(
  row: number,
  col: number,
  colSpan: number,
  fieldId: string,
  extra?: Partial<IconCell>,
): IconCell {
  return {
    id: cid(),
    type: 'icon',
    row,
    col,
    colSpan,
    fieldId,
    editable: true,
    size: { width: 28, height: 28 },
    style: { align: 'center', valign: 'middle' },
    ...extra,
  }
}

function image(
  row: number,
  col: number,
  colSpan: number,
  fieldId: string,
  extra?: Partial<ImageCell>,
): ImageCell {
  return {
    id: cid(),
    type: 'image',
    row,
    col,
    colSpan,
    fieldId,
    editable: true,
    allowUpload: true,
    size: { width: 96, height: 72 },
    style: { align: 'center', valign: 'middle' },
    ...extra,
  }
}

// Estilos reutilizables
const title: CellStyle = { bg: BAND.headerBlue, bold: true, align: 'center', uppercase: true, fontSize: 14 }
const band: CellStyle = { bg: BAND.headerBlue, bold: true, align: 'center', uppercase: true }
const dataLabel: CellStyle = { bg: BAND.subHeaderBlue, bold: true, align: 'left', valign: 'middle' }
const colHead: CellStyle = { bg: BAND.subHeaderBlue, bold: true, align: 'center', valign: 'middle' }

// Un par etiqueta/valor (label 2 cols + field 2 cols) empezando en `col`.
function pair(row: number, col: number, text: string, fieldId: string): TemplateCell[] {
  return [label(row, col, 2, text, dataLabel), field(row, col + 2, 2, fieldId)]
}

const cells: TemplateCell[] = [
  // Títulos
  label(1, 1, 12, 'Unidad Educativa "Ejemplar"', title),
  label(2, 1, 12, 'Planificación Conecta, Nivela y Crea 2026 – 2027', title),

  // Datos informativos
  label(3, 1, 12, 'Datos informativos:', { ...band, align: 'left' }),
  ...pair(4, 1, 'Nombre de la Institución:', 'institucion'),
  ...pair(4, 5, 'Área:', 'area'),
  ...pair(4, 9, 'Asignatura:', 'asignatura'),
  ...pair(5, 1, 'Nombre del Docente:', 'docente'),
  ...pair(5, 5, 'Grado/Curso:', 'grado'),
  ...pair(5, 9, 'Fecha de inicio:', 'fechaInicio'),
  ...pair(6, 1, 'Semanas:', 'semanas'),
  ...pair(6, 5, 'Paralelo:', 'paralelo'),
  ...pair(6, 9, 'Fecha de finalización:', 'fechaFin'),

  // Objetivo
  label(7, 1, 2, 'Objetivo:', dataLabel),
  field(7, 3, 10, 'objetivo', { multiline: true }),

  // Semana de adaptación
  label(8, 1, 12, 'Semana de adaptación', band),
  label(9, 1, 2, 'Días', colHead),
  label(9, 3, 7, 'Estrategias metodológicas y socioemocionales', colHead),
  label(9, 10, 3, 'Recursos', colHead),

  // Lunes → la celda de RECURSOS es de tipo IMAGE (foto del material) para
  // demostrar que un recurso visual puede vivir en cualquier sección.
  label(10, 1, 2, 'Lunes', dataLabel),
  field(10, 3, 7, 'adapLunes', { multiline: true }),
  image(10, 10, 3, 'recursoLunes'),

  label(11, 1, 2, 'Martes', dataLabel),
  field(11, 3, 7, 'adapMartes', { multiline: true }),
  field(11, 10, 3, 'recursoMartes', { multiline: true }),

  label(12, 1, 2, 'Miércoles', dataLabel),
  field(12, 3, 7, 'adapMiercoles', { multiline: true }),
  field(12, 10, 3, 'recursoMiercoles', { multiline: true }),

  label(13, 1, 2, 'Jueves', dataLabel),
  field(13, 3, 7, 'adapJueves', { multiline: true }),
  field(13, 10, 3, 'recursoJueves', { multiline: true }),

  label(14, 1, 2, 'Viernes', dataLabel),
  field(14, 3, 7, 'adapViernes', { multiline: true }),
  field(14, 10, 3, 'recursoViernes', { multiline: true }),

  // Semanas de nivelación
  label(15, 1, 12, 'Semanas de nivelación (semana 2 - 3)', band),
  label(16, 1, 2, 'Criterio de evaluación', colHead),
  label(16, 3, 2, 'Indicadores de evaluación', colHead),
  label(16, 5, 2, 'Recursos', colHead),
  label(16, 7, 3, 'Orientaciones metodológicas para la enseñanza y aprendizaje', colHead),
  label(16, 10, 3, 'Orientaciones para la evaluación', colHead),

  // Fila de nivelación: dentro de "Orientaciones metodológicas" va la marca de
  // fase como celda ICON (como el "ANTICIPACIÓN 🟩" de la plantilla original).
  field(17, 1, 2, 'criterio', { multiline: true }),
  field(17, 3, 2, 'indicadores', { multiline: true }),
  field(17, 5, 2, 'recursosNivelacion', { multiline: true }),
  label(17, 7, 1, 'Anticipación', { bold: true, valign: 'top', fontSize: 11 }),
  icon(17, 8, 2, 'faseIcono', { defaultIconId: 'idea' }),
  field(17, 10, 3, 'orientacionesEval', { multiline: true }),
]

export const MINISTRY_TEMPLATE: TemplateDefinition = {
  id: 'conecta-nivela-crea',
  version: 1,
  name: 'Conecta, Nivela y Crea',
  description: 'Formato de planificación de nivelación — Ministerio de Educación del Ecuador.',
  columns: Array.from({ length: 12 }, () => ({ weight: 1 })),
  rowHeights: {
    1: 40, 2: 36, 3: 28,
    4: 34, 5: 34, 6: 34, 7: 56,
    8: 30, 9: 40,
    10: 88, 11: 64, 12: 64, 13: 64, 14: 64,
    15: 30, 16: 52, 17: 96,
  },
  sections: [
    { id: 'titulo', title: 'Títulos' },
    { id: 'datos', title: 'Datos informativos' },
    { id: 'objetivo', title: 'Objetivo' },
    { id: 'adaptacion', title: 'Semana de adaptación' },
    { id: 'nivelacion', title: 'Semanas de nivelación' },
  ],
  cells,
}
