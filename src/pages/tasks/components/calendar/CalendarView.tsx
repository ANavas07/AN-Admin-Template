import { useMemo, useState } from 'react'
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useDroppable,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragStartEvent,
} from '@dnd-kit/core'
import {
    addMonths,
    eachDayOfInterval,
    endOfMonth,
    endOfWeek,
    format,
    isSameDay,
    isSameMonth,
    startOfMonth,
    startOfWeek,
    subMonths,
} from 'date-fns'
import { es } from 'date-fns/locale'
import type { TasksApi } from '../../hooks/useTasksMock'
import type { Task } from '../../types'
import { CalendarTaskChip } from './CalendarTaskChip'

type Props = {
    api: TasksApi
    onOpenTask: (taskId: string) => void
}

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const toKey = (date: Date) => format(date, 'yyyy-MM-dd')

function DayCell({
    date,
    inMonth,
    isToday,
    tasks,
    onOpenTask,
}: {
    date: Date
    inMonth: boolean
    isToday: boolean
    tasks: Task[]
    onOpenTask: (taskId: string) => void
}) {
    const { setNodeRef, isOver } = useDroppable({ id: `day-${toKey(date)}`, data: { date: toKey(date) } })

    return (
        <div
            ref={setNodeRef}
            className={`flex min-h-24 flex-col gap-1 border-b border-r border-(--color-border) p-1.5 transition-colors ${
                inMonth ? 'bg-(--color-surface)' : 'bg-(--color-bg-soft)/40'
            } ${isOver ? 'bg-brand/10 ring-1 ring-inset ring-brand/40' : ''}`}
        >
            <span
                className={`inline-flex h-6 w-6 items-center justify-center self-start rounded-full text-xs font-medium ${
                    isToday
                        ? 'bg-brand text-white'
                        : inMonth
                          ? 'text-(--color-text)'
                          : 'text-(--color-text-muted)'
                }`}
            >
                {format(date, 'd')}
            </span>
            <div className="flex flex-col gap-1 overflow-hidden">
                {tasks.map((task) => (
                    <CalendarTaskChip key={task.id} task={task} onOpen={onOpenTask} />
                ))}
            </div>
        </div>
    )
}

export function CalendarView({ api, onOpenTask }: Props) {
    const [cursor, setCursor] = useState(() => new Date(2026, 7, 1)) // Ago 2026 (mock range)
    const [activeTask, setActiveTask] = useState<Task | null>(null)
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

    const days = useMemo(() => {
        const gridStart = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 })
        const gridEnd = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 })
        return eachDayOfInterval({ start: gridStart, end: gridEnd })
    }, [cursor])

    const tasksByDay = useMemo(() => {
        const map = new Map<string, Task[]>()
        for (const task of api.project.tasks) {
            if (!task.dueDate) continue
            const key = task.dueDate.slice(0, 10)
            const list = map.get(key) ?? []
            list.push(task)
            map.set(key, list)
        }
        return map
    }, [api.project.tasks])

    function onDragStart(event: DragStartEvent) {
        setActiveTask(api.project.tasks.find((task) => task.id === event.active.id) ?? null)
    }

    function onDragEnd(event: DragEndEvent) {
        const { active, over } = event
        setActiveTask(null)
        if (!over) return
        const date = over.data.current?.date as string | undefined
        if (date) {
            // TODO: sync with API — PATCH /tasks/:id { dueDate }
            api.setTaskDates(String(active.id), date)
        }
    }

    const today = new Date(2026, 7, 18) // mock "today" = 2026-08-18

    return (
        <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
            <div className="overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface)">
                <div className="flex items-center justify-between px-4 py-3">
                    <h3 className="text-sm font-semibold capitalize text-(--color-text)">
                        {format(cursor, 'MMMM yyyy', { locale: es })}
                    </h3>
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => setCursor((value) => subMonths(value, 1))}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-(--color-border) text-(--color-text-muted) hover:bg-(--color-bg-soft) hover:text-(--color-text)"
                            aria-label="Mes anterior"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4" aria-hidden="true">
                                <path d="m15 18-6-6 6-6" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            onClick={() => setCursor(new Date(2026, 7, 1))}
                            className="rounded-lg border border-(--color-border) px-2.5 py-1.5 text-xs font-medium text-(--color-text-muted) hover:bg-(--color-bg-soft) hover:text-(--color-text)"
                        >
                            Hoy
                        </button>
                        <button
                            type="button"
                            onClick={() => setCursor((value) => addMonths(value, 1))}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-(--color-border) text-(--color-text-muted) hover:bg-(--color-bg-soft) hover:text-(--color-text)"
                            aria-label="Mes siguiente"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4" aria-hidden="true">
                                <path d="m9 18 6-6-6-6" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-7 border-t border-(--color-border) bg-(--color-bg-soft)/60">
                    {WEEKDAYS.map((day) => (
                        <div key={day} className="border-r border-(--color-border) px-2 py-1.5 text-center text-[11px] font-semibold uppercase tracking-wide text-(--color-text-muted) last:border-r-0">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7">
                    {days.map((date) => (
                        <DayCell
                            key={toKey(date)}
                            date={date}
                            inMonth={isSameMonth(date, cursor)}
                            isToday={isSameDay(date, today)}
                            tasks={tasksByDay.get(toKey(date)) ?? []}
                            onOpenTask={onOpenTask}
                        />
                    ))}
                </div>
            </div>

            <DragOverlay>
                {activeTask ? (
                    <div className="w-40">
                        <CalendarTaskChip task={activeTask} onOpen={() => {}} overlay />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    )
}
