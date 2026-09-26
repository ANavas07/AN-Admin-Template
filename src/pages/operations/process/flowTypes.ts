// Visual + BPMN layer of the diagram. Semantic process-level types live in ./types.
import { toneBorder, toneSolid } from '../../../components/ui/tone'
export type NodeKind =
    | 'task'
    | 'start'
    | 'end'
    | 'intermediate'
    | 'decision'
    | 'note'
    | 'data'
    | 'group'
    | 'lane'

/** BPMN 2.0 element subtype. The kind gives the shape, the bpmnType gives the semantics. */
export type BpmnType =
    | 'task'
    | 'userTask'
    | 'serviceTask'
    | 'manualTask'
    | 'scriptTask'
    | 'businessRuleTask'
    | 'subprocess'
    | 'startEvent'
    | 'timerStartEvent'
    | 'messageStartEvent'
    | 'intermediateEvent'
    | 'timerIntermediateEvent'
    | 'messageIntermediateEvent'
    | 'endEvent'
    | 'exclusiveGateway'
    | 'inclusiveGateway'
    | 'parallelGateway'
    | 'eventBasedGateway'

export type EdgeKind = 'sequence' | 'message' | 'association'

export type NodeColor = 'emerald' | 'sky' | 'amber' | 'violet' | 'rose' | 'slate'

export type AttachmentRef = {
    id: string
    name: string
    /** Bytes */
    size: number
    mimeType: string
    addedAt: string
    /** Inline content for small files; larger files keep metadata only until a backend exists */
    dataUrl?: string
}

/** Semantic documentation of an element — independent from its visual representation. */
export type ElementData = {
    responsible: string
    department: string
    estimatedTime: string
    systems: string[]
    inputs: string[]
    outputs: string[]
    documents: AttachmentRef[]
}

export function emptyElementData(): ElementData {
    return {
        responsible: '',
        department: '',
        estimatedTime: '',
        systems: [],
        inputs: [],
        outputs: [],
        documents: [],
    }
}

export type FlowNode = {
    id: string
    kind: NodeKind
    bpmnType: BpmnType | null
    title: string
    description: string
    note: string
    color: NodeColor
    x: number
    y: number
    /** Only containers (group / lane) persist explicit dimensions */
    width?: number
    height?: number
    data: ElementData
}

export type FlowEdge = {
    id: string
    from: string
    to: string
    label: string
    kind: EdgeKind
    /** Optional condition documented on sequence flows leaving a gateway */
    condition: string
}

export type DiagramSnapshot = {
    version: 2
    nodes: FlowNode[]
    edges: FlowEdge[]
}

export const CANVAS_WIDTH = 3000
export const CANVAS_HEIGHT = 1800
export const MIN_SCALE = 0.25
export const MAX_SCALE = 2.5
/** Legacy single-diagram storage key (pre-repository). Migrated by processService. */
export const LEGACY_STORAGE_KEY = 'process-designer-diagram'

/** Node colors are categorical tones (see components/ui/tone.ts); the names are persisted in diagrams. */
const nodeSoftFill: Record<NodeColor, string> = {
    emerald: 'bg-accent-emerald/10',
    sky: 'bg-accent-sky/10',
    amber: 'bg-accent-amber/10',
    violet: 'bg-accent-violet/10',
    rose: 'bg-accent-rose/10',
    slate: 'bg-accent-slate/10',
}

export const nodeColorStyles = Object.fromEntries(
    (Object.keys(nodeSoftFill) as NodeColor[]).map((color) => [
        color,
        { bar: toneSolid[color], border: toneBorder[color], swatch: toneSolid[color], soft: nodeSoftFill[color] },
    ])
) as Record<NodeColor, { bar: string; border: string; swatch: string; soft: string }>

export const colorOptions: { value: NodeColor; label: string }[] = [
    { value: 'emerald', label: 'Esmeralda' },
    { value: 'sky', label: 'Cielo' },
    { value: 'amber', label: 'Ámbar' },
    { value: 'violet', label: 'Violeta' },
    { value: 'rose', label: 'Rosa' },
    { value: 'slate', label: 'Pizarra' },
]

type KindDimensions = {
    width: number
    /**
     * Initial height of containers. For the rest of the kinds the real height
     * depends on the content, so this is only an estimate used until the node
     * is measured in the DOM.
     */
    height: number
}

const KIND_DIMENSIONS: Record<NodeKind, KindDimensions> = {
    task: { width: 224, height: 90 },
    start: { width: 64, height: 64 },
    end: { width: 64, height: 64 },
    intermediate: { width: 64, height: 64 },
    decision: { width: 128, height: 128 },
    note: { width: 200, height: 64 },
    data: { width: 200, height: 64 },
    group: { width: 340, height: 240 },
    lane: { width: 620, height: 180 },
}

export const kindLabels: Record<NodeKind, string> = {
    task: 'Tarea',
    start: 'Inicio',
    end: 'Fin',
    intermediate: 'Evento intermedio',
    decision: 'Compuerta',
    note: 'Nota',
    data: 'Dato / documento',
    group: 'Grupo',
    lane: 'Lane',
}

export const bpmnTypeLabels: Record<BpmnType, string> = {
    task: 'Tarea',
    userTask: 'Tarea de usuario',
    serviceTask: 'Tarea de servicio',
    manualTask: 'Tarea manual',
    scriptTask: 'Tarea de script',
    businessRuleTask: 'Regla de negocio',
    subprocess: 'Subproceso',
    startEvent: 'Evento de inicio',
    timerStartEvent: 'Inicio por tiempo',
    messageStartEvent: 'Inicio por mensaje',
    intermediateEvent: 'Evento intermedio',
    timerIntermediateEvent: 'Intermedio de tiempo',
    messageIntermediateEvent: 'Intermedio de mensaje',
    endEvent: 'Evento de fin',
    exclusiveGateway: 'Compuerta exclusiva',
    inclusiveGateway: 'Compuerta inclusiva',
    parallelGateway: 'Compuerta paralela',
    eventBasedGateway: 'Compuerta por eventos',
}

/** Valid BPMN subtypes for each visual kind, first entry is the default. */
export const KIND_BPMN_TYPES: Partial<Record<NodeKind, BpmnType[]>> = {
    task: ['task', 'userTask', 'serviceTask', 'manualTask', 'scriptTask', 'businessRuleTask', 'subprocess'],
    start: ['startEvent', 'timerStartEvent', 'messageStartEvent'],
    intermediate: ['intermediateEvent', 'timerIntermediateEvent', 'messageIntermediateEvent'],
    end: ['endEvent'],
    decision: ['exclusiveGateway', 'inclusiveGateway', 'parallelGateway', 'eventBasedGateway'],
}

export function defaultBpmnType(kind: NodeKind): BpmnType | null {
    return KIND_BPMN_TYPES[kind]?.[0] ?? null
}

export function isContainer(kind: NodeKind) {
    return kind === 'group' || kind === 'lane'
}

export function isEventKind(kind: NodeKind) {
    return kind === 'start' || kind === 'end' || kind === 'intermediate'
}

/** Kinds that carry business documentation (responsible, systems, attachments…) */
export function hasSemanticData(kind: NodeKind) {
    return kind === 'task' || kind === 'decision' || kind === 'data'
}

export function getNodeWidth(node: FlowNode) {
    return node.width ?? KIND_DIMENSIONS[node.kind].width
}

/** Explicit height for containers, estimated height for the rest (see KIND_DIMENSIONS). */
export function getNodeHeight(node: FlowNode) {
    return node.height ?? KIND_DIMENSIONS[node.kind].height
}

export function getDefaultDimensions(kind: NodeKind) {
    return KIND_DIMENSIONS[kind]
}

const VALID_KINDS = new Set<NodeKind>([
    'task', 'start', 'end', 'intermediate', 'decision', 'note', 'data', 'group', 'lane',
])
const VALID_COLORS = new Set<NodeColor>(['emerald', 'sky', 'amber', 'violet', 'rose', 'slate'])
const VALID_EDGE_KINDS = new Set<EdgeKind>(['sequence', 'message', 'association'])

function parseStringArray(raw: unknown): string[] {
    if (!Array.isArray(raw)) return []
    return raw.filter((item): item is string => typeof item === 'string')
}

function parseAttachments(raw: unknown): AttachmentRef[] {
    if (!Array.isArray(raw)) return []
    const result: AttachmentRef[] = []
    for (const item of raw) {
        if (typeof item !== 'object' || item === null) continue
        const doc = item as Partial<AttachmentRef>
        if (typeof doc.id !== 'string' || typeof doc.name !== 'string') continue
        result.push({
            id: doc.id,
            name: doc.name,
            size: typeof doc.size === 'number' ? doc.size : 0,
            mimeType: typeof doc.mimeType === 'string' ? doc.mimeType : 'application/octet-stream',
            addedAt: typeof doc.addedAt === 'string' ? doc.addedAt : new Date().toISOString(),
            ...(typeof doc.dataUrl === 'string' ? { dataUrl: doc.dataUrl } : {}),
        })
    }
    return result
}

function parseElementData(raw: unknown): ElementData {
    const base = emptyElementData()
    if (typeof raw !== 'object' || raw === null) return base
    const data = raw as Partial<ElementData>
    return {
        responsible: typeof data.responsible === 'string' ? data.responsible : '',
        department: typeof data.department === 'string' ? data.department : '',
        estimatedTime: typeof data.estimatedTime === 'string' ? data.estimatedTime : '',
        systems: parseStringArray(data.systems),
        inputs: parseStringArray(data.inputs),
        outputs: parseStringArray(data.outputs),
        documents: parseAttachments(data.documents),
    }
}

/**
 * Parses raw JSON (import / storage) into a safe diagram, or null when malformed.
 * Accepts both the legacy v1 shape and the current v2 shape.
 */
export function parseDiagram(raw: unknown): DiagramSnapshot | null {
    if (typeof raw !== 'object' || raw === null) return null
    const data = raw as { nodes?: unknown; edges?: unknown }
    if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) return null

    const nodes: FlowNode[] = []
    for (const item of data.nodes) {
        if (typeof item !== 'object' || item === null) return null
        const node = item as Partial<FlowNode>
        if (typeof node.id !== 'string' || typeof node.x !== 'number' || typeof node.y !== 'number') {
            return null
        }
        const kind = VALID_KINDS.has(node.kind as NodeKind) ? (node.kind as NodeKind) : 'task'
        const validTypes = KIND_BPMN_TYPES[kind]
        const bpmnType =
            validTypes && validTypes.includes(node.bpmnType as BpmnType)
                ? (node.bpmnType as BpmnType)
                : defaultBpmnType(kind)
        nodes.push({
            id: node.id,
            kind,
            bpmnType,
            title: typeof node.title === 'string' ? node.title : kindLabels[kind],
            description: typeof node.description === 'string' ? node.description : '',
            note: typeof node.note === 'string' ? node.note : '',
            color: VALID_COLORS.has(node.color as NodeColor) ? (node.color as NodeColor) : 'emerald',
            x: node.x,
            y: node.y,
            ...(typeof node.width === 'number' ? { width: node.width } : {}),
            ...(typeof node.height === 'number' ? { height: node.height } : {}),
            data: parseElementData(node.data),
        })
    }

    const nodeIds = new Set(nodes.map((node) => node.id))
    const edges: FlowEdge[] = []
    for (const item of data.edges) {
        if (typeof item !== 'object' || item === null) return null
        const edge = item as Partial<FlowEdge>
        if (typeof edge.id !== 'string' || typeof edge.from !== 'string' || typeof edge.to !== 'string') {
            return null
        }
        if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) continue
        edges.push({
            id: edge.id,
            from: edge.from,
            to: edge.to,
            label: typeof edge.label === 'string' ? edge.label : '',
            kind: VALID_EDGE_KINDS.has(edge.kind as EdgeKind) ? (edge.kind as EdgeKind) : 'sequence',
            condition: typeof edge.condition === 'string' ? edge.condition : '',
        })
    }

    return { version: 2, nodes, edges }
}

export function emptyDiagram(): DiagramSnapshot {
    return { version: 2, nodes: [], edges: [] }
}
