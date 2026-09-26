// Labels and tones of the support center, shared by lists, detail and forms.
import type { StatusTone } from '../../../components/ui/tone'
import type { UserRole } from '../../../config/app.config'
import type { TicketCategory, TicketPriority, TicketStatus } from '../../../services/support/support.service'

export const STATUS_META: Record<TicketStatus, { label: string; tone: StatusTone; description: string }> = {
    open: { label: 'Abierto', tone: 'info', description: 'Pendiente de revisión por soporte' },
    in_progress: { label: 'En curso', tone: 'brand', description: 'Un agente está trabajando en él' },
    waiting: { label: 'Esperando respuesta', tone: 'warning', description: 'Soporte necesita información tuya' },
    resolved: { label: 'Resuelto', tone: 'success', description: 'Solución aplicada; puedes reabrirlo respondiendo' },
    closed: { label: 'Cerrado', tone: 'neutral', description: 'Sin más acciones' },
}

export const STATUSES = Object.keys(STATUS_META) as TicketStatus[]

/** Statuses that still need work. */
export const ACTIVE_STATUSES: TicketStatus[] = ['open', 'in_progress', 'waiting']

export const PRIORITY_META: Record<TicketPriority, { label: string; tone: StatusTone }> = {
    low: { label: 'Baja', tone: 'neutral' },
    medium: { label: 'Media', tone: 'info' },
    high: { label: 'Alta', tone: 'warning' },
    urgent: { label: 'Urgente', tone: 'danger' },
}

export const PRIORITIES = Object.keys(PRIORITY_META) as TicketPriority[]

export const CATEGORY_META: Record<TicketCategory, { label: string; description: string; icon: string }> = {
    incident: { label: 'Incidencia', description: 'Algo no funciona o muestra un error', icon: 'activity' },
    access: { label: 'Accesos y permisos', description: 'Roles, cuentas bloqueadas o accesos nuevos', icon: 'lock' },
    request: { label: 'Solicitud de servicio', description: 'Configuraciones, cargas de datos o cambios', icon: 'tasks' },
    integration: { label: 'Integraciones y API', description: 'API keys, conectores y sincronizaciones', icon: 'key' },
    question: { label: 'Consulta', description: 'Dudas de uso o buenas prácticas', icon: 'help' },
}

export const CATEGORIES = Object.keys(CATEGORY_META) as TicketCategory[]

export function isTicketCategory(value: string | null): value is TicketCategory {
    return value !== null && value in CATEGORY_META
}

/** Roles that act as support agents: change status, priority and write internal notes. */
const AGENT_ROLES: UserRole[] = ['admin']

export const isSupportAgent = (role: UserRole) => AGENT_ROLES.includes(role)

/** Support staff available for assignment. PLANTILLA: replace with your helpdesk team. */
export const SUPPORT_AGENTS = ['María Torres', 'Carlos Rivas', 'Lucía Andrade']
