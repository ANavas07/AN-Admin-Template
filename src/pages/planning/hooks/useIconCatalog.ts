import { useCallback, useEffect, useMemo, useState } from 'react'
import { iconsService } from '../../../services/planning/icons.service'
import type { IconManifest, IconManifestEntry } from '../types'

// Carga el catálogo de íconos una sola vez y expone búsqueda por texto/tags.
// Único punto de acceso al manifest: componentes consumen este hook.

export interface IconCatalog {
  manifest: IconManifest | null
  icons: IconManifestEntry[]
  loading: boolean
  error: string | null
  getById: (id: string) => IconManifestEntry | undefined
  search: (query: string) => IconManifestEntry[]
}

export function useIconCatalog(): IconCatalog {
  const [manifest, setManifest] = useState<IconManifest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    iconsService
      .getManifest(controller.signal)
      .then((data) => {
        setManifest(data)
        setError(null)
      })
      .catch((err) => {
        if (err?.name !== 'AbortError') setError('No se pudo cargar el catálogo de íconos.')
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [])

  const icons = useMemo(() => manifest?.icons ?? [], [manifest])

  const byId = useMemo(() => new Map(icons.map((i) => [i.id, i])), [icons])
  const getById = useCallback((id: string) => byId.get(id), [byId])

  const search = useCallback(
    (query: string) => {
      const q = query.trim().toLowerCase()
      if (!q) return icons
      return icons.filter(
        (icon) =>
          icon.label.toLowerCase().includes(q) ||
          icon.id.toLowerCase().includes(q) ||
          icon.tags.some((tag) => tag.toLowerCase().includes(q)),
      )
    },
    [icons],
  )

  return { manifest, icons, loading, error, getById, search }
}
