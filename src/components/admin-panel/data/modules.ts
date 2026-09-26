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

/** Pagina interna de un modulo (menu anidado del sidebar y de la paleta). */
export type ModulePage = {
    id: string
    title: string
    url: string
    icon?: string
}

export type ModuleDefinition = {
    id: string
    title: string
    description: string
    icon: string
    /** Ruta interna. Si falta, la tarjeta se muestra deshabilitada. */
    url?: string
    /** Roles con acceso. Sin valor = todos. */
    requiredRoles?: string[]
    /** Paginas internas del modulo. Opcional: habilita el submenu del sidebar. */
    children?: ModulePage[]
    /** Palabras extra para la busqueda de la paleta de comandos. */
    keywords?: string[]
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
                keywords: ['kanban', 'tablero', 'calendario', 'cronograma'],
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
                keywords: ['bpmn', 'diagramas', 'flujos'],
                description: 'Repositorio y disenador de diagramas de proceso',
                icon: 'process',
                url: '/process',
                requiredRoles: ['admin', 'organizer'],
            },
            {
                id: 'files',
                title: 'Documentos',
                keywords: ['archivos', 'subir', 'upload'],
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
                keywords: ['rbac', 'seguridad', 'accesos'],
                children: [
                    { id: 'rbac-roles', title: 'Roles', url: '/superuser/rbac/roles', icon: 'administration' },
                    { id: 'rbac-permissions', title: 'Permisos', url: '/superuser/rbac/permissions', icon: 'rbac' },
                    { id: 'rbac-groups', title: 'Grupos', url: '/superuser/rbac/groups', icon: 'users' },
                    { id: 'rbac-users', title: 'Asignación de Usuarios', url: '/superuser/rbac/users', icon: 'user' },
                    { id: 'rbac-audit', title: 'Log de Auditoría', url: '/superuser/rbac/audit', icon: 'audit' },
                ],
            },
            {
                id: 'audit',
                title: 'Auditoria',
                keywords: ['logs', 'bitacora', 'eventos'],
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
                keywords: ['componentes', 'ui', 'design system'],
                children: [
                    { id: 'playground-inputs', title: 'Inputs', url: '/playground/inputs' },
                    { id: 'playground-buttons', title: 'Botones', url: '/playground/buttons' },
                    { id: 'playground-tables', title: 'Tablas', url: '/playground/tables' },
                    { id: 'playground-gantt', title: 'Gantt', url: '/playground/gantt' },
                    { id: 'playground-forms', title: 'Formularios', url: '/playground/forms' },
                    { id: 'playground-modals', title: 'Pop-Ups', url: '/playground/modals' },
                ],
            },
        ],
    },
]
