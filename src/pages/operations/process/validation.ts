// BPMN validation rules. Pure functions over the diagram — kept apart from the
// canvas so new rules can be added (or run server-side / by AI) without UI changes.
import { bpmnTypeLabels, kindLabels } from './flowTypes'
import type { DiagramSnapshot, FlowNode } from './flowTypes'

export type ValidationLevel = 'ok' | 'warning' | 'error'

export type ValidationResult = {
    level: ValidationLevel
    message: string
    /** Element the finding points to, when applicable */
    nodeId?: string
}

function nodeName(node: FlowNode) {
    return node.title.trim() || `(${(node.bpmnType && bpmnTypeLabels[node.bpmnType]) || kindLabels[node.kind]} sin nombre)`
}

/** Kinds that participate in the flow (notes, groups and lanes are annotations). */
function isFlowNode(node: FlowNode) {
    return node.kind !== 'note' && node.kind !== 'group' && node.kind !== 'lane'
}

export function validateDiagram(diagram: DiagramSnapshot): ValidationResult[] {
    const results: ValidationResult[] = []
    const { nodes, edges } = diagram
    const flowNodes = nodes.filter(isFlowNode)
    const sequenceEdges = edges.filter((edge) => edge.kind !== 'association')

    if (nodes.length === 0) {
        return [{ level: 'warning', message: 'El diagrama está vacío. Agrega elementos desde la paleta.' }]
    }

    // Start / end events
    const startNodes = nodes.filter((node) => node.kind === 'start')
    const endNodes = nodes.filter((node) => node.kind === 'end')
    results.push(
        startNodes.length > 0
            ? { level: 'ok', message: 'El proceso tiene evento de inicio.' }
            : { level: 'error', message: 'El proceso no tiene evento de inicio.' }
    )
    results.push(
        endNodes.length > 0
            ? { level: 'ok', message: 'El proceso tiene evento de fin.' }
            : { level: 'error', message: 'El proceso no tiene evento de fin.' }
    )

    // Unnamed tasks
    const unnamedTasks = nodes.filter(
        (node) => node.kind === 'task' && node.title.trim().length === 0
    )
    if (unnamedTasks.length === 0) {
        if (nodes.some((node) => node.kind === 'task')) {
            results.push({ level: 'ok', message: 'Todas las tareas tienen nombre.' })
        }
    } else {
        for (const node of unnamedTasks) {
            results.push({ level: 'warning', message: 'Existe una tarea sin nombre.', nodeId: node.id })
        }
    }

    // Disconnected flow elements
    const connectedIds = new Set<string>()
    for (const edge of sequenceEdges) {
        connectedIds.add(edge.from)
        connectedIds.add(edge.to)
    }
    for (const node of flowNodes) {
        if (flowNodes.length > 1 && !connectedIds.has(node.id)) {
            results.push({
                level: 'error',
                message: `El elemento "${nodeName(node)}" está desconectado del flujo.`,
                nodeId: node.id,
            })
        }
    }

    // Start events must not have incoming flow; end events must not have outgoing flow
    for (const node of startNodes) {
        if (sequenceEdges.some((edge) => edge.to === node.id)) {
            results.push({
                level: 'warning',
                message: `El evento de inicio "${nodeName(node)}" tiene conexiones entrantes.`,
                nodeId: node.id,
            })
        }
    }
    for (const node of endNodes) {
        if (sequenceEdges.some((edge) => edge.from === node.id)) {
            results.push({
                level: 'warning',
                message: `El evento de fin "${nodeName(node)}" tiene conexiones salientes.`,
                nodeId: node.id,
            })
        }
    }

    // Gateways: at least two outgoing paths, and labelled/conditioned outputs
    const gateways = nodes.filter((node) => node.kind === 'decision')
    for (const gateway of gateways) {
        const outgoing = sequenceEdges.filter((edge) => edge.from === gateway.id)
        if (outgoing.length < 2) {
            results.push({
                level: 'warning',
                message: `La compuerta "${nodeName(gateway)}" tiene menos de dos salidas.`,
                nodeId: gateway.id,
            })
        }
        // Parallel gateways do not need conditions on their outputs
        if (gateway.bpmnType !== 'parallelGateway') {
            const unlabelled = outgoing.filter(
                (edge) => edge.label.trim().length === 0 && edge.condition.trim().length === 0
            )
            for (const edge of unlabelled) {
                const target = nodes.find((node) => node.id === edge.to)
                results.push({
                    level: 'warning',
                    message: `La compuerta "${nodeName(gateway)}" tiene una salida sin condición${target ? ` (hacia "${nodeName(target)}")` : ''}.`,
                    nodeId: gateway.id,
                })
            }
        }
    }
    if (gateways.length > 0 && !results.some((result) => result.nodeId && gateways.some((g) => g.id === result.nodeId))) {
        results.push({ level: 'ok', message: 'Todas las compuertas tienen salidas correctamente definidas.' })
    }

    // Documentation coverage (warnings help build the knowledge repository)
    const tasksWithoutResponsible = nodes.filter(
        (node) => node.kind === 'task' && node.data.responsible.trim().length === 0
    )
    if (tasksWithoutResponsible.length === 0) {
        if (nodes.some((node) => node.kind === 'task')) {
            results.push({ level: 'ok', message: 'Todas las tareas tienen responsable asignado.' })
        }
    } else {
        for (const node of tasksWithoutResponsible) {
            results.push({
                level: 'warning',
                message: `La tarea "${nodeName(node)}" no tiene responsable.`,
                nodeId: node.id,
            })
        }
    }

    return results
}

export function summarizeValidation(results: ValidationResult[]) {
    return {
        errors: results.filter((result) => result.level === 'error').length,
        warnings: results.filter((result) => result.level === 'warning').length,
        passed: results.filter((result) => result.level === 'ok').length,
    }
}
