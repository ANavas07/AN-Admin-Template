// Connector geometry: decides where each edge touches its nodes and how it is drawn.
//
// Every edge endpoint is attached to the side of the node that faces the other
// node (top / right / bottom / left). When several edges share the same side of
// a node they are spread along it, so connections never collapse on one point.
import type { FlowEdge, FlowNode, NodeKind } from './flowTypes'

export type Side = 'top' | 'right' | 'bottom' | 'left'

export type Point = { x: number; y: number }

export type Size = { width: number; height: number }

export type Box = Point & Size

export type Anchor = Point & { side: Side }

export type EdgeRoute = {
    edge: FlowEdge
    path: string
    /** Middle point of the curve, used for labels and the delete button */
    midX: number
    midY: number
    isDashed: boolean
}

type NodeShape = 'rect' | 'ellipse' | 'diamond'

type Endpoint = {
    node: FlowNode
    box: Box
    side: Side
    /** Center of the node at the other end, used to order endpoints along a side */
    towards: Point
    /** Position along the side, from -1 (start) to 1 (end). 0 is the middle. */
    offset: number
}

const SIDE_NORMALS: Record<Side, Point> = {
    top: { x: 0, y: -1 },
    right: { x: 1, y: 0 },
    bottom: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
}

/** Fraction of the side that endpoints can use, so they stay away from the corners. */
const SIDE_SPREAD: Record<NodeShape, number> = {
    rect: 0.7,
    ellipse: 0.6,
    diamond: 0.5,
}

const MIN_BEND = 40

function shapeOf(kind: NodeKind): NodeShape {
    if (kind === 'start' || kind === 'end' || kind === 'intermediate') return 'ellipse'
    if (kind === 'decision') return 'diamond'
    return 'rect'
}

function centerOf(box: Box): Point {
    return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
}

function isHorizontal(side: Side) {
    return side === 'left' || side === 'right'
}

/**
 * Side of `box` that faces `target`. The distance on each axis is compared
 * relative to the size of the boxes, so wide or tall shapes choose naturally.
 */
export function facingSide(box: Box, target: Box): Side {
    const from = centerOf(box)
    const to = centerOf(target)
    const dx = to.x - from.x
    const dy = to.y - from.y
    const horizontalReach = Math.abs(dx) / Math.max((box.width + target.width) / 2, 1)
    const verticalReach = Math.abs(dy) / Math.max((box.height + target.height) / 2, 1)

    if (horizontalReach >= verticalReach) return dx >= 0 ? 'right' : 'left'
    return dy >= 0 ? 'bottom' : 'top'
}

/** Point on the outline of the node for a given side and offset along that side. */
export function anchorOn(kind: NodeKind, box: Box, side: Side, offset = 0): Anchor {
    const shape = shapeOf(kind)
    const center = centerOf(box)
    const halfWidth = box.width / 2
    const halfHeight = box.height / 2
    const t = offset * SIDE_SPREAD[shape]
    // How far the outline sits from the center along the side normal, for the offset t
    const depth =
        shape === 'ellipse' ? Math.sqrt(1 - t * t) : shape === 'diamond' ? 1 - Math.abs(t) : 1

    if (isHorizontal(side)) {
        const direction = side === 'right' ? 1 : -1
        return { x: center.x + direction * halfWidth * depth, y: center.y + t * halfHeight, side }
    }
    const direction = side === 'bottom' ? 1 : -1
    return { x: center.x + t * halfWidth, y: center.y + direction * halfHeight * depth, side }
}

/**
 * Cubic curve that leaves `from` perpendicular to its side and enters `to`
 * perpendicular to its side. A plain point as target (the pending connection
 * preview) simply receives the curve.
 */
export function connectorCurve(from: Anchor, to: Anchor | Point) {
    const distance = Math.hypot(to.x - from.x, to.y - from.y)
    const bend = Math.max(distance * 0.4, MIN_BEND)
    const fromNormal = SIDE_NORMALS[from.side]
    const c1 = { x: from.x + fromNormal.x * bend, y: from.y + fromNormal.y * bend }
    const c2 =
        'side' in to
            ? { x: to.x + SIDE_NORMALS[to.side].x * bend, y: to.y + SIDE_NORMALS[to.side].y * bend }
            : to

    return {
        path: `M ${from.x} ${from.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${to.x} ${to.y}`,
        // Point of the Bézier curve at t = 0.5
        midX: (from.x + 3 * c1.x + 3 * c2.x + to.x) / 8,
        midY: (from.y + 3 * c1.y + 3 * c2.y + to.y) / 8,
    }
}

/**
 * Spreads the endpoints that share the same side of the same node. They are
 * ordered by the position of the node at the other end so edges do not cross.
 */
function spreadAlongSides(endpoints: Endpoint[]) {
    const groups = new Map<string, Endpoint[]>()
    for (const endpoint of endpoints) {
        const key = `${endpoint.node.id}:${endpoint.side}`
        groups.set(key, [...(groups.get(key) ?? []), endpoint])
    }

    for (const group of groups.values()) {
        if (group.length < 2) continue
        const axis = isHorizontal(group[0].side) ? 'y' : 'x'
        // Array.sort is stable, so ties keep the edge order and parallel edges stay parallel
        group.sort((a, b) => a.towards[axis] - b.towards[axis])
        group.forEach((endpoint, index) => {
            endpoint.offset = (index / (group.length - 1)) * 2 - 1
        })
    }
}

/** Computes the drawing of every edge of the diagram. */
export function routeEdges(
    nodes: FlowNode[],
    edges: FlowEdge[],
    boxOf: (node: FlowNode) => Box
): EdgeRoute[] {
    const nodeById = new Map(nodes.map((node) => [node.id, node]))
    const endpoints: Endpoint[] = []
    const connected: { edge: FlowEdge; from: Endpoint; to: Endpoint }[] = []

    for (const edge of edges) {
        const fromNode = nodeById.get(edge.from)
        const toNode = nodeById.get(edge.to)
        if (!fromNode || !toNode) continue
        const fromBox = boxOf(fromNode)
        const toBox = boxOf(toNode)
        const from: Endpoint = {
            node: fromNode,
            box: fromBox,
            side: facingSide(fromBox, toBox),
            towards: centerOf(toBox),
            offset: 0,
        }
        const to: Endpoint = {
            node: toNode,
            box: toBox,
            side: facingSide(toBox, fromBox),
            towards: centerOf(fromBox),
            offset: 0,
        }
        endpoints.push(from, to)
        connected.push({ edge, from, to })
    }

    spreadAlongSides(endpoints)

    return connected.map(({ edge, from, to }) => {
        const curve = connectorCurve(
            anchorOn(from.node.kind, from.box, from.side, from.offset),
            anchorOn(to.node.kind, to.box, to.side, to.offset)
        )
        return {
            edge,
            ...curve,
            isDashed: edge.kind !== 'sequence' || from.node.kind === 'note' || to.node.kind === 'note',
        }
    })
}

/** Curve drawn while the user is dragging a new connection towards `pointer`. */
export function previewCurve(node: FlowNode, box: Box, pointer: Point) {
    const side = facingSide(box, { ...pointer, width: 0, height: 0 })
    return connectorCurve(anchorOn(node.kind, box, side), pointer).path
}
