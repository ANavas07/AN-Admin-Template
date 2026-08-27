// Shared style maps. Every color comes from Tailwind palettes / project tokens —
// nothing hardcoded outside this file. Pattern mirrors `process/types.ts`.
import type { AccentColor, Priority } from './types'

/** Soft badge/chip styles per accent color (bg + text + border), dark-aware. */
export const accentStyles: Record<AccentColor, string> = {
    sky: 'bg-sky-500/10 text-sky-700 border-sky-500/30 dark:text-sky-300',
    violet: 'bg-violet-500/10 text-violet-700 border-violet-500/30 dark:text-violet-300',
    amber: 'bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-300',
    rose: 'bg-rose-500/10 text-rose-700 border-rose-500/30 dark:text-rose-300',
    emerald: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-300',
    slate: 'bg-slate-500/10 text-slate-600 border-slate-500/30 dark:text-slate-300',
    indigo: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/30 dark:text-indigo-300',
}

/** Solid avatar backgrounds per accent color. */
export const accentAvatar: Record<AccentColor, string> = {
    sky: 'bg-sky-500 text-white',
    violet: 'bg-violet-500 text-white',
    amber: 'bg-amber-500 text-white',
    rose: 'bg-rose-500 text-white',
    emerald: 'bg-emerald-500 text-white',
    slate: 'bg-slate-500 text-white',
    indigo: 'bg-indigo-500 text-white',
}

/** Column header dot color per accent (solid swatch). */
export const accentDot: Record<AccentColor, string> = {
    sky: 'bg-sky-500',
    violet: 'bg-violet-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    emerald: 'bg-emerald-500',
    slate: 'bg-slate-400',
    indigo: 'bg-indigo-500',
}

/** Raw hex per accent — used by the SVAR Gantt (Timeline) which needs plain colors. */
export const accentHex: Record<AccentColor, string> = {
    sky: '#0ea5e9',
    violet: '#8b5cf6',
    amber: '#f59e0b',
    rose: '#f43f5e',
    emerald: '#10b981',
    slate: '#64748b',
    indigo: '#6366f1',
}

export const priorityLabels: Record<Priority, string> = {
    urgent: "Urgente",
    high: 'Alta',
    normal: 'Media',
    low: 'Baja',
}

export const priorityStyles: Record<Priority, string> = {
    urgent: 'bg-red-500/10 text-red-700 border-red-500/30 dark:text-red-300',
    high: 'bg-rose-500/10 text-rose-700 border-rose-500/30 dark:text-rose-300',
    normal: 'bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-300',
    low: 'bg-slate-500/10 text-slate-600 border-slate-500/30 dark:text-slate-300',
}

/** Small solid dot used inside the priority badge. */
export const priorityDot: Record<Priority, string> = {
    urgent: 'bg-red-500',
    high: 'bg-rose-500',
    normal: 'bg-amber-500',
    low: 'bg-slate-400',
}

/** Natural priority order (Urgent → low). */
export const priorityOrder: Priority[] = ['urgent', 'high', 'normal', 'low']
