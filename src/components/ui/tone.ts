// Shared color "tones". Every badge, chip, alert, status map and categorical
// color in the app resolves to one of these, so a status looks the same on
// every screen and changes in a single place.
//
// Class strings are written out in full (no string interpolation) so Tailwind
// can detect them at build time.

/** Semantic tones: they carry meaning (state, feedback). */
export type StatusTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info'

/**
 * Categorical tones: they only tell data apart (tags, node colors, avatars).
 * The names match values persisted in data, e.g. a process node color 'emerald'.
 */
export type AccentTone = 'emerald' | 'sky' | 'indigo' | 'violet' | 'rose' | 'amber' | 'orange' | 'teal' | 'slate'

export type Tone = StatusTone | AccentTone

/** Tinted background + colored text (chips, avatars, icon tiles). */
export const toneTint: Record<Tone, string> = {
    neutral: 'bg-canvas-subtle text-fg-muted',
    brand: 'bg-brand-soft text-brand-strong',
    success: 'bg-success-soft text-success',
    warning: 'bg-warning-soft text-warning',
    danger: 'bg-danger-soft text-danger',
    info: 'bg-info-soft text-info',
    emerald: 'bg-accent-emerald-soft text-accent-emerald',
    sky: 'bg-accent-sky-soft text-accent-sky',
    indigo: 'bg-accent-indigo-soft text-accent-indigo',
    violet: 'bg-accent-violet-soft text-accent-violet',
    rose: 'bg-accent-rose-soft text-accent-rose',
    amber: 'bg-accent-amber-soft text-accent-amber',
    orange: 'bg-accent-orange-soft text-accent-orange',
    teal: 'bg-accent-teal-soft text-accent-teal',
    slate: 'bg-accent-slate-soft text-accent-slate',
}

/** Border and ring color matching the tint. Pair with `border` or `ring-1`. */
export const toneOutline: Record<Tone, string> = {
    neutral: 'border-line ring-line',
    brand: 'border-brand/25 ring-brand/25',
    success: 'border-success/25 ring-success/25',
    warning: 'border-warning/25 ring-warning/25',
    danger: 'border-danger/25 ring-danger/25',
    info: 'border-info/25 ring-info/25',
    emerald: 'border-accent-emerald/25 ring-accent-emerald/25',
    sky: 'border-accent-sky/25 ring-accent-sky/25',
    indigo: 'border-accent-indigo/25 ring-accent-indigo/25',
    violet: 'border-accent-violet/25 ring-accent-violet/25',
    rose: 'border-accent-rose/25 ring-accent-rose/25',
    amber: 'border-accent-amber/25 ring-accent-amber/25',
    orange: 'border-accent-orange/25 ring-accent-orange/25',
    teal: 'border-accent-teal/25 ring-accent-teal/25',
    slate: 'border-accent-slate/25 ring-accent-slate/25',
}

/** Tint + outline colors: the standard badge / soft chip look. */
export const toneSoft = Object.fromEntries(
    (Object.keys(toneTint) as Tone[]).map((tone) => [tone, `${toneTint[tone]} ${toneOutline[tone]}`])
) as Record<Tone, string>

/** Solid fill for small marks: status dots, legend swatches, color bars. */
export const toneSolid: Record<Tone, string> = {
    neutral: 'bg-fg-subtle',
    brand: 'bg-brand-solid',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
    info: 'bg-info',
    emerald: 'bg-accent-emerald',
    sky: 'bg-accent-sky',
    indigo: 'bg-accent-indigo',
    violet: 'bg-accent-violet',
    rose: 'bg-accent-rose',
    amber: 'bg-accent-amber',
    orange: 'bg-accent-orange',
    teal: 'bg-accent-teal',
    slate: 'bg-accent-slate',
}

/** Colored text / icon only. */
export const toneText: Record<Tone, string> = {
    neutral: 'text-fg-muted',
    brand: 'text-brand',
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
    info: 'text-info',
    emerald: 'text-accent-emerald',
    sky: 'text-accent-sky',
    indigo: 'text-accent-indigo',
    violet: 'text-accent-violet',
    rose: 'text-accent-rose',
    amber: 'text-accent-amber',
    orange: 'text-accent-orange',
    teal: 'text-accent-teal',
    slate: 'text-accent-slate',
}

/** Border color only (outlines of shapes such as process nodes). */
export const toneBorder: Record<Tone, string> = {
    neutral: 'border-line-strong',
    brand: 'border-brand',
    success: 'border-success',
    warning: 'border-warning',
    danger: 'border-danger',
    info: 'border-info',
    emerald: 'border-accent-emerald',
    sky: 'border-accent-sky',
    indigo: 'border-accent-indigo',
    violet: 'border-accent-violet',
    rose: 'border-accent-rose',
    amber: 'border-accent-amber',
    orange: 'border-accent-orange',
    teal: 'border-accent-teal',
    slate: 'border-accent-slate',
}

const AVATAR_TONES: AccentTone[] = ['sky', 'emerald', 'violet', 'amber', 'rose', 'teal', 'indigo', 'orange']

/** Stable categorical tone for a string (e.g. a user name), for avatars and tags. */
export function toneFromString(value: string): AccentTone {
    let hash = 0
    for (const char of value) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
    return AVATAR_TONES[hash % AVATAR_TONES.length]
}
