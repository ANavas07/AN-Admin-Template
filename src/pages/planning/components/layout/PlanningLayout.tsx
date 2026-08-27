import { useState } from 'react'
import { sileo } from 'sileo'
import ModuleHeader from '../../../../components/common/page/ModuleHeader'
import ButtonComponent from '../../../../components/ui/buttons/ButtonComponent'
import TemplateGrid from '../grid/TemplateGrid'
import { usePlanningMock } from '../../hooks/usePlanningMock'

// Página del módulo de Planificación: cabecera + alterna lectura/edición +
// (placeholder) exportadores. La misma vista alimenta al futuro PDF.

type Mode = 'read' | 'edit'

export default function PlanningLayout() {
  const planning = usePlanningMock()
  const [mode, setMode] = useState<Mode>('edit')

  const exportSoon = (format: string) =>
    sileo.info({ title: `Exportar a ${format} se habilita con el backend.` })

  return (
    <div className="mx-auto max-w-350 space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <ModuleHeader
        eyebrow="Planificación"
        title="Conecta, Nivela y Crea"
        description="Plantilla de planificación con celdas de texto, íconos e imágenes configurables en cualquier punto de la grilla."
        actions={
          <div className="flex items-center gap-2">
            <div className="flex rounded-xl bg-(--color-bg-soft) p-1">
              <ButtonComponent
                variant={mode === 'edit' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setMode('edit')}
              >
                Editar
              </ButtonComponent>
              <ButtonComponent
                variant={mode === 'read' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setMode('read')}
              >
                Vista
              </ButtonComponent>
            </div>
            <ButtonComponent variant="outline" size="sm" onClick={() => exportSoon('PDF')}>
              PDF
            </ButtonComponent>
            <ButtonComponent variant="outline" size="sm" onClick={() => exportSoon('Word')}>
              Word
            </ButtonComponent>
            <ButtonComponent variant="outline" size="sm" onClick={() => exportSoon('Excel')}>
              Excel
            </ButtonComponent>
          </div>
        }
      />

      <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm sm:p-6">
        <TemplateGrid
          template={planning.template}
          mode={mode}
          ownerId={planning.ownerId}
          getValue={planning.getValue}
          setText={planning.setText}
          setIcon={planning.setIcon}
          setImage={planning.setImage}
          clearValue={planning.clearValue}
          uploadImage={planning.uploadImage}
        />
      </div>
    </div>
  )
}
