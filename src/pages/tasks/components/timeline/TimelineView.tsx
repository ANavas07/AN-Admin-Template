import { useMemo } from 'react'
import { differenceInCalendarDays, parseISO } from 'date-fns'
import GanttDiagram from '../../../../components/ui/gantt/SvarGantt'
import { useTheme } from '../../../../context/theme-context'
import type { Project } from '../../types'

type Props = { project: Project }

/**
 * Timeline (Gantt) view. Reuses the project's SVAR Gantt wrapper — same library
 * and integration pattern as `playground/GanttCatalog.tsx`. Sections become
 * summary rows, tasks become bars, and `dependsOn` becomes dependency links.
 */
export function TimelineView({ project }: Props) {
    const { isDarkMode } = useTheme()

    const { tasks, links, scales, start, end } = useMemo(() => {
        // SVAR uses numeric ids in the project's example — map our string ids onto them.
        const num = new Map<string, number>()
        let counter = 1
        const idOf = (key: string) => {
            if (!num.has(key)) num.set(key, counter++)
            return num.get(key)!
        }

        const ganttTasks: Record<string, unknown>[] = []
        const scheduled = project.tasks.filter((task) => task.startDate)

        let min: Date | null = null
        let max: Date | null = null

        for (const section of project.sections) {
            ganttTasks.push({ id: idOf(section.id), text: section.name, type: 'summary', open: true })
        }

        for (const task of scheduled) {
            const startDate = parseISO(task.startDate as string)
            const dueDate = task.dueDate ? parseISO(task.dueDate) : startDate
            const duration = Math.max(1, differenceInCalendarDays(dueDate, startDate) + 1)
            if (!min || startDate < min) min = startDate
            const endDate = new Date(startDate)
            endDate.setDate(endDate.getDate() + duration)
            if (!max || endDate > max) max = endDate

            ganttTasks.push({
                id: idOf(task.id),
                text: task.title,
                start: startDate,
                duration,
                parent: idOf(task.sectionId),
                progress: task.completed ? 100 : Math.round((task.subtasks.filter((s) => s.completed).length / Math.max(1, task.subtasks.length)) * 100),
                type: 'task',
            })
        }

        const ganttLinks = scheduled.flatMap((task) =>
            task.dependsOn
                .filter((depId) => num.has(depId) || scheduled.some((t) => t.id === depId))
                .map((depId) => ({
                    id: `${depId}-${task.id}`,
                    source: idOf(depId),
                    target: idOf(task.id),
                    type: 'e2s' as const,
                })),
        )

        const rangeStart = min ?? new Date()
        const rangeEnd = max ?? new Date()
        // Pad a few days on each side for breathing room.
        const paddedStart = new Date(rangeStart)
        paddedStart.setDate(paddedStart.getDate() - 3)
        const paddedEnd = new Date(rangeEnd)
        paddedEnd.setDate(paddedEnd.getDate() + 3)

        return {
            tasks: ganttTasks,
            links: ganttLinks,
            scales: [
                { unit: 'month', step: 1, format: '%F %Y' },
                { unit: 'day', step: 1, format: '%j' },
            ],
            start: paddedStart,
            end: paddedEnd,
        }
    }, [project])

    return (
        <section className="h-[62vh] min-h-130 overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface)">
            <GanttDiagram
                tasks={tasks}
                links={links}
                scales={scales}
                start={start}
                end={end}
                cellWidth={64}
                cellHeight={40}
                fullWidth
                fullHeight
                zoom
                theme={isDarkMode ? 'willow-dark' : 'willow'}
                themeFonts
            />
        </section>
    )
}
