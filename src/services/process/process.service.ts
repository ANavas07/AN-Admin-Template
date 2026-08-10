// Process repository. Persists to localStorage today, but exposes an async API
// with the same shape as the http-backed services (see services/rbac) so it can
// be swapped for a real backend without touching the UI.
import { LEGACY_STORAGE_KEY, emptyDiagram, parseDiagram } from '../../pages/process/flowTypes'
import type { DiagramSnapshot } from '../../pages/process/flowTypes'
import type {
    ProcessMeta,
    ProcessRecord,
    ProcessStatus,
    ProcessSummary,
    ProcessVersionEntry,
} from '../../pages/process/types'

const STORAGE_KEY = 'process-repository:v1'

type RepositoryFile = {
    version: 1
    processes: ProcessRecord[]
}

function newId() {
    return `proc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function nowIso() {
    return new Date().toISOString()
}

function defaultMeta(partial: Partial<ProcessMeta> = {}): ProcessMeta {
    const timestamp = nowIso()
    return {
        id: newId(),
        name: 'Proceso sin título',
        code: '',
        area: '',
        category: '',
        responsible: '',
        version: '1.0',
        status: 'draft',
        description: '',
        objective: '',
        scope: '',
        tags: [],
        createdAt: timestamp,
        updatedAt: timestamp,
        ...partial,
    }
}

function readRepository(): RepositoryFile {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
            const parsed = JSON.parse(raw) as RepositoryFile
            if (parsed && Array.isArray(parsed.processes)) {
                // Re-validate diagrams defensively; storage can be edited by hand
                for (const record of parsed.processes) {
                    record.diagram = parseDiagram(record.diagram) ?? emptyDiagram()
                    record.generalDocuments = Array.isArray(record.generalDocuments) ? record.generalDocuments : []
                    record.versions = Array.isArray(record.versions) ? record.versions : []
                }
                return parsed
            }
        }
    } catch {
        // Corrupt storage falls through to an empty repository
    }
    return { version: 1, processes: [] }
}

function writeRepository(repo: RepositoryFile) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(repo))
}

/** One-time migration of the legacy single-diagram storage into the repository. */
function migrateLegacyDiagram(repo: RepositoryFile): boolean {
    try {
        const raw = localStorage.getItem(LEGACY_STORAGE_KEY)
        if (!raw) return false
        const diagram = parseDiagram(JSON.parse(raw))
        localStorage.removeItem(LEGACY_STORAGE_KEY)
        if (!diagram || diagram.nodes.length === 0) return false
        repo.processes.unshift({
            meta: defaultMeta({ name: 'Proceso migrado', description: 'Diagrama recuperado del editor anterior.' }),
            diagram,
            generalDocuments: [],
            versions: [],
        })
        return true
    } catch {
        return false
    }
}

function summarize(record: ProcessRecord): ProcessSummary {
    const elementDocuments = record.diagram.nodes.reduce(
        (total, node) => total + node.data.documents.length,
        0
    )
    return {
        ...record.meta,
        elementCount: record.diagram.nodes.length,
        connectionCount: record.diagram.edges.length,
        documentCount: elementDocuments + record.generalDocuments.length,
    }
}

export type CreateProcessDto = Partial<Omit<ProcessMeta, 'id' | 'createdAt' | 'updatedAt'>> & {
    diagram?: DiagramSnapshot
}

export const processService = {
    async list(): Promise<ProcessSummary[]> {
        const repo = readRepository()
        if (migrateLegacyDiagram(repo)) writeRepository(repo)
        return repo.processes.map(summarize)
    },

    async getById(id: string): Promise<ProcessRecord | null> {
        const repo = readRepository()
        if (migrateLegacyDiagram(repo)) writeRepository(repo)
        return repo.processes.find((record) => record.meta.id === id) ?? null
    },

    async create(data: CreateProcessDto = {}): Promise<ProcessRecord> {
        const repo = readRepository()
        const { diagram, ...meta } = data
        const record: ProcessRecord = {
            meta: defaultMeta(meta),
            diagram: diagram ?? emptyDiagram(),
            generalDocuments: [],
            versions: [],
        }
        repo.processes.unshift(record)
        writeRepository(repo)
        return record
    },

    async updateMeta(id: string, patch: Partial<Omit<ProcessMeta, 'id' | 'createdAt'>>): Promise<ProcessMeta | null> {
        const repo = readRepository()
        const record = repo.processes.find((item) => item.meta.id === id)
        if (!record) return null
        record.meta = { ...record.meta, ...patch, id: record.meta.id, updatedAt: nowIso() }
        writeRepository(repo)
        return record.meta
    },

    async saveDiagram(id: string, diagram: DiagramSnapshot): Promise<boolean> {
        const repo = readRepository()
        const record = repo.processes.find((item) => item.meta.id === id)
        if (!record) return false
        record.diagram = diagram
        record.meta.updatedAt = nowIso()
        writeRepository(repo)
        return true
    },

    async setStatus(id: string, status: ProcessStatus): Promise<boolean> {
        const repo = readRepository()
        const record = repo.processes.find((item) => item.meta.id === id)
        if (!record) return false
        record.meta.status = status
        record.meta.updatedAt = nowIso()
        writeRepository(repo)
        return true
    },

    /** Archives the current diagram as a version entry and bumps the version label. */
    async saveVersion(id: string, nextVersion: string, comment: string): Promise<ProcessVersionEntry | null> {
        const repo = readRepository()
        const record = repo.processes.find((item) => item.meta.id === id)
        if (!record) return null
        const entry: ProcessVersionEntry = {
            version: record.meta.version,
            savedAt: nowIso(),
            comment,
            diagram: record.diagram,
        }
        record.versions.unshift(entry)
        record.meta.version = nextVersion
        record.meta.updatedAt = nowIso()
        writeRepository(repo)
        return entry
    },

    async duplicate(id: string): Promise<ProcessRecord | null> {
        const repo = readRepository()
        const source = repo.processes.find((item) => item.meta.id === id)
        if (!source) return null
        const copy: ProcessRecord = {
            meta: defaultMeta({
                ...source.meta,
                name: `${source.meta.name} (copia)`,
                status: 'draft',
                version: '1.0',
            }),
            diagram: JSON.parse(JSON.stringify(source.diagram)) as DiagramSnapshot,
            generalDocuments: [...source.generalDocuments],
            versions: [],
        }
        repo.processes.unshift(copy)
        writeRepository(repo)
        return copy
    },

    async remove(id: string): Promise<boolean> {
        const repo = readRepository()
        const before = repo.processes.length
        repo.processes = repo.processes.filter((item) => item.meta.id !== id)
        writeRepository(repo)
        return repo.processes.length < before
    },
}
