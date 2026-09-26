import { lazy, Suspense, useState } from 'react'
import type { ReactNode } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import Panel from '../panel/Panel'
import { cn } from '../../../utils/cn'

type ChartCardProps<T> = {
    title: string
    description?: string
    /** Chart view */
    children: ReactNode
    /** Data + TanStack column definitions for the accessible table view */
    data?: T[]
    columns?: ColumnDef<T>[]
    actions?: ReactNode
    className?: string
}

// The table view is loaded on demand so charts do not pull TanStack Table into the first load
const TableTS = lazy(() => import('../table/TableTs')) as unknown as typeof import('../table/TableTs').default

const toggleClass = 'rounded-sm px-2 py-1 text-2xs font-medium transition-colors'

/**
 * Card around a chart. When `data` and `columns` are given it offers a
 * "Tabla" view rendered with TanStack Table, so every value is reachable
 * without hovering or seeing the chart.
 */
export default function ChartCard<T>({ title, description, children, data, columns, actions, className }: ChartCardProps<T>) {
    const [view, setView] = useState<'chart' | 'table'>('chart')
    const hasTable = Boolean(data && columns)

    const viewToggle = hasTable ? (
        <div className="flex rounded-md border border-line bg-canvas p-0.5" role="group" aria-label="Vista">
            {(['chart', 'table'] as const).map((option) => (
                <button
                    key={option}
                    type="button"
                    onClick={() => setView(option)}
                    aria-pressed={view === option}
                    className={cn(toggleClass, view === option ? 'bg-surface text-fg shadow-xs' : 'text-fg-muted hover:text-fg')}
                >
                    {option === 'chart' ? 'Gráfico' : 'Tabla'}
                </button>
            ))}
        </div>
    ) : null

    return (
        <Panel
            title={title}
            headingLevel="h3"
            description={description}
            className={className}
            actions={
                actions || viewToggle ? (
                    <>
                        {actions}
                        {viewToggle}
                    </>
                ) : undefined
            }
        >
            {view === 'table' && data && columns ? (
                <div className="max-h-64 overflow-y-auto">
                    <Suspense fallback={<p className="py-8 text-center text-sm text-fg-muted">Cargando tabla…</p>}>
                        <TableTS data={data} columns={columns} existBtn={false} enableSorting />
                    </Suspense>
                </div>
            ) : (
                children
            )}
        </Panel>
    )
}
