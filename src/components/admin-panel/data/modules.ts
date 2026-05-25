// datos y configuración de módulos
export type ModuleCategory = {
    name: string
    icon: string
    modules: {
        id: string
        title: string
        description: string
        icon: string
        requiredRoles?: string[]
        url?: string
    }[]
}

export const MODULE_CATEGORIES: ModuleCategory[] = [
    {
        name: 'ADMINISTRATIVOS',
        icon: '📋',
        modules: [
            {
                id: 'attendance',
                title: 'Atención bienestar universitario',
                description: 'Atención bienestar universitario online',
                icon: '📅',
                requiredRoles: ['admin', 'organizer'],
                url: '/rutas'
            },
            {
                id: 'calendar',
                title: 'Calendario',
                description:
                    'Calendario de actividades de la institución',
                icon: '📅',
                requiredRoles: ['admin', 'organizer'],
            },
            {
                id: 'email',
                title: 'Correo electrónico',
                description:
                    'Word, excel online, calendario, creative, forms etc.',
                icon: '📧',
                requiredRoles: ['admin', 'organizer', 'analyst'],
            },
            {
                id: 'surveys',
                title: 'Encuestas',
                description: 'Responder encuestas',
                icon: '📊',
                requiredRoles: ['admin', 'organizer', 'analyst', 'viewer'],
            },
            {
                id: 'evaluation-360',
                title: 'Evaluación del desempeño 360°',
                description: 'Retroalimentación 360 para evaluar fortalezas y mejoras.',
                icon: '🎯',
                requiredRoles: ['admin', 'organizer'],
            },
            {
                id: 'institutional-eval',
                title: 'Evaluación institucional (responsable)',
                description: 'Carga de evidencias de la evaluación',
                icon: '🏛️',
                requiredRoles: ['admin'],
            },
            {
                id: 'inst-eval-revisor',
                title: 'Evaluación institucional (revisor)',
                description: 'Revisión de evidencias de la evaluación',
                icon: '👁️',
                requiredRoles: ['admin', 'analyst'],
            },
            {
                id: 'health-research',
                title: 'Investigación en salud',
                description: 'Protocolos y redes de investigación',
                icon: '🔬',
                requiredRoles: ['admin', 'organizer', 'analyst'],
            },
            {
                id: 'manuals',
                title: 'Manuales y documentos',
                description: 'Manuales y documentos',
                icon: '📖',
                requiredRoles: ['admin', 'organizer', 'analyst', 'viewer'],
            },
            {
                id: 'messages',
                title: 'Mensajes',
                description: 'Mensajería interna',
                icon: '💬',
                requiredRoles: ['admin', 'organizer', 'analyst', 'viewer'],
            },
            {
                id: 'help-desk',
                title: 'Mesa ayuda',
                description: 'Mesa ayuda',
                icon: '🆘',
                requiredRoles: ['admin', 'organizer'],
            },
            {
                id: 'reports',
                title: 'Reports',
                description: 'Listado de reportes',
                icon: '📑',
                requiredRoles: ['admin', 'analyst'],
            },
            {
                id: 'doc-responsible',
                title: 'Responsable gestión documental',
                description: 'Gestión de documentos administrativos',
                icon: '📋',
                requiredRoles: ['admin'],
            },
            {
                id: 'doc-reviewer',
                title: 'Revisor gestión documental',
                description: 'Revisión de documentos administrativos',
                icon: '✅',
                requiredRoles: ['admin', 'analyst'],
            },
            {
                id: 'support-request',
                title: 'Solicitar soporte',
                description: 'Solicitar soporte técnico',
                icon: '⚙️',
                requiredRoles: ['admin', 'organizer', 'analyst', 'viewer'],
            },
            {
                id: 'requests',
                title: 'Solicitudes',
                description: 'Gestor de solicitudes',
                icon: '📝',
                requiredRoles: ['admin', 'organizer'],
            },
            {
                id: 'escalated-requests',
                title: 'Solicitudes escaladas',
                description: 'Solicitudes escaladas a nivel superior',
                icon: '🚀',
                requiredRoles: ['admin'],
            },
        ],
    },
    {
        name: 'ASEGURAMIENTO DE LA CALIDAD',
        icon: '✅',
        modules: [
            {
                id: 'quality-assurance',
                title: 'Aseguramiento de Calidad',
                description: 'Proceso de verificación de calidad',
                icon: '🏅',
                requiredRoles: ['admin', 'analyst'],
            },
            {
                id: 'compliance',
                title: 'Cumplimiento Normativo',
                description: 'Verificación de cumplimiento normativo',
                icon: '📜',
                requiredRoles: ['admin'],
            },
        ],
    },
    {
        name: 'MANTENIMIENTO',
        icon: '🔧',
        modules: [
            {
                id: 'system-maintenance',
                title: 'Mantenimiento del Sistema',
                description: 'Tareas de mantenimiento preventivo',
                icon: '🛠️',
                requiredRoles: ['admin'],
            },
            {
                id: 'backups',
                title: 'Respaldos',
                description: 'Gestión de copias de seguridad',
                icon: '💾',
                requiredRoles: ['admin'],
            },
        ],
    },
    {
        name: 'SISTEMAS',
        icon: '💻',
        modules: [
            {
                id: 'user-management',
                title: 'Gestión de Usuarios',
                description: 'Administrar usuarios del sistema',
                icon: '👥',
                requiredRoles: ['admin'],
            },
            {
                id: 'permissions',
                title: 'Permisos y Roles',
                description: 'Configurar permisos y roles de usuario',
                icon: '🔐',
                requiredRoles: ['admin'],
            },
            {
                id: 'system-config',
                title: 'Configuración del Sistema',
                description: 'Parámetros generales del sistema',
                icon: '⚙️',
                requiredRoles: ['admin'],
            },
        ],
    },
]
