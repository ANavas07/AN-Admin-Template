/**
 * Contrato HTTP del módulo de Planificación (instancias + subida de imágenes).
 *
 * Aún NO se invoca: el frontend funciona con estado local (ver usePlanningMock),
 * igual que useTasksMock. Este archivo documenta y deja listo el contrato para
 * que, al llegar el backend, solo el hook cambie sus llamadas.
 */
import { http } from '../http'
import { sanitize } from '../sanitize'
import type { PlanificacionInstance, UploadedAssetRef } from '../../pages/planning/types'

export const planningService = {
  getInstance: (id: string, signal?: AbortSignal) =>
    http.get<PlanificacionInstance>(`/planificaciones/${id}`, { signal }),

  saveInstance: (id: string, data: Partial<PlanificacionInstance>) =>
    http.patch<PlanificacionInstance>(`/planificaciones/${id}`, sanitize(data)),

  /**
   * Sube una imagen propia y devuelve su referencia. El backend valida tipo,
   * tamaño y asigna el `ownerId` (institución/usuario) desde la sesión.
   * Nota: usa FormData, así que se llamará con fetch directo, no con http.post JSON.
   */
  uploadImage: (file: File): Promise<UploadedAssetRef> =>
    // TODO(backend): POST multipart /planificaciones/assets → UploadedAssetRef
    Promise.reject(
      new Error(`uploadImage('${file.name}') requiere backend; el mock usa object URLs locales.`),
    ),
}
