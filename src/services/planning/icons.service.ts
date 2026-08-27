/**
 * Acceso al catálogo de íconos.
 *
 * Hoy lee el manifest estático servido por Vite desde /public (funcional sin
 * backend). Cuando exista el backend Nest.js, basta cambiar la URL por
 * `GET {BASE_URL}/icons` — la forma de la respuesta (IconManifest) es idéntica.
 */
import { ICONS_MANIFEST_URL } from '../../pages/planning/constants'
import type { IconManifest } from '../../pages/planning/types'

export const iconsService = {
  getManifest: async (signal?: AbortSignal): Promise<IconManifest> => {
    // TODO(backend): reemplazar por http.get<IconManifest>('/icons', { signal })
    const res = await fetch(ICONS_MANIFEST_URL, { signal })
    if (!res.ok) throw new Error(`No se pudo cargar el catálogo de íconos (${res.status})`)
    return (await res.json()) as IconManifest
  },
}
