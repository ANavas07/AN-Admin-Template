import type { NavigateFunction } from 'react-router-dom'
import { processService } from '../services/process/process.service'
import { getModuleById, hasModuleAccess } from './navigation'

/**
 * Frequent actions, shared by the home "Quick access" panel and the command
 * palette. `moduleId` ties each action to a module so it respects role access.
 */
export type QuickAction = {
    id: string
    label: string
    description: string
    icon: string
    moduleId: string
    keywords?: string[]
    run: (navigate: NavigateFunction) => void | Promise<void>
}

export const QUICK_ACTIONS: QuickAction[] = [
    {
        id: 'new-process',
        label: 'Nuevo proceso',
        description: 'Crea un proceso vacío y abre el diseñador BPMN',
        icon: 'process',
        moduleId: 'process',
        keywords: ['crear', 'bpmn', 'diagrama'],
        run: async (navigate) => {
            const created = await processService.create()
            navigate(`/process/${created.meta.id}`)
        },
    },
    {
        id: 'open-board',
        label: 'Abrir tablero de tareas',
        description: 'Tablero, lista, cronograma y calendario',
        icon: 'tasks',
        moduleId: 'tasks',
        keywords: ['tareas', 'kanban', 'nueva tarea'],
        run: (navigate) => navigate('/tasks'),
    },
    {
        id: 'upload-files',
        label: 'Subir documentos',
        description: 'Carga archivos al centro de documentos',
        icon: 'files',
        moduleId: 'files',
        keywords: ['archivos', 'upload', 'cargar'],
        run: (navigate) => navigate('/files'),
    },
    {
        id: 'new-ticket',
        label: 'Nuevo ticket de soporte',
        description: 'Reporta una incidencia o solicita ayuda',
        icon: 'support',
        moduleId: 'support',
        keywords: ['ayuda', 'incidencia', 'soporte', 'crear'],
        run: (navigate) => navigate('/support/new'),
    },
    {
        id: 'compose-mail',
        label: 'Redactar correo',
        description: 'Abre un mensaje nuevo en el correo',
        icon: 'mail',
        moduleId: 'mail',
        keywords: ['email', 'enviar', 'mensaje', 'nuevo correo'],
        run: (navigate) => navigate('/mail/inbox?compose=1'),
    },
    {
        id: 'ask-assistant',
        label: 'Preguntar al asistente IA',
        description: 'Inicia una conversación nueva',
        icon: 'assistant',
        moduleId: 'assistant',
        keywords: ['ia', 'ai', 'chat', 'nueva conversacion'],
        run: (navigate) => navigate('/assistant'),
    },
    {
        id: 'generate-api-key',
        label: 'Generar API key',
        description: 'Emite una credencial para una integración',
        icon: 'key',
        moduleId: 'api-keys',
        keywords: ['api', 'token', 'credencial', 'integracion'],
        run: (navigate) => navigate('/admin/api-keys?new=1'),
    },
    {
        id: 'manage-roles',
        label: 'Gestionar roles',
        description: 'Roles, permisos y jerarquía de acceso',
        icon: 'rbac',
        moduleId: 'rbac',
        keywords: ['permisos', 'seguridad', 'rbac'],
        run: (navigate) => navigate('/superuser/rbac/roles'),
    },
    {
        id: 'review-audit',
        label: 'Revisar auditoría',
        description: 'Últimos eventos de acceso y cambios de permisos',
        icon: 'audit',
        moduleId: 'audit',
        keywords: ['logs', 'eventos', 'bitacora'],
        run: (navigate) => navigate('/superuser/rbac/audit'),
    },
]

export function getQuickActions(role: string) {
    return QUICK_ACTIONS.filter((action) => {
        const module = getModuleById(action.moduleId)
        return module !== null && hasModuleAccess(module, role)
    })
}
