import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ButtonComponent from '../../components/ui/buttons/ButtonComponent'
import PopUp from '../../components/common/pop-up/PopUp'
import { ArrowLeftIcon, FlowIcon, SparkIcon, TrashBinIcon } from '../../icons/icons'
import { processService } from '../../services/process/process.service'
import type { ProcessDraft } from '../../services/process/ai.service'
import FlowNodeView from './FlowNodeView'
import AiAssistantModal from './components/AiAssistantModal'
import PalettePanel from './components/PalettePanel'
import ProcessInfoModal from './components/ProcessInfoModal'
import PropertiesPanel from './components/PropertiesPanel'
import ValidationPanel from './components/ValidationPanel'
import { useDiagramHistory } from './hooks/useDiagramHistory'
import { validateDiagram } from './validation'
import type { ValidationResult } from './validation'
import type { PaletteItem } from './bpmnCatalog'
import {
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    MAX_SCALE,
    MIN_SCALE,
    edgePath,
    emptyElementData,
    getDefaultDimensions,
    getNodeHeight,
    getNodeWidth,
    getPorts,
    isContainer,
    nodeColorStyles,
    parseDiagram,
} from './flowTypes'
import type { DiagramSnapshot, ElementData, FlowEdge, FlowNode } from './flowTypes'
import { processStatusLabels, processStatusStyles } from './types'
import type { ProcessMeta, ProcessRecord } from './types'

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

function approximateNodeHeight(node: FlowNode) {
    if (isContainer(node.kind)) return getNodeHeight(node)
    if (node.kind === 'decision') return 128
    if (node.kind === 'task') return 90
    return 64
}

export default function ProcessDesigner() {
    const { id: processId } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const [record, setRecord] = useState<ProcessRecord | null>(null)
    const [loadState, setLoadState] = useState<'loading' | 'ready' | 'missing'>('loading')

    const diagram = useDiagramHistory({ nodes: [], edges: [] })
    const { nodes, edges } = diagram

    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
    const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null)
    const [connectingFromId, setConnectingFromId] = useState<string | null>(null)
    const [pointerPos, setPointerPos] = useState<{ x: number; y: number } | null>(null)
    const [viewport, setViewport] = useState<ViewportState>({ scale: 1, tx: 0, ty: 0 })
    const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 })
    const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)
    const [statusMessage, setStatusMessage] = useState<string | null>(null)
    const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false)
    const [isValidationOpen, setIsValidationOpen] = useState(false)
    const [validationResults, setValidationResults] = useState<ValidationResult[]>([])
    const [isAiOpen, setIsAiOpen] = useState(false)
    const [isInfoOpen, setIsInfoOpen] = useState(false)
    const [savedSerialized, setSavedSerialized] = useState('')

    const rootRef = useRef<HTMLDivElement>(null)
    const viewportRef = useRef<HTMLDivElement>(null)
    const importInputRef = useRef<HTMLInputElement>(null)
    const dragRef = useRef<{ nodeId: string; offsetX: number; offsetY: number } | null>(null)
    const panRef = useRef<{ startX: number; startY: number; startTx: number; startTy: number; moved: boolean } | null>(null)
    const resizeRef = useRef<{ nodeId: string; startW: number; startH: number; startX: number; startY: number } | null>(null)
    const connectDragRef = useRef<{ startClientX: number; startClientY: number; moved: boolean } | null>(null)
    const idCounterRef = useRef(0)
    const toastTimerRef = useRef<number | null>(null)

    // --- Load the process from the repository ------------------------------
    useEffect(() => {
        let cancelled = false
        setLoadState('loading')
        processService.getById(processId ?? '').then((found) => {
            if (cancelled) return
            if (!found) {
                setLoadState('missing')
                return
            }
            setRecord(found)
            diagram.reset({ nodes: found.diagram.nodes, edges: found.diagram.edges })
            setSavedSerialized(JSON.stringify(found.diagram))
            setLoadState('ready')
        })
        return () => {
            cancelled = true
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [processId])

    const isDirty = useMemo(
        () => loadState === 'ready' && JSON.stringify(diagram.snapshot()) !== savedSerialized,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [nodes, edges, savedSerialized, loadState]
    )

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

    // Keyboard shortcuts: Delete removes, Escape cancels, Ctrl+Z / Ctrl+Y history
    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setConnectingFromId(null)
                setContextMenu(null)
                return
            }
            if ((event.ctrlKey || event.metaKey) && !isTypingTarget(event.target)) {
                const key = event.key.toLowerCase()
                if (key === 'z' && !event.shiftKey) {
                    event.preventDefault()
                    diagram.undo()
                    return
                }
                if (key === 'y' || (key === 'z' && event.shiftKey)) {
                    event.preventDefault()
                    diagram.redo()
                    return
                }
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
    // Property edits are transient (not in undo history) so typing does not
    // flood it; structural changes (add / remove / connect / drag) are recorded.
    function updateNode(nodeId: string, patch: Partial<FlowNode>) {
        diagram.applyTransient((current) => ({
            ...current,
            nodes: current.nodes.map((node) => (node.id === nodeId ? { ...node, ...patch } : node)),
        }))
    }

    function updateNodeData(nodeId: string, patch: Partial<ElementData>) {
        diagram.applyTransient((current) => ({
            ...current,
            nodes: current.nodes.map((node) =>
                node.id === nodeId ? { ...node, data: { ...node.data, ...patch } } : node
            ),
        }))
    }

    function updateEdge(edgeId: string, patch: Partial<FlowEdge>) {
        diagram.applyTransient((current) => ({
            ...current,
            edges: current.edges.map((edge) => (edge.id === edgeId ? { ...edge, ...patch } : edge)),
        }))
    }

    function removeNode(nodeId: string) {
        diagram.apply((current) => ({
            nodes: current.nodes.filter((node) => node.id !== nodeId),
            edges: current.edges.filter((edge) => edge.from !== nodeId && edge.to !== nodeId),
        }))
        setSelectedNodeId((current) => (current === nodeId ? null : current))
        setConnectingFromId((current) => (current === nodeId ? null : current))
        setContextMenu(null)
    }

    function removeEdge(edgeId: string) {
        diagram.apply((current) => ({
            ...current,
            edges: current.edges.filter((edge) => edge.id !== edgeId),
        }))
        setSelectedEdgeId((current) => (current === edgeId ? null : current))
        setContextMenu(null)
    }

    function duplicateNode(nodeId: string) {
        const source = nodes.find((node) => node.id === nodeId)
        if (!source) return
        const copy: FlowNode = {
            ...source,
            id: newId('n'),
            x: source.x + 32,
            y: source.y + 32,
            data: { ...source.data, documents: [...source.data.documents] },
        }
        diagram.apply((current) => ({ ...current, nodes: [...current.nodes, copy] }))
        setSelectedNodeId(copy.id)
        setSelectedEdgeId(null)
        setContextMenu(null)
    }

    function addNode(item: PaletteItem) {
        const dims = getDefaultDimensions(item.kind)
        const center = viewportCenterWorld()
        const jitter = (idCounterRef.current % 5) * 16

        const node: FlowNode = {
            id: newId('n'),
            kind: item.kind,
            bpmnType: item.bpmnType,
            title: item.defaultTitle,
            description: item.defaultDescription,
            note: '',
            color: item.defaultColor,
            x: Math.max(0, Math.min(center.x - dims.width / 2 + jitter, CANVAS_WIDTH - dims.width)),
            y: Math.max(0, Math.min(center.y - 60 + jitter, CANVAS_HEIGHT - 160)),
            data: emptyElementData(),
            ...(isContainer(item.kind) ? { width: dims.width, height: dims.defaultHeight } : {}),
        }

        if (item.bpmnType === 'exclusiveGateway') {
            // An exclusive gateway ships with its two labeled outputs
            const yesNode: FlowNode = {
                ...node,
                id: newId('n'),
                kind: 'task',
                bpmnType: 'task',
                title: 'Camino Sí',
                description: 'Ocurre cuando se cumple la condición.',
                color: 'emerald',
                x: Math.min(node.x + 260, CANVAS_WIDTH - 224),
                y: Math.max(0, node.y - 100),
                data: emptyElementData(),
            }
            const noNode: FlowNode = {
                ...node,
                id: newId('n'),
                kind: 'task',
                bpmnType: 'task',
                title: 'Camino No',
                description: 'Ocurre cuando no se cumple la condición.',
                color: 'rose',
                x: Math.min(node.x + 260, CANVAS_WIDTH - 224),
                y: Math.min(node.y + 170, CANVAS_HEIGHT - 160),
                data: emptyElementData(),
            }
            diagram.apply((current) => ({
                nodes: [...current.nodes, node, yesNode, noNode],
                edges: [
                    ...current.edges,
                    { id: newId('e'), from: node.id, to: yesNode.id, label: 'Sí', kind: 'sequence', condition: '' },
                    { id: newId('e'), from: node.id, to: noNode.id, label: 'No', kind: 'sequence', condition: '' },
                ],
            }))
        } else {
            diagram.apply((current) => ({ ...current, nodes: [...current.nodes, node] }))
        }

        setSelectedNodeId(node.id)
        setSelectedEdgeId(null)
    }

    function completeConnection(targetId: string) {
        const fromId = connectingFromId
        setConnectingFromId(null)
        if (!fromId || fromId === targetId) return

        diagram.apply((current) => {
            if (current.edges.some((edge) => edge.from === fromId && edge.to === targetId)) return current
            const fromNode = current.nodes.find((node) => node.id === fromId)
            const toNode = current.nodes.find((node) => node.id === targetId)
            let label = ''
            if (fromNode?.kind === 'decision' && fromNode.bpmnType === 'exclusiveGateway') {
                const outgoing = current.edges.filter((edge) => edge.from === fromId).length
                label = outgoing === 0 ? 'Sí' : outgoing === 1 ? 'No' : ''
            }
            const kind = fromNode?.kind === 'note' || toNode?.kind === 'note' ? 'association' : 'sequence'
            return {
                ...current,
                edges: [...current.edges, { id: newId('e'), from: fromId, to: targetId, label, kind, condition: '' }],
            }
        })
    }

    function clearCanvas() {
        diagram.apply(() => ({ nodes: [], edges: [] }))
        setSelectedNodeId(null)
        setSelectedEdgeId(null)
        setConnectingFromId(null)
        setIsClearConfirmOpen(false)
    }

    // --- Persistence --------------------------------------------------------
    async function saveDiagram() {
        if (!record) return
        const snapshot = diagram.snapshot()
        const saved = await processService.saveDiagram(record.meta.id, snapshot)
        if (saved) {
            setSavedSerialized(JSON.stringify(snapshot))
            showStatus('Proceso guardado en el repositorio.')
        } else {
            showStatus('No se pudo guardar: el proceso ya no existe en el repositorio.')
        }
    }

    async function saveMeta(patch: Partial<Omit<ProcessMeta, 'id' | 'createdAt'>>) {
        if (!record) return
        const updated = await processService.updateMeta(record.meta.id, patch)
        if (updated) {
            setRecord({ ...record, meta: updated })
            showStatus('Información del proceso actualizada.')
        }
    }

    function exportDiagram() {
        const blob = new Blob([JSON.stringify(diagram.snapshot(), null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        const slug = (record?.meta.code || record?.meta.name || 'proceso')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
        anchor.download = `${slug || 'proceso'}.json`
        anchor.click()
        URL.revokeObjectURL(url)
        showStatus('Diagrama exportado como JSON.')
    }

    async function handleImportFile(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0]
        event.target.value = ''
        if (!file) return
        try {
            const parsed = parseDiagram(JSON.parse(await file.text()))
            if (!parsed) throw new Error('invalid diagram')
            diagram.apply(() => ({ nodes: parsed.nodes, edges: parsed.edges }))
            setSelectedNodeId(null)
            setSelectedEdgeId(null)
            setConnectingFromId(null)
            showStatus(`Se importaron ${parsed.nodes.length} elementos y ${parsed.edges.length} conexiones.`)
        } catch {
            showStatus('No se pudo importar: el archivo no es un diagrama JSON válido.')
        }
    }

    // --- Validation ---------------------------------------------------------
    function runValidation() {
        setValidationResults(validateDiagram(diagram.snapshot()))
        setIsValidationOpen(true)
    }

    function goToNode(nodeId: string) {
        const node = nodes.find((candidate) => candidate.id === nodeId)
        if (!node) return
        setSelectedNodeId(nodeId)
        setSelectedEdgeId(null)
        setViewport((current) => ({
            ...current,
            tx: viewportSize.width / 2 - (node.x + getNodeWidth(node) / 2) * current.scale,
            ty: viewportSize.height / 2 - (node.y + approximateNodeHeight(node) / 2) * current.scale,
        }))
    }

    // --- AI proposal --------------------------------------------------------
    function applyAiDraft(generated: DiagramSnapshot, draft: ProcessDraft) {
        diagram.apply(() => ({ nodes: generated.nodes, edges: generated.edges }))
        setSelectedNodeId(null)
        setSelectedEdgeId(null)
        setViewport({ scale: 1, tx: 0, ty: 0 })
        if (record && record.meta.name === 'Proceso sin título' && draft.name) {
            saveMeta({ name: draft.name, description: draft.description, area: draft.area })
        }
        showStatus('Propuesta aplicada al lienzo. Revísala y guárdala cuando estés conforme.')
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
        diagram.beginGesture()
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
            diagram.endGesture()
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
        diagram.beginGesture()
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
            diagram.endGesture()
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
                isDashed: edge.kind !== 'sequence' || from.kind === 'note' || to.kind === 'note',
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

    if (loadState === 'loading') {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-(--color-bg)">
                <p className="text-sm text-(--color-text-muted)">Cargando proceso…</p>
            </div>
        )
    }

    if (loadState === 'missing' || !record) {
        return (
            <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 bg-(--color-bg)">
                <FlowIcon className="size-10 text-(--color-text-muted)" />
                <p className="text-sm font-semibold text-(--color-text)">El proceso no existe o fue eliminado.</p>
                <ButtonComponent variant="primary" size="sm" onClick={() => navigate('/process')}>
                    Volver al repositorio
                </ButtonComponent>
            </div>
        )
    }

    return (
        <div ref={rootRef} className="relative flex h-[calc(100vh-4rem)] flex-col bg-(--color-bg)">
            {/* Toolbar */}
            <div className="border-b border-(--color-border) bg-(--color-surface)/80 backdrop-blur">
                <div className="mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
                    <div className="flex min-w-0 items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/process')}
                            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-(--color-border) text-(--color-text-muted) transition-colors hover:bg-(--color-bg-soft) hover:text-(--color-text)"
                            aria-label="Volver al repositorio de procesos"
                            title="Volver al repositorio"
                        >
                            <ArrowLeftIcon className="size-4" />
                        </button>
                        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                            <FlowIcon className="size-5" />
                        </span>
                        <div className="min-w-0">
                            <button
                                type="button"
                                onClick={() => setIsInfoOpen(true)}
                                className="flex max-w-full items-center gap-2 text-left"
                                title="Editar información del proceso"
                            >
                                <h1 className="truncate text-sm font-bold text-(--color-text) hover:text-brand">
                                    {record.meta.name}
                                </h1>
                                <span
                                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${processStatusStyles[record.meta.status]}`}
                                >
                                    {processStatusLabels[record.meta.status]}
                                </span>
                            </button>
                            <p className="truncate text-xs text-(--color-text-muted)">
                                {record.meta.code ? `${record.meta.code} · ` : ''}v{record.meta.version} ·{' '}
                                {nodes.length} elementos · {edges.length} conexiones
                                {isDirty ? ' · cambios sin guardar' : ''}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {connectingFromId ? (
                            <span className="animate-pulse rounded-full border border-brand/40 bg-brand-soft px-3 py-1.5 text-xs font-semibold text-brand">
                                Suelta sobre el elemento destino · Esc para cancelar
                            </span>
                        ) : null}
                        <div className="flex items-center overflow-hidden rounded-xl border border-(--color-border)">
                            <button
                                type="button"
                                onClick={diagram.undo}
                                disabled={!diagram.canUndo}
                                className="px-2.5 py-1.5 text-sm text-(--color-text) transition-colors hover:bg-(--color-bg-soft) disabled:cursor-not-allowed disabled:opacity-40"
                                aria-label="Deshacer"
                                title="Deshacer (Ctrl+Z)"
                            >
                                ↶
                            </button>
                            <span className="h-5 w-px bg-(--color-border)" aria-hidden="true" />
                            <button
                                type="button"
                                onClick={diagram.redo}
                                disabled={!diagram.canRedo}
                                className="px-2.5 py-1.5 text-sm text-(--color-text) transition-colors hover:bg-(--color-bg-soft) disabled:cursor-not-allowed disabled:opacity-40"
                                aria-label="Rehacer"
                                title="Rehacer (Ctrl+Y)"
                            >
                                ↷
                            </button>
                        </div>
                        <ButtonComponent size="sm" variant="outline" onClick={runValidation}>
                            Validar
                        </ButtonComponent>
                        <ButtonComponent
                            size="sm"
                            variant="outline"
                            leftIcon={<SparkIcon className="size-4" />}
                            onClick={() => setIsAiOpen(true)}
                        >
                            Generar con IA
                        </ButtonComponent>
                        <ButtonComponent size="sm" variant="outline" onClick={() => importInputRef.current?.click()}>
                            Importar
                        </ButtonComponent>
                        <ButtonComponent size="sm" variant="outline" onClick={exportDiagram}>
                            Exportar
                        </ButtonComponent>
                        <ButtonComponent size="sm" variant="primary" onClick={saveDiagram}>
                            Guardar
                        </ButtonComponent>
                        <ButtonComponent
                            size="sm"
                            variant="outline"
                            leftIcon={<TrashBinIcon className="size-4" />}
                            onClick={() => setIsClearConfirmOpen(true)}
                            disabled={nodes.length === 0}
                            aria-label="Limpiar lienzo"
                            title="Limpiar lienzo"
                        >
                            Limpiar
                        </ButtonComponent>
                        <input
                            ref={importInputRef}
                            type="file"
                            accept=".json,application/json"
                            className="hidden"
                            onChange={handleImportFile}
                            aria-label="Importar diagrama JSON"
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
                                    aria-label="Eliminar conexión"
                                    title="Eliminar conexión"
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
                                    El lienzo está vacío
                                </p>
                                <p className="mt-1 text-xs text-(--color-text-muted)">
                                    Agrega elementos desde la paleta BPMN, genera una propuesta con IA o importa un
                                    diagrama guardado.
                                </p>
                            </div>
                        ) : null}
                    </div>

                    {/* BPMN palette */}
                    <PalettePanel onAdd={addNode} />

                    {/* Zoom controls */}
                    <div
                        onPointerDown={(event) => event.stopPropagation()}
                        className="absolute bottom-4 left-3 z-30 flex items-center gap-1 rounded-full border border-(--color-border) bg-(--color-surface)/95 px-1.5 py-1 shadow-lg backdrop-blur"
                    >
                        <button
                            type="button"
                            onClick={() => zoomBy(1 / 1.2)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-(--color-text) transition-colors hover:bg-(--color-bg-soft)"
                            aria-label="Alejar"
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
                            aria-label="Acercar"
                        >
                            +
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewport({ scale: 1, tx: 0, ty: 0 })}
                            className="ml-1 rounded-full px-2 py-1 text-[11px] font-semibold text-(--color-text-muted) transition-colors hover:bg-(--color-bg-soft) hover:text-brand"
                            aria-label="Restablecer vista"
                        >
                            Reiniciar
                        </button>
                    </div>

                    {/* Minimap */}
                    <div
                        onPointerDown={jumpFromMinimap}
                        className="absolute bottom-4 right-4 z-30 hidden cursor-pointer overflow-hidden rounded-xl border border-(--color-border) bg-(--color-surface)/90 shadow-lg backdrop-blur md:block"
                        style={{ width: MINIMAP_WIDTH, height: MINIMAP_HEIGHT }}
                        role="img"
                        aria-label="Vista general del diagrama — clic para mover la vista"
                        title="Clic para mover la vista"
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

                {/* Properties panel */}
                <aside
                    className="hidden w-80 shrink-0 overflow-y-auto border-l border-(--color-border) bg-(--color-surface) lg:block"
                    onPointerDown={(event) => event.stopPropagation()}
                >
                    <PropertiesPanel
                        selectedNode={selectedNode}
                        selectedEdge={selectedEdge}
                        nodes={nodes}
                        onUpdateNode={updateNode}
                        onUpdateNodeData={updateNodeData}
                        onUpdateEdge={updateEdge}
                        onDuplicateNode={duplicateNode}
                        onRemoveNode={removeNode}
                        onRemoveEdge={removeEdge}
                        onStatus={showStatus}
                    />
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
                            Duplicar
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
                        Eliminar
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
                title="Limpiar lienzo"
                description="Se eliminarán todos los elementos y conexiones."
                size="sm"
                footer={
                    <>
                        <ButtonComponent variant="outline" onClick={() => setIsClearConfirmOpen(false)}>
                            Cancelar
                        </ButtonComponent>
                        <ButtonComponent variant="danger" onClick={clearCanvas}>
                            Limpiar todo
                        </ButtonComponent>
                    </>
                }
            >
                <p>
                    Estás a punto de eliminar {nodes.length} {nodes.length === 1 ? 'elemento' : 'elementos'} y{' '}
                    {edges.length} {edges.length === 1 ? 'conexión' : 'conexiones'}. Podrás deshacer con Ctrl+Z, o
                    exporta primero el diagrama si quieres conservar una copia.
                </p>
            </PopUp>

            {/* Validation results */}
            <ValidationPanel
                isOpen={isValidationOpen}
                onClose={() => setIsValidationOpen(false)}
                results={validationResults}
                onGoToNode={goToNode}
            />

            {/* AI assistant */}
            <AiAssistantModal isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} onApply={applyAiDraft} />

            {/* Process information */}
            <ProcessInfoModal
                isOpen={isInfoOpen}
                onClose={() => setIsInfoOpen(false)}
                meta={record.meta}
                onSave={saveMeta}
            />
        </div>
    )
}
