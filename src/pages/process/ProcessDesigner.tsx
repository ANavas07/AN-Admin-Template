import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react'
import ButtonComponent from '../../components/ui/buttons/ButtonComponent'
import InputComponent from '../../components/ui/inputs/InputComponent'
import PopUp from '../../components/common/pop-up/PopUp'
import { FlowIcon, NoteIcon, TrashBinIcon } from '../../icons/icons'
import FlowNodeView from './FlowNodeView'
import {
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    MAX_SCALE,
    MIN_SCALE,
    STORAGE_KEY,
    colorOptions,
    edgePath,
    getDefaultDimensions,
    getNodeHeight,
    getNodeWidth,
    getPorts,
    isContainer,
    kindLabels,
    nodeColorStyles,
    parseDiagram,
} from './flowTypes'
import type { DiagramSnapshot, FlowEdge, FlowNode, NodeColor, NodeKind } from './flowTypes'

const initialNodes: FlowNode[] = [
    { id: 'n-start', kind: 'start', title: 'Start', description: '', note: '', color: 'emerald', x: 70, y: 300 },
    { id: 'n-reg', kind: 'task', title: 'Registration opens', description: 'Teams submit their roster and payment.', note: '', color: 'emerald', x: 220, y: 268 },
    { id: 'n-val', kind: 'task', title: 'Team validation', description: 'Documents and eligibility are reviewed.', note: '', color: 'sky', x: 520, y: 268 },
    { id: 'n-dec', kind: 'decision', title: 'Documents OK?', description: '', note: '', color: 'violet', x: 820, y: 268 },
    { id: 'n-draw', kind: 'task', title: 'Group draw', description: 'Validated teams are seeded into groups.', note: '', color: 'violet', x: 1060, y: 150 },
    { id: 'n-fix', kind: 'task', title: 'Request corrections', description: 'Team is asked to resubmit documents.', note: '', color: 'rose', x: 1060, y: 470 },
    { id: 'n-end', kind: 'end', title: 'End', description: '', note: '', color: 'rose', x: 1400, y: 180 },
    { id: 'n-note', kind: 'note', title: 'Validation rule', description: 'Reject rosters with fewer than 8 players. Escalate edge cases to the organizer on duty.', note: '', color: 'amber', x: 470, y: 470 },
]

const initialEdges: FlowEdge[] = [
    { id: 'e-1', from: 'n-start', to: 'n-reg', label: '' },
    { id: 'e-2', from: 'n-reg', to: 'n-val', label: '' },
    { id: 'e-3', from: 'n-val', to: 'n-dec', label: '' },
    { id: 'e-4', from: 'n-dec', to: 'n-draw', label: 'Yes' },
    { id: 'e-5', from: 'n-dec', to: 'n-fix', label: 'No' },
    { id: 'e-6', from: 'n-draw', to: 'n-end', label: '' },
    { id: 'e-7', from: 'n-note', to: 'n-val', label: '' },
]

const kindDefaults: Record<NodeKind, { title: string; description: string; color: NodeColor }> = {
    task: { title: 'New task', description: 'Describe what happens in this step.', color: 'emerald' },
    start: { title: 'Start', description: '', color: 'emerald' },
    end: { title: 'End', description: '', color: 'rose' },
    decision: { title: 'Decision?', description: '', color: 'violet' },
    note: { title: 'Note', description: 'Write your comment here.', color: 'amber' },
    data: { title: 'Data / document', description: 'Document produced by the process.', color: 'sky' },
    group: { title: 'Group', description: '', color: 'slate' },
    lane: { title: 'Lane', description: '', color: 'slate' },
}

type ViewportState = { scale: number; tx: number; ty: number }

type ContextMenuState = {
    x: number
    y: number
    targetType: 'node' | 'edge'
    targetId: string
}

const MINIMAP_WIDTH = 168
const MINIMAP_SCALE = MINIMAP_WIDTH / CANVAS_WIDTH
const MINIMAP_HEIGHT = Math.round(CANVAS_HEIGHT * MINIMAP_SCALE)

const textareaClass =
    'w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-2.5 text-sm text-(--color-text) placeholder:text-(--color-text-muted) transition-all duration-200 focus:border-highlight focus:outline-none focus:ring-2 focus:ring-highlight/25'

function isTypingTarget(target: EventTarget | null) {
    const element = target as HTMLElement | null
    return Boolean(
        element &&
        (element.tagName === 'INPUT' ||
            element.tagName === 'TEXTAREA' ||
            element.tagName === 'SELECT' ||
            element.isContentEditable)
    )
}

function loadInitialDiagram(): DiagramSnapshot {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
            const parsed = parseDiagram(JSON.parse(raw))
            if (parsed) return parsed
        }
    } catch {
        // Fall through to the demo diagram when storage is unreadable
    }
    return { version: 1, nodes: initialNodes, edges: initialEdges }
}

function approximateNodeHeight(node: FlowNode) {
    if (isContainer(node.kind)) return getNodeHeight(node)
    if (node.kind === 'decision') return 128
    if (node.kind === 'task') return 90
    return 64
}

function PaletteGlyph({ kind }: { kind: NodeKind }) {
    switch (kind) {
        case 'task':
            return (
                <svg viewBox="0 0 20 20" fill="none" className="size-5" aria-hidden="true">
                    <rect x="3" y="5" width="14" height="10" rx="3" stroke="currentColor" strokeWidth="1.6" />
                </svg>
            )
        case 'start':
            return (
                <svg viewBox="0 0 20 20" fill="none" className="size-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true">
                    <circle cx="10" cy="10" r="6.5" stroke="currentColor" strokeWidth="1.4" />
                </svg>
            )
        case 'end':
            return (
                <svg viewBox="0 0 20 20" fill="none" className="size-5 text-rose-600 dark:text-rose-400" aria-hidden="true">
                    <circle cx="10" cy="10" r="6" stroke="currentColor" strokeWidth="3" />
                </svg>
            )
        case 'decision':
            return (
                <svg viewBox="0 0 20 20" fill="none" className="size-5" aria-hidden="true">
                    <path d="M10 3 17 10 10 17 3 10Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                </svg>
            )
        case 'note':
            return (
                <svg viewBox="0 0 20 20" fill="none" className="size-5 text-amber-600 dark:text-amber-400" aria-hidden="true">
                    <rect x="3.5" y="3.5" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" strokeDasharray="2.5 2" />
                </svg>
            )
        case 'data':
            return (
                <svg viewBox="0 0 20 20" fill="none" className="size-5" aria-hidden="true">
                    <path d="M4 4h8l4 4v8H4V4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                    <path d="M12 4v4h4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                </svg>
            )
        case 'group':
            return (
                <svg viewBox="0 0 20 20" fill="none" className="size-5" aria-hidden="true">
                    <rect x="3" y="4" width="14" height="12" rx="3" stroke="currentColor" strokeWidth="1.6" strokeDasharray="3 2.5" />
                </svg>
            )
        default:
            return (
                <svg viewBox="0 0 20 20" fill="none" className="size-5" aria-hidden="true">
                    <rect x="2.5" y="5" width="15" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M6.5 5v10" stroke="currentColor" strokeWidth="1.6" />
                </svg>
            )
    }
}

const paletteItems: { kind: NodeKind; label: string }[] = [
    { kind: 'task', label: 'Add task' },
    { kind: 'decision', label: 'Add decision' },
    { kind: 'start', label: 'Add start point' },
    { kind: 'end', label: 'Add end point' },
    { kind: 'note', label: 'Add note' },
    { kind: 'data', label: 'Add data / document' },
    { kind: 'group', label: 'Add group' },
    { kind: 'lane', label: 'Add lane' },
]

export default function ProcessDesigner() {
    const [nodes, setNodes] = useState<FlowNode[]>(() => loadInitialDiagram().nodes)
    const [edges, setEdges] = useState<FlowEdge[]>(() => loadInitialDiagram().edges)
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
    const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null)
    const [connectingFromId, setConnectingFromId] = useState<string | null>(null)
    const [pointerPos, setPointerPos] = useState<{ x: number; y: number } | null>(null)
    const [viewport, setViewport] = useState<ViewportState>({ scale: 1, tx: 0, ty: 0 })
    const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 })
    const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)
    const [statusMessage, setStatusMessage] = useState<string | null>(null)
    const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false)

    const rootRef = useRef<HTMLDivElement>(null)
    const viewportRef = useRef<HTMLDivElement>(null)
    const importInputRef = useRef<HTMLInputElement>(null)
    const dragRef = useRef<{ nodeId: string; offsetX: number; offsetY: number } | null>(null)
    const panRef = useRef<{ startX: number; startY: number; startTx: number; startTy: number; moved: boolean } | null>(null)
    const resizeRef = useRef<{ nodeId: string; startW: number; startH: number; startX: number; startY: number } | null>(null)
    const connectDragRef = useRef<{ startClientX: number; startClientY: number; moved: boolean } | null>(null)
    const idCounterRef = useRef(0)
    const toastTimerRef = useRef<number | null>(null)

    const selectedNode = useMemo(
        () => nodes.find((node) => node.id === selectedNodeId) ?? null,
        [nodes, selectedNodeId]
    )
    const selectedEdge = useMemo(
        () => edges.find((edge) => edge.id === selectedEdgeId) ?? null,
        [edges, selectedEdgeId]
    )
    const connectingFromNode = useMemo(
        () => nodes.find((node) => node.id === connectingFromId) ?? null,
        [nodes, connectingFromId]
    )

    // Track viewport dimensions for the minimap and centered placement
    useEffect(() => {
        const element = viewportRef.current
        if (!element) return
        const observer = new ResizeObserver((entries) => {
            const entry = entries[0]
            if (entry) {
                setViewportSize({ width: entry.contentRect.width, height: entry.contentRect.height })
            }
        })
        observer.observe(element)
        return () => observer.disconnect()
    }, [])

    // Mouse-wheel zoom keeps the world point under the cursor fixed.
    // Native listener because React wheel handlers cannot preventDefault (passive).
    useEffect(() => {
        const element = viewportRef.current
        if (!element) return

        function handleWheel(event: WheelEvent) {
            event.preventDefault()
            const rect = element!.getBoundingClientRect()
            const px = event.clientX - rect.left
            const py = event.clientY - rect.top
            setViewport((current) => {
                const factor = Math.exp(-event.deltaY * 0.0014)
                const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, current.scale * factor))
                const ratio = scale / current.scale
                return {
                    scale,
                    tx: px - ratio * (px - current.tx),
                    ty: py - ratio * (py - current.ty),
                }
            })
        }

        element.addEventListener('wheel', handleWheel, { passive: false })
        return () => element.removeEventListener('wheel', handleWheel)
    }, [])

    // Keyboard shortcuts: Delete removes the selection, Escape cancels pending actions
    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setConnectingFromId(null)
                setContextMenu(null)
                return
            }
            if ((event.key === 'Delete' || event.key === 'Backspace') && !isTypingTarget(event.target)) {
                if (selectedNodeId) removeNode(selectedNodeId)
                else if (selectedEdgeId) removeEdge(selectedEdgeId)
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    })

    function showStatus(message: string) {
        if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current)
        setStatusMessage(message)
        toastTimerRef.current = window.setTimeout(() => setStatusMessage(null), 2600)
    }

    function newId(prefix: string) {
        idCounterRef.current += 1
        return `${prefix}-${Date.now().toString(36)}-${idCounterRef.current}`
    }

    function worldPoint(event: { clientX: number; clientY: number }) {
        const rect = viewportRef.current?.getBoundingClientRect()
        if (!rect) return { x: 0, y: 0 }
        return {
            x: (event.clientX - rect.left - viewport.tx) / viewport.scale,
            y: (event.clientY - rect.top - viewport.ty) / viewport.scale,
        }
    }

    function viewportCenterWorld() {
        return {
            x: (viewportSize.width / 2 - viewport.tx) / viewport.scale,
            y: (viewportSize.height / 2 - viewport.ty) / viewport.scale,
        }
    }

    // --- Diagram mutations ------------------------------------------------
    function updateNode(nodeId: string, patch: Partial<FlowNode>) {
        setNodes((current) => current.map((node) => (node.id === nodeId ? { ...node, ...patch } : node)))
    }

    function updateEdge(edgeId: string, patch: Partial<FlowEdge>) {
        setEdges((current) => current.map((edge) => (edge.id === edgeId ? { ...edge, ...patch } : edge)))
    }

    function removeNode(nodeId: string) {
        setNodes((current) => current.filter((node) => node.id !== nodeId))
        setEdges((current) => current.filter((edge) => edge.from !== nodeId && edge.to !== nodeId))
        setSelectedNodeId((current) => (current === nodeId ? null : current))
        setConnectingFromId((current) => (current === nodeId ? null : current))
        setContextMenu(null)
    }

    function removeEdge(edgeId: string) {
        setEdges((current) => current.filter((edge) => edge.id !== edgeId))
        setSelectedEdgeId((current) => (current === edgeId ? null : current))
        setContextMenu(null)
    }

    function duplicateNode(nodeId: string) {
        const source = nodes.find((node) => node.id === nodeId)
        if (!source) return
        const copy: FlowNode = { ...source, id: newId('n'), x: source.x + 32, y: source.y + 32 }
        setNodes((current) => [...current, copy])
        setSelectedNodeId(copy.id)
        setSelectedEdgeId(null)
        setContextMenu(null)
    }

    function addNode(kind: NodeKind) {
        const defaults = kindDefaults[kind]
        const dims = getDefaultDimensions(kind)
        const center = viewportCenterWorld()
        const jitter = (idCounterRef.current % 5) * 16

        const node: FlowNode = {
            id: newId('n'),
            kind,
            title: defaults.title,
            description: defaults.description,
            note: '',
            color: defaults.color,
            x: Math.max(0, Math.min(center.x - dims.width / 2 + jitter, CANVAS_WIDTH - dims.width)),
            y: Math.max(0, Math.min(center.y - 60 + jitter, CANVAS_HEIGHT - 160)),
            ...(isContainer(kind) ? { width: dims.width, height: dims.defaultHeight } : {}),
        }

        if (kind === 'decision') {
            // A decision automatically ships with its two labeled outputs
            const yesNode: FlowNode = {
                ...node,
                id: newId('n'),
                kind: 'task',
                title: 'Yes path',
                description: 'Happens when the condition is met.',
                color: 'emerald',
                x: Math.min(node.x + 260, CANVAS_WIDTH - 224),
                y: Math.max(0, node.y - 100),
            }
            const noNode: FlowNode = {
                ...node,
                id: newId('n'),
                kind: 'task',
                title: 'No path',
                description: 'Happens when the condition fails.',
                color: 'rose',
                x: Math.min(node.x + 260, CANVAS_WIDTH - 224),
                y: Math.min(node.y + 170, CANVAS_HEIGHT - 160),
            }
            setNodes((current) => [...current, node, yesNode, noNode])
            setEdges((current) => [
                ...current,
                { id: newId('e'), from: node.id, to: yesNode.id, label: 'Yes' },
                { id: newId('e'), from: node.id, to: noNode.id, label: 'No' },
            ])
        } else {
            setNodes((current) => [...current, node])
        }

        setSelectedNodeId(node.id)
        setSelectedEdgeId(null)
    }

    function completeConnection(targetId: string) {
        const fromId = connectingFromId
        setConnectingFromId(null)
        if (!fromId || fromId === targetId) return

        setEdges((current) => {
            if (current.some((edge) => edge.from === fromId && edge.to === targetId)) return current
            const fromNode = nodes.find((node) => node.id === fromId)
            let label = ''
            if (fromNode?.kind === 'decision') {
                const outgoing = current.filter((edge) => edge.from === fromId).length
                label = outgoing === 0 ? 'Yes' : outgoing === 1 ? 'No' : ''
            }
            return [...current, { id: newId('e'), from: fromId, to: targetId, label }]
        })
    }

    function clearCanvas() {
        setNodes([])
        setEdges([])
        setSelectedNodeId(null)
        setSelectedEdgeId(null)
        setConnectingFromId(null)
        setIsClearConfirmOpen(false)
    }

    // --- Persistence --------------------------------------------------------
    function snapshot(): DiagramSnapshot {
        return { version: 1, nodes, edges }
    }

    function saveDiagram() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot()))
            showStatus('Diagram saved on this device.')
        } catch {
            showStatus('Save failed: local storage is unavailable.')
        }
    }

    function exportDiagram() {
        const blob = new Blob([JSON.stringify(snapshot(), null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = 'process-diagram.json'
        anchor.click()
        URL.revokeObjectURL(url)
        showStatus('Diagram exported as JSON.')
    }

    async function handleImportFile(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0]
        event.target.value = ''
        if (!file) return
        try {
            const parsed = parseDiagram(JSON.parse(await file.text()))
            if (!parsed) throw new Error('invalid diagram')
            setNodes(parsed.nodes)
            setEdges(parsed.edges)
            setSelectedNodeId(null)
            setSelectedEdgeId(null)
            setConnectingFromId(null)
            showStatus(`Imported ${parsed.nodes.length} elements and ${parsed.edges.length} connections.`)
        } catch {
            showStatus('Import failed: the file is not a valid diagram JSON.')
        }
    }

    // --- Canvas pan + click-to-deselect ------------------------------------
    function handleViewportPointerDown(event: ReactPointerEvent) {
        if (event.button !== 0) return
        setContextMenu(null)
        panRef.current = {
            startX: event.clientX,
            startY: event.clientY,
            startTx: viewport.tx,
            startTy: viewport.ty,
            moved: false,
        }
        ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
    }

    function handleViewportPointerMove(event: ReactPointerEvent) {
        const pan = panRef.current
        if (pan) {
            const dx = event.clientX - pan.startX
            const dy = event.clientY - pan.startY
            if (Math.abs(dx) + Math.abs(dy) > 3) pan.moved = true
            if (pan.moved) {
                setViewport((current) => ({ ...current, tx: pan.startTx + dx, ty: pan.startTy + dy }))
            }
            return
        }
        if (connectingFromId) setPointerPos(worldPoint(event))
    }

    function handleViewportPointerUp(event: ReactPointerEvent) {
        const pan = panRef.current
        panRef.current = null
        if (pan && !pan.moved) {
            setSelectedNodeId(null)
            setSelectedEdgeId(null)
            setConnectingFromId(null)
        }
        ;(event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId)
    }

    // --- Node dragging ------------------------------------------------------
    function handleNodePointerDown(event: ReactPointerEvent, node: FlowNode) {
        if (event.button !== 0) return
        event.stopPropagation()
        setContextMenu(null)
        if (connectingFromId) {
            completeConnection(node.id)
            return
        }
        const point = worldPoint(event)
        dragRef.current = { nodeId: node.id, offsetX: point.x - node.x, offsetY: point.y - node.y }
        ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
        setSelectedNodeId(node.id)
        setSelectedEdgeId(null)
    }

    function handleNodePointerMove(event: ReactPointerEvent) {
        const drag = dragRef.current
        if (!drag) return
        const node = nodes.find((candidate) => candidate.id === drag.nodeId)
        if (!node) return
        const point = worldPoint(event)
        const x = Math.min(Math.max(point.x - drag.offsetX, 0), CANVAS_WIDTH - getNodeWidth(node))
        const y = Math.min(Math.max(point.y - drag.offsetY, 0), CANVAS_HEIGHT - 60)
        updateNode(drag.nodeId, { x, y })
    }

    function handleNodePointerUp(event: ReactPointerEvent) {
        if (dragRef.current) {
            ;(event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId)
        }
        dragRef.current = null
    }

    // --- Container resizing -------------------------------------------------
    function handleResizeStart(event: ReactPointerEvent, node: FlowNode) {
        if (event.button !== 0) return
        event.stopPropagation()
        const point = worldPoint(event)
        resizeRef.current = {
            nodeId: node.id,
            startW: getNodeWidth(node),
            startH: getNodeHeight(node),
            startX: point.x,
            startY: point.y,
        }
        ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
    }

    function handleResizeMove(event: ReactPointerEvent) {
        const resize = resizeRef.current
        if (!resize) return
        event.stopPropagation()
        const point = worldPoint(event)
        updateNode(resize.nodeId, {
            width: Math.max(180, resize.startW + point.x - resize.startX),
            height: Math.max(96, resize.startH + point.y - resize.startY),
        })
    }

    function handleResizeEnd(event: ReactPointerEvent) {
        if (resizeRef.current) {
            ;(event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId)
        }
        resizeRef.current = null
    }

    // --- Connections (drag from port, or click port then click target) -----
    function handleStartConnection(event: ReactPointerEvent, nodeId: string) {
        if (event.button !== 0) return
        event.stopPropagation()
        ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
        connectDragRef.current = { startClientX: event.clientX, startClientY: event.clientY, moved: false }
        setConnectingFromId(nodeId)
        setPointerPos(worldPoint(event))
    }

    function handlePortPointerMove(event: ReactPointerEvent) {
        const drag = connectDragRef.current
        if (!drag || !connectingFromId) return
        if (
            Math.abs(event.clientX - drag.startClientX) + Math.abs(event.clientY - drag.startClientY) > 4
        ) {
            drag.moved = true
        }
        setPointerPos(worldPoint(event))
    }

    function handlePortPointerUp(event: ReactPointerEvent) {
        const drag = connectDragRef.current
        connectDragRef.current = null
        ;(event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId)
        if (!connectingFromId || !drag?.moved) return // simple click keeps the connection pending

        const element = document.elementFromPoint(event.clientX, event.clientY)
        const targetId = element?.closest('[data-node-id]')?.getAttribute('data-node-id') ?? null
        if (targetId && targetId !== connectingFromId) {
            completeConnection(targetId)
        } else {
            setConnectingFromId(null)
        }
    }

    function handleCompleteOnPort(event: ReactPointerEvent, nodeId: string) {
        event.stopPropagation()
        if (connectingFromId) completeConnection(nodeId)
    }

    // --- Context menu -------------------------------------------------------
    function openContextMenu(event: ReactMouseEvent, targetType: 'node' | 'edge', targetId: string) {
        event.preventDefault()
        event.stopPropagation()
        const rect = rootRef.current?.getBoundingClientRect()
        if (!rect) return
        if (targetType === 'node') {
            setSelectedNodeId(targetId)
            setSelectedEdgeId(null)
        } else {
            setSelectedEdgeId(targetId)
            setSelectedNodeId(null)
        }
        setContextMenu({
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
            targetType,
            targetId,
        })
    }

    // --- Derived geometry ---------------------------------------------------
    const edgeGeometry = useMemo(() => {
        const nodeById = new Map(nodes.map((node) => [node.id, node]))
        return edges.flatMap((edge) => {
            const from = nodeById.get(edge.from)
            const to = nodeById.get(edge.to)
            if (!from || !to) return []
            const fromPort = getPorts(from).output
            const toPort = getPorts(to).input
            return [{
                edge,
                path: edgePath(fromPort.x, fromPort.y, toPort.x, toPort.y),
                midX: (fromPort.x + toPort.x) / 2,
                midY: (fromPort.y + toPort.y) / 2,
                isDashed: from.kind === 'note' || to.kind === 'note',
            }]
        })
    }, [edges, nodes])

    function jumpFromMinimap(event: ReactPointerEvent) {
        event.stopPropagation()
        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
        const worldX = (event.clientX - rect.left) / MINIMAP_SCALE
        const worldY = (event.clientY - rect.top) / MINIMAP_SCALE
        setViewport((current) => ({
            ...current,
            tx: viewportSize.width / 2 - worldX * current.scale,
            ty: viewportSize.height / 2 - worldY * current.scale,
        }))
    }

    function zoomBy(factor: number) {
        const cx = viewportSize.width / 2
        const cy = viewportSize.height / 2
        setViewport((current) => {
            const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, current.scale * factor))
            const ratio = scale / current.scale
            return { scale, tx: cx - ratio * (cx - current.tx), ty: cy - ratio * (cy - current.ty) }
        })
    }

    const zoomPercent = Math.round(viewport.scale * 100)

    return (
        <div ref={rootRef} className="relative flex h-[calc(100vh-4rem)] flex-col bg-(--color-bg)">
            {/* Toolbar */}
            <div className="border-b border-(--color-border) bg-(--color-surface)/80 backdrop-blur">
                <div className="mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand">
                            <FlowIcon className="size-5" />
                        </span>
                        <div>
                            <h1 className="text-sm font-bold text-(--color-text)">Process flow designer</h1>
                            <p className="text-xs text-(--color-text-muted)">
                                {nodes.length} elements · {edges.length} connections
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {connectingFromId ? (
                            <span className="animate-pulse rounded-full border border-brand/40 bg-brand-soft px-3 py-1.5 text-xs font-semibold text-brand">
                                Drop on a target element · Esc to cancel
                            </span>
                        ) : (
                            <span className="hidden rounded-full border border-(--color-border) bg-(--color-bg-soft) px-3 py-1.5 text-xs text-(--color-text-muted) xl:inline">
                                Wheel to zoom · drag empty canvas to pan · right-click to delete
                            </span>
                        )}
                        <ButtonComponent size="sm" variant="outline" onClick={() => importInputRef.current?.click()}>
                            Import
                        </ButtonComponent>
                        <ButtonComponent size="sm" variant="outline" onClick={exportDiagram}>
                            Export JSON
                        </ButtonComponent>
                        <ButtonComponent size="sm" variant="primary" onClick={saveDiagram}>
                            Save
                        </ButtonComponent>
                        <ButtonComponent
                            size="sm"
                            variant="outline"
                            leftIcon={<TrashBinIcon className="size-4" />}
                            onClick={() => setIsClearConfirmOpen(true)}
                            disabled={nodes.length === 0}
                            aria-label="Clear canvas"
                            title="Clear canvas"
                        >
                            Clear
                        </ButtonComponent>
                        <input
                            ref={importInputRef}
                            type="file"
                            accept=".json,application/json"
                            className="hidden"
                            onChange={handleImportFile}
                            aria-label="Import diagram JSON"
                        />
                    </div>
                </div>
            </div>

            <div className="flex min-h-0 flex-1">
                {/* Canvas viewport */}
                <div
                    ref={viewportRef}
                    onPointerDown={handleViewportPointerDown}
                    onPointerMove={handleViewportPointerMove}
                    onPointerUp={handleViewportPointerUp}
                    onContextMenu={(event) => event.preventDefault()}
                    className="relative min-w-0 flex-1 cursor-grab overflow-hidden touch-none active:cursor-grabbing"
                >
                    {/* World layer (panned + zoomed) */}
                    <div
                        className="absolute select-none"
                        style={{
                            width: CANVAS_WIDTH,
                            height: CANVAS_HEIGHT,
                            transform: `translate(${viewport.tx}px, ${viewport.ty}px) scale(${viewport.scale})`,
                            transformOrigin: '0 0',
                            backgroundImage: 'radial-gradient(circle, var(--color-border) 1px, transparent 1px)',
                            backgroundSize: '24px 24px',
                        }}
                    >
                        {/* Connection layer */}
                        <svg
                            className="absolute inset-0 h-full w-full"
                            width={CANVAS_WIDTH}
                            height={CANVAS_HEIGHT}
                            // pointerEvents none lets clicks pass through to containers (z-index 1
                            // below this layer); edge hit paths re-enable their own stroke events
                            style={{ zIndex: 2, pointerEvents: 'none' }}
                            aria-hidden="true"
                        >
                            <defs>
                                <marker id="flow-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                                    <path d="M 0 0 L 10 5 L 0 10 z" className="fill-(--color-text-muted)" />
                                </marker>
                                <marker id="flow-arrow-active" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                                    <path d="M 0 0 L 10 5 L 0 10 z" className="fill-brand" />
                                </marker>
                            </defs>

                            {edgeGeometry.map(({ edge, path, isDashed }) => {
                                const isSelected = edge.id === selectedEdgeId
                                return (
                                    <g key={edge.id}>
                                        {/* Wide invisible stroke to make edges easy to click */}
                                        <path
                                            d={path}
                                            fill="none"
                                            stroke="transparent"
                                            strokeWidth={16}
                                            className="cursor-pointer"
                                            style={{ pointerEvents: 'stroke' }}
                                            onPointerDown={(event) => {
                                                event.stopPropagation()
                                                setSelectedEdgeId(edge.id)
                                                setSelectedNodeId(null)
                                                setContextMenu(null)
                                            }}
                                            onContextMenu={(event) => openContextMenu(event, 'edge', edge.id)}
                                        />
                                        <path
                                            d={path}
                                            fill="none"
                                            strokeWidth={isSelected ? 2.5 : 1.8}
                                            strokeDasharray={isDashed ? '5 4' : undefined}
                                            className={isSelected ? 'stroke-brand' : 'stroke-(--color-text-muted)'}
                                            markerEnd={isSelected ? 'url(#flow-arrow-active)' : 'url(#flow-arrow)'}
                                            style={{ pointerEvents: 'none' }}
                                        />
                                    </g>
                                )
                            })}

                            {/* Pending connection preview */}
                            {connectingFromNode && pointerPos ? (
                                <path
                                    d={edgePath(
                                        getPorts(connectingFromNode).output.x,
                                        getPorts(connectingFromNode).output.y,
                                        pointerPos.x,
                                        pointerPos.y
                                    )}
                                    fill="none"
                                    strokeWidth={2}
                                    strokeDasharray="6 5"
                                    className="animate-pulse stroke-brand"
                                    style={{ pointerEvents: 'none' }}
                                />
                            ) : null}
                        </svg>

                        {/* Edge labels */}
                        {edgeGeometry
                            .filter(({ edge }) => edge.label)
                            .map(({ edge, midX, midY }) => (
                                <span
                                    key={`label-${edge.id}`}
                                    className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-(--color-border) bg-(--color-surface) px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-(--color-text) shadow-sm"
                                    style={{ left: midX, top: midY, zIndex: 4 }}
                                >
                                    {edge.label}
                                </span>
                            ))}

                        {/* Delete button on the selected connection */}
                        {edgeGeometry
                            .filter(({ edge }) => edge.id === selectedEdgeId)
                            .map(({ edge, midX, midY }) => (
                                <button
                                    key={`delete-${edge.id}`}
                                    type="button"
                                    onPointerDown={(event) => event.stopPropagation()}
                                    onClick={() => removeEdge(edge.id)}
                                    className="absolute z-20 inline-flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-(--color-border) bg-(--color-surface) text-rose-600 shadow-md transition-transform hover:scale-110 dark:text-rose-300"
                                    style={{ left: midX, top: midY - (edge.label ? 22 : 0) }}
                                    aria-label="Delete connection"
                                    title="Delete connection"
                                >
                                    <TrashBinIcon className="size-4" />
                                </button>
                            ))}

                        {/* Nodes */}
                        {nodes.map((node) => (
                            <FlowNodeView
                                key={node.id}
                                node={node}
                                isSelected={node.id === selectedNodeId}
                                isConnectSource={node.id === connectingFromId}
                                isConnectCandidate={Boolean(connectingFromId && connectingFromId !== node.id)}
                                onPointerDown={(event) => handleNodePointerDown(event, node)}
                                onPointerMove={handleNodePointerMove}
                                onPointerUp={handleNodePointerUp}
                                onContextMenu={(event) => openContextMenu(event, 'node', node.id)}
                                onStartConnection={(event) => handleStartConnection(event, node.id)}
                                onPortPointerMove={handlePortPointerMove}
                                onPortPointerUp={handlePortPointerUp}
                                onCompleteConnection={(event) => handleCompleteOnPort(event, node.id)}
                                onResizeStart={(event) => handleResizeStart(event, node)}
                                onResizeMove={handleResizeMove}
                                onResizeEnd={handleResizeEnd}
                            />
                        ))}

                        {/* Empty state */}
                        {nodes.length === 0 ? (
                            <div className="pointer-events-none absolute left-105 top-48 w-80 rounded-3xl border border-dashed border-(--color-border) bg-(--color-surface)/80 p-8 text-center backdrop-blur">
                                <FlowIcon className="mx-auto size-8 text-(--color-text-muted)" />
                                <p className="mt-3 text-sm font-semibold text-(--color-text)">
                                    The canvas is empty
                                </p>
                                <p className="mt-1 text-xs text-(--color-text-muted)">
                                    Add elements from the palette on the left, or import a saved diagram.
                                </p>
                            </div>
                        ) : null}
                    </div>

                    {/* Element palette */}
                    <div
                        onPointerDown={(event) => event.stopPropagation()}
                        className="absolute left-3 top-3 z-30 flex flex-col gap-0.5 rounded-2xl border border-(--color-border) bg-(--color-surface)/95 p-1.5 shadow-lg backdrop-blur"
                        role="toolbar"
                        aria-label="Add elements"
                    >
                        {paletteItems.map((item) => (
                            <button
                                key={item.kind}
                                type="button"
                                onClick={() => addNode(item.kind)}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-(--color-text) transition-colors hover:bg-brand-soft hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                                aria-label={item.label}
                                title={item.label}
                            >
                                <PaletteGlyph kind={item.kind} />
                            </button>
                        ))}
                    </div>

                    {/* Zoom controls */}
                    <div
                        onPointerDown={(event) => event.stopPropagation()}
                        className="absolute bottom-4 left-3 z-30 flex items-center gap-1 rounded-full border border-(--color-border) bg-(--color-surface)/95 px-1.5 py-1 shadow-lg backdrop-blur"
                    >
                        <button
                            type="button"
                            onClick={() => zoomBy(1 / 1.2)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-(--color-text) transition-colors hover:bg-(--color-bg-soft)"
                            aria-label="Zoom out"
                        >
                            −
                        </button>
                        <span className="w-11 text-center text-xs font-semibold tabular-nums text-(--color-text-muted)">
                            {zoomPercent}%
                        </span>
                        <button
                            type="button"
                            onClick={() => zoomBy(1.2)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-(--color-text) transition-colors hover:bg-(--color-bg-soft)"
                            aria-label="Zoom in"
                        >
                            +
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewport({ scale: 1, tx: 0, ty: 0 })}
                            className="ml-1 rounded-full px-2 py-1 text-[11px] font-semibold text-(--color-text-muted) transition-colors hover:bg-(--color-bg-soft) hover:text-brand"
                            aria-label="Reset view"
                        >
                            Reset
                        </button>
                    </div>

                    {/* Minimap */}
                    <div
                        onPointerDown={jumpFromMinimap}
                        className="absolute bottom-4 right-4 z-30 hidden cursor-pointer overflow-hidden rounded-xl border border-(--color-border) bg-(--color-surface)/90 shadow-lg backdrop-blur md:block"
                        style={{ width: MINIMAP_WIDTH, height: MINIMAP_HEIGHT }}
                        role="img"
                        aria-label="Diagram overview — click to move the view"
                        title="Click to move the view"
                    >
                        {nodes.map((node) => (
                            <span
                                key={`mm-${node.id}`}
                                className={`absolute rounded-xs ${isContainer(node.kind) ? `${nodeColorStyles[node.color].soft} border ${nodeColorStyles[node.color].border}` : nodeColorStyles[node.color].swatch}`}
                                style={{
                                    left: node.x * MINIMAP_SCALE,
                                    top: node.y * MINIMAP_SCALE,
                                    width: Math.max(3, getNodeWidth(node) * MINIMAP_SCALE),
                                    height: Math.max(2, approximateNodeHeight(node) * MINIMAP_SCALE),
                                }}
                            />
                        ))}
                        <span
                            className="absolute border border-brand bg-brand/10"
                            style={{
                                left: (-viewport.tx / viewport.scale) * MINIMAP_SCALE,
                                top: (-viewport.ty / viewport.scale) * MINIMAP_SCALE,
                                width: (viewportSize.width / viewport.scale) * MINIMAP_SCALE,
                                height: (viewportSize.height / viewport.scale) * MINIMAP_SCALE,
                            }}
                        />
                    </div>
                </div>

                {/* Inspector panel */}
                <aside
                    className="hidden w-80 shrink-0 overflow-y-auto border-l border-(--color-border) bg-(--color-surface) lg:block"
                    onPointerDown={(event) => event.stopPropagation()}
                >
                    {selectedNode ? (
                        <div className="space-y-5 p-5">
                            <span className="inline-flex rounded-full border border-(--color-border) bg-(--color-bg-soft) px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-(--color-text-muted)">
                                {kindLabels[selectedNode.kind]}
                            </span>

                            <InputComponent
                                label={selectedNode.kind === 'note' ? 'Note title' : 'Label'}
                                value={selectedNode.title}
                                onChange={(event) => updateNode(selectedNode.id, { title: event.target.value })}
                                placeholder="Element label"
                            />

                            {!isContainer(selectedNode.kind) ? (
                                <div>
                                    <label htmlFor="node-description" className="mb-1.5 block text-sm font-medium text-(--color-text)">
                                        {selectedNode.kind === 'note' ? 'Content' : 'Description'}
                                    </label>
                                    <textarea
                                        id="node-description"
                                        value={selectedNode.description}
                                        onChange={(event) => updateNode(selectedNode.id, { description: event.target.value })}
                                        rows={3}
                                        placeholder={selectedNode.kind === 'note' ? 'Write the note content' : 'What happens in this step?'}
                                        className={textareaClass}
                                    />
                                </div>
                            ) : null}

                            {selectedNode.kind === 'task' || selectedNode.kind === 'data' || selectedNode.kind === 'decision' ? (
                                <div>
                                    <label htmlFor="node-note" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-(--color-text)">
                                        <NoteIcon className="size-4 text-amber-600 dark:text-amber-400" />
                                        Attached note
                                    </label>
                                    <textarea
                                        id="node-note"
                                        value={selectedNode.note}
                                        onChange={(event) => updateNode(selectedNode.id, { note: event.target.value })}
                                        rows={3}
                                        placeholder="Add an annotation for this element"
                                        className="w-full rounded-xl border border-amber-600/30 bg-amber-50/50 px-4 py-2.5 text-sm text-(--color-text) placeholder:text-(--color-text-muted) transition-all duration-200 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/25 dark:bg-amber-500/5"
                                    />
                                </div>
                            ) : null}

                            {selectedNode.kind !== 'start' && selectedNode.kind !== 'end' && selectedNode.kind !== 'note' ? (
                                <div>
                                    <p className="mb-2 text-sm font-medium text-(--color-text)">Accent color</p>
                                    <div className="flex flex-wrap gap-2">
                                        {colorOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => updateNode(selectedNode.id, { color: option.value })}
                                                className={[
                                                    'h-8 w-8 rounded-full transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-surface)',
                                                    nodeColorStyles[option.value].swatch,
                                                    selectedNode.color === option.value
                                                        ? 'ring-2 ring-(--color-text) ring-offset-2 ring-offset-(--color-surface)'
                                                        : '',
                                                ].join(' ')}
                                                aria-label={`Set accent color to ${option.label}`}
                                                aria-pressed={selectedNode.color === option.value}
                                                title={option.label}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ) : null}

                            <div className="space-y-2 border-t border-(--color-border) pt-4">
                                <ButtonComponent
                                    variant="outline"
                                    size="sm"
                                    fullWidth
                                    onClick={() => duplicateNode(selectedNode.id)}
                                >
                                    Duplicate element
                                </ButtonComponent>
                                <ButtonComponent
                                    variant="danger"
                                    size="sm"
                                    fullWidth
                                    leftIcon={<TrashBinIcon className="size-4" />}
                                    onClick={() => removeNode(selectedNode.id)}
                                >
                                    Delete element
                                </ButtonComponent>
                            </div>
                        </div>
                    ) : selectedEdge ? (
                        <div className="space-y-5 p-5">
                            <span className="inline-flex rounded-full border border-(--color-border) bg-(--color-bg-soft) px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-(--color-text-muted)">
                                Connection
                            </span>
                            <p className="text-sm text-(--color-text)">
                                <span className="font-semibold">
                                    {nodes.find((node) => node.id === selectedEdge.from)?.title ?? 'Unknown element'}
                                </span>
                                {' → '}
                                <span className="font-semibold">
                                    {nodes.find((node) => node.id === selectedEdge.to)?.title ?? 'Unknown element'}
                                </span>
                            </p>
                            <InputComponent
                                label="Arrow label"
                                value={selectedEdge.label}
                                onChange={(event) => updateEdge(selectedEdge.id, { label: event.target.value })}
                                placeholder="e.g. Yes / No / Approved"
                                hint="Shown on the middle of the arrow."
                            />
                            <ButtonComponent
                                variant="danger"
                                size="sm"
                                fullWidth
                                leftIcon={<TrashBinIcon className="size-4" />}
                                onClick={() => removeEdge(selectedEdge.id)}
                            >
                                Delete connection
                            </ButtonComponent>
                        </div>
                    ) : (
                        <div className="space-y-4 p-5">
                            <span className="inline-flex rounded-full border border-(--color-border) bg-(--color-bg-soft) px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-(--color-text-muted)">
                                How it works
                            </span>
                            <ul className="space-y-3 text-sm text-(--color-text-muted)">
                                <li className="flex gap-2.5">
                                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                                    Add tasks, decisions, start/end points, notes, data, groups and lanes from the left palette.
                                </li>
                                <li className="flex gap-2.5">
                                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                                    Drag from an element's right port and drop on another element to connect them.
                                </li>
                                <li className="flex gap-2.5">
                                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                                    New decisions come with Yes / No outputs; click an arrow to edit its label.
                                </li>
                                <li className="flex gap-2.5">
                                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                                    Zoom with the mouse wheel, pan by dragging empty canvas, and use the minimap to jump around.
                                </li>
                                <li className="flex gap-2.5">
                                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                                    Right-click an element or arrow to delete it, or press Delete with it selected.
                                </li>
                                <li className="flex gap-2.5">
                                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                                    Save keeps the diagram on this device; Export / Import moves it as a JSON file.
                                </li>
                            </ul>
                        </div>
                    )}
                </aside>
            </div>

            {/* Context menu */}
            {contextMenu ? (
                <div
                    onPointerDown={(event) => event.stopPropagation()}
                    className="absolute z-50 w-44 overflow-hidden rounded-xl border border-(--color-border) bg-(--color-surface) py-1 shadow-xl"
                    style={{ left: contextMenu.x, top: contextMenu.y }}
                    role="menu"
                >
                    {contextMenu.targetType === 'node' ? (
                        <button
                            type="button"
                            role="menuitem"
                            onClick={() => duplicateNode(contextMenu.targetId)}
                            className="w-full px-4 py-2 text-left text-sm text-(--color-text) transition-colors hover:bg-(--color-bg-soft)"
                        >
                            Duplicate
                        </button>
                    ) : null}
                    <button
                        type="button"
                        role="menuitem"
                        onClick={() =>
                            contextMenu.targetType === 'node'
                                ? removeNode(contextMenu.targetId)
                                : removeEdge(contextMenu.targetId)
                        }
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-900/30"
                    >
                        <TrashBinIcon className="size-4" />
                        Delete
                    </button>
                </div>
            ) : null}

            {/* Status toast */}
            {statusMessage ? (
                <div className="pointer-events-none absolute bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-(--color-border) bg-(--color-surface) px-4 py-2 text-sm font-medium text-(--color-text) shadow-lg">
                    {statusMessage}
                </div>
            ) : null}

            {/* Clear canvas confirmation */}
            <PopUp
                isOpen={isClearConfirmOpen}
                onClose={() => setIsClearConfirmOpen(false)}
                title="Clear canvas"
                description="All elements and connections will be removed."
                size="sm"
                footer={
                    <>
                        <ButtonComponent variant="outline" onClick={() => setIsClearConfirmOpen(false)}>
                            Cancel
                        </ButtonComponent>
                        <ButtonComponent variant="danger" onClick={clearCanvas}>
                            Clear everything
                        </ButtonComponent>
                    </>
                }
            >
                <p>
                    You are about to delete {nodes.length} {nodes.length === 1 ? 'element' : 'elements'} and{' '}
                    {edges.length} {edges.length === 1 ? 'connection' : 'connections'}. Export the diagram first if
                    you want to keep a copy.
                </p>
            </PopUp>
        </div>
    )
}
