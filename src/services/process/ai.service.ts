// AI layer for process generation. Deliberately decoupled from the canvas:
//   aiService -> ProcessDraft (semantic) -> buildDiagramFromDraft -> DiagramSnapshot -> validation -> user review.
// Today generateDraft is a local simulation; swapping it for a real model only
// requires reimplementing generateDraft with the same contract.
import { emptyElementData } from '../../pages/process/flowTypes'
import type { BpmnType, DiagramSnapshot, FlowEdge, FlowNode, NodeColor } from '../../pages/process/flowTypes'

export type DraftStep = {
    name: string
    type: Extract<BpmnType, 'task' | 'userTask' | 'serviceTask' | 'manualTask'>
    description: string
    responsible: string
    inputs: string[]
    outputs: string[]
}

export type DraftDecision = {
    /** Question shown on the gateway */
    name: string
    /** Index (into steps) the "yes" branch continues to; the "no" branch loops back */
    afterStep: number
    yesLabel: string
    noLabel: string
    noStepName: string
}

export type ProcessDraft = {
    name: string
    description: string
    area: string
    steps: DraftStep[]
    decisions: DraftDecision[]
    /** True while the service is a local simulation (no model behind it) */
    simulated: boolean
}

export type GenerateDraftInput = {
    description: string
    area: string
}

function titleFromDescription(description: string) {
    const cleaned = description.trim().replace(/\s+/g, ' ')
    if (!cleaned) return 'Proceso generado'
    const withoutLead = cleaned.replace(/^(necesito|quiero|requiero)\s+(un|una|el|la)?\s*(proceso|flujo)?\s*(para|de|que)?\s*/i, '')
    const base = withoutLead || cleaned
    const capitalized = base.charAt(0).toUpperCase() + base.slice(1)
    return capitalized.length > 80 ? `${capitalized.slice(0, 77)}…` : capitalized
}

export const aiService = {
    /**
     * Generates an editable process proposal from a natural-language description.
     * SIMULATED: produces a sensible generic template until a model is connected.
     */
    async generateDraft({ description, area }: GenerateDraftInput): Promise<ProcessDraft> {
        // Simulate network/model latency so the UI flow is realistic
        await new Promise((resolve) => setTimeout(resolve, 900))

        const responsible = area.trim() || 'Área responsable'
        const subject = titleFromDescription(description)

        return {
            name: subject,
            description: description.trim(),
            area: area.trim(),
            simulated: true,
            steps: [
                {
                    name: 'Recibir solicitud',
                    type: 'userTask',
                    description: 'Se recibe y registra la solicitud que da inicio al proceso.',
                    responsible,
                    inputs: ['Solicitud'],
                    outputs: ['Solicitud registrada'],
                },
                {
                    name: 'Validar información',
                    type: 'userTask',
                    description: 'Se verifica que la información entregada esté completa y sea correcta.',
                    responsible,
                    inputs: ['Solicitud registrada'],
                    outputs: ['Solicitud validada'],
                },
                {
                    name: 'Procesar solicitud',
                    type: 'serviceTask',
                    description: 'Se ejecuta la gestión principal solicitada.',
                    responsible,
                    inputs: ['Solicitud validada'],
                    outputs: ['Resultado generado'],
                },
                {
                    name: 'Notificar al solicitante',
                    type: 'serviceTask',
                    description: 'Se informa al solicitante el resultado del trámite.',
                    responsible,
                    inputs: ['Resultado generado'],
                    outputs: ['Notificación enviada'],
                },
            ],
            decisions: [
                {
                    name: '¿Información completa?',
                    afterStep: 1,
                    yesLabel: 'Sí',
                    noLabel: 'No',
                    noStepName: 'Solicitar corrección',
                },
            ],
        }
    },
}

const STEP_GAP_X = 300
const BASE_Y = 280

let generatedCounter = 0
function genId(prefix: string) {
    generatedCounter += 1
    return `${prefix}-ai-${Date.now().toString(36)}-${generatedCounter}`
}

/**
 * Turns a semantic draft into a laid-out diagram. Pure and canvas-agnostic:
 * the result goes through the normal validation + user review pipeline.
 */
export function buildDiagramFromDraft(draft: ProcessDraft): DiagramSnapshot {
    const nodes: FlowNode[] = []
    const edges: FlowEdge[] = []

    const taskColor: Record<DraftStep['type'], NodeColor> = {
        task: 'emerald',
        userTask: 'sky',
        serviceTask: 'violet',
        manualTask: 'amber',
    }

    let x = 70
    const startNode: FlowNode = {
        id: genId('n'),
        kind: 'start',
        bpmnType: 'startEvent',
        title: 'Inicio',
        description: '',
        note: '',
        color: 'emerald',
        x,
        y: BASE_Y + 2,
        data: emptyElementData(),
    }
    nodes.push(startNode)
    let previousId = startNode.id
    let previousLabel = ''

    const decisionByStep = new Map(draft.decisions.map((decision) => [decision.afterStep, decision]))

    draft.steps.forEach((step, index) => {
        x += STEP_GAP_X
        const stepNode: FlowNode = {
            id: genId('n'),
            kind: 'task',
            bpmnType: step.type,
            title: step.name,
            description: step.description,
            note: '',
            color: taskColor[step.type],
            x,
            y: BASE_Y - 32,
            data: {
                ...emptyElementData(),
                responsible: step.responsible,
                inputs: step.inputs,
                outputs: step.outputs,
            },
        }
        nodes.push(stepNode)
        edges.push({
            id: genId('e'),
            from: previousId,
            to: stepNode.id,
            label: previousLabel,
            kind: 'sequence',
            condition: '',
        })
        previousId = stepNode.id
        previousLabel = ''

        const decision = decisionByStep.get(index)
        if (decision) {
            x += STEP_GAP_X
            const gateway: FlowNode = {
                id: genId('n'),
                kind: 'decision',
                bpmnType: 'exclusiveGateway',
                title: decision.name,
                description: '',
                note: '',
                color: 'violet',
                x,
                y: BASE_Y - 30,
                data: emptyElementData(),
            }
            const fixTask: FlowNode = {
                id: genId('n'),
                kind: 'task',
                bpmnType: 'userTask',
                title: decision.noStepName,
                description: 'Se solicita corregir o completar la información faltante.',
                note: '',
                color: 'rose',
                x,
                y: BASE_Y + 190,
                data: { ...emptyElementData(), responsible: step.responsible },
            }
            nodes.push(gateway, fixTask)
            edges.push(
                { id: genId('e'), from: stepNode.id, to: gateway.id, label: '', kind: 'sequence', condition: '' },
                { id: genId('e'), from: gateway.id, to: fixTask.id, label: decision.noLabel, kind: 'sequence', condition: '' },
                { id: genId('e'), from: fixTask.id, to: stepNode.id, label: '', kind: 'sequence', condition: '' }
            )
            previousId = gateway.id
            previousLabel = decision.yesLabel
        }
    })

    x += STEP_GAP_X
    const endNode: FlowNode = {
        id: genId('n'),
        kind: 'end',
        bpmnType: 'endEvent',
        title: 'Fin',
        description: '',
        note: '',
        color: 'rose',
        x,
        y: BASE_Y + 2,
        data: emptyElementData(),
    }
    nodes.push(endNode)
    edges.push({
        id: genId('e'),
        from: previousId,
        to: endNode.id,
        label: previousLabel,
        kind: 'sequence',
        condition: '',
    })

    return { version: 2, nodes, edges }
}
