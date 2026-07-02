export type NodeKind =
    | 'task'
    | 'start'
    | 'end'
    | 'decision'
    | 'note'
    | 'data'
    | 'group'
    | 'lane'

export type NodeColor = 'emerald' | 'sky' | 'amber' | 'violet' | 'rose' | 'slate'

export type FlowNode = {
    id: string
    kind: NodeKind
    title: string
    description: string
    note: string
    color: NodeColor
    x: number
    y: number
    /** Only containers (group / lane) persist explicit dimensions */
    width?: number
    height?: number
}

export type FlowEdge = {
    id: string
    from: string
    to: string
    label: string
}

export type DiagramSnapshot = {
    version: 1
    nodes: FlowNode[]
    edges: FlowEdge[]
}

export const CANVAS_WIDTH = 3000
export const CANVAS_HEIGHT = 1800
export const MIN_SCALE = 0.25
export const MAX_SCALE = 2.5
export const STORAGE_KEY = 'process-designer-diagram'

export const nodeColorStyles: Record<
    NodeColor,
    { bar: string; border: string; swatch: string; soft: string }
> = {
    emerald: { bar: 'bg-emerald-500', border: 'border-emerald-500', swatch: 'bg-emerald-500', soft: 'bg-emerald-500/10' },
    sky: { bar: 'bg-sky-500', border: 'border-sky-500', swatch: 'bg-sky-500', soft: 'bg-sky-500/10' },
    amber: { bar: 'bg-amber-500', border: 'border-amber-500', swatch: 'bg-amber-500', soft: 'bg-amber-500/10' },
    violet: { bar: 'bg-violet-500', border: 'border-violet-500', swatch: 'bg-violet-500', soft: 'bg-violet-500/10' },
    rose: { bar: 'bg-rose-500', border: 'border-rose-500', swatch: 'bg-rose-500', soft: 'bg-rose-500/10' },
    slate: { bar: 'bg-slate-500', border: 'border-slate-500', swatch: 'bg-slate-500', soft: 'bg-slate-500/10' },
}

export const colorOptions: { value: NodeColor; label: string }[] = [
    { value: 'emerald', label: 'Emerald' },
    { value: 'sky', label: 'Sky' },
    { value: 'amber', label: 'Amber' },
    { value: 'violet', label: 'Violet' },
    { value: 'rose', label: 'Rose' },
    { value: 'slate', label: 'Slate' },
]

type KindDimensions = {
    width: number
    portY: number
    defaultHeight?: number
}

const KIND_DIMENSIONS: Record<NodeKind, KindDimensions> = {
    task: { width: 224, portY: 34 },
    start: { width: 64, portY: 32 },
    end: { width: 64, portY: 32 },
    decision: { width: 128, portY: 64 },
    note: { width: 200, portY: 26 },
    data: { width: 200, portY: 34 },
    group: { width: 340, portY: 22, defaultHeight: 240 },
    lane: { width: 620, portY: 22, defaultHeight: 180 },
}

export const kindLabels: Record<NodeKind, string> = {
    task: 'Task',
    start: 'Start',
    end: 'End',
    decision: 'Decision',
    note: 'Note',
    data: 'Data / document',
    group: 'Group',
    lane: 'Lane',
}

export function isContainer(kind: NodeKind) {
    return kind === 'group' || kind === 'lane'
}

export function getNodeWidth(node: FlowNode) {
    return node.width ?? KIND_DIMENSIONS[node.kind].width
}

export function getNodeHeight(node: FlowNode) {
    return node.height ?? KIND_DIMENSIONS[node.kind].defaultHeight ?? 64
}

export function getDefaultDimensions(kind: NodeKind) {
    return KIND_DIMENSIONS[kind]
}

export function getPorts(node: FlowNode) {
    const portY = node.y + KIND_DIMENSIONS[node.kind].portY
    return {
        input: { x: node.x, y: portY },
        output: { x: node.x + getNodeWidth(node), y: portY },
    }
}

export function edgePath(fromX: number, fromY: number, toX: number, toY: number) {
    const bend = Math.max(Math.abs(toX - fromX) / 2, 48)
    return `M ${fromX} ${fromY} C ${fromX + bend} ${fromY}, ${toX - bend} ${toY}, ${toX} ${toY}`
}

const VALID_KINDS = new Set<NodeKind>(['task', 'start', 'end', 'decision', 'note', 'data', 'group', 'lane'])
const VALID_COLORS = new Set<NodeColor>(['emerald', 'sky', 'amber', 'violet', 'rose', 'slate'])

/** Parses raw JSON (import / localStorage) into a safe diagram, or null when malformed. */
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
        nodes.push({
            id: node.id,
            kind,
            title: typeof node.title === 'string' ? node.title : kindLabels[kind],
            description: typeof node.description === 'string' ? node.description : '',
            note: typeof node.note === 'string' ? node.note : '',
            color: VALID_COLORS.has(node.color as NodeColor) ? (node.color as NodeColor) : 'emerald',
            x: node.x,
            y: node.y,
            ...(typeof node.width === 'number' ? { width: node.width } : {}),
            ...(typeof node.height === 'number' ? { height: node.height } : {}),
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
        })
    }

    return { version: 1, nodes, edges }
}
