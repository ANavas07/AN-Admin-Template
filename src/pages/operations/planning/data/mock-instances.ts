/** Instancia de ejemplo (datos capturados) para el mock. */
import type { PlanificacionInstance } from '../types'
import { MINISTRY_TEMPLATE } from './ministry-template'

export const mockInstance: PlanificacionInstance = {
  id: 'plan-demo-1',
  templateId: MINISTRY_TEMPLATE.id,
  templateVersion: MINISTRY_TEMPLATE.version,
  title: 'Planificación de nivelación — 8vo EGB',
  updatedAt: new Date('2026-08-24').toISOString(),
  values: {
    institucion: { kind: 'text', value: 'Unidad Educativa "Ejemplar"' },
    area: { kind: 'text', value: 'Ciencias Naturales' },
    asignatura: { kind: 'text', value: 'Biología' },
    docente: { kind: 'text', value: 'John Doe' },
    grado: { kind: 'text', value: '8vo EGB' },
    paralelo: { kind: 'text', value: 'A' },
    semanas: { kind: 'text', value: '1, 2, 3, 4 y 5' },
    fechaInicio: { kind: 'text', value: '2026-09-01' },
    fechaFin: { kind: 'text', value: '2026-10-03' },
    objetivo: {
      kind: 'text',
      value: 'Reforzar destrezas base para nivelar al grupo antes de iniciar la unidad.',
    },
    // Celda ICON: marca de fase (anticipación).
    faseIcono: { kind: 'icon', iconId: 'idea' },
    // La celda IMAGE (recursoLunes) queda vacía: el usuario sube su propia foto.
  },
}
