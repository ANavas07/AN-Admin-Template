// Process-level (semantic) types: a process is more than its diagram — it carries
// metadata, documentation, state and versioning, independent from the visual layer.
import { toneSoft } from '../../../components/ui/tone'
import type { StatusTone } from '../../../components/ui/tone'
import type { AttachmentRef, DiagramSnapshot } from './flowTypes'

export type ProcessStatus = 'draft' | 'review' | 'approved' | 'published' | 'obsolete'

export const processStatusLabels: Record<ProcessStatus, string> = {
    draft: 'Borrador',
    review: 'En revisión',
    approved: 'Aprobado',
    published: 'Publicado',
    obsolete: 'Obsoleto',
}

export const processStatusTones: Record<ProcessStatus, StatusTone> = {
    draft: 'neutral',
    review: 'warning',
    approved: 'info',
    published: 'success',
    obsolete: 'danger',
}

/** @deprecated Kept for compatibility; render `<Badge tone={processStatusTones[status]}>` instead. */
export const processStatusStyles = Object.fromEntries(
    Object.entries(processStatusTones).map(([status, tone]) => [status, toneSoft[tone]])
) as Record<ProcessStatus, string>

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
