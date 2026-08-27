import { useCallback, useMemo, useState } from 'react'
import { mockInstance } from '../data/mock-instances'
import { MINISTRY_TEMPLATE } from '../data/ministry-template'
import { CURRENT_OWNER_ID } from '../constants'
import type {
  CapturedValue,
  PlanificacionInstance,
  TemplateDefinition,
  UploadedAssetRef,
} from '../types'

// Único punto de acceso a los datos de la planificación. Los componentes NUNCA
// importan mock-instances directamente. Cuando llegue el backend, solo cambia
// este archivo: se reemplaza el estado local por llamadas a planningService y se
// mantiene la misma superficie retornada.

let assetSeq = 1

function cloneInstance(source: PlanificacionInstance): PlanificacionInstance {
  return structuredClone(source)
}

export interface PlanningApi {
  template: TemplateDefinition
  instance: PlanificacionInstance
  ownerId: string
  getValue: (fieldId: string) => CapturedValue | undefined
  setText: (fieldId: string, value: string) => void
  setIcon: (fieldId: string, iconId: string) => void
  setImage: (fieldId: string, asset: UploadedAssetRef) => void
  clearValue: (fieldId: string) => void
  /** Sube una imagen (mock: object URL local) y devuelve su referencia. */
  uploadImage: (file: File) => Promise<UploadedAssetRef>
}

export function usePlanningMock(): PlanningApi {
  const [instance, setInstance] = useState<PlanificacionInstance>(() => cloneInstance(mockInstance))

  const template = MINISTRY_TEMPLATE

  const getValue = useCallback(
    (fieldId: string) => instance.values[fieldId],
    [instance.values],
  )

  const setValue = useCallback((fieldId: string, value: CapturedValue) => {
    // TODO(backend): PATCH /planificaciones/:id { values: { [fieldId]: value } }
    setInstance((prev) => ({
      ...prev,
      values: { ...prev.values, [fieldId]: value },
      updatedAt: new Date().toISOString(),
    }))
  }, [])

  const setText = useCallback(
    (fieldId: string, value: string) => setValue(fieldId, { kind: 'text', value }),
    [setValue],
  )

  const setIcon = useCallback(
    (fieldId: string, iconId: string) => setValue(fieldId, { kind: 'icon', iconId }),
    [setValue],
  )

  const setImage = useCallback(
    (fieldId: string, asset: UploadedAssetRef) => setValue(fieldId, { kind: 'image', asset }),
    [setValue],
  )

  const clearValue = useCallback((fieldId: string) => {
    // TODO(backend): PATCH /planificaciones/:id { values: { [fieldId]: null } }
    setInstance((prev) => {
      const next = { ...prev.values }
      delete next[fieldId]
      return { ...prev, values: next, updatedAt: new Date().toISOString() }
    })
  }, [])

  const uploadImage = useCallback(async (file: File): Promise<UploadedAssetRef> => {
    // TODO(backend): planningService.uploadImage(file) → asigna ownerId y URL real.
    // Mock: object URL local, ownerId = institución actual.
    const url = URL.createObjectURL(file)
    return {
      assetId: `asset-${assetSeq++}`,
      url,
      fileName: file.name,
      mimeType: file.type,
      ownerId: CURRENT_OWNER_ID,
    }
  }, [])

  return useMemo(
    () => ({
      template,
      instance,
      ownerId: CURRENT_OWNER_ID,
      getValue,
      setText,
      setIcon,
      setImage,
      clearValue,
      uploadImage,
    }),
    [template, instance, getValue, setText, setIcon, setImage, clearValue, uploadImage],
  )
}
