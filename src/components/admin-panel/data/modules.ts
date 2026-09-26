/**
 * Catalogo de modulos del home (dashboard).
 *
 * PLANTILLA: esta lista es intencionalmente corta. Solo incluye modulos que
 * existen como ruta real en src/routes/AppRoutes.tsx, para que ninguna tarjeta
 * lleve a una pantalla vacia.
 *
 * Para agregar un modulo:
 *   1. Crea la pagina en src/pages/<modulo>/
 *   2. Registra la ruta en src/routes/AppRoutes.tsx (usa lazy())
 *   3. Agrega la entrada aqui con su `url` y sus `requiredRoles`
 *
 * `icon` es una clave del registro de ModuleIcon.tsx (p. ej. 'tasks', 'files').
 * Por compatibilidad tambien acepta cualquier texto, como un emoji.
 *
 * `requiredRoles` filtra la tarjeta segun el rol activo. Si se omite, el modulo
 * es visible para todos los roles.
 */

export type ModuleDefinition = {
    id: string
    title: string
    description: string
    icon: string
    /** Ruta interna. Si falta, la tarjeta se muestra deshabilitada. */
    url?: string
    /** Roles con acceso. Sin valor = todos. */
    requiredRoles?: string[]
}

export type ModuleCategory = {
    name: string
    icon: string
    modules: ModuleDefinition[]
}

export const MODULE_CATEGORIES: ModuleCategory[] = [
    {
        name: 'OPERACION',
        icon: 'operation',
        modules: [
            {
                id: 'tasks',
                title: 'Gestion de tareas',
                description: 'Tablero, lista, cronograma y calendario de tareas',
                icon: 'tasks',
                url: '/tasks',
                requiredRoles: ['admin', 'organizer', 'analyst'],
            },
            {
                id: 'planning',
                title: 'Planificacion',
                description: 'Grilla de plantillas con iconos e imagenes por celda',
                icon: 'planning',
                url: '/planning',
                requiredRoles: ['admin', 'organizer', 'analyst'],
            },
            {
                id: 'process',
                title: 'Procesos',
                description: 'Repositorio y disenador de diagramas de proceso',
                icon: 'process',
                url: '/process',
                requiredRoles: ['admin', 'organizer'],
            },
            {
                id: 'files',
                title: 'Documentos',
                description: 'Centro de carga y seguimiento de archivos',
                icon: 'files',
                url: '/files',
                requiredRoles: ['admin', 'organizer', 'analyst', 'viewer'],
            },
        ],
    },
    {
        name: 'ADMINISTRACION',
        icon: 'administration',
        modules: [
            {
                id: 'users',
                title: 'Gestion de usuarios',
                description: 'Alta, edicion y estado de los usuarios del sistema',
                icon: 'users',
                url: '/users',
                requiredRoles: ['admin'],
            },
            {
                id: 'rbac',
                title: 'Roles y permisos',
                description: 'Roles, permisos, grupos y asignaciones (RBAC)',
                icon: 'rbac',
                url: '/superuser/rbac',
                requiredRoles: ['admin'],
            },
            {
                id: 'audit',
                title: 'Auditoria',
                description: 'Bitacora de cambios sobre roles y permisos',
                icon: 'audit',
                url: '/superuser/rbac/audit',
                requiredRoles: ['admin', 'analyst'],
            },
        ],
    },
    {
        name: 'HERRAMIENTAS',
        icon: 'tools',
        modules: [
            {
                id: 'gantt',
                title: 'Gantt',
                description: 'Vista Gantt independiente para cronogramas',
                icon: 'gantt',
                url: '/gantt',
                requiredRoles: ['admin', 'organizer', 'analyst'],
            },
            {
                id: 'playground',
                title: 'Catalogo de UI',
                description: 'Inputs, botones, tablas, formularios y modales',
                icon: 'playground',
                url: '/playground',
                requiredRoles: ['admin', 'organizer', 'analyst', 'viewer'],
            },
        ],
    },
]
