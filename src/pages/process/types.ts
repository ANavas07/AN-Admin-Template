// Process-level (semantic) types: a process is more than its diagram — it carries
// metadata, documentation, state and versioning, independent from the visual layer.
import type { AttachmentRef, DiagramSnapshot } from './flowTypes'

export type ProcessStatus = 'draft' | 'review' | 'approved' | 'published' | 'obsolete'

export const processStatusLabels: Record<ProcessStatus, string> = {
    draft: 'Borrador',
    review: 'En revisión',
    approved: 'Aprobado',
    published: 'Publicado',
    obsolete: 'Obsoleto',
}

export const processStatusStyles: Record<ProcessStatus, string> = {
    draft: 'bg-slate-500/10 text-slate-600 border-slate-500/30 dark:text-slate-300',
    review: 'bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-300',
    approved: 'bg-sky-500/10 text-sky-700 border-sky-500/30 dark:text-sky-300',
    published: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-300',
    obsolete: 'bg-rose-500/10 text-rose-700 border-rose-500/30 dark:text-rose-300',
}

/** Natural lifecycle order, used to offer the next states in the UI. */
export const processStatusFlow: ProcessStatus[] = ['draft', 'review', 'approved', 'published', 'obsolete']

export type ProcessMeta = {
    id: string
    name: string
    /** Business code, e.g. PROC-ACA-001 */
    code: string
    area: string
    category: string
    responsible: string
    version: string
    status: ProcessStatus
    description: string
    objective: string
    scope: string
    tags: string[]
    createdAt: string
    updatedAt: string
}

/** A saved snapshot of a previous version of the process. */
export type ProcessVersionEntry = {
    version: string
    savedAt: string
    comment: string
    diagram: DiagramSnapshot
}

export type ProcessRecord = {
    meta: ProcessMeta
    diagram: DiagramSnapshot
    /** Documentation attached to the process itself (not to a specific element) */
    generalDocuments: AttachmentRef[]
    versions: ProcessVersionEntry[]
}

/** Lightweight row for the repository list view. */
export type ProcessSummary = ProcessMeta & {
    elementCount: number
    connectionCount: number
    documentCount: number
}
