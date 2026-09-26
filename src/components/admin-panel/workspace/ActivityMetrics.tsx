import { useNavigate } from 'react-router-dom'
import type { ColumnDef } from '@tanstack/react-table'
import { useWorkspace } from '../../../context/workspace-context'
import type { DailyCount, MonthlyCount, WeekdayCount } from '../../../services/workspace/metrics'
import { percentChange } from '../../../services/workspace/metrics'
import Badge from '../../ui/badge/Badge'
import AreaLineChart from '../../ui/charts/AreaLineChart'
import BarList from '../../ui/charts/BarList'
import ChartCard from '../../ui/charts/ChartCard'
import ColumnChart from '../../ui/charts/ColumnChart'
import StatTile from '../../ui/charts/StatTile'
import { formatCompact, formatNumber } from '../../ui/charts/chartUtils'
import ModuleIcon from '../ModuleIcon'
import type { useWorkspaceInsights } from './useWorkspaceInsights'
import type { ModuleUsage } from './useWorkspaceInsights'

type Insights = ReturnType<typeof useWorkspaceInsights>

const dayLabel = new Intl.DateTimeFormat('es', { day: 'numeric' })
const dayTitle = new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'long' })
const monthLabel = new Intl.DateTimeFormat('es', { month: 'short' })
const monthTitle = new Intl.DateTimeFormat('es', { month: 'long', year: 'numeric' })

// TanStack column definitions for the table view of each chart
const dailyColumns: ColumnDef<DailyCount>[] = [
    { id: 'date', header: 'Día', accessorFn: (row) => row.date.getTime(), cell: (info) => dayTitle.format(info.row.original.date) },
    { accessorKey: 'count', header: 'Visitas' },
]
const monthlyColumns: ColumnDef<MonthlyCount>[] = [
    { id: 'month', header: 'Mes', accessorFn: (row) => row.month.getTime(), cell: (info) => monthTitle.format(info.row.original.month) },
    { accessorKey: 'count', header: 'Visitas' },
]
const weeklyColumns: ColumnDef<WeekdayCount>[] = [
    { accessorKey: 'label', header: 'Día' },
    { accessorKey: 'count', header: 'Visitas promedio' },
]
const moduleColumns: ColumnDef<ModuleUsage>[] = [
    { id: 'module', header: 'Módulo', accessorFn: (row) => row.module.title },
    { accessorKey: 'count', header: 'Visitas (30 días)' },
]

/** Usage analytics of the signed-in user, derived from the visit log. */
export default function ActivityMetrics({ insights }: { insights: Insights }) {
    const navigate = useNavigate()
    const { hasDemoActivity, clearDemoActivity } = useWorkspace()
    const { summary, daily, monthly, weekly, topModules } = insights
    const last7 = daily.slice(-7).reduce((total, day) => total + day.count, 0)
    const previous7 = daily.slice(-14, -7).reduce((total, day) => total + day.count, 0)

    return (
        <section aria-labelledby="home-metrics" className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h2 id="home-metrics" className="text-base font-semibold text-fg">
                        Tu actividad
                    </h2>
                    <p className="mt-0.5 text-xs text-fg-muted">Calculada a partir de los módulos que visitas</p>
                </div>
                {hasDemoActivity ? (
                    <div className="flex items-center gap-2">
                        <Badge tone="info" size="sm">
                            Incluye datos de demostración
                        </Badge>
                        <button type="button" onClick={clearDemoActivity} className="text-xs font-medium text-brand hover:text-brand-strong">
                            Borrar demo
                        </button>
                    </div>
                ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatTile
                    label="Visitas hoy"
                    value={formatNumber(summary.today)}
                    trend={daily.slice(-14).map((day) => day.count)}
                    deltaLabel="últimos 14 días"
                />
                <StatTile
                    label="Últimos 30 días"
                    value={formatCompact(summary.last30)}
                    delta={percentChange(summary.last30, summary.previous30)}
                    deltaLabel="vs. 30 días previos"
                />
                <StatTile
                    label="Últimos 7 días"
                    value={formatNumber(last7)}
                    delta={percentChange(last7, previous7)}
                    deltaLabel="vs. semana anterior"
                />
                <StatTile
                    label="Módulos en uso"
                    value={`${summary.activeModules30} / ${insights.accessibleModules.length}`}
                    deltaLabel={summary.streakDays > 0 ? `${summary.streakDays} días seguidos con actividad` : 'Sin actividad reciente'}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-12">
                <ChartCard
                    title="Actividad diaria"
                    description="Visitas a módulos en los últimos 30 días"
                    data={daily}
                    columns={dailyColumns}
                    className="md:col-span-2 xl:col-span-8"
                >
                    <ColumnChart
                        data={daily}
                        x={(row) => dayLabel.format(row.date)}
                        y={(row) => row.count}
                        tooltipTitle={(row) => dayTitle.format(row.date)}
                        seriesLabel="visitas"
                        labelEvery={5}
                        height={220}
                        ariaLabel="Gráfico de columnas: visitas por día en los últimos 30 días"
                    />
                </ChartCard>

                <ChartCard
                    title="Módulos más usados"
                    description="Visitas en los últimos 30 días"
                    data={topModules}
                    columns={moduleColumns}
                    className="md:col-span-2 xl:col-span-4"
                >
                    {topModules.length > 0 ? (
                        <BarList
                            data={topModules.slice(0, 6)}
                            label={(row) => row.module.title}
                            value={(row) => row.count}
                            icon={(row) => <ModuleIcon name={row.module.icon} className="size-4" />}
                            onSelect={(row) => row.module.url && navigate(row.module.url)}
                            ariaLabel="Módulos más usados en los últimos 30 días"
                        />
                    ) : (
                        <p className="py-10 text-center text-sm text-fg-muted">Todavía no hay visitas registradas.</p>
                    )}
                </ChartCard>

                <ChartCard
                    title="Tendencia mensual"
                    description="Visitas por mes, últimos 6 meses"
                    data={monthly}
                    columns={monthlyColumns}
                    className="xl:col-span-6"
                >
                    <AreaLineChart
                        data={monthly}
                        x={(row) => monthLabel.format(row.month)}
                        y={(row) => row.count}
                        tooltipTitle={(row) => monthTitle.format(row.month)}
                        seriesLabel="visitas"
                        height={200}
                        ariaLabel="Gráfico de línea: visitas por mes en los últimos 6 meses"
                    />
                </ChartCard>

                <ChartCard
                    title="Patrón semanal"
                    description="Visitas promedio por día de la semana (8 semanas)"
                    data={weekly}
                    columns={weeklyColumns}
                    className="xl:col-span-6"
                >
                    <ColumnChart
                        data={weekly}
                        x={(row) => row.label}
                        y={(row) => row.count}
                        seriesLabel="visitas promedio"
                        formatValue={(value) => formatNumber(Math.round(value * 10) / 10)}
                        height={200}
                        ariaLabel="Gráfico de columnas: visitas promedio por día de la semana"
                    />
                </ChartCard>
            </div>
        </section>
    )
}
