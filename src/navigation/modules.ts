/**
 * Registro de navegacion: la unica fuente de modulos de la aplicacion. El
 * sidebar, la paleta de comandos, el home, los favoritos, las metricas y el
 * control de acceso por rol lo leen desde aqui (ver navigation.ts).
 *
 * Para agregar un modulo:
 *   1. Crea la pagina en src/pages/<seccion>/<modulo>/ (p. ej. communication/mail)
 *   2. Registra la ruta en src/routes/AppRoutes.tsx (usa lazy())
 *   3. Agrega la entrada en la categoria que corresponda con su `url` y sus `requiredRoles`
 *
 * `icon` es una clave del registro de ModuleIcon.tsx (p. ej. 'tasks', 'mail').
 * Por compatibilidad tambien acepta cualquier texto, como un emoji.
 *
 * `requiredRoles` limita el acceso: el modulo se oculta del menu, la paleta y
 * el home, y su ruta responde 403. Si se omite, es visible para todos los roles.
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
    /** Identificador estable de la seccion. */
    id?: string
    /** Nombre visible de la seccion. */
    name: string
    icon: string
    modules: ModuleDefinition[]
    /** false: no se muestra como grupo propio del sidebar (se llega desde otra entrada). */
    sidebar?: boolean
    /** false: no aparece en el catalogo de modulos del home. */
    catalog?: boolean
}

const ALL_ROLES = ['admin', 'organizer', 'analyst', 'viewer']

/** Modulos operativos. En el sidebar se agrupan dentro de "Espacio de trabajo › Módulos". */
const OPERATION_MODULES: ModuleDefinition[] = [
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
        requiredRoles: ALL_ROLES,
    },
    {
        id: 'gantt',
        title: 'Gantt',
        description: 'Vista Gantt independiente para cronogramas',
        icon: 'gantt',
        url: '/gantt',
        requiredRoles: ['admin', 'organizer', 'analyst'],
    },
]

export const MODULE_CATEGORIES: ModuleCategory[] = [
    {
        id: 'workspace',
        name: 'Espacio de trabajo',
        icon: 'operation',
        catalog: false,
        modules: [
            {
                id: 'modules',
                title: 'Módulos',
                description: 'Catálogo de todos los módulos disponibles para tu rol',
                icon: 'grid',
                url: '/workspace/modules',
                keywords: ['catalogo', 'aplicaciones'],
                children: OPERATION_MODULES.map((module) => ({
                    id: `modules-${module.id}`,
                    title: module.title,
                    url: module.url!,
                    icon: module.icon,
                })),
            },
            {
                id: 'favorites',
                title: 'Favoritos',
                description: 'Tus módulos fijados',
                icon: 'star',
                url: '/workspace/favorites',
            },
            {
                id: 'activity',
                title: 'Actividad reciente',
                description: 'Historial de navegación y métricas de uso',
                icon: 'activity',
                url: '/workspace/activity',
                keywords: ['historial', 'metricas', 'estadisticas'],
            },
        ],
    },
    {
        id: 'operations',
        name: 'Operación',
        icon: 'operation',
        sidebar: false,
        modules: OPERATION_MODULES,
    },
    {
        id: 'communication',
        name: 'Comunicación',
        icon: 'mail',
        modules: [
            {
                id: 'mail',
                title: 'Correo',
                description: 'Bandeja de entrada, envíos, borradores y archivo',
                icon: 'mail',
                url: '/mail',
                keywords: ['email', 'mensajes', 'bandeja', 'inbox', 'redactar'],
                children: [
                    { id: 'mail-inbox', title: 'Bandeja de entrada', url: '/mail/inbox' },
                    { id: 'mail-starred', title: 'Favoritos', url: '/mail/starred' },
                    { id: 'mail-sent', title: 'Enviados', url: '/mail/sent' },
                    { id: 'mail-drafts', title: 'Borradores', url: '/mail/drafts' },
                    { id: 'mail-archive', title: 'Archivados', url: '/mail/archive' },
                    { id: 'mail-trash', title: 'Papelera', url: '/mail/trash' },
                ],
            },
            {
                id: 'assistant',
                title: 'Asistente IA',
                description: 'Conversaciones con el asistente, código y archivos',
                icon: 'assistant',
                url: '/assistant',
                keywords: ['ia', 'ai', 'chat', 'copilot', 'preguntar'],
            },
            {
                id: 'support',
                title: 'Centro de soporte',
                description: 'Tickets, seguimiento y contacto con soporte',
                icon: 'support',
                url: '/support',
                keywords: ['ayuda', 'ticket', 'incidencia', 'helpdesk'],
                children: [
                    { id: 'support-tickets', title: 'Mis tickets', url: '/support/tickets' },
                    { id: 'support-new', title: 'Nuevo ticket', url: '/support/new' },
                    { id: 'support-kb', title: 'Base de conocimiento', url: '/support/knowledge-base' },
                    { id: 'support-contact', title: 'Contactar soporte', url: '/support/contact' },
                ],
            },
        ],
    },
    {
        id: 'administration',
        name: 'Administración',
        icon: 'administration',
        modules: [
            {
                id: 'api-keys',
                title: 'API Keys',
                description: 'Credenciales de integración, permisos, uso y rotación',
                icon: 'key',
                url: '/admin/api-keys',
                requiredRoles: ['admin'],
                keywords: ['api', 'tokens', 'credenciales', 'integraciones'],
            },
            {
                id: 'users',
                title: 'Usuarios',
                description: 'Alta, edicion y estado de los usuarios del sistema',
                icon: 'users',
                url: '/users',
                requiredRoles: ['admin'],
            },
            {
                id: 'rbac',
                title: 'Roles',
                description: 'Roles, permisos, grupos y asignaciones (RBAC)',
                icon: 'rbac',
                url: '/superuser/rbac',
                requiredRoles: ['admin'],
                keywords: ['rbac', 'seguridad', 'accesos', 'permisos'],
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
                title: 'Registros de auditoría',
                keywords: ['logs', 'bitacora', 'eventos', 'auditoria'],
                description: 'Bitacora de cambios sobre roles y permisos',
                icon: 'audit',
                url: '/superuser/rbac/audit',
                requiredRoles: ['admin', 'analyst'],
            },
        ],
    },
    {
        id: 'help',
        name: 'Ayuda',
        icon: 'help',
        modules: [
            {
                id: 'knowledge-base',
                title: 'Base de conocimiento',
                description: 'Guías y respuestas a las preguntas frecuentes',
                icon: 'book',
                url: '/help/knowledge-base',
                keywords: ['faq', 'articulos', 'guias', 'kb'],
            },
            {
                id: 'docs',
                title: 'Documentación',
                description: 'Guía de la plantilla y catálogo de componentes de UI',
                icon: 'docs',
                url: '/help/docs',
                keywords: ['docs', 'componentes', 'ui', 'design system', 'playground'],
                children: [
                    { id: 'docs-guide', title: 'Guía de la plantilla', url: '/help/docs' },
                    { id: 'docs-playground', title: 'Catálogo de UI', url: '/playground' },
                ],
            },
        ],
    },
    {
        id: 'account',
        name: 'Cuenta',
        icon: 'user',
        catalog: false,
        modules: [
            {
                id: 'profile',
                title: 'Perfil',
                description: 'Tus datos personales y de contacto',
                icon: 'user',
                url: '/account/profile',
            },
            {
                id: 'preferences',
                title: 'Preferencias',
                description: 'Tema, navegación y notificaciones',
                icon: 'settings',
                url: '/account/preferences',
                keywords: ['tema', 'oscuro', 'configuracion', 'notificaciones'],
            },
            {
                id: 'security',
                title: 'Seguridad',
                description: 'Contraseña, verificación en dos pasos y sesiones',
                icon: 'lock',
                url: '/account/security',
                keywords: ['contrasena', 'password', '2fa', 'sesiones'],
            },
        ],
    },
]
