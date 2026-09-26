// Shared style maps. Colors come from the shared tone system
// (components/ui/tone.ts): accent colors are categorical tones and priorities
// map to semantic ones. Pattern mirrors `process/types.ts`.
import { toneSoft, toneSolid, toneTint } from '../../../components/ui/tone'
import type { StatusTone } from '../../../components/ui/tone'
import type { AccentColor, Priority } from './types'

/** Soft badge/chip styles per accent color (bg + text + border). */
export const accentStyles: Record<AccentColor, string> = {
    sky: toneSoft.sky,
    violet: toneSoft.violet,
    amber: toneSoft.amber,
    rose: toneSoft.rose,
    emerald: toneSoft.emerald,
    slate: toneSoft.slate,
    indigo: toneSoft.indigo,
}

/** Avatar / team tile colors per accent (tinted, legible in both themes). */
export const accentAvatar: Record<AccentColor, string> = {
    sky: toneTint.sky,
    violet: toneTint.violet,
    amber: toneTint.amber,
    rose: toneTint.rose,
    emerald: toneTint.emerald,
    slate: toneTint.slate,
    indigo: toneTint.indigo,
}

/** Column header dot color per accent (solid swatch). */
export const accentDot: Record<AccentColor, string> = {
    sky: toneSolid.sky,
    violet: toneSolid.violet,
    amber: toneSolid.amber,
    rose: toneSolid.rose,
    emerald: toneSolid.emerald,
    slate: toneSolid.slate,
    indigo: toneSolid.indigo,
}

export const priorityLabels: Record<Priority, string> = {
    urgent: "Urgente",
    high: 'Alta',
    normal: 'Media',
    low: 'Baja',
}

/** Semantic tone of each priority. */
export const priorityTones: Record<Priority, StatusTone | 'orange'> = {
    urgent: 'danger',
    high: 'orange',
    normal: 'warning',
    low: 'neutral',
}

export const priorityStyles: Record<Priority, string> = {
    urgent: toneSoft[priorityTones.urgent],
    high: toneSoft[priorityTones.high],
    normal: toneSoft[priorityTones.normal],
    low: toneSoft[priorityTones.low],
}

/** Small solid dot used inside the priority badge. */
export const priorityDot: Record<Priority, string> = {
    urgent: toneSolid[priorityTones.urgent],
    high: toneSolid[priorityTones.high],
    normal: toneSolid[priorityTones.normal],
    low: toneSolid[priorityTones.low],
}

/** Natural priority order (Urgent → low). */
export const priorityOrder: Priority[] = ['urgent', 'high', 'normal', 'low']
