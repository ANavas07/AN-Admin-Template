// Response engine of the AI assistant. Today it is a local simulation that
// writes Markdown answers token by token; to use a real model, implement
// AssistantEngine against YOUR backend (which holds the model credentials:
// never call a model provider with a key from the browser) and export it as
// `assistantEngine`. The UI only depends on this contract.
import type { Attachment } from '../../utils/attachments'
import { formatBytes } from '../../utils/format'
import { normalizeText } from '../../utils/text'

export type EngineMessage = { role: 'user' | 'assistant'; content: string; attachments: Attachment[] }

export type EngineRequest = {
    messages: EngineMessage[]
    /** Changes the wording on "regenerate" */
    variant: number
}

export type AssistantEngine = {
    /** Streams the answer through onToken and resolves with the full text. Rejects with an AbortError when stopped. */
    reply: (request: EngineRequest, onToken: (token: string) => void, signal: AbortSignal) => Promise<string>
    /** True while there is no model behind the engine */
    simulated: boolean
}

const INTROS = [
    ['Claro.', 'Por supuesto.', 'Buena pregunta.'],
    ['Aquí tienes una propuesta:', 'Te propongo lo siguiente:', 'Una forma de hacerlo:'],
]

const pick = <T,>(options: T[], variant: number) => options[variant % options.length]

const has = (text: string, words: string[]) => words.some((word) => text.includes(word))

function codeAnswer(variant: number) {
    return `${pick(INTROS[1], variant)} un hook de React tipado que carga datos con cancelación, siguiendo el patrón de los servicios de la plantilla.

\`\`\`tsx
import { useEffect, useState } from 'react'

export function useResource<T>(load: (signal: AbortSignal) => Promise<T>) {
    const [data, setData] = useState<T | null>(null)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        const controller = new AbortController()
        load(controller.signal)
            .then(setData)
            .catch((reason) => {
                if (reason.name !== 'AbortError') setError(reason)
            })
        return () => controller.abort()
    }, [load])

    return { data, error, isLoading: data === null && error === null }
}
\`\`\`

**Puntos clave**

1. El \`AbortController\` evita actualizar el estado de un componente desmontado.
2. El estado se actualiza en la promesa, no de forma síncrona en el efecto.
3. Memoriza \`load\` con \`useCallback\` (o déjalo al React Compiler) para no repetir la carga.`
}

function sqlAnswer(variant: number) {
    return `${pick(INTROS[0], variant)} Esta consulta obtiene los usuarios activos por departamento con su último acceso:

\`\`\`sql
SELECT d.name AS departamento,
       COUNT(u.id) AS usuarios_activos,
       MAX(s.last_seen_at) AS ultimo_acceso
FROM users u
JOIN departments d ON d.id = u.department_id
LEFT JOIN sessions s ON s.user_id = u.id
WHERE u.status = 'active'
GROUP BY d.name
ORDER BY usuarios_activos DESC;
\`\`\`

> Crea un índice sobre \`sessions(user_id, last_seen_at)\` si la tabla de sesiones es grande.`
}

function tableAnswer(variant: number) {
    return `${pick(INTROS[0], variant)} Comparativa rápida de los entornos de una API key:

| Entorno | Prefijo | Uso recomendado | Rotación |
| --- | --- | --- | --- |
| Producción | \`sk_live_\` | Integraciones reales | Cada 90 días |
| Staging | \`sk_stg_\` | Pruebas con datos de preproducción | Cada 180 días |
| Desarrollo | \`sk_test_\` | Desarrollo local y CI | Al terminar el proyecto |

Asigna siempre el mínimo de permisos y define una fecha de expiración.`
}

function securityAnswer(variant: number) {
    return `${pick(INTROS[0], variant)} Recomendaciones para gestionar credenciales de integración:

- **Una clave por integración y entorno.** Así puedes revocar una sin afectar a las demás.
- **Mínimo privilegio.** Evita \`admin:full\`; usa permisos de lectura cuando baste.
- **Rotación programada.** En *Administración › API Keys*, «Rotar» emite un valor nuevo y anula el anterior.
- **Nunca en el código.** Guárdalas en un gestor de secretos o variables de entorno del servidor.
- **Auditoría.** Revisa el registro de cada clave para detectar usos inesperados.`
}

function attachmentAnswer(attachments: Attachment[], variant: number) {
    const list = attachments.map((file) => `- **${file.name}** · ${file.mimeType || 'archivo'} · ${formatBytes(file.size)}`).join('\n')
    return `${pick(INTROS[0], variant)} Recibí ${attachments.length === 1 ? 'este archivo' : 'estos archivos'}:

${list}

En esta versión de demostración no leo el contenido de los archivos. Con un modelo conectado, el backend extraería el texto y podría **resumirlo**, **responder preguntas** sobre él o **compararlo** con otros documentos.`
}

function greetingAnswer() {
    return `¡Hola! Soy el asistente de la plataforma. Puedo ayudarte a:

- Redactar correos, resúmenes y documentación.
- Escribir o revisar **código** (TypeScript, React, SQL).
- Explicar módulos como *Procesos*, *Tareas* o *API Keys*.

¿Por dónde empezamos?`
}

function genericAnswer(question: string, variant: number) {
    const topic = question.replace(/[¿?¡!.]+/g, '').trim().slice(0, 80)
    const steps = [
        'Define el objetivo y el resultado esperado.',
        'Identifica a los responsables y los datos de entrada.',
        'Divide el trabajo en pasos verificables.',
        'Registra el avance en el módulo de tareas y revisa los bloqueos.',
    ]
    const ordered = variant % 2 === 0 ? steps : [...steps.slice(1), steps[0]]
    return `${pick(INTROS[0], variant)} Sobre **«${topic}»**, te sugiero este enfoque:

${ordered.map((step, index) => `${index + 1}. ${step}`).join('\n')}

Si me das más contexto (área, plazos, restricciones) puedo detallar cada paso o redactar el plan completo.`
}

/** Chooses the simulated answer from the last user message. */
export function composeAnswer(request: EngineRequest) {
    const last = [...request.messages].reverse().find((message) => message.role === 'user')
    if (!last) return greetingAnswer()
    const text = normalizeText(last.content)
    if (last.attachments.length) return attachmentAnswer(last.attachments, request.variant)
    if (has(text, ['sql', 'consulta', 'query', 'base de datos'])) return sqlAnswer(request.variant)
    if (has(text, ['codigo', 'code', 'hook', 'react', 'typescript', 'funcion', 'componente'])) return codeAnswer(request.variant)
    if (has(text, ['tabla', 'compara', 'diferencia'])) return tableAnswer(request.variant)
    if (has(text, ['api key', 'clave', 'seguridad', 'credencial', 'token'])) return securityAnswer(request.variant)
    if (/^(hola|buenas|buenos|hey|hello)\b/.test(text)) return greetingAnswer()
    return genericAnswer(last.content, request.variant)
}

function wait(ms: number, signal: AbortSignal) {
    return new Promise<void>((resolve, reject) => {
        if (signal.aborted) return reject(new DOMException('Detenido', 'AbortError'))
        const timeout = setTimeout(resolve, ms)
        signal.addEventListener(
            'abort',
            () => {
                clearTimeout(timeout)
                reject(new DOMException('Detenido', 'AbortError'))
            },
            { once: true }
        )
    })
}

export const simulatedEngine: AssistantEngine = {
    simulated: true,
    async reply(request, onToken, signal) {
        const answer = composeAnswer(request)
        await wait(450, signal) // "thinking"
        // Words with their trailing whitespace, so Markdown and code keep their layout
        const tokens = answer.match(/\S+\s*|\s+/g) ?? []
        let written = ''
        for (const token of tokens) {
            await wait(token.includes('\n') ? 30 : 14, signal)
            written += token
            onToken(token)
        }
        return written
    },
}

export const assistantEngine: AssistantEngine = simulatedEngine
