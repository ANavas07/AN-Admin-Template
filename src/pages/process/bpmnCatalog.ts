// Catalog that feeds the palette: BPMN elements grouped by category, each with
// contextual help so users can learn BPMN while modelling.
import type { BpmnType, NodeColor, NodeKind } from './flowTypes'

export type PaletteItem = {
    /** Stable identifier, unique across the whole catalog */
    id: string
    kind: NodeKind
    bpmnType: BpmnType | null
    label: string
    defaultTitle: string
    defaultDescription: string
    defaultColor: NodeColor
    help: {
        what: string
        example: string
    }
}

export type PaletteCategory = {
    id: string
    label: string
    items: PaletteItem[]
}

export const paletteCategories: PaletteCategory[] = [
    {
        id: 'events',
        label: 'Eventos',
        items: [
            {
                id: 'startEvent',
                kind: 'start',
                bpmnType: 'startEvent',
                label: 'Inicio',
                defaultTitle: 'Inicio',
                defaultDescription: '',
                defaultColor: 'emerald',
                help: {
                    what: 'Marca el punto donde comienza el proceso. Todo proceso debe tener al menos un evento de inicio.',
                    example: 'El proceso arranca cuando llega una nueva solicitud.',
                },
            },
            {
                id: 'timerStartEvent',
                kind: 'start',
                bpmnType: 'timerStartEvent',
                label: 'Inicio por tiempo',
                defaultTitle: 'Cada día a las 8:00',
                defaultDescription: '',
                defaultColor: 'emerald',
                help: {
                    what: 'El proceso inicia automáticamente en un momento o intervalo de tiempo definido.',
                    example: 'Todos los lunes se genera el reporte semanal.',
                },
            },
            {
                id: 'messageStartEvent',
                kind: 'start',
                bpmnType: 'messageStartEvent',
                label: 'Inicio por mensaje',
                defaultTitle: 'Mensaje recibido',
                defaultDescription: '',
                defaultColor: 'emerald',
                help: {
                    what: 'El proceso inicia al recibir un mensaje externo: un correo, una notificación o una solicitud de otro sistema.',
                    example: 'Llega un correo con una solicitud de certificado.',
                },
            },
            {
                id: 'intermediateEvent',
                kind: 'intermediate',
                bpmnType: 'intermediateEvent',
                label: 'Evento intermedio',
                defaultTitle: 'Evento',
                defaultDescription: '',
                defaultColor: 'sky',
                help: {
                    what: 'Algo que ocurre en medio del proceso: una espera, una señal o un hito que no inicia ni termina el flujo.',
                    example: 'Esperar la confirmación del estudiante antes de continuar.',
                },
            },
            {
                id: 'endEvent',
                kind: 'end',
                bpmnType: 'endEvent',
                label: 'Fin',
                defaultTitle: 'Fin',
                defaultDescription: '',
                defaultColor: 'rose',
                help: {
                    what: 'Marca el punto donde termina un camino del proceso. Puede haber varios finales.',
                    example: 'El trámite finaliza cuando se entrega el certificado.',
                },
            },
        ],
    },
    {
        id: 'tasks',
        label: 'Tareas',
        items: [
            {
                id: 'task',
                kind: 'task',
                bpmnType: 'task',
                label: 'Tarea',
                defaultTitle: 'Nueva tarea',
                defaultDescription: 'Describe qué ocurre en este paso.',
                defaultColor: 'emerald',
                help: {
                    what: 'Una unidad de trabajo dentro del proceso. Es el elemento más común: algo que alguien o algo debe hacer.',
                    example: 'Registrar la solicitud en el sistema.',
                },
            },
            {
                id: 'userTask',
                kind: 'task',
                bpmnType: 'userTask',
                label: 'Tarea de usuario',
                defaultTitle: 'Tarea de usuario',
                defaultDescription: '',
                defaultColor: 'sky',
                help: {
                    what: 'Una tarea que realiza una persona, normalmente apoyada por un sistema (aprobar, revisar, completar un formulario).',
                    example: 'La secretaria valida la documentación entregada.',
                },
            },
            {
                id: 'serviceTask',
                kind: 'task',
                bpmnType: 'serviceTask',
                label: 'Tarea de servicio',
                defaultTitle: 'Tarea de servicio',
                defaultDescription: '',
                defaultColor: 'violet',
                help: {
                    what: 'Una tarea automática ejecutada por un sistema o servicio, sin intervención humana.',
                    example: 'El sistema genera el certificado en PDF.',
                },
            },
            {
                id: 'manualTask',
                kind: 'task',
                bpmnType: 'manualTask',
                label: 'Tarea manual',
                defaultTitle: 'Tarea manual',
                defaultDescription: '',
                defaultColor: 'amber',
                help: {
                    what: 'Trabajo físico realizado sin ayuda de ningún sistema.',
                    example: 'Archivar el expediente en la carpeta física.',
                },
            },
            {
                id: 'scriptTask',
                kind: 'task',
                bpmnType: 'scriptTask',
                label: 'Tarea de script',
                defaultTitle: 'Tarea de script',
                defaultDescription: '',
                defaultColor: 'slate',
                help: {
                    what: 'Una tarea automática definida por un script o fórmula que ejecuta el motor del proceso.',
                    example: 'Calcular el costo del trámite según el tipo de solicitud.',
                },
            },
            {
                id: 'businessRuleTask',
                kind: 'task',
                bpmnType: 'businessRuleTask',
                label: 'Regla de negocio',
                defaultTitle: 'Regla de negocio',
                defaultDescription: '',
                defaultColor: 'violet',
                help: {
                    what: 'Evalúa una regla o tabla de decisión del negocio para obtener un resultado.',
                    example: 'Determinar si el estudiante cumple los requisitos de beca.',
                },
            },
            {
                id: 'subprocess',
                kind: 'task',
                bpmnType: 'subprocess',
                label: 'Subproceso',
                defaultTitle: 'Subproceso',
                defaultDescription: '',
                defaultColor: 'sky',
                help: {
                    what: 'Agrupa un conjunto de pasos que forman un proceso propio. Permite mantener el diagrama principal simple.',
                    example: '"Verificación de pagos" como subproceso dentro de la matrícula.',
                },
            },
        ],
    },
    {
        id: 'gateways',
        label: 'Compuertas',
        items: [
            {
                id: 'exclusiveGateway',
                kind: 'decision',
                bpmnType: 'exclusiveGateway',
                label: 'Exclusiva (XOR)',
                defaultTitle: '¿Decisión?',
                defaultDescription: '',
                defaultColor: 'violet',
                help: {
                    what: 'Permite tomar una decisión donde únicamente una de las rutas puede continuar.',
                    example: '¿Solicitud completa? Sí → Procesar · No → Solicitar información.',
                },
            },
            {
                id: 'parallelGateway',
                kind: 'decision',
                bpmnType: 'parallelGateway',
                label: 'Paralela (AND)',
                defaultTitle: 'En paralelo',
                defaultDescription: '',
                defaultColor: 'sky',
                help: {
                    what: 'Divide el flujo en varias ramas que se ejecutan al mismo tiempo, o espera a que todas terminen.',
                    example: 'Verificar pagos y validar documentos simultáneamente.',
                },
            },
            {
                id: 'inclusiveGateway',
                kind: 'decision',
                bpmnType: 'inclusiveGateway',
                label: 'Inclusiva (OR)',
                defaultTitle: '¿Qué aplica?',
                defaultDescription: '',
                defaultColor: 'amber',
                help: {
                    what: 'Permite que continúen una o varias rutas a la vez, según las condiciones que se cumplan.',
                    example: 'Notificar por correo y/o por SMS según las preferencias.',
                },
            },
            {
                id: 'eventBasedGateway',
                kind: 'decision',
                bpmnType: 'eventBasedGateway',
                label: 'Por eventos',
                defaultTitle: '¿Qué ocurre primero?',
                defaultDescription: '',
                defaultColor: 'slate',
                help: {
                    what: 'El camino se decide por el primer evento que ocurra, no por una condición de datos.',
                    example: 'Continuar con lo que llegue primero: respuesta del cliente o vencimiento del plazo.',
                },
            },
        ],
    },
    {
        id: 'others',
        label: 'Otros elementos',
        items: [
            {
                id: 'data',
                kind: 'data',
                bpmnType: null,
                label: 'Dato / documento',
                defaultTitle: 'Dato / documento',
                defaultDescription: 'Documento producido por el proceso.',
                defaultColor: 'sky',
                help: {
                    what: 'Representa información o un documento que el proceso usa o produce.',
                    example: 'El certificado en PDF generado por el proceso.',
                },
            },
            {
                id: 'note',
                kind: 'note',
                bpmnType: null,
                label: 'Nota',
                defaultTitle: 'Nota',
                defaultDescription: 'Escribe aquí tu comentario.',
                defaultColor: 'amber',
                help: {
                    what: 'Una anotación libre para aclarar o comentar cualquier parte del diagrama. No afecta el flujo.',
                    example: 'Recordar que los casos especiales se escalan al coordinador.',
                },
            },
            {
                id: 'group',
                kind: 'group',
                bpmnType: null,
                label: 'Grupo',
                defaultTitle: 'Grupo',
                defaultDescription: '',
                defaultColor: 'slate',
                help: {
                    what: 'Un recuadro visual para agrupar elementos relacionados. No cambia el comportamiento del proceso.',
                    example: 'Agrupar los pasos de la etapa de "Validación".',
                },
            },
            {
                id: 'lane',
                kind: 'lane',
                bpmnType: null,
                label: 'Lane (responsable)',
                defaultTitle: 'Área / rol',
                defaultDescription: '',
                defaultColor: 'slate',
                help: {
                    what: 'Un carril que indica qué área o rol es responsable de los elementos que contiene.',
                    example: 'Un carril para "Secretaría" y otro para "Coordinación".',
                },
            },
        ],
    },
]

export const paletteItemById = new Map<string, PaletteItem>(
    paletteCategories.flatMap((category) => category.items.map((item) => [item.id, item]))
)
