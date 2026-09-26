import { useNavigate } from 'react-router-dom'
import { SearchIcon } from '../../../icons/icons'
import { modifierKeyLabel } from '../../../utils/platform'
import { useCommandPalette } from '../../common/command-palette/command-palette-context'
import Kbd from '../../ui/kbd/Kbd'
import Panel from '../../ui/panel/Panel'
import ModuleIcon from '../ModuleIcon'
import type { QuickAction } from '../data/quickActions'

const tileClass =
    'flex items-start gap-3 rounded-lg border border-line p-3 text-left transition-colors hover:border-line-strong hover:bg-canvas-subtle/60 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand/25'

/** Frequent actions, ordered by how much the user works in each module. */
export default function QuickActionsPanel({ actions, className }: { actions: QuickAction[]; className?: string }) {
    const navigate = useNavigate()
    const { open: openPalette } = useCommandPalette()

    return (
        <Panel title="Acceso rápido" description="Acciones frecuentes según tu actividad" headingId="home-actions" className={className}>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {actions.map((action) => (
                    <button key={action.id} type="button" onClick={() => void action.run(navigate)} className={tileClass}>
                        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-brand-soft text-brand-strong">
                            <ModuleIcon name={action.icon} className="size-4" />
                        </span>
                        <span className="min-w-0">
                            <span className="block text-sm font-medium text-fg">{action.label}</span>
                            <span className="mt-0.5 block text-2xs leading-4 text-fg-muted">{action.description}</span>
                        </span>
                    </button>
                ))}
                <button type="button" onClick={openPalette} className={tileClass}>
                    <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-canvas-subtle text-fg-muted">
                        <SearchIcon className="size-4" />
                    </span>
                    <span className="min-w-0">
                        <span className="block text-sm font-medium text-fg">Buscar en todo</span>
                        <span className="mt-1 flex items-center gap-1 text-2xs text-fg-muted">
                            <Kbd>{modifierKeyLabel()}</Kbd>
                            <Kbd>K</Kbd>
                            desde cualquier página
                        </span>
                    </span>
                </button>
            </div>
        </Panel>
    )
}
