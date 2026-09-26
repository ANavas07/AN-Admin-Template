import { useEffect, useMemo, useRef, useState } from 'react'
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ButtonComponent from '../../../components/ui/buttons/ButtonComponent'
import PopUp from '../../../components/common/pop-up/PopUp'
import { FlowIcon } from '../../../icons/icons'
import { processService } from '../../../services/process/process.service'
import type { ProcessDraft } from '../../../services/process/ai.service'
import { sileo } from 'sileo'
import FlowNodeView from './FlowNodeView'
import AiAssistantModal from './components/AiAssistantModal'
import CanvasContextMenu from './components/CanvasContextMenu'
import type { ContextMenuState } from './components/CanvasContextMenu'
import DesignerToolbar from './components/DesignerToolbar'
import EdgeLayer from './components/EdgeLayer'
import Minimap from './components/Minimap'
import PalettePanel from './components/PalettePanel'
import ProcessInfoModal from './components/ProcessInfoModal'
import PropertiesPanel from './components/PropertiesPanel'
import ValidationPanel from './components/ValidationPanel'
import ZoomControls from './components/ZoomControls'
import { useCanvasViewport } from './hooks/useCanvasViewport'
import { useDiagramHistory } from './hooks/useDiagramHistory'
import { useNodeSizes } from './hooks/useNodeSizes'
import { validateDiagram } from './validation'
import type { ValidationResult } from './validation'
import type { PaletteItem } from './bpmnCatalog'
import { previewCurve, routeEdges } from './connectors'
import type { Box, Point } from './connectors'
import {
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    emptyElementData,
    getDefaultDimensions,
    getNodeHeight,
    getNodeWidth,
    isContainer,
    parseDiagram,
} from './flowTypes'
import type { DiagramSnapshot, ElementData, FlowEdge, FlowNode } from './flowTypes'
import type { ProcessMeta, ProcessRecord } from './types'

type PanGesture = { startX: number; startY: number; startTx: number; startTy: number; moved: boolean }
type DragGesture = { nodeId: string; offsetX: number; offsetY: number }
type ResizeGesture = { nodeId: string; startW: number; startH: number; startX: number; startY: number }
type ConnectGesture = { startClientX: number; startClientY: number; moved: boolean }

/** Pointer movement (in px) below which a gesture is still considered a click. */
const PAN_THRESHOLD = 3
const CONNECT_DRAG_THRESHOLD = 4

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

function capturePointer(event: ReactPointerEvent) {
    ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

function releasePointer(event: ReactPointerEvent) {
    ;(event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId)
}

function toFileSlug(text: string) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
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
    const [pointerPos, setPointerPos] = useState<Point | null>(null)
    const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)
    const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false)
    const [isValidationOpen, setIsValidationOpen] = useState(false)
    const [validationResults, setValidationResults] = useState<ValidationResult[]>([])
    const [isAiOpen, setIsAiOpen] = useState(false)
    const [isInfoOpen, setIsInfoOpen] = useState(false)
    const [savedSerialized, setSavedSerialized] = useState('')

    const rootRef = useRef<HTMLDivElement>(null)
    const viewportRef = useRef<HTMLDivElement>(null)
    const panRef = useRef<PanGesture | null>(null)
    const dragRef = useRef<DragGesture | null>(null)
    const resizeRef = useRef<ResizeGesture | null>(null)
    const connectDragRef = useRef<ConnectGesture | null>(null)
    const idCounterRef = useRef(0)

    const { viewport, viewportSize, toWorld, centerInWorld, centerOn, panTo, zoomBy, resetView } =
        useCanvasViewport(viewportRef)
    const { sizes: nodeSizes, measureRef } = useNodeSizes()

    // Reset to the loading state when navigating between processes
    const [loadedProcessId, setLoadedProcessId] = useState(processId)
    if (loadedProcessId !== processId) {
        setLoadedProcessId(processId)
        setLoadState('loading')
    }

    // --- Load the process from the repository ------------------------------
    useEffect(() => {
        let cancelled = false
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
        sileo.info({ title: message })
    }

    function newId(prefix: string) {
        idCounterRef.current += 1
        return `${prefix}-${Date.now().toString(36)}-${idCounterRef.current}`
    }

    function selectNode(nodeId: string | null) {
        setSelectedNodeId(nodeId)
        setSelectedEdgeId(null)
    }

    function selectEdge(edgeId: string | null) {
        setSelectedEdgeId(edgeId)
        setSelectedNodeId(null)
    }

    function clearSelection() {
        setSelectedNodeId(null)
        setSelectedEdgeId(null)
        setConnectingFromId(null)
    }

    /** Position and real size of a node: measured in the DOM, estimated until then. */
    function boxOf(node: FlowNode): Box {
        const size = nodeSizes.get(node.id)
        return {
            x: node.x,
            y: node.y,
            width: size?.width ?? getNodeWidth(node),
            height: size?.height ?? getNodeHeight(node),
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
        selectNode(copy.id)
        setContextMenu(null)
    }

    /** Task node created next to a new exclusive gateway, one per branch. */
    function createBranchTask(gateway: FlowNode, branch: 'yes' | 'no'): FlowNode {
        const isYes = branch === 'yes'
        return {
            ...gateway,
            id: newId('n'),
            kind: 'task',
            bpmnType: 'task',
            title: isYes ? 'Camino Sí' : 'Camino No',
            description: isYes ? 'Ocurre cuando se cumple la condición.' : 'Ocurre cuando no se cumple la condición.',
            color: isYes ? 'emerald' : 'rose',
            x: Math.min(gateway.x + 260, CANVAS_WIDTH - getDefaultDimensions('task').width),
            y: isYes ? Math.max(0, gateway.y - 100) : Math.min(gateway.y + 170, CANVAS_HEIGHT - 160),
            data: emptyElementData(),
        }
    }

    function addNode(item: PaletteItem) {
        const dims = getDefaultDimensions(item.kind)
        const center = centerInWorld()
        // Consecutive additions are offset so they do not stack exactly on top of each other
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
            ...(isContainer(item.kind) ? { width: dims.width, height: dims.height } : {}),
        }

        if (item.bpmnType === 'exclusiveGateway') {
            // An exclusive gateway ships with its two labeled outputs
            const yesNode = createBranchTask(node, 'yes')
            const noNode = createBranchTask(node, 'no')
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

        selectNode(node.id)
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

    function replaceDiagram(next: DiagramSnapshot) {
        diagram.apply(() => ({ nodes: next.nodes, edges: next.edges }))
        clearSelection()
    }

    function clearCanvas() {
        diagram.apply(() => ({ nodes: [], edges: [] }))
        clearSelection()
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
        anchor.download = `${toFileSlug(record?.meta.code || record?.meta.name || 'proceso') || 'proceso'}.json`
        anchor.click()
        URL.revokeObjectURL(url)
        showStatus('Diagrama exportado como JSON.')
    }

    async function importDiagram(file: File) {
        try {
            const parsed = parseDiagram(JSON.parse(await file.text()))
            if (!parsed) throw new Error('invalid diagram')
            replaceDiagram(parsed)
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
        selectNode(nodeId)
        const box = boxOf(node)
        centerOn(box.x + box.width / 2, box.y + box.height / 2)
    }

    // --- AI proposal --------------------------------------------------------
    function applyAiDraft(generated: DiagramSnapshot, draft: ProcessDraft) {
        replaceDiagram(generated)
        resetView()
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
        capturePointer(event)
    }

    function handleViewportPointerMove(event: ReactPointerEvent) {
        const pan = panRef.current
        if (pan) {
            const dx = event.clientX - pan.startX
            const dy = event.clientY - pan.startY
            if (Math.abs(dx) + Math.abs(dy) > PAN_THRESHOLD) pan.moved = true
            if (pan.moved) panTo(pan.startTx + dx, pan.startTy + dy)
            return
        }
        if (connectingFromId) setPointerPos(toWorld(event))
    }

    function handleViewportPointerUp(event: ReactPointerEvent) {
        const pan = panRef.current
        panRef.current = null
        if (pan && !pan.moved) clearSelection()
        releasePointer(event)
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
        const point = toWorld(event)
        dragRef.current = { nodeId: node.id, offsetX: point.x - node.x, offsetY: point.y - node.y }
        diagram.beginGesture()
        capturePointer(event)
        selectNode(node.id)
    }

    function handleNodePointerMove(event: ReactPointerEvent) {
        const drag = dragRef.current
        if (!drag) return
        const node = nodes.find((candidate) => candidate.id === drag.nodeId)
        if (!node) return
        const point = toWorld(event)
        const x = Math.min(Math.max(point.x - drag.offsetX, 0), CANVAS_WIDTH - getNodeWidth(node))
        const y = Math.min(Math.max(point.y - drag.offsetY, 0), CANVAS_HEIGHT - 60)
        updateNode(drag.nodeId, { x, y })
    }

    function handleNodePointerUp(event: ReactPointerEvent) {
        if (dragRef.current) {
            releasePointer(event)
            diagram.endGesture()
        }
        dragRef.current = null
    }

    // --- Container resizing -------------------------------------------------
    function handleResizeStart(event: ReactPointerEvent, node: FlowNode) {
        if (event.button !== 0) return
        event.stopPropagation()
        const point = toWorld(event)
        resizeRef.current = {
            nodeId: node.id,
            startW: getNodeWidth(node),
            startH: getNodeHeight(node),
            startX: point.x,
            startY: point.y,
        }
        diagram.beginGesture()
        capturePointer(event)
    }

    function handleResizeMove(event: ReactPointerEvent) {
        const resize = resizeRef.current
        if (!resize) return
        event.stopPropagation()
        const point = toWorld(event)
        updateNode(resize.nodeId, {
            width: Math.max(180, resize.startW + point.x - resize.startX),
            height: Math.max(96, resize.startH + point.y - resize.startY),
        })
    }

    function handleResizeEnd(event: ReactPointerEvent) {
        if (resizeRef.current) {
            releasePointer(event)
            diagram.endGesture()
        }
        resizeRef.current = null
    }

    // --- Connections (drag from port, or click port then click target) -----
    function handleStartConnection(event: ReactPointerEvent, nodeId: string) {
        if (event.button !== 0) return
        event.stopPropagation()
        capturePointer(event)
        connectDragRef.current = { startClientX: event.clientX, startClientY: event.clientY, moved: false }
        setConnectingFromId(nodeId)
        setPointerPos(toWorld(event))
    }

    function handlePortPointerMove(event: ReactPointerEvent) {
        const drag = connectDragRef.current
        if (!drag || !connectingFromId) return
        const distance = Math.abs(event.clientX - drag.startClientX) + Math.abs(event.clientY - drag.startClientY)
        if (distance > CONNECT_DRAG_THRESHOLD) drag.moved = true
        setPointerPos(toWorld(event))
    }

    function handlePortPointerUp(event: ReactPointerEvent) {
        const drag = connectDragRef.current
        connectDragRef.current = null
        releasePointer(event)
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
        if (targetType === 'node') selectNode(targetId)
        else selectEdge(targetId)
        setContextMenu({
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
            targetType,
            targetId,
        })
    }

    function removeFromContextMenu(menu: ContextMenuState) {
        if (menu.targetType === 'node') removeNode(menu.targetId)
        else removeEdge(menu.targetId)
    }

    // --- Derived geometry ---------------------------------------------------
    const edgeRoutes = routeEdges(nodes, edges, boxOf)
    const previewPath =
        connectingFromNode && pointerPos
            ? previewCurve(connectingFromNode, boxOf(connectingFromNode), pointerPos)
            : null

    if (loadState === 'loading') {
        return (
            <div className="flex h-[calc(100vh-var(--layout-navbar-height))] items-center justify-center bg-canvas">
                <p className="text-sm text-fg-muted">Cargando proceso…</p>
            </div>
        )
    }

    if (loadState === 'missing' || !record) {
        return (
            <div className="flex h-[calc(100vh-var(--layout-navbar-height))] flex-col items-center justify-center gap-4 bg-canvas">
                <FlowIcon className="size-10 text-fg-muted" />
                <p className="text-sm font-semibold text-fg">El proceso no existe o fue eliminado.</p>
                <ButtonComponent variant="primary" size="sm" onClick={() => navigate('/process')}>
                    Volver al repositorio
                </ButtonComponent>
            </div>
        )
    }

    return (
        <div ref={rootRef} className="relative flex h-[calc(100vh-var(--layout-navbar-height))] flex-col bg-canvas">
            <DesignerToolbar
                meta={record.meta}
                nodeCount={nodes.length}
                edgeCount={edges.length}
                isDirty={isDirty}
                isConnecting={Boolean(connectingFromId)}
                canUndo={diagram.canUndo}
                canRedo={diagram.canRedo}
                onBack={() => navigate('/process')}
                onOpenInfo={() => setIsInfoOpen(true)}
                onUndo={diagram.undo}
                onRedo={diagram.redo}
                onValidate={runValidation}
                onOpenAi={() => setIsAiOpen(true)}
                onImport={importDiagram}
                onExport={exportDiagram}
                onSave={saveDiagram}
                onClear={() => setIsClearConfirmOpen(true)}
            />

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
                            backgroundImage: 'radial-gradient(circle, var(--color-line) 1px, transparent 1px)',
                            backgroundSize: '24px 24px',
                        }}
                    >
                        <EdgeLayer
                            routes={edgeRoutes}
                            selectedEdgeId={selectedEdgeId}
                            previewPath={previewPath}
                            onSelectEdge={(edgeId) => {
                                selectEdge(edgeId)
                                setContextMenu(null)
                            }}
                            onEdgeContextMenu={(event, edgeId) => openContextMenu(event, 'edge', edgeId)}
                            onRemoveEdge={removeEdge}
                        />

                        {nodes.map((node) => (
                            <FlowNodeView
                                key={node.id}
                                node={node}
                                measureRef={measureRef}
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

                        {nodes.length === 0 ? (
                            <div className="pointer-events-none absolute left-105 top-48 w-80 rounded-3xl border border-dashed border-line-strong bg-surface p-8 text-center">
                                <FlowIcon className="mx-auto size-8 text-fg-muted" />
                                <p className="mt-3 text-sm font-semibold text-fg">
                                    El lienzo está vacío
                                </p>
                                <p className="mt-1 text-xs text-fg-muted">
                                    Agrega elementos desde la paleta BPMN, genera una propuesta con IA o importa un
                                    diagrama guardado.
                                </p>
                            </div>
                        ) : null}
                    </div>

                    <PalettePanel onAdd={addNode} />

                    <ZoomControls
                        scale={viewport.scale}
                        onZoomIn={() => zoomBy(1.2)}
                        onZoomOut={() => zoomBy(1 / 1.2)}
                        onReset={resetView}
                    />

                    <Minimap
                        nodes={nodes}
                        boxOf={boxOf}
                        viewport={viewport}
                        viewportSize={viewportSize}
                        onNavigate={centerOn}
                    />
                </div>

                <aside
                    className="hidden w-80 shrink-0 overflow-y-auto border-l border-line bg-surface lg:block"
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

            {contextMenu ? (
                <CanvasContextMenu menu={contextMenu} onDuplicate={duplicateNode} onRemove={removeFromContextMenu} />
            ) : null}

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

            <ValidationPanel
                isOpen={isValidationOpen}
                onClose={() => setIsValidationOpen(false)}
                results={validationResults}
                onGoToNode={goToNode}
            />

            <AiAssistantModal isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} onApply={applyAiDraft} />

            <ProcessInfoModal
                isOpen={isInfoOpen}
                onClose={() => setIsInfoOpen(false)}
                meta={record.meta}
                onSave={saveMeta}
            />
        </div>
    )
}
